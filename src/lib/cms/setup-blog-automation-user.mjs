#!/usr/bin/env node
/**
 * Ensure dedicated blog automation user exists (Editor) with Application Password.
 *
 * Usage:
 *   node src/lib/cms/setup-blog-automation-user.mjs          # dry-run
 *   node src/lib/cms/setup-blog-automation-user.mjs --apply
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const HOST = process.env.PLOI_SSH_HOST?.trim();
const USER = process.env.PLOI_SSH_USER?.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH?.trim();
const WP_ROOT =
  process.env.PLOI_WP_ROOT?.trim() ||
  path.posix.dirname(path.posix.dirname(PLUGINS_PATH || ""));
const apply = process.argv.includes("--apply");

const AUTOMATION_USER = "blog-automation";
const AUTOMATION_EMAIL = "blog-automation@salonora.eu";
const APP_PASSWORD_NAME = "n8n-blog-publishing";

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
const tempPassword = crypto.randomBytes(16).toString("base64url");

const php = `<?php
$dry = ${apply ? "false" : "true"};
$login = '${AUTOMATION_USER}';
$email = '${AUTOMATION_EMAIL}';
$app_name = '${APP_PASSWORD_NAME}';
$user = get_user_by('login', $login);
if (!$user) {
  echo "user {$login}: not found\\n";
  if (!$dry) {
    $id = wp_insert_user([
      'user_login' => $login,
      'user_email' => $email,
      'user_pass' => '${tempPassword}',
      'role' => 'editor',
      'display_name' => 'Blog Automation',
    ]);
    if (is_wp_error($id)) {
      echo "create failed: " . $id->get_error_message() . "\\n";
      exit(1);
    }
    echo "created user id {$id}\\n";
    $user = get_user_by('id', $id);
  } else {
    echo "DRY-RUN: would create editor user {$login}\\n";
    exit(0);
  }
} else {
  echo "user {$login} exists (id {$user->ID}, roles: " . implode(',', (array) $user->roles) . ")\\n";
  if (!in_array('editor', (array) $user->roles, true) && !in_array('administrator', (array) $user->roles, true)) {
    if (!$dry) {
      $user->set_role('editor');
      echo "role set to editor\\n";
    } else {
      echo "DRY-RUN: would set role to editor\\n";
    }
  }
}
if (!class_exists('WP_Application_Passwords')) {
  echo "WP_Application_Passwords unavailable\\n";
  exit(1);
}
$existing = WP_Application_Passwords::get_user_application_passwords($user->ID);
foreach ($existing as $row) {
  if (($row['name'] ?? '') === $app_name) {
    echo "application password '{$app_name}' already exists (uuid {$row['uuid']})\\n";
    echo "Use WP admin to revoke/recreate if the password was lost.\\n";
    exit(0);
  }
}
if ($dry) {
  echo "DRY-RUN: would run wp user application-password create {$login} {$app_name}\\n";
  exit(0);
}
echo "Run via WP-CLI: wp user application-password create {$login} {$app_name}\\n";
`;

const remotePhp = "/tmp/omb-setup-blog-automation-user.php";
const b64 = Buffer.from(php, "utf8").toString("base64");
const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remotePhp)} && cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} ; rm -f ${shellQuote(remotePhp)}`;

console.log(apply ? "APPLY mode" : "DRY-RUN (pass --apply to write)");

const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);

if (!apply) process.exit(0);

const appCmd = `cd ${shellQuote(WP_ROOT)} && ${WP_CLI} user application-password list ${shellQuote(AUTOMATION_USER)} --format=count`;
const listResult = spawnSync("ssh", [REMOTE, appCmd], { encoding: "utf8" });
const existingCount = parseInt(String(listResult.stdout).trim(), 10);
if (existingCount > 0) {
  console.log(`Application password already exists for ${AUTOMATION_USER} (count=${existingCount}).`);
  process.exit(0);
}

const createCmd = `cd ${shellQuote(WP_ROOT)} && ${WP_CLI} user application-password create ${shellQuote(AUTOMATION_USER)} ${shellQuote(APP_PASSWORD_NAME)}`;
console.log("Creating application password via WP-CLI…");
const createResult = spawnSync("ssh", [REMOTE, createCmd], { encoding: "utf8" });
if (createResult.stdout) process.stdout.write(createResult.stdout);
if (createResult.stderr) process.stderr.write(createResult.stderr);
process.exit(createResult.status ?? 1);
