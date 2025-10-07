import { JSX } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

interface ErrorInfo {
  title: string;
  message: string;
  status?: number;
}

/**
 * Extracts error information from different error types
 *
 * @param {unknown} error - The error object to extract information from
 * @returns {ErrorInfo} Formatted error information object
 */
const getErrorInfo = (error: unknown): ErrorInfo => {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      message: error.data?.message || 'Something went wrong',
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Application Error',
      message: error.message,
    };
  }

  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred',
  };
};

/**
 * Error boundary component that provides a better UX for application errors
 *
 * @returns {JSX.Element} The error boundary UI component
 */
export const ErrorBoundary = (): JSX.Element => {
  const error = useRouteError();
  const errorInfo = getErrorInfo(error);
  const navigate = useNavigate();

  /**
   * Reloads the current page
   *
   * @returns {void}
   */
  const handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Navigates to the homepage
   *
   * @returns {void}
   */
  const handleGoHome = (): void => {
    navigate('/', { viewTransition: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold">{errorInfo.title}</h2>
          <p className="mt-2 text-sm">{errorInfo.message}</p>

          {errorInfo.status === 404 && (
            <p className="mt-2 text-sm">The page you're looking for doesn't exist.</p>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <Button onClick={handleGoHome} className="w-full" variant="default">
            Go to Homepage
          </Button>

          <Button onClick={handleReload} className="w-full" variant="secondary">
            Reload Page
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error instanceof Error && (
          <details className="mt-8">
            <summary className="cursor-pointer text-sm font-medium">
              Error Details (Development)
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto p-2 text-xs">{error.stack}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
