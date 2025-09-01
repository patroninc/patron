import { StrictMode } from 'react'
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from 'react-dom/server'
import App from './App'

/*
  React SSR streaming with Suspense requires a stable parent element and a
  server that writes the HTML shell before piping the stream, then finishes the
  document once all content is ready. We handle this in server.js using
  onShellReady and onAllReady.
*/

export function render(
  _url: string,
  initialData: unknown,
  options?: RenderToPipeableStreamOptions,
) {
  return renderToPipeableStream(
    <StrictMode>
      <App initialData={initialData} />
    </StrictMode>,
    options,
  )
}
