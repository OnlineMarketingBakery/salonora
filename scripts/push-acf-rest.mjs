import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envLocal = resolve(__dirname, '../.env.local')
const envFallback = resolve(__dirname, '../.env')

/** Read .env as UTF-8 or UTF-16 LE (PowerShell `Out-File` default). */
function readEnvFileText(absPath) {
  const buf = readFileSync(absPath)
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString('utf16le')
  }
  return buf.toString('utf8').replace(/^\uFEFF/, '')
}

/** When dotenv reports “injected (0)” (UTF-16/BOM/odd editors), still pick up KEY=value lines. */
function mergeEnvFromFile(absPath) {
  if (!existsSync(absPath)) return
  let text
  try {
    text = readEnvFileText(absPath)
  } catch {
    return
  }
  text = text.replace(/^\uFEFF/, '')
  for (const line of text.split(/\r?\n/)) {
    let s = line.trim()
    if (!s || s.startsWith('#')) continue
    if (s.startsWith('export ')) s = s.slice(7).trim()
    const eq = s.indexOf('=')
    if (eq === -1) continue
    const key = s.slice(0, eq).trim()
    let val = s.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!key) continue
    const cur = process.env[key]
    if (cur === undefined || cur === '') process.env[key] = val
  }
}

config({ path: envLocal, quiet: true })
config({ path: envFallback, quiet: true })
mergeEnvFromFile(envLocal)
mergeEnvFromFile(envFallback)

/** Bulk array import for POST …/acf-sync — kept OUTSIDE `acf-json/` so ACF Local JSON does not try to load it as a single field group file. */
const JSON_PATH = resolve(__dirname, '../wordpress/wp-content/themes/omb-headless/acf-import-bundle.json')
const WP_URL = process.env.WORDPRESS_API_URL?.trim()
const SECRET = process.env.REVALIDATION_SECRET?.trim()

const WP_BASE = WP_URL ? WP_URL.replace(/\/$/, '') : ''

if (!WP_URL || !SECRET) {
  const missing = [!WP_URL && 'WORDPRESS_API_URL', !SECRET && 'REVALIDATION_SECRET'].filter(Boolean)
  const hint = [
    `Missing: ${missing.join(', ')}.`,
    `Expected in ${envLocal} or ${envFallback} as:`,
    '  WORDPRESS_API_URL=https://example.com/wp-json',
    '  REVALIDATION_SECRET=your-secret',
    existsSync(envLocal)
      ? '(file exists — open it in an editor and save as UTF-8 if vars still fail)'
      : `(create ${envLocal} — see .env.example)`,
  ].join('\n')
  console.error(`❌  ${hint}`)
  process.exit(1)
}

if (!WP_BASE.toLowerCase().endsWith('/wp-json')) {
  console.error(
    '❌  WORDPRESS_API_URL must be the REST root ending in /wp-json with no trailing slash (e.g. https://example.com/wp-json).',
  )
  console.error(`   Got: ${WP_URL}`)
  process.exit(1)
}

const body = readFileSync(JSON_PATH, 'utf8')
const syncUrl = `${WP_BASE}/omb-headless/v1/acf-sync`

let res
try {
  res = await fetch(syncUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sync-Secret': SECRET,
    },
    body,
  })
} catch (err) {
  const msg = err?.cause?.message || err?.message || String(err)
  console.error(`❌  Could not reach WordPress (${syncUrl}): ${msg}`)
  console.error('   Set WORDPRESS_API_URL in .env.local to your real REST base, e.g. https://mysite.com/wp-json')
  process.exit(1)
}

let data
try {
  data = await res.json()
} catch {
  console.error('❌  Push failed: expected JSON from WordPress, got status', res.status)
  process.exit(1)
}

if (!res.ok) {
  console.error('❌  Push failed:', data)
  if (res.status === 404 && data?.code === 'rest_no_route') {
    console.error(
      '\nTip: The server does not expose POST …/omb-headless/v1/acf-sync.\n' +
        'Deploy `wordpress/wp-content/plugins/omb-headless-core/` and ensure the plugin is active.',
    )
  }
  process.exit(1)
}

console.log(`✅  Imported ${data.imported} field group(s)`)
