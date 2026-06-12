#!/usr/bin/env node
/**
 * Deploy OMB WordPress plugins via Ploi SSH.
 *
 * Default: omb-headless-core + omb-form-builder only.
 * Optional flags (pass after --):
 *   --with-theme     also deploy omb-headless theme (includes acf-json)
 *   --with-mu-plugin also deploy salonora-headless-polylang.php mu-plugin
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

dotenv.config({ path: path.join(ROOT, ".env.local") });

const argv = process.argv.slice(2);
const withTheme = argv.includes("--with-theme");
const withMuPlugin = argv.includes("--with-mu-plugin");

const REQUIRED = ["PLOI_SSH_HOST", "PLOI_SSH_USER", "PLOI_PLUGINS_PATH"];
if (withTheme) REQUIRED.push("PLOI_THEMES_PATH");
if (withMuPlugin) REQUIRED.push("PLOI_MU_PLUGINS_PATH");

for (const key of REQUIRED) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing ${key} in .env.local`);
    process.exit(1);
  }
}

const HOST = process.env.PLOI_SSH_HOST.trim();
const USER = process.env.PLOI_SSH_USER.trim();
const PLUGINS_PATH = process.env.PLOI_PLUGINS_PATH.trim();
const THEMES_PATH = process.env.PLOI_THEMES_PATH?.trim() ?? "";
const MU_PLUGINS_PATH = process.env.PLOI_MU_PLUGINS_PATH?.trim() ?? "";
const REMOTE = `${USER}@${HOST}`;
const REMOTE_TMP = `/tmp/salonora-wp-deploy-${Date.now()}`;

function run(cmd, args, label, options = {}) {
  console.log(`\n-> ${label}`);
  const result = spawnSync(cmd, args, { stdio: "inherit", ...options });
  if (result.status !== 0) {
    console.error(`Failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

function npmRun(script, extraArgs = []) {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npmCmd, ["run", script, "--", ...extraArgs], `npm run ${script}`, {
    shell: process.platform === "win32",
  });
}

function runSsh(remoteCmd, label) {
  run("ssh", [REMOTE, remoteCmd], label);
}

function runScp(localPath, remoteDest, label) {
  run("scp", [localPath, remoteDest], label);
}

const packageFlags = [];
if (withTheme) packageFlags.push("--with-theme");
if (withMuPlugin) packageFlags.push("--with-mu-plugin");

npmRun("strip:php-bom");
npmRun("plugins:package", packageFlags);

const expected = ["omb-headless-core.zip", "omb-form-builder.zip"];
if (withTheme) expected.push("omb-headless-theme.zip");
if (withMuPlugin) expected.push("salonora-headless-polylang.php");

for (const name of expected) {
  const file = path.join(DIST, name);
  if (!fs.existsSync(file)) {
    console.error(`Missing build artifact: ${file}`);
    process.exit(1);
  }
}

runSsh(`mkdir -p ${REMOTE_TMP}`, "Create remote temp dir");

for (const name of expected) {
  runScp(path.join(DIST, name), `${REMOTE}:${REMOTE_TMP}/`, `Upload ${name}`);
}

const installSteps = [
  "set -e",
  `cd ${REMOTE_TMP}`,
  `unzip -o omb-headless-core.zip -d ${PLUGINS_PATH}`,
  `unzip -o omb-form-builder.zip -d ${PLUGINS_PATH}`,
  `rm -f ${PLUGINS_PATH}/omb-headless-core/includes/acf-sync.php`,
];

if (withTheme) {
  installSteps.push(`unzip -o omb-headless-theme.zip -d ${THEMES_PATH}`);
}

if (withMuPlugin) {
  installSteps.push(`cp -f salonora-headless-polylang.php ${MU_PLUGINS_PATH}/`);
}

const cleanup = ["omb-headless-core.zip", "omb-form-builder.zip"];
if (withTheme) cleanup.push("omb-headless-theme.zip");
if (withMuPlugin) cleanup.push("salonora-headless-polylang.php");
installSteps.push(`rm -f ${cleanup.join(" ")}`);
installSteps.push(`rmdir ${REMOTE_TMP} 2>/dev/null || rm -rf ${REMOTE_TMP}`);

runSsh(installSteps.join(" && "), "Install on server");

console.log("\nDeploy complete.");
if (withTheme) {
  console.log("If ACF field groups changed, sync them in WP Admin -> Custom Fields -> Sync available.");
}
