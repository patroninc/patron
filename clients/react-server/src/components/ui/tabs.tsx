import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { JSX } from 'react';
import { cn } from '../../lib/utils';
import PxBorder from '../px-border';
import FocusRing from '../focus-ring';

/**
 *
 * @param {object} props - Props to be passed to the Tabs component.
 * @param {string} props.className - Additional class names to be applied to the Tabs component.
 * @returns The Tabs component.
 */
const Tabs = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>): JSX.Element => {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-5', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TabsList component.
 * @param {string} props.className - Additional class names to be applied to the TabsList component.
 * @returns The TabsList component.
 */
const TabsList = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>): JSX.Element => {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('m-[3px] inline-flex h-[47px] w-fit items-end justify-center gap-5', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TabsTrigger component.
 * @param {string} props.className - Additional class names to be applied to the TabsTrigger component.
 * @returns The TabsTrigger component.
 */
const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): JSX.Element => {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-primary group text-foreground relative z-[5] inline-flex flex-1 items-center justify-center gap-1.5 bg-white px-6 py-[5px] text-lg whitespace-nowrap outline-none select-none hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 data-[state=active]:py-2 data-[state=active]:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      suppressHydrationWarning={true}
      {...props}
    >
      {props.children}
      <PxBorder width={3} radius="lg" />
      <FocusRing width={3} />
    </TabsPrimitive.Trigger>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TabsContent component.
 * @param {string} props.className - Additional class names to be applied to the TabsContent component.
 * @returns The TabsContent component.
 */
const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>): JSX.Element => {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('relative m-[3px] flex-1 outline-none', className)}
      suppressHydrationWarning={true}
      {...props}
    >
      {props.children}
    </TabsPrimitive.Content>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
