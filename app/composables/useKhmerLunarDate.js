// composables/useKhmerLunarDate.js
//
// Wraps @thyrith/momentkh so templates can show the traditional Khmer lunar
// (Chhankitek) calendar date instead of just the Gregorian date — this is
// what real Khmer wedding invitations print (e.g. "ថ្ងៃសៅរ៍ ១៥កើត ខែពិសាខ
// ឆ្នាំរោង ឆស័ក ព.ស.២៥៦៨"), so it reads as authentic rather than a plain
// translated date.
//
// Install once in your app:
//   npm install @thyrith/momentkh
//
// Docs / algorithm credit: https://github.com/ThyrithSor/momentkh
// (based on the traditional Cambodian astronomical calendar algorithm)

import momentkh from '@thyrith/momentkh'

// Default format: ថ្ងៃសៅរ៍ ១៥កើត ខែពិសាខ ឆ្នាំរោង ឆស័ក ព.ស.២៥៦៨
const DEFAULT_FORMAT = 'ថ្ងៃW dN ខែm ឆ្នាំa e ព.ស.b'
// Shorter variant for tight spaces (invitation cards, mini/preview mode)
const SHORT_FORMAT = 'dN ខែm ឆ្នាំa'

export const useKhmerLunarDate = () => {
  const toKhmerLunar = (isoOrDate, { format = DEFAULT_FORMAT, short = false } = {}) => {
    if (!isoOrDate) return ''
    try {
      const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
      if (Number.isNaN(date.getTime())) return ''
      const khmer = momentkh.fromDate(date)
      return momentkh.format(khmer, short ? SHORT_FORMAT : format)
    } catch (e) {
      return ''
    }
  }

  // Handy when you also want the raw parts (e.g. to build a countdown
  // label like "១៥ថ្ងៃទៀតដល់ថ្ងៃពិសាខបូជា")
  const toKhmerLunarParts = (isoOrDate) => {
    if (!isoOrDate) return null
    try {
      const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
      if (Number.isNaN(date.getTime())) return null
      return momentkh.fromDate(date).khmer
    } catch (e) {
      return null
    }
  }

  return { toKhmerLunar, toKhmerLunarParts }
}
