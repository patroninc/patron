import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import PxBorder from '@/components/px-border';
import { JSX } from 'react';
import FocusRing from '@/components/focus-ring';

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
      <PxBorder width={2} radius="md" />
      <FocusRing width={2} />

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
