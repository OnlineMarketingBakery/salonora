#!/usr/bin/env node
/**
 * Fix misplaced capital O in CTA labels across WordPress page_sections + ACF options.
 *
 * Usage:
 *   node src/lib/cms/fix-cta-label-casing.mjs          # dry-run
 *   node src/lib/cms/fix-cta-label-casing.mjs --apply
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
if (!function_exists('get_field')) {
    echo "ACF inactive\\n";
    exit(1);
}

$dry = ${apply ? "false" : "true"};
$changes = 0;
$pages_updated = 0;
$options_updated = 0;

$explicit = [
    'DiscOver the difference' => 'Discover the difference',
    'Start tOday' => 'Start today',
    'Start taking bOOkings' => 'Start taking bookings',
    'Start with the cOmplete sOlyoutiOn' => 'Start with the complete solution',
];

function omb_decode_plain($text) {
    if (!is_string($text) || $text === '') return $text;
    $text = str_replace('&nbsp;', ' ', $text);
    return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function omb_fix_misplaced_o($text) {
    if (!is_string($text) || $text === '') return $text;
    $out = trim(omb_decode_plain($text));
    do {
        $prev = $out;
        $out = preg_replace('/([a-z])O([a-z])/', '$1o$2', $out);
    } while ($prev !== $out);
    return $out;
}

function omb_normalize_cta_label($text) {
    global $explicit;
    if (!is_string($text) || $text === '') return $text;
    $out = omb_fix_misplaced_o($text);
    if (isset($explicit[$text])) {
        $out = $explicit[$text];
    }
    foreach ($explicit as $from => $to) {
        if (strpos($out, $from) !== false) {
            $out = str_replace($from, $to, $out);
        }
    }
    return $out;
}

function omb_log_change($context, $field, $before, $after) {
    global $changes;
    if ($before === $after) return false;
    $changes++;
    echo "{$context} / {$field}: \\"{$before}\\" -> \\"{$after}\\"\\n";
    return true;
}

function omb_fix_link_array(&$link, $context, $field) {
    if (!is_array($link)) return false;
    $changed = false;
    if (isset($link['title']) && is_string($link['title'])) {
        $after = omb_normalize_cta_label($link['title']);
        if (omb_log_change($context, $field . '.title', $link['title'], $after)) {
            $link['title'] = $after;
            $changed = true;
        }
    }
    return $changed;
}

function omb_fix_cta_row(&$row, $context, $field) {
    if (!is_array($row)) return false;
    $changed = false;
    if (isset($row['cta_text']) && is_string($row['cta_text'])) {
        $after = omb_normalize_cta_label($row['cta_text']);
        if (omb_log_change($context, $field . '.cta_text', $row['cta_text'], $after)) {
            $row['cta_text'] = $after;
            $changed = true;
        }
    }
    if (isset($row['cta_url'])) {
        if (omb_fix_link_array($row['cta_url'], $context, $field . '.cta_url')) {
            $changed = true;
        }
    }
    return $changed;
}

function omb_walk_value(&$value, $context, $key = '') {
    if (is_string($value)) {
        $cta_keys = ['cta_text', 'title'];
        if ($key !== '' && in_array($key, $cta_keys, true)) {
            $after = omb_normalize_cta_label($value);
            if (omb_log_change($context, $key, $value, $after)) {
                $value = $after;
                return true;
            }
        }
        return false;
    }
    if (!is_array($value)) return false;
    $changed = false;

    $link_keys = [
        'cta_link', 'cta', 'footer_cta_link', 'footer_cta_primary_link',
        'footer_cta_secondary_link', 'header_cta_link', 'global_cta_link',
        'primary_cta', 'secondary_cta',
    ];
    foreach ($link_keys as $lk) {
        if (isset($value[$lk]) && is_array($value[$lk])) {
            if (omb_fix_link_array($value[$lk], $context, $lk)) $changed = true;
        }
    }

    $repeater_keys = ['ctas', 'footer_ctas', 'pricing_ctas', 'contact_ctas'];
    foreach ($repeater_keys as $rk) {
        if (!isset($value[$rk]) || !is_array($value[$rk])) continue;
        foreach ($value[$rk] as $i => &$item) {
            if (omb_fix_cta_row($item, $context, "{$rk}[{$i}]")) $changed = true;
            if (isset($item['cta_link']) && is_array($item['cta_link'])) {
                if (omb_fix_link_array($item['cta_link'], $context, "{$rk}[{$i}].cta_link")) $changed = true;
            }
        }
        unset($item);
    }

    if (isset($value['items']) && is_array($value['items'])) {
        foreach ($value['items'] as $i => &$pkg) {
            if (!is_array($pkg)) continue;
            if (isset($pkg['ctas']) && is_array($pkg['ctas'])) {
                foreach ($pkg['ctas'] as $j => &$cta) {
                    if (omb_fix_cta_row($cta, $context, "items[{$i}].ctas[{$j}]")) $changed = true;
                }
                unset($cta);
            }
        }
        unset($pkg);
    }

    if (isset($value['packages']) && is_array($value['packages'])) {
        foreach ($value['packages'] as $i => &$pkg) {
            if (!is_array($pkg)) continue;
            if (isset($pkg['ctas']) && is_array($pkg['ctas'])) {
                foreach ($pkg['ctas'] as $j => &$cta) {
                    if (omb_fix_cta_row($cta, $context, "packages[{$i}].ctas[{$j}]")) $changed = true;
                }
                unset($cta);
            }
            if (isset($pkg['pricing_cards']) && is_array($pkg['pricing_cards'])) {
                foreach ($pkg['pricing_cards'] as $j => &$card) {
                    if (!is_array($card) || !isset($card['ctas'])) continue;
                    foreach ($card['ctas'] as $k => &$cta) {
                        if (omb_fix_cta_row($cta, $context, "packages[{$i}].pricing_cards[{$j}].ctas[{$k}]")) $changed = true;
                    }
                    unset($cta);
                }
                unset($card);
            }
        }
        unset($pkg);
    }

    foreach ($value as $k => &$child) {
        if (is_array($child)) {
            if (omb_walk_value($child, $context, (string) $k)) $changed = true;
        }
    }
    unset($child);

    return $changed;
}

$q = new WP_Query([
    'post_type' => 'page',
    'post_status' => ['publish', 'draft', 'private'],
    'posts_per_page' => -1,
    'fields' => 'ids',
    'lang' => '',
    'suppress_filters' => true,
]);

$posts = is_array($q->posts) ? $q->posts : [];

foreach ($posts as $page_id) {
    $sections = get_field('page_sections', $page_id);
    if (!is_array($sections) || !$sections) continue;
    $ctx = 'page ' . $page_id;
    $changed = false;
    foreach ($sections as $i => &$section) {
        if (!is_array($section)) continue;
        $layout = $section['acf_fc_layout'] ?? 'section';
        if (omb_walk_value($section, $ctx . ' / ' . $layout . '[' . $i . ']')) {
            $changed = true;
        }
    }
    unset($section);
    if ($changed) {
        if (!$dry) {
            update_field('page_sections', $sections, $page_id);
            $pages_updated++;
        }
        echo ($dry ? 'DRY-RUN would update' : 'Updated') . " page {$page_id}\\n";
    }
}

$option_ids = ['option', 'options', 'option_nl', 'option_en'];
$option_ids = array_unique($option_ids);
$option_fields = [
    'footer_cta_primary_link', 'footer_cta_secondary_link', 'header_cta_link',
    'global_cta_link', 'footer_cta_link',
];

foreach ($option_ids as $opt) {
    $opt_changed = false;
    foreach ($option_fields as $field) {
        $val = get_field($field, $opt);
        if (!is_array($val)) continue;
        $copy = $val;
        if (omb_fix_link_array($copy, 'options ' . $opt, $field)) {
            $opt_changed = true;
            if (!$dry) {
                update_field($field, $copy, $opt);
            }
        }
    }
    if ($opt_changed) {
        $options_updated++;
        echo ($dry ? 'DRY-RUN would update' : 'Updated') . " options {$opt}\\n";
    }
}

echo "\\n" . ($dry ? 'DRY-RUN' : 'APPLY') . " complete: {$changes} field(s), {$pages_updated} page(s), {$options_updated} option group(s).\\n";
`;

const remotePhp = "/tmp/omb-fix-cta-label-casing.php";
const b64 = Buffer.from(php, "utf8").toString("base64");
const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remotePhp)} && cd ${shellQuote(WP_ROOT)} && ${WP_CLI} eval-file ${shellQuote(remotePhp)} ; rm -f ${shellQuote(remotePhp)}`;

console.log(apply ? "=== APPLY CTA label casing fixes ===" : "=== DRY-RUN CTA label casing fixes ===");
const result = spawnSync("ssh", [REMOTE, cmd], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
