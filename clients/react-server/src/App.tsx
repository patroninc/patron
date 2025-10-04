import { JSX } from 'react';
import { UserInfo } from 'patronts/models';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import Home from '@/pages/home';
import { Login } from '@/pages/login';
import { Register } from '@/pages/register';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import Content from '@/pages/dashboard/content';
import Insights from '@/pages/dashboard/insights';
import Audience from '@/pages/dashboard/audience';
import Payouts from '@/pages/dashboard/payouts';
import { StaticRouter } from 'react-router';
import Series from '@/pages/series';
import Post from '@/pages/post';

type AppProps = {
  initialData?: {
    user?: UserInfo | null;
    posts?: any[];
    series?: any[];
    singleSeries?: any;
    singlePost?: any;
  } | null;
  url?: string;
};

/**
 * Main App component that wraps the application with authentication provider and routing.
 *
 * @param {AppProps} props - The component props
 * @param {Object} props.initialData - Initial server-fetched data for SSR/hydration
 * @param {UserInfo | null} props.initialData.user - Initial user data from server
 * @param {string} props.url - Current URL for server-side routing
 * @returns {JSX.Element} The main app component
 */
const App = ({ initialData, url }: AppProps): JSX.Element => {
  /**
   * Renders the appropriate page component based on the current URL path.
   *
   * @returns The JSX element for the current route
   */
  const renderPage = (): JSX.Element => {
    const path = url || '';

    switch (path) {
      case '':
      case '/':
        return (
          <ProtectedRoute requireAuth={true}>
            <Home />
          </ProtectedRoute>
        );
      case 'login':
      case '/login':
        return (
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        );
      case 'register':
      case '/register':
        return (
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        );
      case 'reset-password':
      case '/reset-password':
        return (
          <ProtectedRoute requireAuth={false}>
            <ForgotPasswordPage />
          </ProtectedRoute>
        );
      case 'dashboard/content':
      case '/dashboard/content':
        return (
          <ProtectedRoute requireAuth={true}>
            <Content />
          </ProtectedRoute>
        );
      case 'dashboard/insights':
      case '/dashboard/insights':
        return (
          <ProtectedRoute requireAuth={true}>
            <Insights />
          </ProtectedRoute>
        );
      case 'dashboard/audience':
      case '/dashboard/audience':
        return (
          <ProtectedRoute requireAuth={true}>
            <Audience />
          </ProtectedRoute>
        );
      case 'dashboard/payouts':
      case '/dashboard/payouts':
        return (
          <ProtectedRoute requireAuth={true}>
            <Payouts />
          </ProtectedRoute>
        );
      default:
        // Handle dynamic routes
        if (path.startsWith('/series/') || path.startsWith('series/')) {
          return (
            <ProtectedRoute requireAuth={true}>
              <Series />
            </ProtectedRoute>
          );
        }
        if (path.startsWith('/post/') || path.startsWith('post/')) {
          return (
            <ProtectedRoute requireAuth={true}>
              <Post />
            </ProtectedRoute>
          );
        }
        return (
          <ProtectedRoute requireAuth={true}>
            <Home />
          </ProtectedRoute>
        );
    }
  };

  return (
    <AuthProvider initialUser={initialData?.user}>
      <AppDataProvider
        initialPosts={initialData?.posts}
        initialSeries={initialData?.series}
        initialSingleSeries={initialData?.singleSeries}
        initialSinglePost={initialData?.singlePost}
      >
        <StaticRouter location={url || '/'}>{renderPage()}</StaticRouter>
      </AppDataProvider>
    </AuthProvider>
  );
};

export default App;
