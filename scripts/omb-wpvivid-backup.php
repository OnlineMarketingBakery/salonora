<?php
/**
 * OMB agent — WPvivid full backup CLI (run on server via SSH, not in web context).
 *
 * Usage:
 *   php omb-wpvivid-backup.php [--dry-run] [--skip-delete]
 *
 * Exit codes: 0 success, 1 failure.
 */

if (php_sapi_name() !== 'cli') {
    fwrite(STDERR, "CLI only\n");
    exit(1);
}

$dryRun = in_array('--dry-run', $argv, true);
$skipDelete = in_array('--skip-delete', $argv, true);

$wpRoot = getenv('OMB_WP_ROOT');
if (!$wpRoot || $wpRoot === '') {
    fwrite(STDERR, "OMB_WP_ROOT is required\n");
    exit(1);
}
$wpLoad = rtrim($wpRoot, '/') . '/wp-load.php';

if (!is_readable($wpLoad)) {
    fwrite(STDERR, "wp-load.php not found at {$wpLoad}\n");
    exit(1);
}

define('WP_USE_THEMES', false);
require $wpLoad;

if (!class_exists('WPvivid_Backup_2') || !class_exists('WPvivid_Backuplist')) {
    fwrite(STDERR, "WPvivid Backup plugin is not available\n");
    exit(1);
}


function omb_wpvivid_backup_options(): array
{
    $schedule = get_option('wpvivid_schedule_setting', []);
    if (!empty($schedule['backup']) && is_array($schedule['backup'])) {
        $opts = $schedule['backup'];
        $opts['type'] = 'Manual';
        if (!isset($opts['action'])) {
            $opts['action'] = 'backup';
        }
        return $opts;
    }

    return [
        'type' => 'Manual',
        'action' => 'backup',
        'backup_files' => 'files+db',
        'local' => '1',
        'remote' => '0',
    ];
}
function omb_wpvivid_delete_oldest(): array
{
    global $wpvivid_plugin;

    $list = WPvivid_Backuplist::get_backuplist();
    if (empty($list)) {
        return ['result' => 'success', 'message' => 'no backups to delete'];
    }

    $oldestId = WPvivid_Backuplist::get_oldest_backup_id($list);
    if ($oldestId === '' || $oldestId === false) {
        return ['result' => 'success', 'message' => 'no unlocked oldest backup found'];
    }

    $createTime = $list[$oldestId]['create_time'] ?? null;
    echo 'Deleting oldest backup: ' . $oldestId;
    if ($createTime) {
        echo ' (' . gmdate('Y-m-d H:i:s', (int) $createTime) . ' UTC)';
    }
    echo PHP_EOL;

    $ret = $wpvivid_plugin->delete_backup_by_id($oldestId, 1);
    if (!isset($ret['result']) || $ret['result'] !== 'success') {
        $error = $ret['error'] ?? 'unknown delete error';
        return ['result' => 'failed', 'error' => $error];
    }

    return ['result' => 'success', 'deleted' => $oldestId];
}

function omb_wpvivid_prepare_task(): array
{
    $backupEngine = new WPvivid_Backup_2();

    if ($backupEngine->is_tasks_backup_running()) {
        return [
            'result' => 'failed',
            'error' => 'A WPvivid backup task is already running',
        ];
    }

    $backupOptions = omb_wpvivid_backup_options();

    $settings = $backupEngine->get_backup_settings($backupOptions);
    $task = new WPvivid_Backup_Task_2();
    $ret = $task->new_backup_task($backupOptions, $settings);

    if (!isset($ret['result']) || $ret['result'] !== 'success' || empty($ret['task_id'])) {
        $error = $ret['error'] ?? 'failed to create backup task';
        return ['result' => 'failed', 'error' => $error];
    }

    return ['result' => 'success', 'task_id' => $ret['task_id']];
}


/**
 * WPvivid merge jobs can accumulate multiple zip_file rows (cumulative sizes).
 * Keep only the final backup_all.zip so admin size matches cron backups.
 */
