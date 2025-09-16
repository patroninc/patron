import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center group peer select-none relative justify-center gap-2 whitespace-nowrap text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none hover:cursor-pointer hover:disable:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        destructive: 'bg-destructive text-white',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 text-base has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export { buttonVariants };
