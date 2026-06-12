#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const WP = path.join(ROOT, "wordpress/wp-content");

const argv = process.argv.slice(2);
const withTheme = argv.includes("--with-theme");
const withMuPlugin = argv.includes("--with-mu-plugin");

const PLUGIN_ARTIFACTS = [
  {
    zipName: "omb-headless-core.zip",
    sourceDir: path.join(WP, "plugins/omb-headless-core"),
    archiveRoot: "omb-headless-core",
    cwd: path.join(WP, "plugins"),
  },
  {
    zipName: "omb-form-builder.zip",
    sourceDir: path.join(WP, "plugins/omb-form-builder"),
    archiveRoot: "omb-form-builder",
    cwd: path.join(WP, "plugins"),
  },
];

const THEME_ARTIFACT = {
  zipName: "omb-headless-theme.zip",
  sourceDir: path.join(WP, "themes/omb-headless"),
  archiveRoot: "omb-headless",
  cwd: path.join(WP, "themes"),
};

const MU_PLUGIN_SRC = path.join(WP, "mu-plugins/salonora-headless-polylang.php");
const MU_PLUGIN_DIST = path.join(DIST, "salonora-headless-polylang.php");

function zipDirectory({ zipName, sourceDir, archiveRoot, cwd }) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Missing source: ${sourceDir}`);
    process.exit(1);
  }
  const zipPath = path.join(DIST, zipName);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  const tar = spawnSync("tar", ["-a", "-c", "-f", zipPath, "-C", cwd, archiveRoot], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (tar.status !== 0) {
    console.error(`Failed to create ${zipName}`);
    process.exit(tar.status ?? 1);
  }
  console.log(`Created ${path.relative(ROOT, zipPath)}`);
}

fs.mkdirSync(DIST, { recursive: true });

for (const artifact of PLUGIN_ARTIFACTS) {
  zipDirectory(artifact);
}

if (withTheme) {
  zipDirectory(THEME_ARTIFACT);
}

if (withMuPlugin) {
  if (!fs.existsSync(MU_PLUGIN_SRC)) {
    console.error(`Missing mu-plugin: ${MU_PLUGIN_SRC}`);
    process.exit(1);
  }
  fs.copyFileSync(MU_PLUGIN_SRC, MU_PLUGIN_DIST);
  console.log(`Copied ${path.relative(ROOT, MU_PLUGIN_DIST)}`);
}

const parts = ["omb-headless-core.zip", "omb-form-builder.zip"];
if (withTheme) parts.push("omb-headless-theme.zip");
if (withMuPlugin) parts.push("salonora-headless-polylang.php");
console.log(`Package complete (${parts.join(", ")}).`);
