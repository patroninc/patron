import LoginLayout from '../layouts/login';
import FormCard from '../components/form-card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { JSX, useState } from 'react';
import { useNavigate } from 'react-router';
import { isValidEmail, patronClient } from '../lib/utils';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Email step of the login form.
 *
 * @param {Object} props - The props for the EmailStep component.
 * @param {string} [props.initialEmail] - Optional initial email value.
 * @param {Function} props.onNext - Callback to proceed to next step with email.
 * @returns {React.ReactElement} The rendered email step form component.
 */
const EmailStep = ({
  initialEmail = '',
  onNext,
}: {
  initialEmail?: string;
  // eslint-disable-next-line no-unused-vars
  onNext: (email: string) => Promise<void>;
}): React.ReactElement => {
  const form = useForm<{ email: string }>({
    defaultValues: { email: initialEmail },
  });

  /**
   * Handles the form submission for the email step.
   *
   * @param data - The form data containing the email address.
   * @param data.email - The email address entered by the user.
   */
  const handleSubmit = async (data: { email: string }): Promise<void> => {
    if (!data.email) {
      form.setError('email', {
        message: 'Email is required',
      });
      return;
    }
    if (!isValidEmail(data.email)) {
      form.setError('email', {
        message: 'Please enter a valid email address',
      });
      return;
    }
    await onNext(data.email);
  };

  return (
    <div className="flex flex-col gap-5">
      <Form {...form}>
        <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-5">
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

          <Button type="submit" disabled={!form.watch('email')} className="w-full">
            Continue
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm">or</p>

      <Button
        onClick={() => {
          patronClient.auth.googleRedirect();
        }}
        className="flex w-full items-center justify-center gap-2"
      >
        Continue with
        <svg
          className="size-4 fill-white"
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Google</title>
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      </Button>

      <p className="mt-5 text-center text-xs">
        By joining, you agree to our{' '}
        <a target="_blank" href="https://patron.com/terms-of-service" className="underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a target="_blank" href="https://patron.com/privacy-policy" className="underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};
/**
 * Login password step of the login form.
 *
 * @param {Object} props - The props for the LoginPasswordStep component.
 * @param {string} props.email - The email address for login.
 * @param {string} [props.initialPassword] - Optional initial password value.
 * @returns {React.ReactElement} The rendered login password step form component.
 */
const LoginPasswordStep = ({
  email,
  initialPassword = '',
}: {
  email: string;
  initialPassword?: string;
}): React.ReactElement => {
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<boolean>(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  /**
   *
   */
  const tryForgotPassword = async (): Promise<void> => {
    try {
      void patronClient.auth.forgotPassword({ email });
    } catch {
      setForgotPasswordError(true);
    }
    setForgotPasswordModal(true);
  };

  const form = useForm<{ password: string }>({
    defaultValues: { password: initialPassword },
  });

  /**
   * Handles the form submission for the password step.
   *
   * @param data - The form data containing the password.
   * @param data.password - The password entered by the user.
   */
  const handleSubmit = async (data: { password: string }): Promise<void> => {
    if (!data.password || data.password.length < 8) {
      form.setError('password', {
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    try {
      const loginResp = await patronClient.auth.login({ email, password: data.password });
      setUser(loginResp.user);
      navigate('/home', { viewTransition: true });
    } catch {
      form.setError('password', {
        message: 'Password is incorrect',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}>
        <div className="flex flex-col gap-3">
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

          <AlertDialog open={forgotPasswordModal}>
            <AlertDialogTrigger
              onClick={tryForgotPassword}
              className="text-right text-sm hover:cursor-pointer hover:underline"
            >
              Forgot password?
            </AlertDialogTrigger>
            <AlertDialogContent contentClassName="sm:max-w-[450px]">
              <AlertDialogHeader className="sm:!text-center">
                <AlertDialogTitle>
                  {forgotPasswordError ? 'Failed to send password reset email' : 'Forgot password?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {forgotPasswordError
                    ? 'Please try again later.'
                    : 'Password reset link has been sent to your email address.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:!justify-center [&>div]:w-full">
                <Button onClick={() => setForgotPasswordModal(false)} className="w-full">
                  Continue
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-5 w-full">
          <Button className="w-full" type="submit">
            Log in
          </Button>
        </div>
      </form>
    </Form>
  );
};

type LoginFormData = {
  email: string;
  password: string;
};

/**
 * Login page component.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export const Login = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LoginFormData>>({});
  const navigate = useNavigate();

  /**
   * Handles email submission and checks if user exists.
   * Navigates to password step if user exists, otherwise redirects to register.
   *
   * @param email - The email address to check.
   */
  const handleEmailNext = async (email: string): Promise<void> => {
    try {
      await patronClient.auth.checkEmail({ email });
      setFormData((prev) => ({ ...prev, email }));
      setCurrentStep(2);
    } catch {
      setFormData((prev) => ({ ...prev, email }));
      navigate('/register', { state: { email }, viewTransition: true });
    }
  };

  const title = currentStep === 1 ? 'Log in or Sign up' : 'Log in';
  const description = currentStep === 1 ? '' : `logging in as ${formData.email ?? ''}`;

  return (
    <LoginLayout>
      <FormCard title={title} description={description}>
        {currentStep === 1 ? (
          <EmailStep initialEmail={formData.email || ''} onNext={handleEmailNext} />
        ) : (
          <LoginPasswordStep
            email={formData.email ?? ''}
            initialPassword={formData.password || ''}
          />
        )}
      </FormCard>
    </LoginLayout>
  );
};