function omb_wpvivid_fix_merge_job_files(WPvivid_Backup_Task_2 $task): void
{
    $taskId = $task->task_id;
    if (empty($taskId) || empty($task->task['jobs']) || !is_array($task->task['jobs'])) {
        return;
    }

    $root = WP_CONTENT_DIR . '/' . WPvivid_Setting::get_backupdir();
    $matches = glob($root . '/*' . $taskId . '*backup_all.zip');
    if (empty($matches)) {
        return;
    }

    usort($matches, static function ($a, $b) {
        return filemtime($b) <=> filemtime($a);
    });

    $finalPath = $matches[0];
    $filename = basename($finalPath);
    $size = filesize($finalPath);
    if ($size === false) {
        return;
    }

    foreach ($task->task['jobs'] as $key => $job) {
        if (($job['backup_type'] ?? '') !== 'backup_merge') {
            continue;
        }
        $task->task['jobs'][$key]['zip_file'] = [
            [
                'filename' => $filename,
                'size' => $size,
            ],
        ];
    }

    $task->update_task();
}

/**
 * WPvivid admin size sums backup.files[].size; CLI merge can register duplicates.
 * Deduplicate by filename and keep only backup_all.zip when present.
 */
function omb_wpvivid_fix_backuplist_size(string $taskId): void
{
    $list = get_option('wpvivid_backup_list', []);
    if (empty($list[$taskId]['backup']['files']) || !is_array($list[$taskId]['backup']['files'])) {
        return;
    }

    $root = WP_CONTENT_DIR . '/' . WPvivid_Setting::get_backupdir();
    $seen = [];
    $deduped = [];

    foreach ($list[$taskId]['backup']['files'] as $file) {
        $name = $file['file_name'] ?? '';
        if ($name === '' || isset($seen[$name])) {
            continue;
        }
        $seen[$name] = true;
        $path = $root . '/' . $name;
        if (is_readable($path)) {
            $size = filesize($path);
            if ($size !== false) {
                $file['size'] = $size;
            }
        }
        $deduped[] = $file;
    }

    $final = [];
    foreach ($deduped as $file) {
        if (str_ends_with($file['file_name'], 'backup_all.zip')) {
            $final = [$file];
            break;
        }
    }
    if ($final === []) {
        $final = $deduped;
    }

    $list[$taskId]['backup']['files'] = $final;
    update_option('wpvivid_backup_list', $list, 'no');
}

