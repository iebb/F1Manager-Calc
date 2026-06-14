import * as RT from "@radix-ui/react-tooltip";
import { cn } from "../../libs/cn";

/**
 * Rich tooltip replacement for the old MUI HtmlTooltip.
 * Usage: <HtmlTooltip title={<...>}>{trigger}</HtmlTooltip>
 */
export function HtmlTooltip({ title, children, className, maxWidth = 260 }) {
  return (
    <RT.Provider delayDuration={150}>
      <RT.Root>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content
            sideOffset={6}
            className={cn(
              "z-50 rounded-xl border border-line bg-surface-raised px-3 py-2 text-xs text-zinc-200 " +
                "shadow-pop animate-fade-in",
              className
            )}
            style={{ maxWidth }}
          >
            {title}
            <RT.Arrow className="fill-surface-raised" />
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  );
}

export function SimpleTooltip({ label, children }) {
  return (
    <RT.Provider delayDuration={150}>
      <RT.Root>
        <RT.Trigger asChild>{children}</RT.Trigger>
        <RT.Portal>
          <RT.Content
            sideOffset={6}
            className="z-50 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100 shadow-pop animate-fade-in"
          >
            {label}
            <RT.Arrow className="fill-zinc-800" />
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  );
}
