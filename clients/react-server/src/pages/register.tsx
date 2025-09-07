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
import { useSearchParams, useNavigate } from 'react-router';
import { isValidEmail, patronClient } from '../lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const emailFromUrl = searchParams.get('email');

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: emailFromUrl || '',
      displayName: '',
      password: '',
      repeatPassword: '',
    },
  });

  useEffect(() => {
    if (!emailFromUrl || !isValidEmail(emailFromUrl)) {
      navigate('/login', { viewTransition: true });
    }
  }, [emailFromUrl, navigate]);

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
      await patronClient.auth.register({
        email: registerFormData.email,
        password: registerFormData.password,
        displayName: registerFormData.displayName,
      });
      setAlertTitle('Success');
      setAlertMessage('Registration successful! Please check your email for verification.');
      setShowAlert(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error has occurred, please try again.';
      setAlertTitle('Registration failed');
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles closing the alert dialog and resets alert state.
   */
  const handleAlertClose = (): void => {
    setShowAlert(false);
    setAlertTitle(null);
    setAlertMessage(null);
  };

  return (
    <LoginLayout>
      <FormCard
        title="Create your account"
        description="Set up your account details and secure password."
      >
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} disabled />
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

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent contentClassName="sm:max-w-[450px]">
          <AlertDialogHeader className="sm:!text-center">
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:!justify-center [&>div]:w-full">
            <Button className="w-full" onClick={handleAlertClose}>
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LoginLayout>
  );
};
