// helpers/getUrl.js — URL and navigation utilities

/**
 * Get the app URL (app.sarika.com) or site URL
 */
export const getAppUrl = (path = '') => {
  const config = useRuntimeConfig()
  const base = config.public.appUrl || 'https://app.sarika.com'
  return path ? `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : base
}

export const getSiteUrl = (path = '') => {
  const config = useRuntimeConfig()
  const base = config.public.siteUrl || 'https://sarika.com'
  return path ? `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : base
}

/**
 * Navigate to app.sarika.com (used on landing page CTA)
 */
export const goToApp = (path = '/dashboard') => {
  const appUrl = getAppUrl(path)
  if (process.client) window.location.href = appUrl
}

/**
 * Build a query string from an object
 */
export const buildQuery = (params = {}) => {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  )
  if (!filtered.length) return ''
  return '?' + new URLSearchParams(Object.fromEntries(filtered)).toString()
}

/**
 * Parse query string to an object
 */
export const parseQuery = (search = '') => {
  const params = new URLSearchParams(search.replace(/^\?/, ''))
  return Object.fromEntries(params.entries())
}

/**
 * Join path segments safely
 */
export const joinPath = (...parts) =>
  '/' + parts
    .map((p) => p.replace(/^\/|\/$/g, ''))
    .filter(Boolean)
    .join('/')

/**
 * Get asset URL (for images, fonts etc.)
 */
export const assetUrl = (path = '') => `/assets/${path.replace(/^\//, '')}`

/**
 * Get image URL (with fallback)
 */
export const imageUrl = (path = '', fallback = '/images/placeholder.jpg') =>
  path ? path : fallback

/**
 * Return the full API endpoint URL
 */
export const apiUrl = (endpoint = '') => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase || '/api'
  return `${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
}

/**
 * Check if a URL is external
 */
export const isExternalUrl = (url = '') =>
  /^(https?:)?\/\//.test(url) && !url.includes(typeof window !== 'undefined' ? window.location.hostname : '')

/**
 * Download a blob as a file
 */
export const downloadBlob = (blob, filename = 'download') => {
  if (!process.client) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text = '') => {
  if (!process.client) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}
