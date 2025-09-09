import LoginLayout from '../layouts/login';
import FormCard from '../components/form-card';
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { isValidEmail, patronClient } from '../lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type RegisterFormData = {
  email: string;
  displayName: string;
  password: string;
  repeatPassword: string;
};

/**
 * Register page component.
 *
 * @returns {React.ReactElement} The register page.
 */
export const Register = (): React.ReactElement => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailFromLocation = (location.state as { email?: string } | undefined)?.email;

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: emailFromLocation || '',
      displayName: '',
      password: '',
      repeatPassword: '',
    },
  });

  useEffect(() => {
    if (!emailFromLocation || !isValidEmail(emailFromLocation)) {
      navigate('/login', { viewTransition: true });
    }
  }, [emailFromLocation, navigate]);

  /**
   * Handles the registration form submission.
   *
   * @param registerFormData - The data submitted from the registration form.
   */
  const handleSubmit = async (registerFormData: RegisterFormData): Promise<void> => {
    if (!registerFormData.displayName || registerFormData.displayName.length < 2) {
      form.setError('displayName', {
        message: 'Display name must be at least 2 characters',
      });
      return;
    }
    if (!registerFormData.password || registerFormData.password.length < 8) {
      form.setError('password', {
        message: 'Password must be at least 8 characters',
      });
      return;
    }
    if (registerFormData.password !== registerFormData.repeatPassword) {
      form.setError('repeatPassword', {
        message: "Passwords don't match",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await patronClient.auth.register(
        {
          email: registerFormData.email,
          password: registerFormData.password,
          displayName: registerFormData.displayName,
        },
        { credentials: 'include' },
      );
      const user = await patronClient.auth.getCurrentUser({ credentials: 'include' });
      setUser(user);
      navigate('/', { viewTransition: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error has occurred, please try again.';
      // For errors, we could show a toast or inline error message here
      // For now, we'll just set the form error
      form.setError('root', {
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      <FormCard
        title="Create your account"
        description="Set up your account details and secure password."
      >
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-5">
            {form.formState.errors.root && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <div className="text-sm text-red-700">{form.formState.errors.root.message}</div>
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeatPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Repeat your password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Loading...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Form>
      </FormCard>
    </LoginLayout>
  );
};
