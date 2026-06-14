import * as RT from "@radix-ui/react-tooltip";
import { cn } from "../../libs/cn";

// Fill color per feedback state. The mark is a thin line (touching the track)
// ending in an upward-pointing triangle tail.
const COLORS = {
  optimal: "#00FFFF", // glowing cyan
  great: "#2563eb", // darker blue
  good: "#ffffff",
  bad: "#f87171", // light red
  "bad+": "#f87171",
  "bad-": "#f87171",
  unknown: "#71717a",
};

const TEXT = {
  optimal: "text-cyan-300",
  great: "text-blue-300",
  good: "text-white",
  bad: "text-red-300",
  "bad+": "text-red-300",
  "bad-": "text-red-300",
  unknown: "text-zinc-400",
};

// Tinted badge per feedback state (used in tables, where the value is shown).
const BADGE = {
  optimal: "bg-cyan-400/15 text-cyan-300",
  great: "bg-blue-500/15 text-blue-300",
  good: "bg-zinc-200/15 text-zinc-100",
  bad: "bg-red-400/15 text-red-300",
  "bad+": "bg-red-400/15 text-red-300",
  "bad-": "bg-red-400/15 text-red-300",
  unknown: "bg-surface-raised text-zinc-400",
};

// "0.539" -> ".539"
const shortValue = (v) => v.toFixed(3).replace(/^0\./, ".");

const TRIANGLE_UP = "polygon(50% 0%, 100% 100%, 0% 100%)";

function MarkShape({ feedback }) {
  const color = COLORS[feedback] || "#a1a1aa";
  const glow = feedback === "optimal";
  const filter = glow
    ? `drop-shadow(0 0 2.5px ${color}) drop-shadow(0 0 1px ${color})`
    : "drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.65))";
  return (
    <span className="inline-flex flex-col items-center transition-transform group-hover:scale-110" style={{ filter }}>
      <span style={{ width: "1.5px", height: "6px", background: color }} />
      <span style={{ width: "9px", height: "6px", background: color, clipPath: TRIANGLE_UP }} />
    </span>
  );
}

/**
 * Compact history mark — a colored line + upward-triangle tail (colour only).
 * Hover reveals the feedback name and its 3-digit value. When `onClick` is given
 * (slider marks), clicking jumps to that mark's value. Wrap the table/slider area
 * in <RT.Provider> (FeedbackMarkProvider).
 */
export function FeedbackMark({ fb, onClick, badge = false }) {
  if (!fb) {
    return badge ? (
      <span className="text-zinc-700">–</span>
    ) : (
      <span className="inline-flex flex-col items-center opacity-40">
        <span style={{ width: "1.5px", height: "6px", background: "#52525b" }} />
        <span style={{ width: "9px", height: "6px", background: "#52525b", clipPath: TRIANGLE_UP }} />
      </span>
    );
  }
  return (
    <RT.Root delayDuration={60}>
      <RT.Trigger asChild>
        {badge ? (
          <span
            className={cn(
              "inline-block cursor-default rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
              BADGE[fb.feedback] || "bg-surface-raised text-zinc-300"
            )}
          >
            {shortValue(fb.value)}
          </span>
        ) : (
          <span
            role={onClick ? "button" : undefined}
            onPointerDown={onClick ? (e) => e.stopPropagation() : undefined}
            onClick={onClick}
            className={cn("group inline-block align-middle", onClick && "cursor-pointer")}
          >
            <MarkShape feedback={fb.feedback} />
          </span>
        )}
      </RT.Trigger>
      <RT.Portal>
        <RT.Content
          sideOffset={6}
          className="z-50 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100 shadow-pop animate-fade-in"
        >
          <span className={cn("font-semibold", TEXT[fb.feedback])}>{fb.feedback}</span>
          <span className="text-zinc-400"> @ {fb.value.toFixed(3)}</span>
          <RT.Arrow className="fill-zinc-800" />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}

export const FeedbackMarkProvider = RT.Provider;
