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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../components/ui/sidebar';
import { useNavigate } from 'react-router';
import { patronClient } from '../lib/utils';

/**
 * @param {object} props - Props to be passed to the UserDropdown component.
 * @param {object} props.user - The user object.
 * @param {string} props.user.name - The user's name.
 * @param {string} props.user.email - The user's email.
 * @param {string} props.user.avatar - The user's avatar URL.
 * @returns {JSX.Element} The UserDropdown component.
 */
export const UserDropdown = ({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}): JSX.Element => {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left">
                <span className="truncate text-base leading-4 font-bold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
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
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a
                  className="flex items-center gap-3"
                  href="https://patron.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                  Privacy Policy
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a
                  className="flex items-center gap-3"
                  href="https://patron.com/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                  Terms of Service
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut onClick={() => patronClient.auth.logout()} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
