import { cn } from "../../libs/cn";

/** Centered max-width page container (replaces MUI Container maxWidth="xl"). */
export function Container({ className, children, ...props }) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-xl px-4 sm:px-6", className)} {...props}>
      {children}
    </div>
  );
}
