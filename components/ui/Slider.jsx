import * as RSlider from "@radix-ui/react-slider";
import { cn } from "../../libs/cn";

const colorMap = {
  primary: { range: "bg-primary", thumb: "border-primary", label: "bg-primary text-primary-fg" },
  warning: { range: "bg-warning", thumb: "border-warning", label: "bg-warning text-warning-fg" },
  danger: { range: "bg-danger", thumb: "border-danger", label: "bg-danger text-danger-fg" },
  info: { range: "bg-info", thumb: "border-info", label: "bg-info text-info-fg" },
};

/**
 * Single-value slider with an always-on formatted value bubble above the thumb.
 * Mirrors the previous MUI Slider behaviour (marks, color states, custom min/max).
 */
export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onValueChange,
  format = (v) => v,
  color = "primary",
  marks = false,
  valueMarks = [],
  disabled = false,
  className,
}) {
  const c = colorMap[color] || colorMap.primary;

  // Build evenly-spaced marks at each step within [min, max], capped to stay sane.
  let markPositions = [];
  if (marks) {
    const count = Math.round((max - min) / step);
    if (count > 0 && count <= 48) {
      for (let i = 0; i <= count; i++) {
        markPositions.push(((i * step) / (max - min)) * 100);
      }
    }
  }

  return (
    <RSlider.Root
      className={cn("relative flex w-full touch-none select-none items-center py-3", className)}
      value={[value]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(vals) => onValueChange(vals[0])}
    >
      <RSlider.Track className="relative h-1.5 w-full grow rounded-full bg-line">
        <RSlider.Range className={cn("absolute h-full rounded-full", c.range)} />
        {markPositions.map((p, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500/70"
            style={{ left: `${p}%` }}
          />
        ))}
        {valueMarks.map((m) => {
          const pct = Math.max(0, Math.min(1, (m.value - min) / (max - min)));
          // align with the thumb centre (thumb is 16px wide, inset by half on each end)
          return (
            <span
              key={m.key}
              // top of the mark sits at the track, hanging below it; no z-index so it
              // stays under the thumb (a later sibling of the track)
              className="absolute top-1/2 -translate-x-1/2"
              style={{ left: `calc(${pct * 100}% + ${16 * (0.5 - pct)}px)` }}
            >
              {m.content}
            </span>
          );
        })}
      </RSlider.Track>
      <RSlider.Thumb
        className={cn(
          "relative block h-4 w-4 rounded-full border-2 bg-zinc-100 shadow-md outline-none " +
            "transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 " +
            "focus-visible:ring-offset-canvas focus-visible:ring-white/60 " +
            "data-[disabled]:cursor-default data-[disabled]:opacity-60 data-[disabled]:hover:scale-100",
          c.thumb
        )}
        aria-label="value"
      >
        <span
          className={cn(
            "pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-0.5 " +
              "text-[11px] font-semibold leading-none shadow",
            c.label
          )}
        >
          {format(value)}
        </span>
      </RSlider.Thumb>
    </RSlider.Root>
  );
}
