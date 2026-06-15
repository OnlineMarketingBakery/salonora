<?php
define('WP_USE_THEMES', false);
require getenv('OMB_WP_ROOT') . '/wp-load.php';
$taskId = $argv[1];
$tasks = get_option('wpvivid_task_list', []);
if (!isset($tasks[$taskId])) { echo "task not found\n"; exit; }
$task = $tasks[$taskId];
foreach ($task['jobs'] as $i => $job) {
    echo "job $i type=" . ($job['backup_type'] ?? '') . "\n";
    if (!empty($job['zip_file'])) {
        echo json_encode($job['zip_file'], JSON_PRETTY_PRINT) . "\n";
    }
}
