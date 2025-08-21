import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";

import { cn } from "~/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group bg-white m-0.5 data-[state=checked]:bg-primary relative data-[state=checked]:text-white aria-invalid:opacity-50 size-4 shrink-0 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <div className="absolute -top-[2px] left-0 w-4 h-0.5 bg-black" />
      <div className="absolute top-0 -right-[2px] h-4 w-0.5 bg-black" />
      <div className="absolute -bottom-[2px] left-0 w-4 h-0.5 bg-black" />
      <div className="absolute bottom-0 -left-[2px] h-4 w-0.5 bg-black" />

      <div className="absolute hidden group-focus-visible:block -top-[4px] left-0 w-4 h-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block top-0 -right-[4px] h-4 w-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block -bottom-[4px] left-0 w-4 h-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block bottom-0 -left-[4px] h-4 w-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block -bottom-0.5 -left-0.5 size-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block -bottom-0.5 -right-0.5 size-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block -top-0.5 -left-0.5 size-0.5 bg-white" />
      <div className="absolute hidden group-focus-visible:block -top-0.5 -right-0.5 size-0.5 bg-white" />

      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-4" strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
