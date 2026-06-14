import { cn } from "../../libs/cn";

/** Lightweight toggle switch. */
export function Switch({ checked, onCheckedChange, disabled, id, className }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
          "focus-visible:ring-offset-canvas disabled:opacity-40 disabled:pointer-events-none",
        checked ? "border-primary bg-primary" : "border-line bg-surface-raised",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-1"
        )}
      />
    </button>
  );
}
