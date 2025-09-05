import { JSX, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import FormCard from '../components/form-card';
import Layout from '../layouts/login';
import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';

/**
 * Password reset page that handles password reset with a token from URL parameters.
 *
 * @returns {JSX.Element} The password reset page
 */
type ResetPasswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

export default function ForgotPasswordPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get token from URL parameters
  const token = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(
        'No reset token provided. Please check your email for the password reset link.',
      );
    } else {
      setStatus('form');
    }
  }, [token]);

  /**
   * Handles password reset form submission.
   *
   * @param {ResetPasswordFormData} data - Form data containing new password and confirmation
   * @returns {Promise<void>} Promise that resolves when reset is complete
   */
  const handlePasswordReset = async (data: ResetPasswordFormData): Promise<void> => {
    if (!token) {
      setStatus('error');
      setMessage('No reset token available. Please request a new password reset.');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: 'Passwords do not match. Please try again.',
      });
      return;
    }

    if (data.newPassword.length < 8) {
      form.setError('newPassword', {
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await resetPassword(data.newPassword, token);
      setStatus('success');
      setMessage('Your password has been successfully reset! You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(
        'Invalid or expired reset token.',
      );
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <FormCard title="Reset Password" description="Enter your new password">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-b-gray-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {status === 'form' && (
          <Form {...form}>
            <form className="space-y-5" onSubmit={(e) => void form.handleSubmit(handlePasswordReset)(e)}>
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your new password" 
                          type="password" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Confirm your new password" 
                          type="password" 
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="w-full flex flex-col gap-2 mt-5">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <Button type="button" variant="secondary" onClick={() => navigate('/login')} className="w-full">
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
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
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Password Reset Successful!</h3>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-4 text-sm text-gray-500">
              Redirecting you to login in a few seconds...
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
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Reset Failed</h3>
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
