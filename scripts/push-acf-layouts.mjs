/**
 * Push flexible layouts via ACF merge import (shows in WP admin layout picker).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { syncAcfImportBundle } from "./sync-acf-import-bundle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env"), quiet: true });
config({ path: resolve(__dirname, "../.env.local"), override: true, quiet: true });

const WP_BASE = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");
const SECRET = process.env.REVALIDATION_SECRET?.trim();
const targets =
  process.argv.slice(2).filter((a) => !a.startsWith("-")).length > 0
    ? process.argv.slice(2).filter((a) => !a.startsWith("-"))
    : ["legal_content", "faq"];

if (!WP_BASE || !SECRET) {
  console.error("[acf:push-layouts] Missing WORDPRESS_API_URL or REVALIDATION_SECRET.");
  process.exit(1);
}

syncAcfImportBundle({ quiet: true });

const bundle = JSON.parse(readFileSync(resolve(__dirname, "../acf-import-bundle.json"), "utf8"));
const group = bundle.find((g) => g.key === "group_omb_page_builder");
const flex = group?.fields?.find((f) => f.name === "page_sections");
if (!flex?.layouts) {
  console.error("[acf:push-layouts] page_sections missing from bundle.");
  process.exit(1);
}

const layoutEntries = [];
for (const name of targets) {
  const entry = Object.entries(flex.layouts).find(([, l]) => l?.name === name);
  if (!entry) {
    console.error(`[acf:push-layouts] Layout "${name}" not in bundle.`);
    process.exit(1);
  }
  layoutEntries.push(entry);
}

const patchGroup = {
  key: group.key,
  title: group.title,
  fields: [
    {
      key: flex.key,
      label: flex.label,
      name: flex.name,
      type: "flexible_content",
      layouts: Object.fromEntries(layoutEntries),
    },
  ],
};

const headers = {
  "Content-Type": "application/json",
  "X-Sync-Secret": SECRET,
  "X-Acf-Merge-Layouts": "1",
};

async function layoutStatus(label) {
  const res = await fetch(`${WP_BASE}/omb-headless/v1/acf-sync-status`);
  if (!res.ok) return;
  const data = await res.json();
  if (!Array.isArray(data.page_sections_layouts)) {
    console.log(`[acf:push-layouts] ${label}: deploy plugin for layout verification`);
    return;
  }
  console.log(`[acf:push-layouts] ${label}: ${data.page_sections_layout_count} layouts on server`);
  for (const name of targets) {
    console.log(`  ${name}: ${data.page_sections_layouts.includes(name) ? "yes" : "NO"}`);
  }
}

await layoutStatus("Before");

const body = JSON.stringify([patchGroup]);
console.log(`[acf:push-layouts] Merge import (${(body.length / 1024).toFixed(1)} KB)`);

const res = await fetch(`${WP_BASE}/omb-headless/v1/acf-sync`, {
  method: "POST",
  headers,
  body,
  signal: AbortSignal.timeout(180_000),
});
const raw = await res.text();
let parsed = null;
try {
  parsed = raw ? JSON.parse(raw) : null;
} catch {
  parsed = null;
}

if (!res.ok || !parsed?.success) {
  console.error(`[acf:push-layouts] Failed HTTP ${res.status}`);
  console.error(raw.slice(0, 600));
  process.exit(1);
}

console.log(`[acf:push-layouts] OK merged=${parsed.merged}`);
await layoutStatus("After");
console.log("[acf:push-layouts] Hard-refresh WP admin. Use OMB Page Builder > Flexible Sections (Page sections).");