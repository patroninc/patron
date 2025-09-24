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
import Settings from '@/pages/settings';
import ErrorBoundary from '@/components/ErrorBoundary';
import NewPost from './pages/new-post';

const initialData = (window as any).__INITIAL_DATA__ as { user?: UserInfo | null } | null;

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Home />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'login',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'register',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'reset-password',
        Component: () => (
          <ProtectedRoute requireAuth={false}>
            <ForgotPasswordPage />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'dashboard/content',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Content />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'dashboard/insights',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Insights />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'dashboard/audience',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Audience />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'dashboard/payouts',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Payouts />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'new-post',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <NewPost />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'settings',
        Component: () => (
          <ProtectedRoute requireAuth={true}>
            <Settings />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
    ],
  },
  {
    path: '*',
    Component: () => {
      throw new Response('Not Found', { status: 404 });
    },
    errorElement: <ErrorBoundary />,
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
