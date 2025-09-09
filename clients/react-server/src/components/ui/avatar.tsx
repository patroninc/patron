import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '../../lib/utils';
import { JSX } from 'react';

/**
 * @param {object} props - Props to be passed to the Avatar component.
 * @param {string} props.className - Additional class names to be applied to the Avatar component.
 * @returns The Avatar component.
 */
const Avatar = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>): JSX.Element => {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-10 shrink-0 overflow-hidden p-[3px]', className)}
      {...props}
    >
      <div className="relative size-full">
        <div className="absolute -top-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
        <div className="absolute -bottom-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
        <div className="absolute top-[3px] -left-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
        <div className="absolute top-[3px] -right-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
        <div className="absolute top-0 left-0 size-[3px] bg-black" />
        <div className="absolute top-0 right-0 size-[3px] bg-black" />
        <div className="absolute bottom-0 left-0 size-[3px] bg-black" />
        <div className="absolute right-0 bottom-0 size-[3px] bg-black" />
        {props.children}
      </div>
    </AvatarPrimitive.Root>
  );
};

/**
 * @param {object} props - Props to be passed to the AvatarImage component.
 * @param {string} props.className - Additional class names to be applied to the AvatarImage component.
 * @returns The AvatarImage component.
 */
const AvatarImage = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>): JSX.Element => {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
};

/**
 * @param {object} props - Props to be passed to the AvatarFallback component.
 * @param {string} props.className - Additional class names to be applied to the AvatarFallback component.
 * @returns The AvatarFallback component.
 */
const AvatarFallback = ({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>): JSX.Element => {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...props}
    />
  );
};

export { Avatar, AvatarImage, AvatarFallback };
