'use client';

import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';
import { JSX } from 'react';

/**
 *
 * @param {object} props - Props to be passed to the Label component.
 * @param {string} props.className - Additional class names to be applied to the Label component.
 * @returns The Label component.
 */
const Label = ({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>): JSX.Element => {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-bold select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
};

export { Label };
