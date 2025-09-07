import { JSX } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';

/**
 *
 * @param {object} props - Props for the Layout component
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @returns {React.ReactElement} The Layout component
 */
const Layout = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
