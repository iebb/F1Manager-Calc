import * as RS from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../../libs/cn";

export function Select({
  value,
  onValueChange,
  placeholder,
  children,
  disabled,
  className,
  contentClassName,
  ariaLabel,
}) {
  return (
    <RS.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RS.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-raised " +
            "px-3 h-9 text-sm text-zinc-100 transition-colors hover:bg-surface-hover " +
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
            "data-[placeholder]:text-zinc-500 disabled:opacity-40 disabled:pointer-events-none",
          className
        )}
      >
        <RS.Value placeholder={placeholder} />
        <RS.Icon className="text-zinc-400 shrink-0">
          <ChevronDown size={16} />
        </RS.Icon>
      </RS.Trigger>
      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-[300px] overflow-hidden rounded-xl border border-line bg-surface-raised " +
              "shadow-pop animate-fade-in",
            contentClassName
          )}
        >
          <RS.Viewport className="p-1">{children}</RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  );
}

export const SelectItem = forwardRef(function SelectItem(
  { children, className, ...props },
  ref
) {
  return (
    <RS.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-1.5 pl-2 pr-8 " +
          "text-sm text-zinc-200 outline-none data-[highlighted]:bg-surface-hover " +
          "data-[state=checked]:text-white data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      <RS.ItemText>{children}</RS.ItemText>
      <RS.ItemIndicator className="absolute right-2 inline-flex items-center text-primary">
        <Check size={15} />
      </RS.ItemIndicator>
    </RS.Item>
  );
});
