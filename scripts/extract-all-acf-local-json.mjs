/**
 * Splits `acf-import-bundle.json` (array of field groups) into one file per group in
 * `acf-json/group_<key>.json` — the format ACF Local JSON expects (see ACF docs).
 *
 * Run after editing the bundle: npm run acf:extract-local-json
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const bundlePath = resolve(root, "wordpress/wp-content/themes/omb-headless/acf-import-bundle.json");
const outDir = resolve(root, "wordpress/wp-content/themes/omb-headless/acf-json");

const groups = JSON.parse(readFileSync(bundlePath, "utf8"));
if (!Array.isArray(groups)) {
  console.error("Expected acf-import-bundle.json to be a JSON array of field groups.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
/** ACF uses `modified` (unix seconds) to decide Sync vs DB — include so WP offers updates reliably. */
const modified = Math.floor(Date.now() / 1000);
let n = 0;
for (const group of groups) {
  if (!group?.key) {
    console.warn("Skipping entry without key");
    continue;
  }
  const file = resolve(outDir, `${group.key}.json`);
  const withModified = { ...group, modified };
  writeFileSync(file, `${JSON.stringify(withModified, null, 4)}\n`);
  console.log("Wrote", group.key + ".json");
  n += 1;
}
console.log(`Done: ${n} group file(s) in acf-json/`);
