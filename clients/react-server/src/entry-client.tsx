import { JSX, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { UserInfo } from 'patronts/models';
import { AuthProvider } from '@/contexts/AuthContext';
import Home from '@/pages/home';
import { Login } from '@/pages/login';
import { Register } from '@/pages/register';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import Content from '@/pages/dashboard/content';
import Insights from '@/pages/dashboard/insights';
import Audience from '@/pages/dashboard/audience';
import Payouts from '@/pages/dashboard/payouts';

const initialData = (window as any).__INITIAL_DATA__ as { user?: UserInfo | null } | null;

export const router = createBrowserRouter([
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
        path: 'reset-password',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <ForgotPasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/content',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Content />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/insights',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Insights />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/audience',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Audience />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/payouts',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Payouts />
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
const App = (): JSX.Element => {
  return (
    <AuthProvider initialUser={initialData?.user}>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <App />
  </StrictMode>,
);
