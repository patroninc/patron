import Layout from '../layouts/login';
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
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { isValidEmail } from '../lib/utils';
import { Link } from 'react-router';

function EmailStep({
  onNext,
  onGoogleAuth,
  initialEmail = '',
}: {
  onNext: (email: string) => void;
  onGoogleAuth: () => void;
  initialEmail?: string;
}) {
  const form = useForm<{ email: string }>({
    defaultValues: { email: initialEmail },
  });

  const handleSubmit = (data: { email: string }) => {
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
    onNext(data.email);
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

      <Button onClick={onGoogleAuth} className="flex w-full items-center justify-center gap-2">
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
}
function LoginPasswordStep({
  email,
  onBack,
  onSubmit,
  initialPassword = '',
}: {
  email: string;
  onBack: () => void;
  onSubmit: (data: { password: string }) => void;
  initialPassword?: string;
}) {
  const form = useForm<{ password: string }>({
    defaultValues: { password: initialPassword },
  });

  const handleSubmit = (data: { password: string }) => {
    if (!data.password || data.password.length < 8) {
      form.setError('password', {
        message: 'Password must be at least 8 characters',
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-5">
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
        <div className="flex justify-between gap-2">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Log in
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SignupDetailsStep({
  email,
  onBack,
  onSubmit,
  initialData = { displayName: '', password: '', repeatPassword: '' },
}: {
  email: string;
  onBack: () => void;
  onSubmit: (data: { displayName: string; password: string; repeatPassword: string }) => void;
  initialData?: {
    displayName: string;
    password: string;
    repeatPassword: string;
  };
}) {
  const form = useForm<{
    displayName: string;
    password: string;
    repeatPassword: string;
  }>({
    defaultValues: initialData,
  });

  const handleSubmit = (data: {
    displayName: string;
    password: string;
    repeatPassword: string;
  }) => {
    if (!data.displayName || data.displayName.length < 2) {
      form.setError('displayName', {
        message: 'Display name must be at least 2 characters',
      });
      return;
    }
    if (!data.password || data.password.length < 8) {
      form.setError('password', {
        message: 'Password must be at least 8 characters',
      });
      return;
    }
    if (data.password !== data.repeatPassword) {
      form.setError('repeatPassword', { message: "Passwords don't match" });
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-5">
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
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Sign up
          </Button>
        </div>
      </form>
    </Form>
  );
}
type LoginFormData = {
  email: string;
  displayName: string;
  password: string;
  repeatPassword: string;
};

export default function Login() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<LoginFormData>>({});
  const [accountExists, setAccountExists] = useState<boolean>(false);

  const handleEmailSubmit = (email: string) => {
    setFormData({ ...formData, email });
    setCurrentStep(2);
  };

  const handleGoogleAuth = () => {
    // Intentionally no-op for now per requirements
    console.log('Google auth clicked');
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleLoginSubmit = ({ password }: { password: string }) => {
    console.log('Logging in with:', { email: formData.email, password });
  };

  const handleSignupSubmit = (data: {
    displayName: string;
    password: string;
    repeatPassword: string;
  }) => {
    const complete = { ...formData, ...data } as LoginFormData;
    console.log('Signing up with:', complete);
  };

  const title = currentStep === 1 ? 'Log in or Sign up' : accountExists ? 'Log in' : 'Sign up';
  const description =
    currentStep === 1
      ? ''
      : accountExists
        ? `logging in as ${formData.email ?? ''}`
        : `signing up as ${formData.email ?? ''}`;

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <FormCard title={title} description={description}>
          {currentStep === 1 ? (
            <EmailStep
              onNext={handleEmailSubmit}
              onGoogleAuth={handleGoogleAuth}
              initialEmail={formData.email || ''}
            />
          ) : accountExists ? (
            <LoginPasswordStep
              email={formData.email ?? ''}
              onBack={handleBack}
              onSubmit={handleLoginSubmit}
              initialPassword={formData.password || ''}
            />
          ) : (
            <SignupDetailsStep
              email={formData.email ?? ''}
              onBack={handleBack}
              onSubmit={handleSignupSubmit}
              initialData={{
                displayName: formData.displayName || '',
                password: formData.password || '',
                repeatPassword: formData.repeatPassword || '',
              }}
            />
          )}
        </FormCard>

        {currentStep === 1 && (
          <div className="px-10">
            <Link to="/register">
              <Button variant="secondary" className="w-full">
                Join as a creator
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
