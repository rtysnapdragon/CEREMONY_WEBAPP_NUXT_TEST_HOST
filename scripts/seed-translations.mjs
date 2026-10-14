/**
 * seed-translations.mjs
 *
 * Reads translations-seed.json and POSTs new entries to the backend.
 * Skips entries that already exist. Runs chunks in parallel for speed.
 *
 * Usage:
 *   node scripts/seed-translations.mjs --token <jwt>
 *   node scripts/seed-translations.mjs --api http://10.0.0.1:8080 --token <jwt>
 *   API_URL=http://localhost:8080 AUTH_TOKEN=xxx node scripts/seed-translations.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir  = dirname(fileURLToPath(import.meta.url))
const arg    = (f) => { const i = process.argv.indexOf(f); return i !== -1 ? process.argv[i + 1] : null }

const API    = (arg('--api') || process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '')
const TOKEN  = arg('--token') || process.env.AUTH_TOKEN || ''
const CHUNK  = Math.max(1, parseInt(arg('--chunk') || '200', 10))
const CONCUR = Math.max(1, parseInt(arg('--concur') || '5', 10))  // parallel chunks

if (!TOKEN) {
  console.error('❌  --token <jwt> required   (or AUTH_TOKEN env var)')
  process.exit(1)
}

// ── Load seed ─────────────────────────────────────────────────────────────────
const seed = JSON.parse(readFileSync(resolve(__dir, '../translations-seed.json'), 'utf-8'))
console.log(`📦  ${seed.length} entries in seed file`)

// ── Fetch existing keys from DB (one request) ─────────────────────────────────
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` }

const existRes = await fetch(`${API}/api/v1/translations/all`, { headers })
if (!existRes.ok) { console.error(`❌  GET /translations/all → ${existRes.status}`); process.exit(1) }

const existBody = await existRes.json()
const existing  = new Set((existBody.data ?? existBody).map(e => `${e.translationKey}::${e.languageCode}`))
console.log(`🗄️   ${existing.size} already in DB`)

// ── Filter new entries ────────────────────────────────────────────────────────
const toPost  = seed.filter(e => !existing.has(`${e.translationKey}::${e.languageCode}`))
const skipped = seed.length - toPost.length

if (!toPost.length) {
  console.log(`✅  Nothing to import — all ${skipped} entries already exist.`)
  process.exit(0)
}
console.log(`⬆️   ${toPost.length} new  |  ${skipped} skipped\n`)

// ── Build chunks ──────────────────────────────────────────────────────────────
const chunks = []
for (let i = 0; i < toPost.length; i += CHUNK) chunks.push(toPost.slice(i, i + CHUNK))

// ── POST chunk (entries → { key: { lang: value } } map) ──────────────────────
async function postChunk(chunk, idx) {
  const translations = {}
  for (const { translationKey: k, languageCode: l, value: v } of chunk) {
    if (!translations[k]) translations[k] = {}
    translations[k][l] = v
  }
  const res = await fetch(`${API}/api/v1/translations/batch`, {
    method: 'POST', headers,
    body: JSON.stringify({ translations }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return chunk.length
}

// ── Run chunks in parallel with concurrency limit ─────────────────────────────
let seeded = 0
let failed = 0
let done   = 0

async function runPool() {
  const queue = [...chunks]
  const workers = Array.from({ length: Math.min(CONCUR, queue.length) }, async () => {
    while (queue.length) {
      const chunk = queue.shift()
      const idx   = chunks.length - queue.length
      try {
        const n = await postChunk(chunk, idx)
        seeded += n
        process.stdout.write(`\r   ${++done}/${chunks.length} chunks  (${seeded} seeded)`)
      } catch (e) {
        failed += chunk.length
        process.stdout.write(`\r   chunk ${idx} failed: ${e.message}\n`)
      }
    }
  })
  await Promise.all(workers)
}

await runPool()

console.log(`\n\n✅  Done.  Seeded: ${seeded}  Skipped: ${skipped}${failed ? `  ❌ Failed: ${failed}` : ''}`)
process.exit(failed > 0 ? 1 : 0)
