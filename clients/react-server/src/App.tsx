import { JSX, Suspense, lazy } from 'react';
import reactLogo from './assets/react.svg';

// Works also with SSR as expected
const Card = lazy(() => import('./Card'));

/**
 * Root application component.
 *
 * @param {object} props - Component props.
 * @param {unknown} [props.initialData] - Initial server-fetched data for SSR/hydration.
 * @returns {JSX.Element} Rendered application.
 */
type AppProps = {
  initialData?: unknown;
};

/**
 * Root application component.
 *
 * @param {{ initialData?: unknown }} props - Component props.
 * @returns {JSX.Element} Rendered application.
 */
function App({ initialData }: AppProps): JSX.Element {
  return (
    <main>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <Suspense fallback={<p>Loading card component...</p>}>
        <Card />
      </Suspense>

      {initialData ? (
        <pre style={{ textAlign: 'left', background: '#111', padding: 12 }}>
          {JSON.stringify(initialData, null, 2)}
        </pre>
      ) : null}

      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </main>
  );
}

export default App;
