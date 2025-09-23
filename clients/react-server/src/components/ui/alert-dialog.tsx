import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import { JSX } from 'react';
import { buttonVariants } from './button-variants';
import PxBorder from '@/components/px-border';
import FocusRing from '@/components/focus-ring';
import { VariantProps } from 'class-variance-authority';

/**
 *
 * @param props - Props to be passed to the AlertDialog root component.
 * @returns The AlertDialog root component.
 */
const AlertDialog = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialog>): JSX.Element => {
  return <AlertDialogPrimitive.AlertDialog data-slot="alert-dialog" {...props} />;
};

/**
 *
 * @param props - Props to be passed to the AlertDialog trigger component.
 * @returns The AlertDialog trigger component.
 */
const AlertDialogTrigger = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogTrigger>): JSX.Element => {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
};

/**
 *
 * @param props - Props to be passed to the AlertDialog portal component.
 * @returns The AlertDialog portal component.
 */
const AlertDialogPortal = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogPortal>): JSX.Element => {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog overlay component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog overlay component.
 * @returns The AlertDialog overlay component.
 */
const AlertDialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogOverlay>): JSX.Element => {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
        className,
      )}
      {...props}
    />
  );
};

type AlertDialogContentProps = React.ComponentProps<
  typeof AlertDialogPrimitive.AlertDialogContent
> & {
  contentClassName?: string;
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog content component.
 * @param {string} props.className - Additional class names to be applied to the inner content container of the AlertDialog.
 * @param {string} props.contentClassName - Additional class names to be applied to the outer content container of the AlertDialog.
 * @returns The AlertDialog content component.
 */
const AlertDialogContent = ({
  className,
  contentClassName,
  ...props
}: AlertDialogContentProps): JSX.Element => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-secondary-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] min-w-0 translate-x-[-50%] translate-y-[-50%] gap-4 duration-200 sm:max-w-lg',
          contentClassName,
        )}
        {...props}
      >
        <div
          className={cn('bg-secondary-primary relative flex min-w-0 flex-col gap-6 p-6', className)}
        >
          {props.children}
          <PxBorder width={5} radius="lg" />
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog header component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog header component.
 * @returns The AlertDialog header component.
 */
const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-4 text-center sm:text-left', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog footer component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog footer component.
 * @returns The AlertDialog footer component.
 */
const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog title component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog title component.
 * @returns The AlertDialog title component.
 */
const AlertDialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogTitle>): JSX.Element => {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-center text-2xl font-bold', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog description component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog description component.
 * @returns The AlertDialog description component.
 */
const AlertDialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogDescription>): JSX.Element => {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-center text-base', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog action component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog action component.
 * @param {string} props.variant - The variant of the button, which determines its styling. Can be 'default', 'destructive', or 'secondary'.
 * @returns The AlertDialog action component.
 */
const AlertDialogAction = ({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  VariantProps<typeof buttonVariants>): JSX.Element => {
  return (
    <AlertDialogPrimitive.Action className={cn(buttonVariants({ variant }), className)} {...props}>
      <PxBorder width={3} radius="lg" />
      <FocusRing width={3} />
      {props.children}
    </AlertDialogPrimitive.Action>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the AlertDialog cancel component.
 * @param {string} props.className - Additional class names to be applied to the AlertDialog cancel component.
 * @returns The AlertDialog cancel component.
 */
const AlertDialogCancel = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>): JSX.Element => {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: 'secondary' }), className)}
      {...props}
    >
      <PxBorder width={3} radius="lg" />
      <FocusRing width={3} />
      {props.children}
    </AlertDialogPrimitive.Cancel>
  );
};

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
