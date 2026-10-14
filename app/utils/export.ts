// ============================================================
// useTableExport – CSV export utility
// ============================================================

import type { TableColumn, TableColumnMeta } from '../types/table.types'
import type { Row } from '@tanstack/vue-table'

function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCsv<TData>(
  rows: Row<TData>[],
  columns: TableColumn<TData>[],
  filename = 'export.csv',
) {
  const exportableCols = columns.filter(
    (col) => (col.meta as TableColumnMeta | undefined)?.exportable !== false,
  )

  const headers = exportableCols.map((col) => {
    if (typeof col.header === 'string') return col.header
    return (col as { accessorKey?: string }).accessorKey ?? col.id ?? ''
  })

  const csvRows = rows.map((row) =>
    exportableCols.map((col) => {
      const key = (col as { accessorKey?: string }).accessorKey ?? col.id ?? ''
      const val = (row.original as Record<string, unknown>)[key]
      return escapeCell(val)
    }),
  )

  const csv = [headers.map(escapeCell), ...csvRows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
