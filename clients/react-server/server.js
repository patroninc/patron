import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import express from 'express';
import { config } from 'dotenv';
import { Patronts } from 'patronts';
import winston from 'winston';

config();

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';
const ABORT_DELAY = 10000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

const patronClient = new Patronts({
  serverURL: process.env.VITE_SERVER_URL || 'http://localhost:8080',
});

const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

const app = express();

// Structured logging middleware for all requests
app.use((req, res, next) => {
  const start = Date.now();

  // Capture response end to log completion
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;

    if (isProduction) {
      logger.info('Request completed', {
        type: 'request_complete',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('Content-Length'),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.socket.remoteAddress,
      });
    }

    originalEnd.apply(this, args);
  };

  next();
});

// Reverse proxy for /proxy -> VITE_API_URL (without the /proxy prefix)
// Example: /proxy/auth/me -> https://backend.example.com/auth/me
app.use('/proxy', async (req, res, next) => {
  try {
    const targetBase = process.env.VITE_API_URL || 'http://localhost:8080';

    // When mounted on '/proxy', req.url no longer contains '/proxy'
    // So we can directly append it to the target base
    const targetUrl = new globalThis.URL(req.url, targetBase);

    // Copy request headers, dropping hop-by-hop headers
    const incomingHeaders = { ...req.headers };
    delete incomingHeaders['host'];
    delete incomingHeaders['connection'];
    delete incomingHeaders['keep-alive'];
    delete incomingHeaders['proxy-authenticate'];
    delete incomingHeaders['proxy-authorization'];
    delete incomingHeaders['te'];
    delete incomingHeaders['trailers'];
    delete incomingHeaders['transfer-encoding'];
    delete incomingHeaders['upgrade'];
    delete incomingHeaders['content-length']; // Let fetch calculate this

    // Preserve cookies and auth headers as-is; adjust origin/referrer to backend
    if (incomingHeaders['origin']) {
      incomingHeaders['origin'] = new globalThis.URL(targetBase).origin;
    }
    if (incomingHeaders['referer']) {
      incomingHeaders['referer'] = new globalThis.URL(targetBase).origin;
    }

    const method = req.method || 'GET';
    const hasBody = !['GET', 'HEAD'].includes(method);

    const fetchInit = {
      method,
      headers: incomingHeaders,
      // Node Fetch requires duplex: 'half' when streaming a request body
      ...(hasBody ? { body: req, duplex: 'half' } : {}),
      redirect: 'manual',
    };

    const upstream = await globalThis.fetch(targetUrl, fetchInit);

    // Copy response status and headers, omitting hop-by-hop
    res.status(upstream.status);

    const hopByHop = new Set([
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
    ]);

    upstream.headers.forEach((value, key) => {
      if (!hopByHop.has(key.toLowerCase())) {
        // set-cookie can be repeated; handle array form if supported
        if (key.toLowerCase() === 'set-cookie') {
          // Node 18+ (undici) supports getSetCookie()
          const cookies = upstream.headers.getSetCookie?.();
          if (cookies && cookies.length) {
            res.setHeader('set-cookie', cookies);
          } else {
            res.setHeader('set-cookie', value);
          }
        } else {
          res.setHeader(key, value);
        }
      }
    });

    // Stream body back to client
    if (!upstream.body) {
      res.end();
      return;
    }

    // Convert Web ReadableStream to Node Readable and pipe
    const nodeStream =
      typeof Readable.fromWeb === 'function'
        ? Readable.fromWeb(upstream.body)
        : Readable.from(upstream.body);

    nodeStream.on('error', () => {
      // Fail the response if upstream stream errors out
      if (!res.headersSent) res.status(502);
      res.end();
    });

    nodeStream.pipe(res);
  } catch (err) {
    // On errors, fall through to next handler so SSR or error middleware can decide
    next(err);
  }
});

/** @type {import('vite').ViteDevServer | undefined} */
let vite;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

