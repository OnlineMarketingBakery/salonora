#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHP_SCRIPT = path.join(ROOT, "scripts", "omb-sync-blog-en.php");
const MANIFEST = path.join(ROOT, "scripts", "data", "blog-en-manifest.json");
const CONTENT_DIR = path.join(ROOT, "scripts", "data", "blog-en");
dotenv.config({ path: path.join(ROOT, ".env.local") });
const dryRun = process.argv.includes("--dry-run");
for (const key of ["PLOI_SSH_HOST", "PLOI_SSH_USER", "PLOI_PLUGINS_PATH"]) {
  if (!process.env[key]?.trim()) { console.error(`Missing ${key}`); process.exit(1); }
}
for (const f of [PHP_SCRIPT, MANIFEST, CONTENT_DIR]) {
  if (!fs.existsSync(f)) { console.error(`Missing ${f}`); process.exit(1); }
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
for (const post of manifest.posts ?? []) {
  if (!fs.existsSync(path.join(CONTENT_DIR, post.contentFile))) {
    console.error(`Missing ${post.contentFile}`); process.exit(1);
  }
}
const HOST = process.env.PLOI_SSH_HOST.trim();
const USER = process.env.PLOI_SSH_USER.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH.trim();
const WP_ROOT = process.env.PLOI_WP_ROOT?.trim() || path.posix.dirname(path.posix.dirname(PLUGINS_PATH));
const REMOTE = `${USER}@${HOST}`;
const stamp = Date.now();
const REMOTE_DIR = `/tmp/omb-blog-en-${stamp}`;
if (dryRun) { console.log("Dry run OK", manifest.posts.length, "posts"); process.exit(0); }
function run(cmd, args, label) {
  console.log(`\n-> ${label}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) { console.error(`Failed: ${label}`); process.exit(result.status ?? 1); }
}
run("ssh", [REMOTE, `mkdir -p '${REMOTE_DIR}/content'`], "Create remote dir");
run("scp", [MANIFEST, `${REMOTE}:${REMOTE_DIR}/blog-en-manifest.json`], "Upload manifest");
for (const post of manifest.posts) {
  run("scp", [path.join(CONTENT_DIR, post.contentFile), `${REMOTE}:${REMOTE_DIR}/content/${post.contentFile}`], post.contentFile);
}
run("scp", [PHP_SCRIPT, `${REMOTE}:${REMOTE_DIR}/omb-sync-blog-en.php`], "Upload PHP");
run("ssh", [REMOTE, `OMB_WP_ROOT='${WP_ROOT.replace(/'/g, "'\\''")}' php '${REMOTE_DIR}/omb-sync-blog-en.php' '${REMOTE_DIR}/blog-en-manifest.json' '${REMOTE_DIR}/content'; EXIT_CODE=$?; rm -rf '${REMOTE_DIR}'; exit $EXIT_CODE`], "Run sync");
console.log("\nBlog EN sync finished.");
