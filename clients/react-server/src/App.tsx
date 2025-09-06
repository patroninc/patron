import { JSX } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type AppProps = {
  initialData?: unknown;
};

/**
 * Component that handles authenticated app state and routing.
 *
 * @returns {JSX.Element} The authenticated app component
 */
function Loading(): JSX.Element {
  const { loading } = useAuth();

  if (!loading) {
    return <></>;
  }

  return (
    <div className="bg-background cube-bg flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-blue mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );

  // Return an empty fragment or your main app content here
}

/**
 * Main App component that wraps the application with authentication provider.
 *
 * @param {AppProps} props - The component props
 * @param {unknown} props.initialData - Initial server-fetched data for SSR/hydration
 * @returns {JSX.Element} The main app component
 */
// eslint-disable-next-line no-unused-vars
function App({ initialData: _initialData }: AppProps): JSX.Element {
  return (
    <AuthProvider>
      <Loading />
    </AuthProvider>
  );
}

export default App;
