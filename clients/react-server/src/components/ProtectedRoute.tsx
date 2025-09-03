import { JSX, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected route component that handles authentication logic and redirects.
 *
 * @param {ProtectedRouteProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Where to redirect if conditions aren't met
 * @returns {JSX.Element} The protected route component or redirect
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps): JSX.Element {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
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

  // If authentication is required and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in and trying to access auth pages, redirect to home
  if (
    user &&
    !requireAuth &&
    (location.pathname === '/login' || location.pathname === '/register')
  ) {
    return <Navigate to="/" replace />;
  }

  // If no user and on home page, redirect to login
  if (!user && location.pathname === '/') {
    return <Navigate to="/login" replace />;
  }

  // If redirectTo is specified and conditions aren't met
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
