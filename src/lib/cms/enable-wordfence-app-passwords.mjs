#!/usr/bin/env node
/**
 * Re-enable WordPress Application Passwords disabled by Wordfence.
 *
 * Usage:
 *   node src/lib/cms/enable-wordfence-app-passwords.mjs          # dry-run
 *   node src/lib/cms/enable-wordfence-app-passwords.mjs --apply
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
  const probe = spawnSync("ssh", [REMOTE, `${install} && php ${shellQuote(phar)} --info`], {
    encoding: "utf8",
  });
  if (probe.status === 0) return `php ${shellQuote(phar)}`;
  console.error("Could not run wp-cli on server.");
  process.exit(1);
}

const WP_CLI = resolveWpCli();

const php = `<?php
$key = 'loginSec_disableApplicationPasswords';
$dry = ${apply ? "false" : "true"};
if (!class_exists('wfConfig')) {
  echo "Wordfence wfConfig not available (plugin inactive?)\\n";
  exit(1);
}
$before = wfConfig::get($key);
echo "loginSec_disableApplicationPasswords before: {$before}\\n";
if (!$dry && (string) $before !== '0') {
  wfConfig::set($key, 0);
  echo "set to 0 (application passwords enabled)\\n";
} elseif ($dry && (string) $before !== '0') {
  echo "DRY-RUN: would set to 0\\n";
} else {
  echo "already enabled (value is 0)\\n";
}
$after = wfConfig::get($key);
echo "loginSec_disableApplicationPasswords after: {$after}\\n";
$available = function_exists('wp_is_application_passwords_available') ? (wp_is_application_passwords_available() ? 'yes' : 'no') : 'unknown';
echo "wp_is_application_passwords_available: {$available}\\n";
`;

const remotePhp = "/tmp/omb-enable-wordfence-app-passwords.php";
const b64 = Buffer.from(php, "utf8").toString("base64");
const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remotePhp)} && cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} ; rm -f ${shellQuote(remotePhp)}`;

console.log(apply ? "APPLY mode" : "DRY-RUN (pass --apply to write)");

const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
