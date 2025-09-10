import * as React from 'react';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

/**
 * Custom hook to access the sidebar context.
 *
 * @returns {SidebarContextProps} The sidebar context value.
 */
const useSidebar = (): SidebarContextProps => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
};

export { SidebarContext, useSidebar, type SidebarContextProps };
