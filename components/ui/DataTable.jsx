import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectItem } from "./Select";
import { ScrollArea } from "./Table";
import { cn } from "../../libs/cn";

/**
 * Minimal paginated data grid — replaces @mui/x-data-grid for the results table.
 * columns: [{ field, headerName, width?, align?, valueGetter?({row,value}), renderCell?({row,value}) }]
 * rows: [{ id, ... }]
 */
export function DataTable({
  rows,
  columns,
  pageSizeOptions = [20, 50, 100],
  initialPageSize = 20,
  paginate = true,
  className,
}) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(0);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const pageRows = paginate ? rows.slice(start, start + pageSize) : rows.slice(0, initialPageSize);

  const cellValue = (col, row) => {
    const raw = row[col.field];
    return col.valueGetter ? col.valueGetter({ row, value: raw }) : raw;
  };

  return (
    <div className={cn("border border-line bg-surface shadow-panel", className)}>
      <ScrollArea>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.field}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    "whitespace-nowrap px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
                    col.align === "right" ? "text-right" : col.align === "left" ? "text-left" : "text-center"
                  )}
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-line/50 hover:bg-surface-hover/50">
                {columns.map((col) => {
                  const value = cellValue(col, row);
                  return (
                    <td
                      key={col.field}
                      className={cn(
                        "whitespace-nowrap px-2 py-1.5",
                        col.align === "right" ? "text-right" : col.align === "left" ? "text-left" : "text-center"
                      )}
                    >
                      {col.renderCell ? col.renderCell({ row, value }) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-2 py-8 text-center text-zinc-500">
                  No rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>
      {paginate && (
      <div className="flex items-center justify-end gap-4 border-t border-line px-3 py-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
            className="h-7 px-2 text-xs"
          >
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </Select>
        </div>
        <span>
          {total === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, total)}`} of {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-surface-hover disabled:opacity-30"
            disabled={safePage <= 0}
            onClick={() => setPage(safePage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="grid h-7 w-7 place-items-center rounded-md hover:bg-surface-hover disabled:opacity-30"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
