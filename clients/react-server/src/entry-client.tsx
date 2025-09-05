import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmailPage from './pages/verify-email';
import ForgotPasswordPage from './pages/forgot-password';

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        ),
      },
      {
        path: 'verify-email',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <VerifyEmailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'forgot-password',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <ForgotPasswordPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

/**
 * Root component that wraps the app with providers.
 *
 * @returns {JSX.Element} The app component with providers
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <App />
  </StrictMode>,
);
