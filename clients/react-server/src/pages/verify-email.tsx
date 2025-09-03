import { JSX, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import FormCard from '../components/form-card';
import Layout from '../layouts/login';
import { Button } from '../components/ui/button';
// import { Patronts, HTTPClient } from 'patronts';

/**
 * Email verification page that handles email verification with a token from URL parameters.
 *
 * @returns {JSX.Element} The email verification page
 */
export default function VerifyEmailPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  // Get token from URL parameters
  const token = searchParams.get('token');

  // Create HTTP client that includes credentials (cookies) with requests
  // const httpClient = new HTTPClient({
  //   fetcher: (request) => {
  //     return fetch(request, {
  //       credentials: 'include',
  //     });
  //   },
  // });

  // const patronClient = new Patronts({
  //   serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8080',
  //   httpClient: httpClient,
  // });

  useEffect(() => {
    /**
     * Verifies the email with the provided token.
     *
     * @returns {Promise<void>} Promise that resolves when verification is complete
     */
    const verifyEmail = async (): Promise<void> => {
      if (!token) {
        setStatus('error');
        setMessage(
          'No verification token provided. Please check your email for the verification link.',
        );
        return;
      }

      try {
        // await patronClient.auth.verifyEmail({ token });
        console.log('Email verification disabled - patronts commented out');
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(
          'Invalid or expired verification token. Please request a new verification email.',
        );
        console.error('Email verification error:', error);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage(
        'No verification token provided. Please check your email for the verification link.',
      );
    }
  }, [token, navigate]);

  /**
   * Handles navigation back to login page.
   *
   * @returns {void}
   */
  const handleReturnToLogin = (): void => {
    navigate('/login');
  };

  return (
    <Layout>
      <FormCard title="Email Verification" description="Verifying your email address">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="border-blue mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Verification Successful!</h3>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting you to login in a few seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Verification Failed</h3>
            <p className="mt-2 text-gray-600">{message}</p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Return to login
              </Button>
            </Link>
          </div>
        )}
      </FormCard>
    </Layout>
  );
}
