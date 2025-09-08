import fs from 'node:fs/promises';
import express from 'express';
import { Patronts } from 'patronts';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';
const ABORT_DELAY = 10000;

const patronClient = new Patronts({
  serverURL: process.env.VITE_SERVER_URL || 'http://localhost:8080',
});

const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

const app = express();

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
  console.log('Received request for:', req.originalUrl);

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

    const initialData = await loadDataForUrl(url, req);

    if (initialData?.shouldRedirect) {
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
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

/**
 * Server-only data loader that checks authentication and handles redirects.
 * Calls the patron API to verify user authentication status.
 *
 * @param {string} url - The request path, relative to the app base.
 * @param {import('express').Request} req - The Express request object for headers/session.
 * @returns {Promise<{user: object | null, shouldRedirect?: {to: string}}>} Data to serialize into the document for SSR/hydration.
 */
async function loadDataForUrl(url, req) {
  try {
    const cookies = req.headers.cookie || '';
    const user = await patronClient.auth.getCurrentUser({
      credentials: 'include',
      headers: {
        cookie: cookies,
      },
    });

    if (url === 'login' || url === 'register') {
      return {
        user,
        shouldRedirect: { to: '/' },
      };
    }

    return { user };
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
