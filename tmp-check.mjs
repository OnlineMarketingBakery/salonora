import fs from "node:fs";
const php = fs.readFileSync("C:/Users/USER/OneDrive/Desktop/OMB/salonora/scripts/omb-wpvivid-backup.php", "utf8");
const hasFlush = php.includes("$wpvivid_plugin->flush($taskId)");
console.log("hasFlush", hasFlush, "len", php.length);
