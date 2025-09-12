import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { JSX } from 'react';
import { cn } from '../../lib/utils';

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
      className={cn('flex flex-col gap-0', className)}
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
      className={cn('inline-flex h-[47px] w-fit items-end justify-center gap-4', className)}
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
        "data-[state=active]:bg-primary group text-foreground relative z-[5] inline-flex flex-1 items-center justify-center gap-1.5 bg-white px-6 py-[5px] text-lg whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:py-2 data-[state=active]:text-white [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {props.children}
      <div className="absolute -top-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
      <div className="absolute top-[3px] -left-[3px] h-[calc(100%-3px)] w-[3px] bg-black" />
      <div className="absolute top-[3px] -right-[3px] h-[calc(100%-3px)] w-[3px] bg-black" />
      <div className="absolute top-0 left-0 size-[3px] bg-black" />
      <div className="absolute top-0 right-0 size-[3px] bg-black" />

      <div className="absolute -bottom-[0px] left-0 h-[3px] w-full bg-black group-data-[state=active]:-bottom-[3px] group-data-[state=active]:bg-white" />

      <div className="absolute -top-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white group-focus-visible:block" />
      <div className="absolute top-[3px] -left-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white group-focus-visible:block" />
      <div className="absolute top-[3px] -right-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white group-focus-visible:block" />
      <div className="absolute top-0 -left-[3px] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute -top-[3px] left-[0] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute top-0 -right-[3px] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute -top-[3px] right-[0] hidden size-[3px] bg-white group-focus-visible:block" />
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
      className={cn('relative flex-1 bg-white p-5 outline-none', className)}
      {...props}
    >
      {props.children}
      <div className="absolute -top-[3px] left-0 h-[3px] w-full bg-black" />
      <div className="absolute -bottom-[3px] left-0 h-[3px] w-full bg-black" />
      <div className="absolute top-0 -left-[3px] h-full w-[3px] bg-black" />
      <div className="absolute top-0 -right-[3px] h-full w-[3px] bg-black" />
    </TabsPrimitive.Content>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
