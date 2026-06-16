<?php
/**
 * Upload case study PNGs from a directory to WordPress media library.
 * Usage: OMB_WP_ROOT=/wp php omb-upload-case-study-media.php /path/to/figma-voetzorg
 */
if (php_sapi_name() !== 'cli') { fwrite(STDERR, "CLI only\n"); exit(1); }
$dir = $argv[1] ?? '';
if (!is_dir($dir)) { fwrite(STDERR, "Directory required\n"); exit(1); }
$wpRoot = getenv('OMB_WP_ROOT');
if (!$wpRoot) { fwrite(STDERR, "OMB_WP_ROOT required\n"); exit(1); }
define('WP_USE_THEMES', false);
require rtrim($wpRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
$fileMap = [
  'hero' => 'hero.png',
  'product_shot' => 'product-shot-composite.png',
  'video_poster' => 'video-poster.png',
  'avatar' => 'avatar.png',
];
$out = [];
foreach ($fileMap as $role => $basename) {
  $file = rtrim($dir, '/') . '/' . $basename;
  if (!is_readable($file)) { fwrite(STDERR, "Missing {$file}\n"); exit(1); }
  $tmp = wp_tempnam($file);
  copy($file, $tmp);
  $fileArray = ['name' => basename($file), 'tmp_name' => $tmp];
  $id = media_handle_sideload($fileArray, 0);
  if (is_wp_error($id)) { fwrite(STDERR, $id->get_error_message() . "\n"); exit(1); }
  @unlink($tmp);
  $out[$role] = (int) $id;
}
echo json_encode(['media' => $out], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
