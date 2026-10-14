// ─────────────────────────────────────────────────────────────────────────────
// utils/tableUtils.ts  –  CSV Export · Clamp helpers · Permission check
// ─────────────────────────────────────────────────────────────────────────────

import type { EnterpriseColumnDef } from "../types/table.types";

// ── CSV Export ────────────────────────────────────────────────────────────────

export function exportToCsv<TData = unknown>(
  rows: TData[],
  columns: EnterpriseColumnDef<TData>[],
  filename = "export.csv",
) {
  const exportableCols = columns.filter(
    (c) =>
      c.meta?.exportable !== false &&
      c.id !== "__select__" &&
      c.id !== "__actions__",
  );

  const headers = exportableCols.map((c) => {
    const h = typeof c.header === "string" ? c.header : String(c.id ?? "");
    return `"${h.replace(/"/g, '""')}"`;
  });

  const dataRows = rows.map((row) =>
    exportableCols.map((c) => {
      const accessorKey =
        (c as { accessorKey?: string }).accessorKey ?? c.id ?? "";
      const val = (row as Record<string, unknown>)[accessorKey];
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    }),
  );

  const csv = [headers.join(","), ...dataRows.map((r) => r.join(","))].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Text clamping ─────────────────────────────────────────────────────────────

export function shouldClamp(value: unknown, maxChars = 80): boolean {
  return typeof value === "string" && value.length > maxChars;
}

// ── Permission check ──────────────────────────────────────────────────────────

export function hasPermission(
  required: string | string[] | undefined,
  userPerms: string[],
): boolean {
  if (!required) return true;
  const arr = Array.isArray(required) ? required : [required];
  return arr.every((p) => userPerms.includes(p));
}

// ── Column width style helper ─────────────────────────────────────────────────

export function colWidthStyle(meta?: {
  minWidth?: number;
  width?: number;
  maxWidth?: number;
}): Record<string, string> {
  if (!meta) return {};
  const style: Record<string, string> = {};
  if (meta.width) style["width"] = `${meta.width}px`;
  if (meta.minWidth) style["min-width"] = `${meta.minWidth}px`;
  if (meta.maxWidth) style["max-width"] = `${meta.maxWidth}px`;
  return style;
}

// ── Badge colour resolver ──────────────────────────────────────────────────────

export function resolveBadgeColor(
  value: unknown,
  badge?: { colorMap?: Record<string, string>; defaultColor?: string },
): string {
  if (!badge) return "neutral";
  return badge.colorMap?.[String(value)] ?? badge.defaultColor ?? "neutral";
}

// ── Density class map ─────────────────────────────────────────────────────────

export const densityClass: Record<string, string> = {
  compact: "py-1 px-2 text-xs",
  default: "py-2 px-3 text-sm",
  comfortable: "py-3 px-4 text-sm",
};
