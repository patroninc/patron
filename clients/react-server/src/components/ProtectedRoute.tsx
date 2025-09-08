import { JSX, ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (requireAuth && !user) {
      navigate('/login', { state: { from: location }, replace: true, viewTransition: true });
      return;
    }

    if (
      user &&
      !requireAuth &&
      (location.pathname === '/login' || location.pathname === '/register')
    ) {
      navigate('/', { replace: true, viewTransition: true });
      return;
    }

    if (!user && location.pathname === '/') {
      navigate('/login', { replace: true, viewTransition: true });
      return;
    }

    if (redirectTo) {
      navigate(redirectTo, { replace: true, viewTransition: true });
    }
  }, [user, requireAuth, location.pathname, navigate, redirectTo, location]);

  return <>{children}</>;
}
