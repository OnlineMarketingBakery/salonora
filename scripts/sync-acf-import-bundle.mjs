#!/usr/bin/env node
/**
 * Keeps the theme copy of the ACF bulk-import JSON in sync with the repo-root canonical file.
 * `npm run acf:push` calls this automatically before POSTing to WordPress.
 *
 * Canonical:  acf-import-bundle.json (repo root) — edit this when adding layouts.
 * Mirror:      wordpress/wp-content/themes/omb-headless/acf-import-bundle.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CANONICAL = join(ROOT, "acf-import-bundle.json");
const THEME_MIRROR = join(
  ROOT,
  "wordpress/wp-content/themes/omb-headless/acf-import-bundle.json"
);

/**
 * Parse + pretty-print so the mirror is stable JSON (and validates syntax).
 * @param {{ quiet?: boolean }} opts
 */
export function syncAcfImportBundle(opts = {}) {
  const { quiet = false } = opts;
  if (!existsSync(CANONICAL)) {
    console.error(`Missing canonical bundle: ${CANONICAL}`);
    process.exit(1);
  }
  const raw = readFileSync(CANONICAL, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in ${CANONICAL}:`, e?.message || e);
    process.exit(1);
  }
  const out = `${JSON.stringify(parsed, null, 2)}\n`;
  const dir = dirname(THEME_MIRROR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(THEME_MIRROR, out, "utf8");
  if (!quiet) {
    console.log(`Synced ACF import bundle to theme mirror: ${THEME_MIRROR}`);
  }
}

const ranAsCli = process.argv[1]?.replace(/\\/g, "/").endsWith("sync-acf-import-bundle.mjs");
if (ranAsCli) {
  syncAcfImportBundle({ quiet: false });
}
