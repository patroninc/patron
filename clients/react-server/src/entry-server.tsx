import { StrictMode } from 'react';
import {
  type RenderToPipeableStreamOptions,
  type PipeableStream,
  renderToPipeableStream,
} from 'react-dom/server';
import App from './App';

/*
  React SSR streaming with Suspense requires a stable parent element and a
  server that writes the HTML shell before piping the stream, then finishes the
  document once all content is ready. We handle this in server.js using
  onShellReady and onAllReady.
*/

/**
 * Render the React app to a Node stream for SSR.
 *
 * @param {string} _url - Current request URL (used for routing if needed).
 * @param {unknown} initialData - Server-fetched data injected into the tree.
 * @param {RenderToPipeableStreamOptions} [options] - Streaming callbacks for shell and errors.
 * @returns {import('stream').Readable} Node read stream of the rendered HTML.
 */
export function render(
  _url: string,
  initialData: unknown,
  options?: RenderToPipeableStreamOptions,
): PipeableStream {
  return renderToPipeableStream(
    <StrictMode>
      <App initialData={initialData} />
    </StrictMode>,
    options,
  );
}
