import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../libs/cn";

const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-medium leading-none border transition-colors",
  {
    variants: {
      color: {
        default: "bg-surface-raised border-line text-zinc-200",
        primary: "bg-primary/15 border-primary/40 text-blue-200",
        secondary: "bg-secondary/15 border-secondary/40 text-fuchsia-200",
        success: "bg-success/15 border-success/40 text-emerald-200",
        danger: "bg-danger/15 border-danger/40 text-red-200",
        error: "bg-danger/15 border-danger/40 text-red-200",
        warning: "bg-warning/15 border-warning/40 text-amber-200",
        info: "bg-info/15 border-info/40 text-sky-200",
        white: "bg-zinc-200/15 border-zinc-300/40 text-zinc-100",
      },
      clickable: {
        true: "cursor-pointer hover:brightness-125",
        false: "",
      },
    },
    defaultVariants: { color: "default", clickable: false },
  }
);

export function Chip({ label, color, onClick, onDelete, className }) {
  return (
    <span
      className={cn(
        chipVariants({ color, clickable: !!onClick }),
        onDelete ? "pl-2.5 pr-1 py-1" : "px-2.5 py-1",
        className
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-0.5 grid h-4 w-4 place-items-center rounded-full hover:bg-black/30"
          aria-label="remove"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
