import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App'

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <App initialData={(window as any).__INITIAL_DATA__} />
  </StrictMode>,
)
