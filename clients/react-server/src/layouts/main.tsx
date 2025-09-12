import { JSX } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { patronClient } from '@/lib/utils';

/**
 *
 * @param {object} props - Props for the Layout component
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @returns {React.ReactElement} The Layout component
 */
const MainLayout = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col">
          {!user?.emailVerified && (
            <div className="bg-warning flex items-center justify-between gap-4 border-b-5 border-b-black px-6 py-3">
              <p className="text-lg">
                Your email is not verified, check the inbox for confirmation email.
              </p>
              <Button
                shadow={false}
                variant="secondary"
                containerClassName="w-max"
                onClick={() => {
                  patronClient.auth.resendVerificationEmail();
                }}
              >
                Resend confirmation email
              </Button>
            </div>
          )}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