function omb_wpvivid_run_task(string $taskId): array
{
    global $wpvivid_plugin;

    $engine = new WPvivid_Backup_2();
    $engine->current_task_id = $taskId;
    $engine->end_shutdown_function = false;
    register_shutdown_function([$engine, 'deal_backup_shutdown_error']);

    if ($engine->is_tasks_backup_running($taskId)) {
        return [
            'result' => 'failed',
            'error' => 'Backup task already marked as running',
        ];
    }

    try {
        $engine->update_backup_task_status($taskId, true, 'running');
        $engine->add_monitor_event($taskId);
        $engine->task = new WPvivid_Backup_Task_2($taskId);
        $engine->task->set_memory_limit();
        $engine->task->set_time_limit();

        $logFile = $engine->task->task['options']['log_file_name'] ?? '';
        if ($logFile) {
            $wpvivid_plugin->wpvivid_log->OpenLogFile($logFile);
            $wpvivid_plugin->wpvivid_log->WriteLog('OMB agent backup started.', 'notice');
            $wpvivid_plugin->wpvivid_log->WriteLogHander();
        }

        if (!$engine->task->is_backup_finished()) {
            $ret = $engine->backup();
            $engine->task->clear_cache();
            if (!isset($ret['result']) || $ret['result'] !== 'success') {
                $error = $ret['error'] ?? 'backup failed';
                $engine->task->update_backup_task_status(false, 'error', false, false, $error);
                do_action('wpvivid_handle_backup_2_failed', $taskId);
                $engine->clear_monitor_schedule($taskId);
                return ['result' => 'failed', 'error' => $error];
            }
        }

        if ($engine->task->need_upload()) {
            $ret = $engine->upload($taskId);
            if (!isset($ret['result']) || $ret['result'] !== WPVIVID_SUCCESS) {
                $error = $ret['error'] ?? 'remote upload failed';
                do_action('wpvivid_handle_backup_2_failed', $taskId);
                $engine->clear_monitor_schedule($taskId);
                return ['result' => 'failed', 'error' => $error];
            }
            omb_wpvivid_fix_merge_job_files($engine->task);
            do_action('wpvivid_handle_backup_2_succeed', $taskId);
            omb_wpvivid_fix_backuplist_size($taskId);
            $engine->update_backup_task_status($taskId, false, 'completed');
        } else {
            if ($logFile) {
                $wpvivid_plugin->wpvivid_log->WriteLog('Backup completed.', 'notice');
            }
            omb_wpvivid_fix_merge_job_files($engine->task);
            do_action('wpvivid_handle_backup_2_succeed', $taskId);
            omb_wpvivid_fix_backuplist_size($taskId);
            $engine->update_backup_task_status($taskId, false, 'completed');
        }

        $engine->clear_monitor_schedule($taskId);
        $engine->end_shutdown_function = true;
        $reportedMb = round(WPvivid_Backuplist::get_size($taskId) / 1024 / 1024, 2);
        echo 'Reported backup size: ' . $reportedMb . ' MB' . PHP_EOL;

        return ['result' => 'success', 'task_id' => $taskId];
    } catch (Throwable $error) {
        $message = 'Exception: ' . $error->getMessage();
        WPvivid_taskmanager::update_backup_task_status($taskId, false, 'error', false, false, $message);
        if (isset($wpvivid_plugin->wpvivid_log)) {
            $wpvivid_plugin->wpvivid_log->WriteLog($message, 'error');
        }
        do_action('wpvivid_handle_backup_2_failed', $taskId);
        $engine->end_shutdown_function = true;
        return ['result' => 'failed', 'error' => $message];
    }
}

$listBefore = WPvivid_Backuplist::get_backuplist();
echo 'Backups before: ' . count($listBefore) . PHP_EOL;

if ($dryRun) {
    $oldestId = WPvivid_Backuplist::get_oldest_backup_id($listBefore);
    echo '[dry-run] Would delete oldest: ' . ($oldestId ?: '(none)') . PHP_EOL;
    echo '[dry-run] Would create files+db local backup using schedule settings' . PHP_EOL;
    exit(0);
}

if (!$skipDelete) {
    $deleteRet = omb_wpvivid_delete_oldest();
    if ($deleteRet['result'] !== 'success') {
        fwrite(STDERR, 'Delete oldest failed: ' . ($deleteRet['error'] ?? 'unknown') . PHP_EOL);
        exit(1);
    }
    if (isset($deleteRet['deleted'])) {
        echo 'Deleted: ' . $deleteRet['deleted'] . PHP_EOL;
    } else {
        echo ($deleteRet['message'] ?? 'No deletion needed') . PHP_EOL;
    }
}

$prepareRet = omb_wpvivid_prepare_task();
if ($prepareRet['result'] !== 'success') {
    fwrite(STDERR, 'Prepare failed: ' . ($prepareRet['error'] ?? 'unknown') . PHP_EOL);
    exit(1);
}

$taskId = $prepareRet['task_id'];
echo 'Starting backup task: ' . $taskId . PHP_EOL;

$runRet = omb_wpvivid_run_task($taskId);
if ($runRet['result'] !== 'success') {
    fwrite(STDERR, 'Backup failed: ' . ($runRet['error'] ?? 'unknown') . PHP_EOL);
    exit(1);
}

$listAfter = WPvivid_Backuplist::get_backuplist();
echo 'Backup completed: ' . $taskId . PHP_EOL;
echo 'Backups after: ' . count($listAfter) . PHP_EOL;
exit(0);
