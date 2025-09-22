'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeftIcon } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { JSX } from 'react';

import { SidebarContext, useSidebar, type SidebarContextProps } from './use-sidebar';
import FocusRing from '@/components/focus-ring';
import PxBorder from '@/components/px-border';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '5.875rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/**
 *
 * @param {object} props - Props to be passed to the SidebarProvider component.
 * @param {boolean} props.defaultOpen - Whether the sidebar is open by default. Defaults to true.
 * @param {boolean} props.open - Controlled open state of the sidebar.
 * @param {Function} props.onOpenChange - Callback when the open state changes.
 * @param {string} props.className - Additional class names to be applied to the SidebarProvider component.
 * @param {React.CSSProperties} props.style - Additional styles to be applied to the SidebarProvider component.
 * @param {React.ReactNode} props.children - The content to be rendered inside the SidebarProvider component.
 * @returns The SidebarProvider component.
 */
const SidebarProvider = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange?: (open: boolean) => void;
}): JSX.Element => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    // eslint-disable-next-line no-unused-vars
    (nextValue: boolean | ((prev: boolean) => boolean)) => {
      const openState =
        typeof nextValue === 'function'
          ? // eslint-disable-next-line no-unused-vars
            (nextValue as (prev: boolean) => boolean)(open)
          : nextValue;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    /**
     *
     * @param {KeyboardEvent} event - The keyboard event.
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the Sidebar component.
 * @param {'left' | 'right'} [props.side] - The side on which the sidebar appears.
 * @param {'sidebar' | 'floating' | 'inset'} [props.variant] - The visual variant of the sidebar.
 * @param {'offcanvas' | 'icon' | 'none'} [props.collapsible] - The collapsibility behavior of the sidebar.
 * @param {string} [props.className] - Additional class names to apply.
 * @param {React.ReactNode} [props.children] - The content of the sidebar.
 * @returns {JSX.Element} The Sidebar component.
 */
const Sidebar = ({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}): JSX.Element => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'bg-secondary-primary text-sidebar-foreground relative flex h-full w-(--sidebar-width) flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r-5 group-data-[side=left]:border-black group-data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-secondary-primary group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarTrigger component.
 * @param {string} props.className - Additional class names to be applied to the SidebarTrigger component.
 * @param {Function} props.onClick - Click handler for the SidebarTrigger component.
 * @returns The SidebarTrigger component.
 */
const SidebarTrigger = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>): JSX.Element => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="secondary"
      size="icon"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      className={className}
      shadow={false}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarRail component.
 * @param {string} props.className - Additional class names to be applied to the SidebarRail component.
 * @returns The SidebarRail component.
 */
const SidebarRail = ({ className, ...props }: React.ComponentProps<'button'>): JSX.Element => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarInset component.
 * @param {string} props.className - Additional class names to be applied to the SidebarInset component.
 * @returns The SidebarInset component.
 */
