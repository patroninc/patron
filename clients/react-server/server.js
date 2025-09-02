import fs from 'node:fs/promises';
import express from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';
const ABORT_DELAY = 10000;

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

    // 1) Load any data needed for this route on the server only
    const initialData = await loadDataForUrl(url, req);

    // 2) Safely serialize and inline initial data into the HTML head
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
 * Example server-only data loader. Replace with real logic per route.
 * You can call databases, internal APIs, etc. here without exposing keys.
 *
 * @param {string} url - The request path, relative to the app base.
 * @param {import('express').Request} req - The Express request object for headers/session.
 * @returns {Promise<unknown>} Data to serialize into the document for SSR/hydration.
 */
async function loadDataForUrl(url, req) {
  // Simple demo: return different payloads by route
  if (url.startsWith('/api-demo')) {
    // Example: call an internal service. Use fetch/axios or DB client here.
    // const r = await fetch(process.env.INTERNAL_URL + '/something');
    // return await r.json();
    return {
      route: url,
      userAgent: req.headers['user-agent'],
      message: 'Hello from the server-only loader',
      now: new Date().toISOString(),
    };
  }
  return null;
}
