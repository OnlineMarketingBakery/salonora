/**
 * Trash duplicate ACF field-group posts (keeps oldest published copy per key).
 * Usage: npm run acf:cleanup-duplicates [-- --dry-run]
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env"), quiet: true });
config({ path: resolve(__dirname, "../.env.local"), override: true, quiet: true });

const WP_BASE = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
const SECRET = process.env.REVALIDATION_SECRET?.trim();
const dryRun = process.argv.includes("--dry-run");

if (!WP_BASE || !SECRET) {
  console.error("[acf:cleanup-duplicates] Missing WORDPRESS_API_URL or REVALIDATION_SECRET.");
  process.exit(1);
}


async function homeSectionCount() {
  const user = process.env.WORDPRESS_APPLICATION_USER;
  const pass = process.env.WORDPRESS_APPLICATION_PASSWORD;
  if (!user || !pass) return null;
  const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  const res = await fetch(
    `${WP_BASE}/wp/v2/pages?slug=home&lang=en&acf_format=standard&_fields=acf`,
    { headers: { Authorization: auth }, signal: AbortSignal.timeout(20000) }
  );
  if (!res.ok) return null;
  const pages = await res.json();
  return pages[0]?.acf?.page_sections?.length ?? 0;
}

const beforeSections = await homeSectionCount();
if (beforeSections === 0) {
  console.error(
    "[acf:cleanup-duplicates] ABORT: Home page already has 0 sections. Restore field groups first (npm run acf:push with deployed plugin), do NOT run cleanup."
  );
  process.exit(1);
}

const cleanupUrl = `${WP_BASE}/omb-headless/v1/acf-sync-cleanup-duplicates`;

const before = await (await fetch(`${WP_BASE}/omb-headless/v1/acf-sync-status`)).json();
const beforeTrash =
  before.field_group_trash_total != null ? `, ${before.field_group_trash_total} already in trash` : "";
console.log(
  `[acf:cleanup-duplicates] Before: ${before.field_group_total} operational, ${before.field_group_duplicate_posts} duplicates${beforeTrash}`
);

const res = await fetch(cleanupUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Sync-Secret": SECRET },
  body: JSON.stringify({ dry_run: dryRun }),
  signal: AbortSignal.timeout(300000),
});
const raw = await res.text(); let parsed=null; try{parsed=JSON.parse(raw);}catch{console.error(raw.slice(0,300)); process.exit(1);}
if (!res.ok || !parsed?.success) {
  console.error("[acf:cleanup-duplicates] Failed", res.status, parsed);
  process.exit(1);
}

const trashed = parsed.trashed ?? parsed.deactivated ?? 0;
if (parsed.dry_run) {
  console.log(
    `[acf:cleanup-duplicates] Dry run: would trash ${trashed}, keep ${parsed.kept_active} canonical group(s).`
  );
} else {
  console.log(
    `[acf:cleanup-duplicates] Trashed ${trashed} duplicate(s); kept ${parsed.kept_active} canonical group(s).`
  );
}

const after = await (await fetch(`${WP_BASE}/omb-headless/v1/acf-sync-status`)).json();
const afterSections = await homeSectionCount();
if (afterSections === 0) {
  console.error(
    "[acf:cleanup-duplicates] CRITICAL: Home page sections dropped to 0. Re-run field group restore immediately."
  );
  process.exit(1);
}
const afterTrash =
  after.field_group_trash_total != null ? `, ${after.field_group_trash_total} in trash` : "";
console.log(
  `[acf:cleanup-duplicates] After: ${after.field_group_total} operational, ${after.field_group_duplicate_posts} duplicates${afterTrash}, home sections: ${afterSections}`
);
