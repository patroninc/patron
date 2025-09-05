import { JSX, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import FormCard from '../components/form-card';
import Layout from '../layouts/login';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

/**
 * Email verification page that handles email verification with a token from URL parameters.
 *
 * @returns {JSX.Element} The email verification page
 */
export default function VerifyEmailPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  // Get token from URL parameters
  const token = searchParams.get('token');

  useEffect(() => {
    /**
     * Verifies the email with the provided token.
     *
     * @returns {Promise<void>} Promise that resolves when verification is complete
     */
    const handleEmailVerification = async (): Promise<void> => {
      if (!token) {
        setStatus('error');
        setMessage(
          'No verification token provided. Please check your email for the verification link.',
        );
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! Welcome to Patron.');
        setTimeout(() => {
          navigate('/');
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
      handleEmailVerification();
    } else {
      setStatus('error');
      setMessage(
        'No verification token provided. Please check your email for the verification link.',
      );
    }
  }, [token, navigate, verifyEmail]);


  return (
    <Layout>
      <FormCard title="Email Verification" description="Verifying your email address">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-b-gray-600"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300">
              <svg
                className="h-6 w-6 text-gray-600"
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
              Redirecting you to your dashboard in a few seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300">
              <svg
                className="h-6 w-6 text-gray-600"
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
