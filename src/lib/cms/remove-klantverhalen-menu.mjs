#!/usr/bin/env node
/**
 * Remove klantverhalen / Case Studies from primary + footer menus (NL + EN).
 *
 * Usage:
 *   node src/lib/cms/remove-klantverhalen-menu.mjs          # dry-run
 *   node src/lib/cms/remove-klantverhalen-menu.mjs --apply
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

/** nav_menu_item post IDs (primary/footer, NL + EN). */
const MENU_ITEM_IDS = [77931, 77928, 77941, 77947];

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
const ids = MENU_ITEM_IDS.join(" ");

const php = `<?php
$ids = [${MENU_ITEM_IDS.join(", ")}];
$dry = ${apply ? "false" : "true"};
foreach ($ids as $id) {
  $post = get_post($id);
  if (!$post || $post->post_type !== 'nav_menu_item') {
    echo "skip {$id}: not a nav_menu_item\\n";
    continue;
  }
  $title = $post->post_title;
  echo "menu item {$id} ({$title})";
  if (!$dry) {
    $ok = wp_delete_post($id, true);
    echo $ok ? " -> deleted" : " -> delete failed";
  }
  echo "\\n";
}
echo $dry ? "DRY-RUN complete.\\n" : "Done.\\n";
`;

const remotePhp = "/tmp/omb-remove-klantverhalen-menu.php";
const b64 = Buffer.from(php, "utf8").toString("base64");
const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remotePhp)} && cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} ; rm -f ${shellQuote(remotePhp)}`;

console.log(apply ? "APPLY mode" : "DRY-RUN (pass --apply to write)");
console.log(`Removing menu items: ${MENU_ITEM_IDS.join(", ")}`);

const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
