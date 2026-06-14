import * as RD from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../libs/cn";

export function Dialog({ open, onOpenChange, children }) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RD.Root>
  );
}

export function DialogContent({ children, className, showClose = true }) {
  return (
    <RD.Portal>
      <RD.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <RD.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 " +
            "border border-line bg-surface p-6 shadow-pop animate-fade-in " +
            "focus:outline-none",
          className
        )}
      >
        {children}
        {showClose && (
          <RD.Close
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-surface-hover hover:text-zinc-200"
            aria-label="Close"
          >
            <X size={18} />
          </RD.Close>
        )}
      </RD.Content>
    </RD.Portal>
  );
}

export function DialogTitle({ children, className }) {
  return (
    <RD.Title className={cn("text-lg font-semibold text-zinc-100 pr-8", className)}>
      {children}
    </RD.Title>
  );
}

export function DialogDescription({ children, className }) {
  return (
    <RD.Description className={cn("mt-2 text-sm text-zinc-400", className)}>
      {children}
    </RD.Description>
  );
}
