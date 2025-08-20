import * as React from "react";
import { Slot as RadixSlot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center group peer relative justify-center gap-2 whitespace-nowrap text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        destructive: "bg-destructive text-white",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  shadow = true,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    shadow?: boolean;
  }) {
  const Comp = asChild ? RadixSlot.Slot : "button";

  const Btn = (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        shadow
          ? "hover:translate-x-[3px] hover:translate-y-[3px] transition-transform relative z-[1] ease-in-out"
          : "m-[3px]",
      )}
      {...props}
    >
      <div className="absolute -top-[3px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-black" />
      <div className="absolute -bottom-[3px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-black" />
      <div className="absolute top-[3px] -left-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
      <div className="absolute top-[3px] -right-[3px] h-[calc(100%-6px)] w-[3px] bg-black" />
      <div className="absolute top-0 left-0 size-[3px] bg-black" />
      <div className="absolute top-0 right-0 size-[3px] bg-black" />
      <div className="absolute bottom-0 left-0 size-[3px] bg-black" />
      <div className="absolute bottom-0 right-0 size-[3px] bg-black" />
      {props.children}
      <div className="absolute hidden group-focus-visible:block -top-[6px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block -bottom-[6px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block top-[3px] -left-[6px] h-[calc(100%-6px)] w-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block top-[3px] -right-[6px] h-[calc(100%-6px)] w-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block top-0 -left-[3px] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block -top-[3px] left-[0] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block top-0 -right-[3px] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block -top-[3px] right-[0] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block bottom-0 -left-[3px] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block -bottom-[3px] left-[0] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block bottom-0 -right-[3px] size-[3px] bg-white" />
      <div className="absolute hidden group-focus-visible:block -bottom-[3px] right-[0] size-[3px] bg-white" />
    </Comp>
  );

  return shadow ? (
    <div className="p-[3px] relative">
      {Btn}
      <div className="absolute -bottom-[3px] left-[9px] w-[calc(100%-12px)] h-[3px] bg-black peer-disabled:bg-black/50" />
      <div className="absolute top-[9px] -right-[3px] h-[calc(100%-12px)] w-[3px] bg-black peer-disabled:bg-black/50" />
      <div className="absolute bottom-[0px] right-0 w-[3px] h-[6px] bg-black peer-disabled:bg-black/50" />
      <div className="absolute bottom-[0px] right-[3px] w-[3px] h-[3px] bg-black peer-disabled:bg-black/50" />
    </div>
  ) : (
    Btn
  );
}

export { Button, buttonVariants };
