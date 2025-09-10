import * as React from 'react';
import { Slot as RadixSlot } from 'radix-ui';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { JSX } from 'react';
import { buttonVariants } from './button-variants';

/**
 *
 * @param {object} props - Props to be passed to the Button component.
 * @param {string} props.className - Additional class names to be applied to the Button component.
 * @param {string} props.variant - The variant of the button, which determines its styling. Can be 'default', 'destructive', or 'secondary'.
 * @param {string} props.size - The size of the button, which determines its dimensions. Can be 'default', 'sm', 'lg', or 'icon'.
 * @param {boolean} [props.asChild=false] - If true, the button will render as a child component using Radix's Slot. Defaults to false.
 * @param {boolean} [props.shadow=true] - If true, the button will have a shadow effect. Defaults to true.
 * @param {string} [props.containerClassName] - Additional class names to be applied to the container of the button.
 * @returns The Button component.
 */
const Button = ({
  className,
  variant,
  size,
  asChild = false,
  shadow = true,
  containerClassName,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    shadow?: boolean;
    containerClassName?: string;
  }): JSX.Element => {
  const Comp = asChild ? RadixSlot.Slot : 'button';

  const Btn = (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        shadow
          ? 'relative z-[1] transition-transform ease-in-out hover:translate-x-[3px] hover:translate-y-[3px]'
          : 'm-[3px]',
      )}
      {...props}
    >
      <div className="absolute -top-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
      <div className="absolute -bottom-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
      <div className="absolute top-[3px] -left-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
      <div className="absolute top-[3px] -right-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
      <div className="absolute top-0 left-0 size-[3px] bg-black" />
      <div className="absolute top-0 right-0 size-[3px] bg-black" />
      <div className="absolute bottom-0 left-0 size-[3px] bg-black" />
      <div className="absolute right-0 bottom-0 size-[3px] bg-black" />
      {props.children}
      <div className="absolute -top-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white group-focus-visible:block" />
      <div className="absolute -bottom-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white group-focus-visible:block" />
      <div className="absolute top-[3px] -left-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white group-focus-visible:block" />
      <div className="absolute top-[3px] -right-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white group-focus-visible:block" />
      <div className="absolute top-0 -left-[3px] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute -top-[3px] left-[0] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute top-0 -right-[3px] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute -top-[3px] right-[0] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute bottom-0 -left-[3px] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute -bottom-[3px] left-[0] hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute -right-[3px] bottom-0 hidden size-[3px] bg-white group-focus-visible:block" />
      <div className="absolute right-[0] -bottom-[3px] hidden size-[3px] bg-white group-focus-visible:block" />
    </Comp>
  );

  return shadow ? (
    <div className={cn('relative p-[3px]', containerClassName)}>
      {Btn}
      <div className="absolute -bottom-[3px] left-[9px] h-[3px] w-[calc(100%-12px)] bg-black peer-disabled:bg-black/50" />
      <div className="absolute top-[9px] -right-[3px] h-[calc(100%-12px)] w-[3px] bg-black peer-disabled:bg-black/50" />
      <div className="absolute right-0 bottom-[0px] h-[6px] w-[3px] bg-black peer-disabled:bg-black/50" />
      <div className="absolute right-[3px] bottom-[0px] h-[3px] w-[3px] bg-black peer-disabled:bg-black/50" />
    </div>
  ) : (
    Btn
  );
};

export { Button };
