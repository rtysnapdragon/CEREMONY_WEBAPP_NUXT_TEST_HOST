export const INVITE_SCHEMES = [
  { id: 'gold',      name: 'Gold Classic',    primary: '#c9a84c', secondary: '#e4b035', bg: '#0c0a06', text: '#f5f0e8' },
  { id: 'rose',      name: 'Rose Romance',    primary: '#e8739a', secondary: '#f4a7b9', bg: '#0d080c', text: '#fde8ef' },
  { id: 'royal',     name: 'Royal Blue',      primary: '#4a6fdb', secondary: '#7b9fe8', bg: '#06091a', text: '#e0e8ff' },
  { id: 'emerald',   name: 'Emerald Garden',  primary: '#7cb87c', secondary: '#a8d5a2', bg: '#0a120c', text: '#e0f0e0' },
  { id: 'amethyst',  name: 'Amethyst',        primary: '#a78bfa', secondary: '#ddd6fe', bg: '#08061a', text: '#ede8ff' },
  { id: 'rustic',    name: 'Rustic Charm',    primary: '#c89464', secondary: '#e8c9a0', bg: '#160d04', text: '#f5e8d8' },
  { id: 'teal',      name: 'Tropical Teal',   primary: '#2dd4bf', secondary: '#99f6e4', bg: '#04120f', text: '#e0f8f5' },
  { id: 'champagne', name: 'Champagne Light', primary: '#a0701e', secondary: '#c8923a', bg: '#f8f4ee', text: '#3a2a10' },
]

export function schemeById(id) {
  return INVITE_SCHEMES.find(s => s.id === id) || INVITE_SCHEMES[0]
}

export function parseInviteColors(raw) {
  if (!raw) return null
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw } catch { return null }
}
