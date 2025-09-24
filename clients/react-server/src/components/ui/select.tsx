import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import PxBorder from '@/components/px-border';
import FocusRing from '@/components/focus-ring';

/**
 * A collection of select components built on top of Radix UI Select primitives.
 * These components provide a complete dropdown selection interface with consistent styling.
 */

/**
 * Root select component that wraps the entire select functionality.
 *
 * @param props - All props from Radix UI Select Root component
 * @returns The root select component
 */
const Select = ({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>): React.ReactElement => {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
};

/**
 * Groups related select items together with optional labeling.
 *
 * @param props - All props from Radix UI Select Group component
 * @returns The select group component
 */
const SelectGroup = ({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>): React.ReactElement => {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
};

/**
 * Displays the selected value or placeholder text within the select trigger.
 *
 * @param props - All props from Radix UI Select Value component
 * @returns The select value component
 */
const SelectValue = ({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>): React.ReactElement => {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
};

/**
 * The clickable trigger button that opens the select dropdown.
 * Features customizable sizing and consistent styling with form inputs.
 *
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @param props.size - Size variant ('sm' | 'default')
 * @param props.children - Child components (typically SelectValue)
 * @returns The select trigger component
 */
const SelectTrigger = ({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}): React.ReactElement => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group relative m-[3px] flex w-fit items-center justify-between gap-2 bg-white px-3 py-2 text-sm whitespace-nowrap transition-[color] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-black/50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-black",
        className,
      )}
      {...props}
    >
      <PxBorder width={3} radius="lg" />
      <FocusRing width={3} />
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

/**
 * The dropdown content container that holds select items.
 * Includes smooth animations and flexible positioning options.
 *
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @param props.children - Child components (typically SelectItem components)
 * @param props.position - Positioning strategy ('popper' by default)
 * @returns The select content component
 */
const SelectContent = ({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>): React.ReactElement => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'group data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border-3 border-black bg-white text-black',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

/**
 * A label component for grouping select items with descriptive text.
 * Typically used within SelectGroup to provide context for grouped items.
 *
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @returns The select label component
 */
const SelectLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>): React.ReactElement => {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
};

/**
 * Individual selectable item within the dropdown.
 * Features hover states, selection indicators, and keyboard navigation support.
 *
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @param props.children - The item content (text, icons, etc.)
 * @returns The select item component
 */
const SelectItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>): React.ReactElement => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-primary group [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-md border-3 border-transparent py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:border-black focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-black group-focus:text-white" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
};

/**
 * Scroll button that appears when content extends above the visible area.
 * Allows users to scroll up through the select options.
 *
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @returns The scroll up button component
 */
const SelectScrollUpButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>): React.ReactElement => {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
};

/**
 * Scroll button that appears when content extends below the visible area.
 * Allows users to scroll down through the select options.
 *
 * @param props - The component props
 * @param props.className - Additional CSS classes to apply
 * @returns The scroll down button component
 */
const SelectScrollDownButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>): React.ReactElement => {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
};

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
};
