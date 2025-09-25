import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';
import PxBorder from '../px-border';

/**
 * Root popover component that provides the context for popover functionality.
 *
 * @param props - Props passed to the Radix UI Popover Root component
 * @returns The popover root element
 */
const Popover = ({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>): React.JSX.Element => {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
};

/**
 * Trigger component that opens the popover when clicked.
 *
 * @param props - Props passed to the Radix UI Popover Trigger component
 * @returns The popover trigger element
 */
const PopoverTrigger = ({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>): React.JSX.Element => {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
};

/**
 * Content component that displays the popover content.
 *
 * @param props - Props passed to the Radix UI Popover Content component
 * @param props.className - Additional CSS classes to apply
 * @param props.align - Alignment of the popover content relative to the trigger
 * @param props.sideOffset - Distance between the popover and trigger
 * @returns The popover content element
 */
const PopoverContent = ({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>): React.JSX.Element => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-secondary-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 text-black shadow-md outline-hidden',
          className,
        )}
        {...props}
      >
        {props.children}
        <PxBorder width={3} radius="lg" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

/**
 * Anchor component that provides a reference point for positioning the popover.
 *
 * @param props - Props passed to the Radix UI Popover Anchor component
 * @returns The popover anchor element
 */
const PopoverAnchor = ({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>): React.JSX.Element => {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
};

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
