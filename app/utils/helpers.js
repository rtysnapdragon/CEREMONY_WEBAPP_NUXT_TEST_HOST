// Safely extract a list from a paginated { content: [] } or flat [] API response,
// filtering out any null/undefined items or items missing an id.
export function toList(res) {
  const arr = Array.isArray(res) ? res : (res?.content ?? [])
  return arr.filter(item => item != null && item.id != null)
}

export function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fmtTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDateTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
         ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function toApiDt(val) {
  if (!val) return null
  const base = val.length === 16 ? val + ':00' : val
  return base.includes('T') ? base : base.replace(' ', 'T')
}

export function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function currency(n) {
  return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function daysUntil(date) {
  if (!date) return null
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000))
}

// Status → Tailwind badge classes
export const STATUS_BADGE = {
  // Guest
  INVITED:    'bg-white/8 text-white/45 border-white/10',
  CONFIRMED:  'bg-gold-500/20 text-gold-400 border-gold-500/25',
  ATTENDED:   'bg-green-500/15 text-green-400 border-green-500/20',
  DECLINED:   'bg-red-500/15 text-red-400 border-red-500/20',
  NO_SHOW:    'bg-red-500/10 text-red-300 border-red-500/15',
  // Wedding
  PLANNING:   'bg-gold-500/20 text-gold-400 border-gold-500/25',
  IN_PROGRESS:'bg-blue-500/15 text-blue-300 border-blue-500/20',
  DONE:       'bg-green-500/15 text-green-400 border-green-500/20',
  COMPLETED:  'bg-green-500/15 text-green-400 border-green-500/20',
  CANCELLED:  'bg-red-500/15 text-red-400 border-red-500/20',
  // Budget
  UNPAID:     'bg-red-500/15 text-red-400 border-red-500/20',
  PARTIAL:    'bg-gold-500/20 text-gold-400 border-gold-500/25',
  PAID:       'bg-green-500/15 text-green-400 border-green-500/20',
  // Gift
  CASH:       'bg-gold-500/20 text-gold-400 border-gold-500/25',
  GIFT:       'bg-purple-500/15 text-purple-300 border-purple-500/20',
  // Side
  GROOM:      'bg-blue-500/15 text-blue-300 border-blue-500/20',
  BRIDE:      'bg-pink-500/15 text-pink-300 border-pink-500/20',
  FRIEND:     'bg-white/8 text-white/40 border-white/10',
  // Task
  PENDING:    'bg-white/8 text-white/45 border-white/10',
  // Org
  ACTIVE:     'bg-green-500/15 text-green-400 border-green-500/20',
  INACTIVE:   'bg-white/8 text-white/40 border-white/10',
  SUSPENDED:  'bg-red-500/15 text-red-400 border-red-500/20',
}

export const PRIORITY_COLOR = {
  URGENT: 'text-red-400',
  HIGH:   'text-orange-400',
  MEDIUM: 'text-gold-400',
  LOW:    'text-white/30',
}
