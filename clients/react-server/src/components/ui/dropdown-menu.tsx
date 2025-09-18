import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { JSX } from 'react';
import PxBorder from '@/components/px-border';

/**
 * @param {object} props - Props to be passed to the DropdownMenu component.
 * @returns The DropdownMenu component.
 */
/**
 * @param {object} props - Props to be passed to the DropdownMenu component.
 * @returns {JSX.Element} The DropdownMenu component.
 */
const DropdownMenu = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>): JSX.Element => {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuPortal component.
 * @returns The DropdownMenuPortal component.
 */
/**
 * @param {object} props - Props to be passed to the DropdownMenuPortal component.
 * @returns {JSX.Element} The DropdownMenuPortal component.
 */
const DropdownMenuPortal = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>): JSX.Element => {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuTrigger component.
 * @returns {JSX.Element} The DropdownMenuTrigger component.
 */
const DropdownMenuTrigger = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>): JSX.Element => {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuContent component.
 * @param {string} props.className - Additional class names to apply.
 * @param {number} props.sideOffset - Offset from the trigger element.
 * @returns {JSX.Element} The DropdownMenuContent component.
 */
const DropdownMenuContent = ({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>): JSX.Element => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto p-[3px] text-black',
          className,
        )}
        {...props}
      >
        <div className="bg-secondary-primary relative flex h-full w-full flex-col gap-2 p-3">
          <PxBorder width={3} radius="lg" />
          {props.children}
        </div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuGroup component.
 * @returns {JSX.Element} The DropdownMenuGroup component.
 */
const DropdownMenuGroup = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>): JSX.Element => {
  return (
    <DropdownMenuPrimitive.Group
      className="flex flex-col gap-3"
      data-slot="dropdown-menu-group"
      {...props}
    />
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuItem component.
 * @param {string} props.className - Additional class names to apply.
 * @param {boolean} props.inset - Whether the item has inset styling.
 * @param {'default' | 'destructive'} props.variant - The visual variant of the item.
 * @returns {JSX.Element} The DropdownMenuItem component.
 */
const DropdownMenuItem = ({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}): JSX.Element => {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-primary focus:data-[variant=destructive]:bg-destructive group relative flex cursor-pointer items-center gap-3 px-[13px] py-1 text-sm outline-hidden select-none focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 focus:data-[variant=destructive]:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-black focus:[&_svg:not([class*='text-'])]:text-white",
        className,
      )}
      {...props}
    >
      {props.children}
      <div className="absolute -top-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] group-focus:bg-black" />
      <div className="absolute -bottom-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] group-focus:bg-black" />
      <div className="absolute top-[3px] -left-[3px] h-[calc(100%-6px)] w-[3px] group-focus:bg-black" />
      <div className="absolute top-[3px] -right-[3px] h-[calc(100%-6px)] w-[3px] group-focus:bg-black" />
      <div className="absolute top-0 left-0 size-[3px] group-focus:bg-black" />
      <div className="absolute top-0 right-0 size-[3px] group-focus:bg-black" />
      <div className="absolute bottom-0 left-0 size-[3px] group-focus:bg-black" />
      <div className="absolute right-0 bottom-0 size-[3px] group-focus:bg-black" />
    </DropdownMenuPrimitive.Item>
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuCheckboxItem component.
 * @param {string} props.className - Additional class names to apply.
 * @param {React.ReactNode} props.children - The content of the checkbox item.
 * @param {boolean} props.checked - Whether the checkbox is checked.
 * @returns {JSX.Element} The DropdownMenuCheckboxItem component.
 */
const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>): JSX.Element => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuRadioGroup component.
 * @returns {JSX.Element} The DropdownMenuRadioGroup component.
 */
const DropdownMenuRadioGroup = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>): JSX.Element => {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuRadioItem component.
 * @param {string} props.className - Additional class names to apply.
 * @param {React.ReactNode} props.children - The content of the radio item.
 * @returns {JSX.Element} The DropdownMenuRadioItem component.
 */
const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>): JSX.Element => {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuLabel component.
 * @param {string} props.className - Additional class names to apply.
 * @param {boolean} props.inset - Whether the label has inset styling.
 * @returns {JSX.Element} The DropdownMenuLabel component.
 */
const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}): JSX.Element => {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
      {...props}
    />
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuShortcut component.
 * @param {string} props.className - Additional class names to apply.
 * @returns {JSX.Element} The DropdownMenuShortcut component.
 */
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.ComponentProps<'span'>): JSX.Element => {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuSub component.
 * @returns {JSX.Element} The DropdownMenuSub component.
 */
const DropdownMenuSub = ({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>): JSX.Element => {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuSubTrigger component.
 * @param {string} props.className - Additional class names to apply.
 * @param {boolean} props.inset - Whether the trigger has inset styling.
 * @param {React.ReactNode} props.children - The content of the sub trigger.
 * @returns {JSX.Element} The DropdownMenuSubTrigger component.
 */
const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}): JSX.Element => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
};

/**
 * @param {object} props - Props to be passed to the DropdownMenuSubContent component.
 * @param {string} props.className - Additional class names to apply.
 * @returns {JSX.Element} The DropdownMenuSubContent component.
 */
const DropdownMenuSubContent = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>): JSX.Element => {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden border p-1 shadow-lg',
        className,
      )}
      {...props}
    />
  );
};

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
