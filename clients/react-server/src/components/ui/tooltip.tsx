import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import { JSX } from 'react';

/**
 *
 * @param {object} props - Props for the TooltipProvider component
 * @param {number} props.delayDuration - Delay duration before showing the tooltip (default is 0)
 * @returns {JSX.Element} The TooltipProvider component
 */
const TooltipProvider = ({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>): JSX.Element => {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props for the Tooltip component
 * @returns {JSX.Element} The Tooltip component
 */
const Tooltip = ({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>): JSX.Element => {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
};

/**
 *
 * @param {object} props - Props for the TooltipTrigger component
 * @returns {JSX.Element} The TooltipTrigger component
 */
const TooltipTrigger = ({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>): JSX.Element => {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
};

/**
 *
 * @param {object} props - Props for the TooltipContent component
 * @param {string} props.className - Additional class names for styling
 * @param {number} props.sideOffset - Offset from the side (default is 0)
 * @param {React.ReactNode} props.children - Content of the tooltip
 * @returns {JSX.Element} The TooltipContent component
 */
const TooltipContent = ({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>): JSX.Element => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
