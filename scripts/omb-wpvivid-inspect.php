<?php
define('WP_USE_THEMES', false);
$wpRoot = getenv('OMB_WP_ROOT') ?: '/home/ploi/backend.salonora.eu/public';
require $wpRoot . '/wp-load.php';
$taskId = $argv[1] ?? 'wpvivid-987312b907353';
$root = WP_CONTENT_DIR . '/' . WPvivid_Setting::get_backupdir();
echo "backup_dir=$root\n";
foreach (glob($root . '/*' . $taskId . '*') as $f) {
    echo basename($f) . ' ' . filesize($f) . "\n";
}
$list = get_option('wpvivid_backup_list', []);
if (isset($list[$taskId])) {
    echo "list_entry:\n" . json_encode($list[$taskId], JSON_PRETTY_PRINT) . "\n";
}
echo 'get_size=' . WPvivid_Backuplist::get_size($taskId) . "\n";
