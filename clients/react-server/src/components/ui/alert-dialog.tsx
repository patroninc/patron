import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { cn } from '../../lib/utils';
import { buttonVariants } from './button';

/**
 *
 * @param root0
 */
const AlertDialog = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogRoot>) => {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
};

/**
 *
 * @param root0
 */
const AlertDialogTrigger = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogTrigger>) => {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
};

/**
 *
 * @param root0
 */
const AlertDialogPortal = ({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogPortal>) => {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
};

/**
 *
 * @param root0
 */
const AlertDialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogOverlay>) => {
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

/**
 *
 * @param root0
 */
const AlertDialogContent = ({
  className,
  contentClassName,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogContent>) => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-secondary-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 duration-200 sm:max-w-lg',
          contentClassName,
        )}
        {...props}
      >
        <div className={cn('bg-secondary-primary relative flex flex-col gap-4 p-6', className)}>
          {props.children}
          {/* Pixelated border */}
          <div className="pointer-events-none absolute -top-[5px] left-[5px] h-[5px] w-[calc(100%-10px)] bg-black"></div>
          <div className="pointer-events-none absolute -bottom-[5px] left-[5px] h-[5px] w-[calc(100%-10px)] bg-black"></div>
          <div className="pointer-events-none absolute top-[5px] -left-[5px] h-[calc(100%-10px)] w-[5px] bg-black"></div>
          <div className="pointer-events-none absolute top-[5px] -right-[5px] h-[calc(100%-10px)] w-[5px] bg-black"></div>
          <div className="pointer-events-none absolute top-0 left-0 size-[5px] bg-black"></div>
          <div className="pointer-events-none absolute bottom-0 left-0 size-[5px] bg-black"></div>
          <div className="pointer-events-none absolute top-0 right-0 size-[5px] bg-black"></div>
          <div className="pointer-events-none absolute right-0 bottom-0 size-[5px] bg-black"></div>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
};

/**
 *
 * @param root0
 */
const AlertDialogHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
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
 * @param root0
 */
const AlertDialogFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3', className)}
      {...props}
    />
  );
};

/**
 *
 * @param root0
 */
const AlertDialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogTitle>) => {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-bold', className)}
      {...props}
    />
  );
};

/**
 *
 * @param root0
 */
const AlertDialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.AlertDialogDescription>) => {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm', className)}
      {...props}
    />
  );
};

/**
 *
 * @param root0
 */
const AlertDialogAction = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) => {
  return <AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />;
};

/**
 *
 * @param root0
 */
const AlertDialogCancel = ({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) => {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'secondary' }), className)}
      {...props}
    />
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
