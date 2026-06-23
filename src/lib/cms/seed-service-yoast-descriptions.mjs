#!/usr/bin/env node
/**
 * Seed Yoast meta descriptions on service CPT posts when empty.
 * Uses excerpt plain text, then ACF `service_intro`.
 *
 * Usage:
 *   node src/lib/cms/seed-service-yoast-descriptions.mjs
 *   node src/lib/cms/seed-service-yoast-descriptions.mjs --apply
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
$dry = ${apply ? "false" : "true"};
$updated = 0;
$skipped = 0;

function omb_plain($html) {
    if (!is_string($html) || $html === '') return '';
    $text = wp_strip_all_tags(html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    $text = preg_replace('/\\s+/', ' ', trim($text));
    if (strlen($text) <= 155) return $text;
    $slice = substr($text, 0, 155);
    $last = strrpos($slice, ' ');
    if ($last !== false && $last > 80) $slice = substr($slice, 0, $last);
    return rtrim($slice) . '…';
}

function omb_service_desc($post_id) {
    $existing = get_post_meta($post_id, '_yoast_wpseo_metadesc', true);
    if (is_string($existing) && trim($existing) !== '') {
        return null;
    }
    $post = get_post($post_id);
    if (!$post) return null;
    $from_excerpt = omb_plain($post->post_excerpt);
    if ($from_excerpt !== '') return $from_excerpt;
    if (function_exists('get_field')) {
        $intro = get_field('service_intro', $post_id);
        if (is_string($intro) && trim($intro) !== '') {
            return omb_plain($intro);
        }
    }
    return null;
}

$posts = get_posts([
    'post_type' => 'service',
    'post_status' => 'publish',
    'numberposts' => -1,
    'lang' => '',
    'suppress_filters' => false,
]);

foreach ($posts as $post) {
    $desc = omb_service_desc($post->ID);
    if ($desc === null) {
        $skipped++;
        continue;
    }
    $lang = function_exists('pll_get_post_language') ? pll_get_post_language($post->ID) : '?';
    echo "service #{$post->ID} ({$lang}) {$post->post_name}: {$desc}\\n";
    if (!$dry) {
        update_post_meta($post->ID, '_yoast_wpseo_metadesc', $desc);
        if (class_exists('WPSEO_Meta')) {
            WPSEO_Meta::set_value('metadesc', $desc, $post->ID);
        }
    }
    $updated++;
}

echo "\\n" . ($dry ? "DRY-RUN" : "APPLIED") . ": {$updated} updated, {$skipped} skipped (already set or no source).\\n";
`;

const remotePhp = `/tmp/omb-seed-service-yoast-${Date.now()}.php`;
const write = spawnSync(
  "ssh",
  [REMOTE, `cat > ${shellQuote(remotePhp)}`],
  { input: php, encoding: "utf8" }
);
if (write.status !== 0) {
  console.error("Failed to upload PHP script");
  process.exit(1);
}

const run = spawnSync(
  "ssh",
  [REMOTE, `cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} && rm -f ${shellQuote(remotePhp)}`],
  { encoding: "utf8" }
);
if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);
process.exit(run.status ?? 1);
