#!/usr/bin/env node
/**
 * Rewrite Yoast canonical / OG URLs from backend.salonora.eu to salonora.eu in WP DB.
 *
 * Usage:
 *   node src/lib/cms/fix-yoast-canonical-domain.mjs
 *   node src/lib/cms/fix-yoast-canonical-domain.mjs --apply
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const HOST = process.env.PLOI_SSH_HOST?.trim();
const USER = process.env.PLOI_SSH_USER?.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH?.trim();
const WP_ROOT =
  process.env.PLOI_WP_ROOT?.trim() ||
  (PLUGINS_PATH
    ? path.posix.dirname(path.posix.dirname(PLUGINS_PATH))
    : "/home/ploi/backend.salonora.eu/public");
const apply = process.argv.includes("--apply");

const FROM = "https://backend.salonora.eu";
const TO = "https://salonora.eu";

/** Yoast tables only — do not touch wp_options (siteurl/home stay on backend). */
const TABLES = ["wp_yoast_indexable", "wp_postmeta"];

if (!HOST || !USER || !WP_ROOT) {
  console.error("Missing PLOI_SSH_HOST, PLOI_SSH_USER, or WP root in .env.local");
  process.exit(1);
}

const REMOTE = `${USER}@${HOST}`;

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function resolveWpCli() {
  const phar = "/tmp/omb-wp-cli.phar";
  const install = `test -f ${shellQuote(phar)} || curl -fsSL -o ${shellQuote(phar)} https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar`;
  const probe = spawnSync(
    "ssh",
    [REMOTE, `${install} && php ${shellQuote(phar)} --info`],
    { encoding: "utf8" },
  );
  if (probe.status === 0) {
    return `php ${shellQuote(phar)}`;
  }
  if (probe.stderr) process.stderr.write(probe.stderr);
  console.error("Could not download or run wp-cli.phar on server.");
  process.exit(1);
}

const WP_CLI = resolveWpCli();
console.log(`Using WP-CLI: ${WP_CLI}`);

for (const table of TABLES) {
  const list = spawnSync(
    "ssh",
    [REMOTE, `cd ${shellQuote(WP_ROOT)} && ${WP_CLI} db tables --format=csv`],
    { encoding: "utf8" },
  );
  if (!list.stdout?.split("\n").some((line) => line.trim().replace(/"/g, "") === table)) {
    console.log(`\nSkip (table missing): ${table}`);
    continue;
  }

  const dryFlag = apply ? "" : " --dry-run";
  const cmd = `cd ${shellQuote(WP_ROOT)} && ${WP_CLI} search-replace ${shellQuote(FROM)} ${shellQuote(TO)} ${shellQuote(table)}${dryFlag}`;
  console.log(`\n-> ${apply ? "APPLY" : "DRY-RUN"}: ${FROM} -> ${TO} in ${table}`);
  const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(`Failed on table: ${table}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nDone (${apply ? "applied" : "dry-run only"}).`);
