import { forwardRef } from "react";
import { cn } from "../../libs/cn";

export const Input = forwardRef(function Input({ className, label, ...props }, ref) {
  const input = (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-surface-raised px-3 text-sm text-zinc-100 " +
          "outline-none transition-colors placeholder:text-zinc-500 " +
          "focus:border-primary focus:ring-2 focus:ring-primary/40",
        className
      )}
      {...props}
    />
  );
  if (!label) return input;
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">{label}</span>
      {input}
    </label>
  );
});