app.use(async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.ts').render} */
    let render;
    if (!isProduction) {
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      render = (await import('./dist/server/entry-server.js')).render;
    }

    const initialData = await loadDataForUrl(url, req, res);

    if (initialData?.shouldRedirect) {
      console.log('Redirecting to:', initialData.shouldRedirect.to);
      res.redirect(302, initialData.shouldRedirect.to);
      return;
    }

    const serialized = JSON.stringify(initialData).replace(/</g, '\\u003c');
    template = template.replace(
      '<!--app-head-->',
      `<script>window.__INITIAL_DATA__ = ${serialized}</script>`,
    );

    const [htmlStart, htmlEnd] = template.split('<!--app-html-->');

    let didError = false;
    const stream = render(url, initialData, {
      onShellError() {
        res.status(500);
        res.set({ 'Content-Type': 'text/html' });
        res.send('<h1>Something went wrong</h1>');
      },
      onShellReady() {
        res.status(didError ? 500 : 200);
        res.set({ 'Content-Type': 'text/html' });
        res.write(htmlStart);

        // Pipe React stream directly to the response
        stream.pipe(res);
      },
      onAllReady() {
        res.end(htmlEnd);
      },
      onError(error) {
        didError = true;
        console.error(error);
      },
    });

    // Safety: abort the stream if it takes too long
    setTimeout(() => {
      try {
        stream.abort?.();
      } catch {
        // ignore
      }
    }, ABORT_DELAY);

    // Abort if client disconnects
    res.on('close', () => {
      try {
        stream.abort?.();
      } catch {
        // ignore
      }
    });
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// Start http server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started at http://0.0.0.0:${port}`);
});

/**
 * Server-only data loader that checks authentication and handles redirects.
 * Calls the patron API to verify user authentication status and forwards cookies.
 *
 * @param {string} url - The request path, relative to the app base.
 * @param {import('express').Request} req - The Express request object for headers/session.
 * @param {import('express').Response} res - The Express response object for setting cookies.
 * @returns {Promise<{user: object | null, shouldRedirect?: {to: string}, posts?: Array, series?: Array, post?: object}>} Data to serialize into the document for SSR/hydration.
 */
// eslint-disable-next-line no-unused-vars
async function loadDataForUrl(url, req, res) {
  try {
    const cookies = req.headers.cookie || '';

    const user = await patronClient.auth.getCurrentUser({
      credentials: 'include',
      headers: {
        cookie: cookies,
      },
    });

    // Redirect authenticated users away from auth pages
    if (url === 'login' || url === 'register') {
      return {
        user,
        shouldRedirect: { to: '/' },
      };
    }

    try {
      const requestOptions = {
        credentials: 'include',
        headers: {
          cookie: cookies,
          accept: 'application/json',
        },
      };

      // Default: fetch all posts and series for general use
      const [allPostsResponse, allSeriesResponse] = await Promise.all([
        patronClient.posts.list(undefined, requestOptions),
        patronClient.series.list({ limit: 40 }, requestOptions),
      ]);
      const allPosts = allPostsResponse.result;
      const allSeries = allSeriesResponse.result;

      // Handle individual series page
      const seriesMatch = url.match(/^\/?series\/([^/]+)\/?$/);
      if (seriesMatch) {
        const seriesId = seriesMatch[1];
        try {
          const [seriesResponse, seriesPostsResponse] = await Promise.all([
            patronClient.series.get({ seriesId: seriesId }, requestOptions),
            patronClient.posts.list({ seriesId: seriesId, limit: 50 }, requestOptions),
          ]);
          return {
            user,
            singleSeries: seriesResponse.result,
            series: allSeries,
            posts: seriesPostsResponse.result,
            allPosts,
          };
        } catch (seriesError) {
          console.warn('Failed to fetch series data:', seriesError);
          return { user, posts: allPosts, series: allSeries };
        }
      }

      // Handle individual post page
      const postMatch = url.match(/^\/?post\/([^/]+)\/?$/);
      if (postMatch) {
        const postId = postMatch[1];
        try {
          const postResponse = await patronClient.posts.get({ postId: postId }, requestOptions);
          const post = postResponse.result;
          let series = null;

          // If post belongs to a series, fetch series data too
          if (post.seriesId) {
            try {
              const seriesResponse = await patronClient.series.get(
                { seriesId: post.seriesId },
                requestOptions,
              );
              series = seriesResponse.result;
            } catch (seriesError) {
              console.warn('Failed to fetch series for post:', seriesError);
            }
          }

          return {
            user,
            singlePost: post,
            posts: allPosts,
            singleSeries: series,
            series: allSeries,
          };
        } catch (postError) {
          console.warn('Failed to fetch post data:', postError);
          return { user, posts: allPosts, series: allSeries };
        }
      }

      // Default: return all posts and series for home page
      return {
        user,
        posts: allPosts,
        series: allSeries,
      };
    } catch (dataError) {
      console.warn('Failed to fetch posts/series:', dataError);
      return { user };
    }
  } catch {
    const isProtectedRoute =
      !url.startsWith('login') && !url.startsWith('register') && !url.startsWith('forgot-password');

    if (isProtectedRoute) {
      return {
        user: null,
        shouldRedirect: { to: 'login' },
      };
    }

    return { user: null };
  }
}
