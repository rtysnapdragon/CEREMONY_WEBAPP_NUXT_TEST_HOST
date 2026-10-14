export default {
    userCatch: "oc_user_catch",
    deviceId: "rty_device_id",
    dbCode: "rty_database",
    langCode: "i18n_redirected",
    fbMessagingToken: "fb_messaging_token",
  
    humanResource: {
      employee: {
        workingStatus: [
          { text: "Working", value: "Working" },
          { text: "Resigned", value: "Resigned" },
          { text: "Terminated", value: "Terminated" },
          { text: "Expired", value: "Expired" },
          { text: "Abandoned", value: "Abandoned" },
        ],
        maritalStatus: [
          { text: "Married", value: "Married" },
          { text: "Divorce", value: "Divorce" },
          { text: "Widow", value: "Widow" },
          { text: "Single", value: "Single" },
        ],
        NSSFType: [
          { text: "InSystem", value: "InSystem" },
          { text: "OutSystem", value: "OutSystem" },
        ],
  
        strGeneral: "general",
        strWorkInformation: "working_info",
      },
    },
    academic:{
      learningSubject:{
        type: {learningAndExam: 'Learning & Exam', learning:'Learning',exam:'Exam',attendence:'Attendence'}
      },
      schedule:{
        monthList : [
            { Value: 1,Name: 'មករា', NameEn: 'January'},
            { Value: 2,Name: 'កុម្ភ:', NameEn: 'February'},
            { Value: 3,Name: 'មីនា', NameEn: 'March' },
            { Value: 4,Name: 'មេសា', NameEn: 'April' },
            { Value: 5,Name: 'ឧសភា', NameEn: 'May' },
            { Value: 6,Name: 'មិថុនា', NameEn: 'June' },
            { Value: 7,Name: 'កក្កដា', NameEn: 'July'},
            { Value: 8,Name: 'សីហា', NameEn: 'August'},
            { Value: 9,Name: 'កញ្ញា', NameEn: 'September' },
            { Value: 10,Name: 'តុលា', NameEn: 'October'},
            { Value: 11,Name: 'វិច្ឆកា', NameEn: 'November'},
            { Value: 12,Name: 'ធ្នូ', NameEn: 'December'}
        ],
        weekList: [
            { Name: 'សប្តាហ៍ទី​ ១', NameEn: 'Week 1', Value: 1 },
            { Name: 'សប្តាហ៍ទី​ ២', NameEn: 'Week 2', Value: 2 },
            { Name: 'សប្តាហ៍ទី​ ៣', NameEn: 'Week 3', Value: 3 },
            { Name: 'សប្តាហ៍ទី​ ៤', NameEn: 'Week 4', Value: 4 },
            { Name: 'សប្តាហ៍ទី​ ៥', NameEn: 'Week 5', Value: 5 },
            { Name: 'សប្តាហ៍ទី​ ៦', NameEn: 'Week 6', Value: 6 },
        ],
        dayOfWeek:[{Name: 'ថ្ងៃច័ន្ទ',EnglishName:'Monday'},{Name: 'ថ្ងៃអង្គារ',EnglishName:'Tuesday'},{Name: 'ថ្ងៃពុធ',EnglishName:'Wednesday'},{Name: 'ថ្ងៃព្រហស្បតិ៍',EnglishName:'Thursday'},{Name: 'ថ្ងៃសុក្រ',EnglishName:'Friday'},{Name: 'ថ្ងៃសៅរ៍',EnglishName:'Satuarday'},{Name: 'ថ្ងៃអាទិត្យ',EnglishName:'Sunday'}],
        periodType:{
          year: 'Year',
          month:'Month',
          week:'Week'
        },
      }
    },
    color:{
      dayOfWeek:{
        background: [
          "rgba(255, 171, 24, 0.03)",
          "rgba(251, 113, 133, 0.03)",
          "rgba(46, 214, 93, 0.03)",
          "rgba(246, 125, 98, 0.03)",
          "rgba(99, 56, 210, 0.03)",
          "rgba(67, 149, 241, 0.03)",
          "rgba(42, 183, 160, 0.03)"
        ],
        primary: ['#ffab18', '#FB7185', '#2ED65D', '#F67D62', '#6338D2', '#4395F1', '#2AB7A0']
      },
      
    },
  };
  

  // helpers/str.js — String utility helpers

/**
 * Truncate a string to a max length with ellipsis
 */
export const truncate = (str = '', max = 60, suffix = '…') => {
  if (!str) return ''
  return str.length <= max ? str : str.slice(0, max) + suffix
}

/**
 * Capitalize first letter
 */
export const capitalize = (str = '') =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

/**
 * Title case a string
 */
export const titleCase = (str = '') =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())

/**
 * Generate initials from a name (up to 2 chars)
 */
export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Slugify a string
 */
export const slugify = (str = '') =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Format currency
 */
export const formatCurrency = (amount = 0, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format number with commas
 */
export const formatNumber = (num = 0, locale = 'en-US') =>
  new Intl.NumberFormat(locale).format(num)

/**
 * Format percentage
 */
export const formatPercent = (value = 0, total = 100, decimals = 1) => {
  if (!total) return '0%'
  return ((value / total) * 100).toFixed(decimals) + '%'
}

/**
 * Format a date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(d)
}

/**
 * Format a date as relative time (e.g. "2 days ago")
 */
export const timeAgo = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = Date.now()
  const diff = now - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date, { month: 'short', day: 'numeric' })
}

/**
 * Days until a future date
 */
export const daysUntil = (date) => {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Generate a random ID
 */
export const uid = (prefix = '') => {
  const rand = Math.random().toString(36).slice(2, 9)
  return prefix ? `${prefix}-${rand}` : rand
}

/**
 * Deep clone an object
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

/**
 * Strip HTML tags from a string
 */
export const stripHtml = (str = '') => str.replace(/<[^>]*>/g, '')

/**
 * Mask an email for privacy
 */
export const maskEmail = (email = '') => {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const masked = local[0] + '***' + (local.length > 1 ? local.slice(-1) : '')
  return `${masked}@${domain}`
}

/**
 * Format phone number display
 */
export const formatPhone = (phone = '') =>
  phone.replace(/(\+\d{3})\s?(\d{2})\s?(\d{3})\s?(\d{3})/, '$1 $2 $3 $4')

/**
 * Return percentage as a number (0–100)
 */
export const pct = (part = 0, total = 0) => (total ? Math.min(100, Math.round((part / total) * 100)) : 0)