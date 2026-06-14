import { cn } from "../../libs/cn";

// Click-to-cycle order and per-state presentation. bad+/bad- are only included
// when enabled in settings.
const BASE_ORDER = ["unknown", "optimal", "great", "good", "bad"];
const BAD_DIR = ["bad+", "bad-"];

const STATES = {
  unknown: { label: "—", cls: "bg-surface-raised border-line text-zinc-500 hover:bg-surface-hover" },
  optimal: { label: "Optimal", cls: "bg-cyan-400/15 border-cyan-400/60 text-cyan-200 shadow-[0_0_10px_-1px_rgba(0,255,255,0.55)] hover:bg-cyan-400/25" },
  great: { label: "Great", cls: "bg-zinc-200/15 border-zinc-300/40 text-cyan-400 hover:bg-zinc-200/25" },
  good: { label: "Good", cls: "bg-zinc-200/15 border-zinc-300/40 text-zinc-100 hover:bg-zinc-200/25" },
  bad: { label: "Bad", cls: "bg-danger/20 border-danger/50 text-red-200 hover:bg-danger/30" },
  "bad+": { label: "Bad ↑", cls: "bg-danger/20 border-danger/50 text-red-200 hover:bg-danger/30" },
  "bad-": { label: "Bad ↓", cls: "bg-danger/20 border-danger/50 text-red-200 hover:bg-danger/30" },
};

/**
 * Click-to-cycle feedback control. Left-click advances to the next state,
 * right-click steps back. Tinted with the active feedback's semantic color.
 */
export function FeedbackCycle({ value, onChange, disabled, allowBadDir = false }) {
  const state = STATES[value] || STATES.unknown;
  // include bad+/bad- in the cycle only when enabled (but never lose the current
  // value if it already is one)
  const order = [...BASE_ORDER, ...((allowBadDir || BAD_DIR.includes(value)) ? BAD_DIR : [])];

  const step = (dir) => {
    let i = order.indexOf(value in STATES ? value : "unknown");
    if (i < 0) i = 0;
    const next = order[(i + dir + order.length) % order.length];
    onChange(next);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      title="Click to cycle feedback · right-click to go back"
      onClick={() => step(1)}
      onContextMenu={(e) => {
        e.preventDefault();
        step(-1);
      }}
      className={cn(
        "flex h-8 w-full items-center justify-center rounded-lg border px-2 text-sm font-semibold " +
          "transition-colors select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 " +
          "focus-visible:ring-primary disabled:opacity-40 disabled:pointer-events-none",
        state.cls
      )}
    >
      <span className="truncate">{state.label}</span>
    </button>
  );
}
