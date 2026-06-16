#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(ROOT, ".env.local") });

const REQUIRED = ["PLOI_SSH_HOST", "PLOI_SSH_USER", "PLOI_PLUGINS_PATH"];
for (const key of REQUIRED) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key}`);
    process.exit(1);
  }
}

const HOST = process.env.PLOI_SSH_HOST.trim();
const USER = process.env.PLOI_SSH_USER.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH.trim();
const WP_ROOT = process.env.PLOI_WP_ROOT?.trim() || path.posix.dirname(path.posix.dirname(PLUGINS_PATH));
const REMOTE = `${USER}@${HOST}`;
const stamp = Date.now();
const REMOTE_DIR = `/tmp/omb-figma-cs-${stamp}`;
const files = {
  uploadPhp: path.join(ROOT, "scripts", "omb-upload-case-study-media.php"),
  updatePhp: path.join(ROOT, "scripts", "update-case-study-from-figma.php"),
  figmaDir: path.join(ROOT, "scripts", "data", "figma-voetzorg"),
  nlJson: path.join(ROOT, "scripts", "data", "case-study-voetzorg-nl.json"),
  enJson: path.join(ROOT, "scripts", "data", "case-study-voetzorg-en.json"),
};
for (const f of Object.values(files)) {
  if (!fs.existsSync(f)) {
    console.error(`Missing ${f}`);
    process.exit(1);
  }
}

function run(cmd, args, label) {
  console.log(`\n-> ${label}`);
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("ssh", [REMOTE, `mkdir -p '${REMOTE_DIR}/figma-voetzorg'`], "Create remote temp dir");
run("scp", [files.uploadPhp, `${REMOTE}:${REMOTE_DIR}/upload.php`], "Upload media PHP");
run("scp", [files.updatePhp, `${REMOTE}:${REMOTE_DIR}/update.php`], "Upload update PHP");
run("scp", [files.nlJson, `${REMOTE}:${REMOTE_DIR}/nl.json`], "Upload NL JSON");
run("scp", [files.enJson, `${REMOTE}:${REMOTE_DIR}/en.json`], "Upload EN JSON");
for (const png of fs.readdirSync(files.figmaDir).filter((f) => f.endsWith(".png"))) {
  run("scp", [path.join(files.figmaDir, png), `${REMOTE}:${REMOTE_DIR}/figma-voetzorg/${png}`], `Upload ${png}`);
}

const remoteCmd = [
  `OMB_WP_ROOT='${WP_ROOT.replace(/'/g, "'\\''")}' php '${REMOTE_DIR}/upload.php' '${REMOTE_DIR}/figma-voetzorg' > '${REMOTE_DIR}/media.json'`,
  `OMB_WP_ROOT='${WP_ROOT.replace(/'/g, "'\\''")}' php '${REMOTE_DIR}/update.php' '${REMOTE_DIR}/media.json' '${REMOTE_DIR}/nl.json' '${REMOTE_DIR}/en.json'`,
  `rm -rf '${REMOTE_DIR}'`,
].join(" && ");

run("ssh", [REMOTE, remoteCmd], "Upload media + update both case studies");
console.log("\nFigma case study sync finished.");
