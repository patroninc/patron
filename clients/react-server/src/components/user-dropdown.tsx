import { ChevronsUpDown, ExternalLink, LogOut, Settings } from 'lucide-react';
import { JSX } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../components/ui/sidebar';
import { useNavigate } from 'react-router';
import { patronClient } from '../lib/utils';
import { useSidebar } from './ui/use-sidebar';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @returns {JSX.Element} The UserDropdown component.
 */
export const UserDropdown = (): JSX.Element => {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              removeHoverStyles
              className="px-[3px] py-0 group-data-[collapsible=icon]:p-0!"
            >
              <Avatar>
                <AvatarImage
                  src={user?.avatarUrl ?? undefined}
                  alt={user?.displayName ?? undefined}
                />
                <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left">
                <span className="truncate text-base leading-4 font-bold">{user?.displayName}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-max"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-lg" onClick={() => navigate('/settings')}>
                <Settings className="size-6" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg">
                <a
                  className="flex items-center gap-3"
                  href="https://patron.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-6" />
                  Privacy Policy
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg">
                <a
                  className="flex items-center gap-3"
                  href="https://patron.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-6" />
                  Terms of Service
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-lg">
                <LogOut className="size-6" onClick={() => patronClient.auth.logout()} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
