// composables/useRTableExport.ts
// Export helpers: CSV (zero deps), Excel (SheetJS CDN dynamic import), PDF (jsPDF + autoTable CDN)
// All heavy libs are dynamically imported so they never bloat the initial bundle.

export interface ExportColumn {
  key:   string
  label: string
}

export function useRTableExport() {
  const exporting = ref(false)

  // ── Flatten one row to ordered plain values ────────────────────────────────
  const flatRow = (row: Record<string, any>, cols: ExportColumn[]) =>
    cols.map(c => {
      const v = row[c.key]
      if (v == null) return ''
      if (typeof v === 'object') return JSON.stringify(v)
      return String(v)
    })

  // ── CSV ────────────────────────────────────────────────────────────────────
  // RFC 4180 — no external lib needed
  const escapeCell = (v: string) =>
    /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v

  const exportCsv = (rows: any[], cols: ExportColumn[], filename = 'export') => {
    const header = cols.map(c => escapeCell(c.label)).join(',')
    const body   = rows.map(r => flatRow(r, cols).map(escapeCell).join(',')).join('\r\n')
    const blob   = new Blob(['\uFEFF' + header + '\r\n' + body], { type: 'text/csv;charset=utf-8;' })
    triggerDownload(blob, `${filename}.csv`)
  }

  // ── Excel (SheetJS — loaded from CDN only when called) ────────────────────
  const exportExcel = async (rows: any[], cols: ExportColumn[], filename = 'export') => {
    exporting.value = true
    try {
      // Dynamic import keeps SheetJS out of the SSR bundle entirely
      const XLSX = await import('xlsx').catch(async () => {
        // fallback: load from CDN via script tag if package not installed
        await loadScript('https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js', 'xlsx-cdn')
        return (window as any).XLSX as typeof import('xlsx')
      })

      const wsData = [
        cols.map(c => c.label),
        ...rows.map(r => flatRow(r, cols)),
      ]
      const ws  = XLSX.utils.aoa_to_sheet(wsData)
      const wb  = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } finally {
      exporting.value = false
    }
  }

  // ── PDF (jsPDF + autoTable — loaded from CDN only when called) ────────────
  const exportPdf = async (
    rows: any[],
    cols: ExportColumn[],
    filename = 'export',
    title?: string
  ) => {
    exporting.value = true
    try {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'jspdf-cdn'
      )
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
        'jspdf-autotable-cdn'
      )

      const { jsPDF } = (window as any).jspdf as { jsPDF: any }
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

      if (title) {
        doc.setFontSize(14)
        doc.text(title, 40, 40)
      }

      ;(doc as any).autoTable({
        head:       [cols.map(c => c.label)],
        body:       rows.map(r => flatRow(r, cols)),
        startY:     title ? 60 : 20,
        styles:     { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 40, right: 40 },
      })

      doc.save(`${filename}.pdf`)
    } finally {
      exporting.value = false
    }
  }

  // ── Util: inject a <script> tag once ──────────────────────────────────────
  const loadScript = (src: string, id: string): Promise<void> =>
    new Promise((resolve, reject) => {
      if (document.getElementById(id)) return resolve()
      const s    = document.createElement('script')
      s.id       = id
      s.src      = src
      s.onload   = () => resolve()
      s.onerror  = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })

  // ── Util: trigger browser download ────────────────────────────────────────
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a   = Object.assign(document.createElement('a'), { href: url, download: filename })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { exporting, exportCsv, exportExcel, exportPdf }
}