import { LayoutDashboard, Library, ChartBar, Users, DollarSign } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { JSX } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { UserDropdown } from './user-dropdown';
const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Content',
    url: '/dashboard/content',
    icon: Library,
  },
  {
    title: 'Insights',
    url: '/dashboard/insights',
    icon: ChartBar,
  },
  {
    title: 'Audience',
    url: '/dashboard/audience',
    icon: Users,
  },
  {
    title: 'Payouts',
    url: '/dashboard/payouts',
    icon: DollarSign,
  },
];

/**
 * @returns {JSX.Element} The AppSidebar component
 */
export const AppSidebar = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="absolute top-[calc((100vh-36px)/2)] -right-6 z-10" />

      <SidebarHeader>
        <SidebarMenu className="flex group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="w-max">
            <Link to="/">
              <img src="/logo.svg" alt="logo" className="size-8" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url, { viewTransition: true })}
                      isActive={isActive}
                    >
                      <IconComponent />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
};
