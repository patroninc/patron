import * as React from 'react';
import { JSX } from 'react';

import { cn } from '@/lib/utils';

/**
 *
 * @param {object} props - Props to be passed to the Card component.
 * @param {string} props.className - Additional class names to be applied to the Card component.
 * @returns The Card component.
 */
const Card = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="card"
      className={cn('bg-card text-card-foreground flex flex-col gap-6 py-6', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the Card header component.
 * @param {string} props.className - Additional class names to be applied to the Card header component.
 * @returns The Card header component.
 */
const CardHeader = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the Card title component.
 * @param {string} props.className - Additional class names to be applied to the Card title component.
 * @returns The Card title component.
 */
const CardTitle = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the Card description component.
 * @param {string} props.className - Additional class names to be applied to the Card description component.
 * @returns The Card description component.
 */
const CardDescription = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the Card action component.
 * @param {string} props.className - Additional class names to be applied to the Card action component.
 * @returns The Card action component.
 */
const CardAction = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the Card content component.
 * @param {string} props.className - Additional class names to be applied to the Card content component.
 * @returns The Card content component.
 */
const CardContent = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
};

/**
 *
 * @param {object} props - Props to be passed to the Card footer component.
 * @param {string} props.className - Additional class names to be applied to the Card footer component.
 * @returns The Card footer component.
 */
const CardFooter = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
