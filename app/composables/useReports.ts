// composables/useReports.ts
import reportConfig from '~/assets/json/report_templates.json'

export interface Report {
  id: number
  name: string
  description: string
  type: string
  format: string
  date: string
  size: string
  icon: string
  status: 'ready' | 'generating' | 'failed'
  sections: string[]
  dateRange: string
  sharedWith: string[]
}

export interface ReportForm {
  name: string
  templateId: string
  type: string
  format: string
  dateRange: string
  customDateFrom: string
  customDateTo: string
  sections: string[]
  includeCharts: boolean
  recipients: string
  scheduleEnabled: boolean
  scheduleFrequency: string
}

const defaultReports: Report[] = [
  { id:1, name:'Q2 Traffic Overview', description:'Page views, sessions, conversions', type:'Analytics', format:'pdf', date:'Jun 1, 2025', size:'2.4 MB', icon:'i-heroicons-document-chart-bar', status:'ready', sections:['summary','charts','top_pages'], dateRange:'last_quarter', sharedWith:['alex@example.com'] },
  { id:2, name:'Revenue Report May', description:'MRR, ARR, churn breakdown', type:'Financial', format:'xlsx', date:'May 31, 2025', size:'1.1 MB', icon:'i-heroicons-banknotes', status:'ready', sections:['summary','mrr_chart','plan_breakdown'], dateRange:'last_month', sharedWith:[] },
  { id:3, name:'User Growth Q1-Q2', description:'Signups, retention, cohorts', type:'Users', format:'pdf', date:'May 28, 2025', size:'890 KB', icon:'i-heroicons-users', status:'ready', sections:['summary','growth_chart','cohorts'], dateRange:'last_quarter', sharedWith:['sara@example.com','ryan@example.com'] },
  { id:4, name:'Integration Health', description:'API uptime and error rates', type:'Analytics', format:'csv', date:'May 20, 2025', size:'430 KB', icon:'i-heroicons-squares-plus', status:'ready', sections:['summary','uptime','errors'], dateRange:'last_7_days', sharedWith:[] },
  { id:5, name:'April Financial Summary', description:'Expenses, revenue, profit margin', type:'Financial', format:'xlsx', date:'May 1, 2025', size:'1.8 MB', icon:'i-heroicons-chart-pie', status:'ready', sections:['summary','mrr_chart','churn'], dateRange:'last_month', sharedWith:['laura@example.com'] },
]


export const useReports = () => {
  // Global state shared across components
  const reports = useState<Report[]>('reports', () => [...defaultReports])
  const config = reportConfig

  const formatIcons: Record<string, string> = {
    pdf:  'i-heroicons-document',
    xlsx: 'i-heroicons-table-cells',
    csv:  'i-heroicons-list-bullet',
    json: 'i-heroicons-code-bracket',
  }
  const typeIcons: Record<string, string> = {
    Analytics:  'i-heroicons-chart-bar',
    Financial:  'i-heroicons-banknotes',
    Users:      'i-heroicons-users',
    Custom:     'i-heroicons-adjustments-horizontal',
  }

  /** Build a fresh ReportForm from a template id */
  const buildForm = (templateId = 'analytics-traffic'): ReportForm => {
    const tpl = config.templates.find(t => t.id === templateId) ?? config.templates[0]
    return {
      name:              tpl.defaultName,
      templateId:        tpl.id,
      type:              tpl.type,
      format:            tpl.defaultFormat,
      dateRange:         tpl.defaultDateRange,
      customDateFrom:    '',
      customDateTo:      '',
      sections:          [...tpl.defaultSections],
      includeCharts:     true,
      recipients:        '',
      scheduleEnabled:   false,
      scheduleFrequency: 'weekly',
    }
  }

  /** Simulate generating a report (fake async, returns after 2s) */
  const generateReport = async (form: ReportForm): Promise<Report> => {
    const tpl   = config.templates.find(t => t.id === form.templateId) ?? config.templates[0]
    const sizes = ['1.2 MB','890 KB','2.1 MB','540 KB','3.4 MB','720 KB']

    const stub: Report = {
      id:          Date.now(),
      name:        form.name,
      description: tpl.description,
      type:        form.type,
      format:      form.format,
      date:        new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }),
      size:        sizes[Math.floor(Math.random() * sizes.length)],
      icon:        typeIcons[form.type] ?? 'i-heroicons-document-text',
      status:      'generating',
      sections:    [...form.sections],
      dateRange:   form.dateRange,
      sharedWith:  form.recipients ? form.recipients.split(',').map(r => r.trim()).filter(Boolean) : [],
    }

    reports.value.unshift(stub)

    // Simulate generation delay
    await new Promise(r => setTimeout(r, 2200))
    const idx = reports.value.findIndex(r => r.id === stub.id)
    if (idx !== -1) reports.value[idx] = { ...reports.value[idx], status: 'ready' }

    return reports.value[idx]
  }

  /** Download a report (creates a fake blob) */
  const downloadReport = (report: Report) => {
    const content = JSON.stringify({
      report: report.name,
      generated: report.date,
      type: report.type,
      format: report.format,
      sections: report.sections,
      data: '(simulated report data)',
    }, null, 2)

    const blob = new Blob([content], { type: 'application/octet-stream' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const ext  = config.formats.find(f => f.value === report.format)?.ext ?? '.pdf'
    a.href     = url
    a.download = `${report.name.replace(/\s+/g, '_')}${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Share a report — adds emails to sharedWith */
  const shareReport = (report: Report, emails: string[]) => {
    const idx = reports.value.findIndex(r => r.id === report.id)
    if (idx !== -1) {
      const existing = new Set(reports.value[idx].sharedWith)
      emails.forEach(e => existing.add(e))
      reports.value[idx] = { ...reports.value[idx], sharedWith: [...existing] }
    }
  }

  /** Delete a report */
  const deleteReport = (id: number) => {
    reports.value = reports.value.filter(r => r.id !== id)
  }

  return {
    reports,
    config,
    buildForm,
    generateReport,
    downloadReport,
    shareReport,
    deleteReport,
    formatIcons,
    typeIcons,
  }
}
