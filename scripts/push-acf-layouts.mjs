/**
 * Push specific flexible layouts via safe layout merge (acf_update_field).
 * Usage: npm run acf:push-layouts [layoutName ...]
 * Default: legal_content, faq
 */
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const targets =
  process.argv.slice(2).filter((a) => !a.startsWith("-")).length > 0
    ? process.argv.slice(2).filter((a) => !a.startsWith("-"))
    : ["legal_content", "faq"];

for (const name of targets) {
  console.log(`[acf:push-layouts] Syncing ${name}...`);
  const result = spawnSync(
    process.execPath,
    [resolve(__dirname, "push-acf-rest.mjs"), "--only=" + name],
    { stdio: "inherit", cwd: resolve(__dirname, "..") }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("[acf:push-layouts] Done.");
