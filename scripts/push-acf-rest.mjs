import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const JSON_PATH = resolve(__dirname, '../wordpress/wp-content/themes/omb-headless/acf-json/acf-import-bundle.json')
const WP_URL = process.env.WORDPRESS_API_URL
const SECRET = process.env.REVALIDATION_SECRET

if (!WP_URL || !SECRET) {
  console.error('❌  WORDPRESS_API_URL and REVALIDATION_SECRET must be set in .env.local')
  process.exit(1)
}

const body = readFileSync(JSON_PATH, 'utf8')

const res = await fetch(`${WP_URL}/omb-headless/v1/acf-sync`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Sync-Secret': SECRET,
  },
  body,
})

const data = await res.json()

if (!res.ok) {
  console.error('❌  Push failed:', data)
  process.exit(1)
}

console.log(`✅  Imported ${data.imported} field group(s)`)
