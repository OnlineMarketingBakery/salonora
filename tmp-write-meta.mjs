const fs = require("fs");
const php = `<?php
define('WP_USE_THEMES', false);
require '/home/ploi/backend.salonora.eu/public/wp-load.php';
$list = get_option('wpvivid_backup_list', []);
foreach (['wpvivid-1c8d7806cadfd', 'wpvivid-505f590f33e0d'] as $id) {
  if (!isset($list[$id])) { echo "missing $id\\n"; continue; }
  $b = $list[$id];
  echo "=== $id type=" . ($b['type'] ?? '?') . " ===\\n";
  echo 'get_size: ' . round(WPvivid_Backuplist::get_size($id) / 1024 / 1024, 2) . " MB\\n";
  if (!empty($b['backup']['files'])) {
    foreach ($b['backup']['files'] as $f) {
      $mb = round(($f['size'] ?? 0) / 1024 / 1024, 2);
      echo '  ' . ($f['file_name'] ?? '?') . " => {$mb} MB\\n";
    }
  }
}
`;
fs.writeFileSync('C:/Users/USER/OneDrive/Desktop/OMB/salonora/tmp-read-backup-meta.php', php);