const SidebarInset = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn(
        'bg-background cube-bg relative flex w-full flex-1 flex-col',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarInput component.
 * @param {string} props.className - Additional class names to be applied to the SidebarInput component.
 * @returns The SidebarInput component.
 */
const SidebarInput = ({ className, ...props }: React.ComponentProps<typeof Input>): JSX.Element => {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('bg-background h-8 w-full shadow-none', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarHeader component.
 * @param {string} props.className - Additional class names to be applied to the SidebarHeader component.
 * @returns The SidebarHeader component.
 */
const SidebarHeader = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col px-6 py-8', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarFooter component.
 * @param {string} props.className - Additional class names to be applied to the SidebarFooter component.
 * @returns The SidebarFooter component.
 */
const SidebarFooter = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col px-6 py-8', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarContent component.
 * @param {string} props.className - Additional class names to be applied to the SidebarContent component.
 * @returns The SidebarContent component.
 */
const SidebarContent = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-x-hidden overflow-y-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarGroup component.
 * @param {string} props.className - Additional class names to be applied to the SidebarGroup component.
 * @returns The SidebarGroup component.
 */
const SidebarGroup = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarGroupLabel component.
 * @param {string} props.className - Additional class names to be applied to the SidebarGroupLabel component.
 * @param {boolean} props.asChild - If true, the component will render as a child using Radix's Slot.
 * @returns The SidebarGroupLabel component.
 */
const SidebarGroupLabel = ({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }): JSX.Element => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarGroupAction component.
 * @param {string} props.className - Additional class names to be applied to the SidebarGroupAction component.
 * @param {boolean} props.asChild - If true, the component will render as a child using Radix's Slot.
 * @returns The SidebarGroupAction component.
 */
const SidebarGroupAction = ({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }): JSX.Element => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarGroupContent component.
 * @param {string} props.className - Additional class names to be applied to the SidebarGroupContent component.
 * @returns The SidebarGroupContent component.
 */
const SidebarGroupContent = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full px-6', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenu component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenu component.
 * @returns The SidebarMenu component.
 */
const SidebarMenu = ({ className, ...props }: React.ComponentProps<'ul'>): JSX.Element => {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(
        'flex w-full min-w-0 flex-col gap-4 group-data-[collapsible=icon]:max-w-[41px]',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuItem component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuItem component.
 * @returns The SidebarMenuItem component.
 */
const SidebarMenuItem = ({ className, ...props }: React.ComponentProps<'li'>): JSX.Element => {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
};

const sidebarMenuButtonVariants: string =
  'peer/menu-button cursor-pointer flex w-full select-none group text-black h-[45px] items-center gap-3 overflow-hidden px-[13px] text-left text-lg outline-hidden transition-[width,height,padding] disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-primary data-[active=true]:font-medium data-[active=true]:text-white data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-[41px]! group-data-[collapsible=icon]:py-2! group-data-[collapsible=icon]:px-2! [&>span:last-child]:truncate [&>svg]:size-6 [&>svg]:shrink-0';

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuButton component.
 * @param {boolean} props.asChild - If true, the component will render as a child using Radix's Slot.
 * @param {boolean} props.isActive - If true, the button will be styled as active.
 * @param {string | React.ComponentProps<typeof TooltipContent>} props.tooltip - The tooltip content or string.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuButton component.
 * @param {boolean} props.removeHoverStyles - If true, the hover styles will be removed.
 * @returns The SidebarMenuButton component.
 */
const SidebarMenuButton = ({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  removeHoverStyles = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  removeHoverStyles?: boolean;
}): JSX.Element => {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants, 'group/button', className)}
      suppressHydrationWarning={true}
      {...props}
    >
      {!removeHoverStyles && (
        <PxBorder
          width={3}
          radius="lg"
          className="bg-transparent group-hover/button:bg-black group-data-[active=true]:bg-black"
        />
      )}
      {props.children}
      <FocusRing width={3} />
    </Comp>
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuAction component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuAction component.
 * @param {boolean} props.asChild - If true, the component will render as a child using Radix's Slot.
 * @param {boolean} props.showOnHover - If true, the action button will only show on hover of the menu item.
 * @returns The SidebarMenuAction component.
 */
const SidebarMenuAction = ({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}): JSX.Element => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuBadge component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuBadge component.
 * @returns The SidebarMenuBadge component.
 */
const SidebarMenuBadge = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
        'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuSkeleton component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuSkeleton component.
 * @param {boolean} props.showIcon - Whether to show an icon skeleton.
 * @returns The SidebarMenuSkeleton component.
 */
const SidebarMenuSkeleton = ({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean;
}): JSX.Element => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuSub component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuSub component.
 * @returns The SidebarMenuSub component.
 */
const SidebarMenuSub = ({ className, ...props }: React.ComponentProps<'ul'>): JSX.Element => {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuSubItem component.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuSubItem component.
 * @returns The SidebarMenuSubItem component.
 */
const SidebarMenuSubItem = ({ className, ...props }: React.ComponentProps<'li'>): JSX.Element => {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the SidebarMenuSubButton component.
 * @param {boolean} props.asChild - If true, the component will render as a child using Radix's Slot.
 * @param {'sm' | 'md'} props.size - The size of the button.
 * @param {boolean} props.isActive - If true, the button will be styled as active.
 * @param {string} props.className - Additional class names to be applied to the SidebarMenuSubButton component.
 * @returns The SidebarMenuSubButton component.
 */
const SidebarMenuSubButton = ({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
}): JSX.Element => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
};
