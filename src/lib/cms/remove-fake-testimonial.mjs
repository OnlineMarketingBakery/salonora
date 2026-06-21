#!/usr/bin/env node
/**
 * Remove fake Sandra Vermeulen testimonials from page_sections and unpublish CPT rows.
 *
 * Usage:
 *   node src/lib/cms/remove-fake-testimonial.mjs          # dry-run
 *   node src/lib/cms/remove-fake-testimonial.mjs --apply
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

/** Sandra Vermeulen (fake) — NL + EN testimonial post IDs. */
const REMOVE_IDS = [6235, 6232];

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
const removePhp = REMOVE_IDS.join(",");

const php = `<?php
if (!function_exists('get_field')) { echo "ACF inactive\\n"; exit(1); }
$remove = array_map('intval', explode(',', '${removePhp}'));
$dry = ${apply ? "false" : "true"};
$q = new WP_Query(['post_type' => 'page', 'post_status' => 'publish', 'posts_per_page' => -1, 'fields' => 'ids']);
$updated = 0;
foreach ($q->posts as $page_id) {
  $sections = get_field('page_sections', $page_id);
  if (!is_array($sections)) continue;
  $changed = false;
  foreach ($sections as $i => $section) {
    if (!is_array($section) || ($section['acf_fc_layout'] ?? '') !== 'testimonials') continue;
    $items = $section['items'] ?? null;
    if (!is_array($items)) continue;
    $ids = array_map(function ($v) {
      if (is_object($v)) return (int) ($v->ID ?? 0);
      if (is_array($v)) return (int) ($v['ID'] ?? $v['id'] ?? 0);
      return (int) $v;
    }, $items);
    $ids = array_values(array_filter($ids));
    $after = array_values(array_filter($ids, function ($id) use ($remove) {
      return $id > 0 && !in_array($id, $remove, true);
    }));
    if ($after === $ids) continue;
    $changed = true;
    $sections[$i]['items'] = $after;
    echo "page {$page_id}: testimonials [" . implode(',', $ids) . "] -> [" . implode(',', $after) . "]\\n";
  }
  if ($changed && !$dry) {
    update_field('page_sections', $sections, $page_id);
    $updated++;
  }
}
foreach ($remove as $tid) {
  $post = get_post($tid);
  if (!$post) { echo "testimonial {$tid}: not found\\n"; continue; }
  echo "testimonial {$tid} ({$post->post_title}): status {$post->post_status}";
  if (!$dry && $post->post_status === 'publish') {
    wp_update_post(['ID' => $tid, 'post_status' => 'draft']);
    echo " -> draft";
  }
  echo "\\n";
}
echo $dry ? "DRY-RUN complete.\\n" : "Updated {$updated} page(s).\\n";
`;

const remotePhp = "/tmp/omb-remove-fake-testimonial.php";
const b64 = Buffer.from(php, "utf8").toString("base64");
const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remotePhp)} && cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} ; rm -f ${shellQuote(remotePhp)}`;

console.log(apply ? "APPLY mode" : "DRY-RUN (pass --apply to write)");
console.log(`Using WP-CLI: ${WP_CLI}`);

const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8" });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
