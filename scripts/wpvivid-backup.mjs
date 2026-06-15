#!/usr/bin/env node
/**
 * Create a WPvivid full backup on the Ploi server and delete the oldest backup first.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHP_SCRIPT = path.join(ROOT, "scripts", "omb-wpvivid-backup.php");

dotenv.config({ path: path.join(ROOT, ".env.local") });

const passthrough = process.argv.slice(2);

const REQUIRED = ["PLOI_SSH_HOST", "PLOI_SSH_USER", "PLOI_PLUGINS_PATH"];
for (const key of REQUIRED) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key} in .env.local`);
    process.exit(1);
  }
}

if (!fs.existsSync(PHP_SCRIPT)) {
  console.error(`Missing ${PHP_SCRIPT}`);
  process.exit(1);
}

const HOST = process.env.PLOI_SSH_HOST.trim();
const USER = process.env.PLOI_SSH_USER.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH.trim();
const WP_ROOT =
  process.env.PLOI_WP_ROOT?.trim() ||
  path.posix.dirname(path.posix.dirname(PLUGINS_PATH));
const REMOTE = `${USER}@${HOST}`;
const REMOTE_SCRIPT = `/tmp/omb-wpvivid-backup-${Date.now()}.php`;
const remoteFlags = passthrough.map((arg) => arg.replace(/'/g, "'\\''")).join(" ");
const remoteCmd = `OMB_WP_ROOT='${WP_ROOT.replace(/'/g, "'\\''")}' php '${REMOTE_SCRIPT}' ${remoteFlags}`;

function run(cmd, args, label) {
  console.log(`\n-> ${label}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

run("scp", [PHP_SCRIPT, `${REMOTE}:${REMOTE_SCRIPT}`], "Upload backup script");
run(
  "ssh",
  [
    REMOTE,
    `${remoteCmd}; EXIT_CODE=$?; rm -f '${REMOTE_SCRIPT}'; exit $EXIT_CODE`,
  ],
  "Run WPvivid backup on server",
);

console.log("\nWPvivid backup finished successfully.");
