#!/usr/bin/env node
/**
 * Upload and run seed-case-study-voetzorg-en.php on the Ploi WordPress server.
 *
 * Usage:
 *   node scripts/run-seed-case-study-voetzorg-en.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHP_SCRIPT = path.join(ROOT, "scripts", "seed-case-study-voetzorg-en.php");
const JSON_DATA = path.join(ROOT, "scripts", "data", "case-study-voetzorg-en.json");

dotenv.config({ path: path.join(ROOT, ".env.local") });

const passthrough = process.argv.slice(2);
const dryRun = passthrough.includes("--dry-run");

const REQUIRED = ["PLOI_SSH_HOST", "PLOI_SSH_USER", "PLOI_PLUGINS_PATH"];
for (const key of REQUIRED) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key} in .env.local`);
    process.exit(1);
  }
}

for (const file of [PHP_SCRIPT, JSON_DATA]) {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
}

const HOST = process.env.PLOI_SSH_HOST.trim();
const USER = process.env.PLOI_SSH_USER.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH.trim();
const WP_ROOT =
  process.env.PLOI_WP_ROOT?.trim() ||
  path.posix.dirname(path.posix.dirname(PLUGINS_PATH));
const REMOTE = `${USER}@${HOST}`;
const stamp = Date.now();
const REMOTE_PHP = `/tmp/omb-seed-case-study-en-${stamp}.php`;
const REMOTE_JSON = `/tmp/omb-case-study-voetzorg-en-${stamp}.json`;
const remoteFlags = dryRun ? "--dry-run" : "";
const remoteCmd = `OMB_WP_ROOT='${WP_ROOT.replace(/'/g, "'\\''")}' php '${REMOTE_PHP}' '${REMOTE_JSON}' ${remoteFlags}`;

function run(cmd, args, label) {
  console.log(`\n-> ${label}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

run("scp", [PHP_SCRIPT, `${REMOTE}:${REMOTE_PHP}`], "Upload PHP seed script");
run("scp", [JSON_DATA, `${REMOTE}:${REMOTE_JSON}`], "Upload EN copy JSON");
run(
  "ssh",
  [
    REMOTE,
    `${remoteCmd}; EXIT_CODE=$?; rm -f '${REMOTE_PHP}' '${REMOTE_JSON}'; exit $EXIT_CODE`,
  ],
  dryRun ? "Dry-run seed on server" : "Run case study EN seed on server",
);

console.log("\nCase study EN seed finished successfully.");
