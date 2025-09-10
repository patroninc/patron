import * as React from 'react';

import { cn } from '@/lib/utils';
import { JSX } from 'react';

/**
 *
 * @param {object} props - Props to be passed to the Input component.
 * @param {string} props.className - Additional class names to be applied to the Input component.
 * @param {string} props.containerClassName - Additional class names to be applied to the Input container.
 * @param {boolean} props.roundedLeft - Whether the left side of the input should have rounded corners. Defaults to true.
 * @param {string} props.type - The type of input element to render (e.g., "text", "password", "email").
 * @returns The Input component.
 */
const Input = ({
  className,
  containerClassName,
  type,
  roundedLeft = true,
  ...props
}: React.ComponentProps<'input'> & {
  containerClassName?: string;
  roundedLeft?: boolean;
}): JSX.Element => {
  return (
    <div className={cn('relative m-[3px]', !roundedLeft && 'ml-0', containerClassName)}>
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground peer placeholder:text-muted-foreground selection:bg-primary flex h-9 w-full min-w-0 bg-white px-3 py-1 text-base transition-[color,box-shadow] outline-none selection:text-white file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
          !roundedLeft && 'border-l-3 border-l-black pl-3',
          className,
        )}
        {...props}
      />
      <div className="peer-[.has-error]:bg-destructive absolute -top-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
      <div className="peer-[.has-error]:bg-destructive absolute -bottom-[3px] left-[3px] h-[3px] w-[calc(100%-6px)] bg-black" />
      <div className="peer-[.has-error]:bg-destructive absolute top-[3px] -right-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
      <div className="peer-[.has-error]:bg-destructive absolute top-0 right-0 size-[3px] bg-black" />
      <div className="peer-[.has-error]:bg-destructive absolute right-0 bottom-0 size-[3px] bg-black" />
      <div className="absolute -top-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white peer-focus-visible:block" />
      <div className="absolute -bottom-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white peer-focus-visible:block" />
      <div className="absolute top-[3px] -right-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white peer-focus-visible:block" />
      <div className="absolute top-0 -right-[3px] hidden size-[3px] bg-white peer-focus-visible:block" />
      <div className="absolute -top-[3px] right-[0] hidden size-[3px] bg-white peer-focus-visible:block" />
      <div className="absolute -right-[3px] bottom-0 hidden size-[3px] bg-white peer-focus-visible:block" />
      <div className="absolute right-[0] -bottom-[3px] hidden size-[3px] bg-white peer-focus-visible:block" />

      {roundedLeft && (
        <>
          <div className="absolute bottom-0 -left-[3px] hidden size-[3px] bg-white peer-focus-visible:block" />
          <div className="absolute -bottom-[3px] left-[0] hidden size-[3px] bg-white peer-focus-visible:block" />
          <div className="absolute top-0 -left-[3px] hidden size-[3px] bg-white peer-focus-visible:block" />
          <div className="absolute -top-[3px] left-[0] hidden size-[3px] bg-white peer-focus-visible:block" />
          <div className="absolute top-[3px] -left-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white peer-focus-visible:block" />
          <div className="peer-[.has-error]:bg-destructive absolute bottom-0 left-0 size-[3px] bg-black" />
          <div className="peer-[.has-error]:bg-destructive absolute top-0 left-0 size-[3px] bg-black" />
          <div className="peer-[.has-error]:bg-destructive absolute top-[3px] -left-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
        </>
      )}

      {!roundedLeft && (
        <>
          <div className="absolute -top-[3px] left-[0] size-[3px] bg-black" />
          <div className="absolute -bottom-[3px] left-[0] size-[3px] bg-black" />
        </>
      )}
    </div>
  );
};

export { Input };
