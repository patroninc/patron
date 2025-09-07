import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { CheckIcon } from 'lucide-react';

import { cn } from '../../lib/utils';
import { JSX } from 'react';

/**
 *
 * @param {object} props - Props to be passed to the Checkbox component.
 * @param {string} props.className - Additional class names to be applied to the Checkbox component.
 * @returns The Checkbox component.
 */
const Checkbox = ({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>): JSX.Element => {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group data-[state=checked]:bg-primary relative m-0.5 size-4 shrink-0 bg-white outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:opacity-50 data-[state=checked]:text-white',
        className,
      )}
      {...props}
    >
      <div className="absolute -top-[2px] left-0 h-0.5 w-4 bg-black" />
      <div className="absolute top-0 -right-[2px] h-4 w-0.5 bg-black" />
      <div className="absolute -bottom-[2px] left-0 h-0.5 w-4 bg-black" />
      <div className="absolute bottom-0 -left-[2px] h-4 w-0.5 bg-black" />

      <div className="absolute -top-[4px] left-0 hidden h-0.5 w-4 bg-white group-focus-visible:block" />
      <div className="absolute top-0 -right-[4px] hidden h-4 w-0.5 bg-white group-focus-visible:block" />
      <div className="absolute -bottom-[4px] left-0 hidden h-0.5 w-4 bg-white group-focus-visible:block" />
      <div className="absolute bottom-0 -left-[4px] hidden h-4 w-0.5 bg-white group-focus-visible:block" />
      <div className="absolute -bottom-0.5 -left-0.5 hidden size-0.5 bg-white group-focus-visible:block" />
      <div className="absolute -right-0.5 -bottom-0.5 hidden size-0.5 bg-white group-focus-visible:block" />
      <div className="absolute -top-0.5 -left-0.5 hidden size-0.5 bg-white group-focus-visible:block" />
      <div className="absolute -top-0.5 -right-0.5 hidden size-0.5 bg-white group-focus-visible:block" />

      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-4" strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};

export { Checkbox };
