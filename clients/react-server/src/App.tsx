import { JSX, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import EmailVerification from './components/EmailVerification';
import { getURLParam } from './utils/urlParams';

type AppProps = {
  initialData?: unknown;
};

type View = 'login' | 'register' | 'verify-email';

/**
 * Component that handles authenticated app state and routing.
 *
 * @returns {JSX.Element} The authenticated app component
 */
function AuthenticatedApp(): JSX.Element {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-blue mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <UserProfile />;
  }

  return <UnauthenticatedApp />;
}

/**
 * Component that handles unauthenticated app state and routing.
 *
 * @returns {JSX.Element} The unauthenticated app component
 */
function UnauthenticatedApp(): JSX.Element {
  const [currentView, setCurrentView] = useState<View>('login');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getURLParam('token');
    if (token) {
      setVerificationToken(token);
      setCurrentView('verify-email');
      // Clear the token from URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  /**
   * Switches the view to registration.
   *
   * @returns {void}
   */
  const handleSwitchToRegister = (): void => setCurrentView('register');
  /**
   * Switches the view to login.
   *
   * @returns {void}
   */
  const handleSwitchToLogin = (): void => setCurrentView('login');

  /**
   * Handles completion of email verification.
   *
   * @returns {void}
   */
  const handleVerificationComplete = (): void => {
    setVerificationToken(null);
    setCurrentView('login');
  };

  switch (currentView) {
    case 'verify-email':
      return verificationToken ? (
        <EmailVerification
          token={verificationToken}
          onVerificationComplete={handleVerificationComplete}
        />
      ) : (
        <Login onSwitchToRegister={handleSwitchToRegister} />
      );
    case 'register':
      return <Register onSwitchToLogin={handleSwitchToLogin} />;
    case 'login':
    default:
      return <Login onSwitchToRegister={handleSwitchToRegister} />;
  }
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
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
