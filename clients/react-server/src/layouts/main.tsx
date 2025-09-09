import { JSX } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

/**
 *
 * @param {object} props - Props for the Layout component
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @returns {React.ReactElement} The Layout component
 */
const MainLayout = ({ children }: { children: JSX.Element }): JSX.Element => {
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
              <Button shadow={false} variant="secondary" containerClassName="w-max">
                Resend confirmation email
              </Button>
            </div>
          )}
          {children}
        </div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
