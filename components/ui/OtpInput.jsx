import { useRef } from "react";
import { cn } from "../../libs/cn";

/**
 * Lightweight replacement for mui-one-time-password-input.
 * value: string or array of single chars (length `length`).
 * onChange: receives the full string.
 * validateChar: (ch) => boolean — rejected chars are ignored.
 */
export function OtpInput({
  value,
  onChange,
  length = 5,
  validateChar = () => true,
  placeholder = "-",
  className,
}) {
  const refs = useRef([]);
  const chars = Array.from({ length }, (_, i) =>
    (Array.isArray(value) ? value[i] : value?.[i]) || ""
  );

  const setAt = (i, ch) => {
    const next = [...chars];
    next[i] = ch;
    onChange(next.join(""));
  };

  const handleChange = (i, raw) => {
    const ch = raw.slice(-1);
    if (ch === "") {
      setAt(i, "");
      return;
    }
    if (!validateChar(ch)) return;
    setAt(i, ch);
    if (refs.current[i + 1]) refs.current[i + 1].focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !chars[i] && refs.current[i - 1]) {
      refs.current[i - 1].focus();
    }
    if (e.key === "ArrowLeft" && refs.current[i - 1]) refs.current[i - 1].focus();
    if (e.key === "ArrowRight" && refs.current[i + 1]) refs.current[i + 1].focus();
  };

  const handlePaste = (i, e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").split("");
    const next = [...chars];
    let pos = i;
    for (const ch of pasted) {
      if (pos >= length) break;
      if (validateChar(ch)) {
        next[pos] = ch;
        pos++;
      }
    }
    onChange(next.join(""));
    if (refs.current[Math.min(pos, length - 1)]) refs.current[Math.min(pos, length - 1)].focus();
  };

  return (
    <div className={cn("flex gap-1.5", className)}>
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={ch}
          placeholder={placeholder}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="text"
          className="h-9 w-9 rounded-lg border border-line bg-surface-raised text-center text-sm
            font-semibold text-zinc-100 outline-none transition-colors placeholder:text-zinc-600
            focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      ))}
    </div>
  );
}
