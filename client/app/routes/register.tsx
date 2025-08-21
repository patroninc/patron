import type { Route } from "./+types/register";
import Layout from "~/layouts/login";
import FormCard from "~/components/form-card";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router";
import { isValidEmail } from "~/lib/utils";

// Step 1: Email Form Component
function EmailStep({
  onNext,
  onGoogleAuth,
  initialEmail = "",
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
      form.setError("email", {
        message: "Email is required",
      });
      return;
    }
    if (!isValidEmail(data.email)) {
      form.setError("email", {
        message: "Please enter a valid email address",
      });
      return;
    }
    onNext(data.email);
  };

  return (
    <div className="flex flex-col gap-5">
      <Form {...form}>
        <form
          onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.watch("email")}
            className="w-full"
          >
            Continue
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm">or</p>

      <Button
        onClick={onGoogleAuth}
        className="w-full flex items-center justify-center gap-2"
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

      <p className="text-xs text-center mt-5">
        By joining, you agree to our{" "}
        <a
          target="_blank"
          href="https://patron.com/terms-of-service"
          className="underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          target="_blank"
          href="https://patron.com/privacy-policy"
          className="underline"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

// Step 2: User Details Form Component
function UserDetailsStep({
  onNext,
  onBack,
  initialData = { displayName: "", password: "", repeatPassword: "" },
}: {
  onNext: (data: {
    displayName: string;
    password: string;
    repeatPassword: string;
  }) => void;
  onBack: () => void;
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
      form.setError("displayName", {
        message: "Display name must be at least 2 characters",
      });
      return;
    }
    if (!data.password || data.password.length < 8) {
      form.setError("password", {
        message: "Password must be at least 8 characters",
      });
      return;
    }
    if (data.password !== data.repeatPassword) {
      form.setError("repeatPassword", {
        message: "Passwords don't match",
      });
      return;
    }
    onNext(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
        className="space-y-5"
      >
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
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                />
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
                <Input
                  placeholder="Repeat your password"
                  type="password"
                  {...field}
                />
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
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Step 3: Page Details Form Component
function PageDetailsStep({
  onNext,
  onBack,
  initialData = { pageName: "", pageUrl: "" },
}: {
  onNext: (data: { pageName: string; pageUrl: string }) => void;
  onBack: () => void;
  initialData?: { pageName: string; pageUrl: string };
}) {
  const form = useForm<{ pageName: string; pageUrl: string }>({
    defaultValues: initialData,
  });

  const handleSubmit = (data: { pageName: string; pageUrl: string }) => {
    if (!data.pageName || data.pageName.length < 2) {
      form.setError("pageName", {
        message: "Page name must be at least 2 characters",
      });
      return;
    }
    if (!data.pageUrl || data.pageUrl.length < 2) {
      form.setError("pageUrl", {
        message: "Page URL must be at least 2 characters",
      });
      return;
    }
    onNext(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="pageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your page name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page URL</FormLabel>
              <FormControl className="w-full">
                <div className="flex items-center">
                  <div className="flex relative z-[2] items-center h-full">
                    <div className="h-[calc(100%-12px)] w-[3px] bg-black"></div>
                    <div className="h-[calc(100%-6px)] w-[3px] bg-accent border-y-3 border-y-black"></div>
                    <div className="text-sm bg-accent flex items-center h-full border-y-3 pl-[9px] pr-[12px] border-y-black">
                      Patron.com/
                    </div>
                  </div>
                  <Input
                    roundedLeft={false}
                    conatinerClassName="w-full"
                    placeholder="Enter your page URL"
                    {...field}
                  />
                </div>
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
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Step 4: Final Details Form Component
function FinalDetailsStep({
  onSubmit,
  onBack,
  initialData = { isNsfw: false },
}: {
  onSubmit: (data: { isNsfw: boolean }) => void;
  onBack: () => void;
  initialData?: { isNsfw: boolean };
}) {
  const form = useForm<{ isNsfw: boolean }>({
    defaultValues: initialData,
  });

  const handleSubmit = (data: { isNsfw: boolean }) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)}
        className="space-y-10 flex flex-col"
      >
        <FormField
          control={form.control}
          name="isNsfw"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>This page contains NSFW content</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-2">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Create Account
          </Button>
        </div>
      </form>
    </Form>
  );
}

type RegisterFormData = {
  email: string;
  displayName: string;
  password: string;
  repeatPassword: string;
  pageName: string;
  pageUrl: string;
  isNsfw: boolean;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register - Patron" },
    { name: "description", content: "Create your creator account on Patron" },
  ];
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterFormData>>({});

  const handleEmailSubmit = (email: string) => {
    setFormData({ ...formData, email });
    setCurrentStep(2);
  };

  const handleUserDetailsSubmit = (userData: {
    displayName: string;
    password: string;
    repeatPassword: string;
  }) => {
    setFormData({ ...formData, ...userData });
    setCurrentStep(3);
  };

  const handlePageDetailsSubmit = (pageData: {
    pageName: string;
    pageUrl: string;
  }) => {
    setFormData({ ...formData, ...pageData });
    setCurrentStep(4);
  };

  const handleFinalSubmit = (finalData: { isNsfw: boolean }) => {
    const completeData = { ...formData, ...finalData } as RegisterFormData;
    console.log("Form submitted:", completeData);
    // Handle form submission here
  };

  const handleGoogleAuth = () => {
    console.log("Google auth clicked");
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Start your creator journey";
      case 2:
        return "Create your account";
      case 3:
        return "Set up your page";
      case 4:
        return "NSFW?";
      default:
        return "Register";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Turn your passion into a profession. Connect with fans who want to support your work.";
      case 2:
        return "Set up your account details and secure password.";
      case 3:
        return "Choose your page name and URL for your creator profile.";
      default:
        return "";
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EmailStep
            onNext={handleEmailSubmit}
            onGoogleAuth={handleGoogleAuth}
            initialEmail={formData.email || ""}
          />
        );
      case 2:
        return (
          <UserDetailsStep
            onNext={handleUserDetailsSubmit}
            onBack={handleBack}
            initialData={{
              displayName: formData.displayName || "",
              password: formData.password || "",
              repeatPassword: formData.repeatPassword || "",
            }}
          />
        );
      case 3:
        return (
          <PageDetailsStep
            onNext={handlePageDetailsSubmit}
            onBack={handleBack}
            initialData={{
              pageName: formData.pageName || "",
              pageUrl: formData.pageUrl || "",
            }}
          />
        );
      case 4:
        return (
          <FinalDetailsStep
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            initialData={{
              isNsfw: formData.isNsfw || false,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-10">
        <FormCard
          className={currentStep === 4 ? "bg-warning" : ""}
          title={getStepTitle()}
          description={getStepDescription()}
        >
          {renderCurrentStep()}
        </FormCard>

        {currentStep === 1 && (
          <div className="px-10">
            <Button variant="secondary" className="w-full">
              <Link to="/login">Join as a fan</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
