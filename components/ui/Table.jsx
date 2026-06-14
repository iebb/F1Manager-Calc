import { cn } from "../../libs/cn";

/** Rounded surface card — replaces MUI Paper / TableContainer. */
export function Panel({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-line bg-surface shadow-panel",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Horizontal-scroll wrapper for wide tables. */
export function ScrollArea({ className, children }) {
  return <div className={cn("w-full overflow-x-auto scroll-thin", className)}>{children}</div>;
}

export function Table({ className, children, ...props }) {
  return (
    <table className={cn("w-full border-collapse text-sm", className)} {...props}>
      {children}
    </table>
  );
}

export function THead({ className, children }) {
  return <thead className={cn(className)}>{children}</thead>;
}

export function TBody({ className, children }) {
  return <tbody className={cn(className)}>{children}</tbody>;
}

export function Tr({ className, children, ...props }) {
  return (
    <tr className={cn("border-b border-line/60 last:border-0", className)} {...props}>
      {children}
    </tr>
  );
}

export function Th({ className, children, ...props }) {
  return (
    <th
      className={cn("px-3 py-2 text-left font-semibold text-zinc-300", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }) {
  return (
    <td className={cn("px-3 py-2 align-middle text-zinc-200", className)} {...props}>
      {children}
    </td>
  );
}
