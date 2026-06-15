<?php
define('WP_USE_THEMES', false);
require getenv('OMB_WP_ROOT') . '/wp-load.php';
$list = get_option('wpvivid_backup_list', []);
foreach ($list as $id => $entry) {
    $size = WPvivid_Backuplist::get_size($id);
    $files = $entry['backup']['files'] ?? [];
    $type = $entry['type'] ?? '';
    $time = isset($entry['create_time']) ? gmdate('Y-m-d H:i', $entry['create_time']) : '';
    echo "$id | $type | $time | files=" . count($files) . " | size_mb=" . round($size/1024/1024,2) . "\n";
}
