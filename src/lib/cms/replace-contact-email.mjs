#!/usr/bin/env node
/**
 * Replace Salonora contact emails in WordPress DB via WP-CLI over SSH.
 *
 * Usage:
 *   node src/lib/cms/replace-contact-email.mjs
 *   node src/lib/cms/replace-contact-email.mjs --apply
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
  path.posix.dirname(path.posix.dirname(PLUGINS_PATH || ""));
const apply = process.argv.includes("--apply");

const REPLACEMENTS = [
  ["mailto:hoi@salonora.nl", "mailto:hi@salonora.eu"],
  ["mailto:info@salonora.nl", "mailto:hi@salonora.eu"],
  ["hoi@salonora.nl", "hi@salonora.eu"],
  ["info@salonora.nl", "hi@salonora.eu"],
  ["hoi@salonora.eu", "hi@salonora.eu"],
  ["info@salonora.eu", "hi@salonora.eu"],
];

if (!HOST || !USER || !WP_ROOT) {
  console.error("Missing PLOI_SSH_HOST, PLOI_SSH_USER, or WP root in .env.local");
  process.exit(1);
}

const REMOTE = `${USER}@${HOST}`;

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

/** Resolve wp-cli on Ploi (download phar to /tmp when not installed). */
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

for (const [from, to] of REPLACEMENTS) {
  const dryFlag = apply ? "" : " --dry-run";
  const cmd = `cd ${shellQuote(WP_ROOT)} && ${WP_CLI} search-replace ${shellQuote(from)} ${shellQuote(to)}${dryFlag} --all-tables`;
  console.log(`\n-> ${apply ? "APPLY" : "DRY-RUN"}: ${from} -> ${to}`);
  const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(`Failed: ${from} -> ${to}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nDone (${apply ? "applied" : "dry-run only"}).`);
