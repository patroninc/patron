import { useEffect, useState } from 'react';
import { Patronts, HTTPClient } from 'patronts';

interface EmailVerificationProps {
  token: string;
  onVerificationComplete: () => void;
}

// Create HTTP client that includes credentials (cookies) with requests
const httpClient = new HTTPClient({
  fetcher: (request) => {
    return fetch(request, {
      credentials: 'include',
    });
  },
});

const patronClient = new Patronts({
  serverURL: 'http://localhost:8080',
  httpClient: httpClient,
});

/**
 * Email verification component that handles email verification with a token.
 *
 * @param {EmailVerificationProps} props - The component props
 * @param {string} props.token - The verification token from URL
 * @param {() => void} props.onVerificationComplete - Callback when verification is complete
 * @returns {JSX.Element} The email verification component
 */
export default function EmailVerification({
  token,
  onVerificationComplete,
}: EmailVerificationProps): JSX.Element {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    /**
     * Verifies the email with the provided token.
     *
     * @returns {Promise<void>} Promise that resolves when verification is complete
     */
    const verifyEmail = async (): Promise<void> => {
      try {
        await patronClient.auth.verifyEmail({ token });
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in.');
        setTimeout(() => {
          onVerificationComplete();
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
    }
  }, [token, onVerificationComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verification</h2>
        </div>

        <div className="rounded-md bg-white p-8 shadow-lg">
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
              <button
                onClick={onVerificationComplete}
                className="button-animated-bg bg-blue focus:ring-blue mt-6 rounded-md px-6 py-3 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
