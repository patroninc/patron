import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';
import { JSX } from 'react';
import PxBorder from '@/components/px-border';

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
        <PxBorder width={3} radius="lg" />
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
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-transparent',
        className,
      )}
      {...props}
    />
  );
};

export { Avatar, AvatarImage, AvatarFallback };
