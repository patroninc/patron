import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative m-[3px]">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground peer bg-white placeholder:text-muted-foreground selection:bg-primary selection:text-white flex h-9 w-full min-w-0 px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      <div className="absolute -top-[3px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute -bottom-[3px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute top-[3px] -left-[3px] h-[calc(100%-6px)] w-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute top-[3px] -right-[3px] h-[calc(100%-6px)] w-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute top-0 left-0 size-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute top-0 right-0 size-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute bottom-0 left-0 size-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute bottom-0 right-0 size-[3px] bg-black peer-[.has-error]:bg-destructive" />
      <div className="absolute hidden peer-focus-visible:block -top-[6px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block -bottom-[6px] left-[3px] w-[calc(100%-6px)] h-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block top-[3px] -left-[6px] h-[calc(100%-6px)] w-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block top-[3px] -right-[6px] h-[calc(100%-6px)] w-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block top-0 -left-[3px] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block -top-[3px] left-[0] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block top-0 -right-[3px] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block -top-[3px] right-[0] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block bottom-0 -left-[3px] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block -bottom-[3px] left-[0] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block bottom-0 -right-[3px] size-[3px] bg-white" />
      <div className="absolute hidden peer-focus-visible:block -bottom-[3px] right-[0] size-[3px] bg-white" />
    </div>
  );
}

export { Input };
