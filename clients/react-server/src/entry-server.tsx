import { StrictMode } from 'react';
import {
  type RenderToPipeableStreamOptions,
  type PipeableStream,
  renderToPipeableStream,
} from 'react-dom/server';
import App from './App';
import { UserInfo } from 'patronts/models';

/*
  React SSR streaming with Suspense requires a stable parent element and a
  server that writes the HTML shell before piping the stream, then finishes the
  document once all content is ready. We handle this in server.js using
  onShellReady and onAllReady.
*/

/**
 * Render the React app to a Node stream for SSR.
 *
 * @param {string} url - Current request URL (used for routing).
 * @param {unknown} initialData - Server-fetched data injected into the tree.
 * @param {RenderToPipeableStreamOptions} [options] - Streaming callbacks for shell and errors.
 * @returns {import('stream').Readable} Node read stream of the rendered HTML.
 */
export const render = (
  url: string,
  initialData: unknown,
  options?: RenderToPipeableStreamOptions,
  // eslint-disable-next-line max-params
): PipeableStream => {
  return renderToPipeableStream(
    <StrictMode>
      <App initialData={initialData as { user?: UserInfo | null } | null} url={url} />
    </StrictMode>,
    options,
  );
};
