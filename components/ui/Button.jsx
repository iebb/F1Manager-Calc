import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../libs/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold whitespace-nowrap " +
    "transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-40 " +
    "disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary-hover focus-visible:ring-primary",
        secondary: "bg-secondary text-secondary-fg hover:bg-secondary-hover focus-visible:ring-secondary",
        success: "bg-success text-success-fg hover:bg-success-hover focus-visible:ring-success",
        danger: "bg-danger text-danger-fg hover:bg-danger-hover focus-visible:ring-danger",
        warning: "bg-warning text-warning-fg hover:bg-warning-hover focus-visible:ring-warning",
        info: "bg-info text-info-fg hover:bg-info-hover focus-visible:ring-info",
        outline:
          "border border-line bg-transparent text-zinc-200 hover:bg-surface-hover focus-visible:ring-line",
        ghost: "bg-transparent text-zinc-300 hover:bg-surface-hover focus-visible:ring-line",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "h-8 w-8 p-0",
        "icon-sm": "h-6 w-6 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export const Button = forwardRef(function Button(
  { className, variant, size, ...props },
  ref
) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
});

export { buttonVariants };
