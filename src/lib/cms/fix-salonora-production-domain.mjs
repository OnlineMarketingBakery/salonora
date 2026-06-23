#!/usr/bin/env node
/**
 * Fix salonora.eu production after staging domain cutover.
 * - Upload + run SSL script (requires sudo on server)
 * - Update NEXT_PUBLIC_SITE_URL, rebuild, restart PM2
 *
 * Usage:
 *   node src/lib/cms/fix-salonora-production-domain.mjs
 *   node src/lib/cms/fix-salonora-production-domain.mjs --skip-ssl
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const HOST = process.env.PLOI_SSH_HOST?.trim();
const USER = process.env.PLOI_SSH_USER?.trim();
const skipSsl = process.argv.includes("--skip-ssl");
const SITE_DIR = "/home/ploi/salonora.eu";

if (!HOST || !USER) {
  console.error("Missing PLOI_SSH_HOST or PLOI_SSH_USER in .env.local");
  process.exit(1);
}

const REMOTE = `${USER}@${HOST}`;

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function ssh(cmd, { tty = false } = {}) {
  const args = tty ? ["-t", REMOTE, cmd] : [REMOTE, cmd];
  const result = spawnSync("ssh", args, { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
}

function uploadSslScript() {
  const here = dirname(fileURLToPath(import.meta.url));
  const sh = readFileSync(join(here, "fix-salonora-ssl.sh"), "utf8");
  const b64 = Buffer.from(sh, "utf8").toString("base64");
  const remote = "/tmp/omb-fix-salonora-ssl.sh";
  const cmd = `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(remote)} && chmod +x ${shellQuote(remote)} && echo uploaded:${remote}`;
  return ssh(cmd);
}

function runSslScript() {
  console.log("\n==> SSL: requesting Let's Encrypt cert (sudo required)…");
  const result = ssh(`sudo bash /tmp/omb-fix-salonora-ssl.sh`, { tty: true });
  return result.status ?? 1;
}

function updateEnvAndDeploy() {
  console.log("\n==> Update production .env …");
  const envPatch = [
    `cd ${shellQuote(SITE_DIR)}`,
    `if grep -q '^NEXT_PUBLIC_SITE_URL=' .env; then sed -i 's|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://salonora.eu|' .env; else echo 'NEXT_PUBLIC_SITE_URL=https://salonora.eu' >> .env; fi`,
    `grep '^NEXT_PUBLIC_SITE_URL=' .env`,
    `export NODE_ENV=production`,
    `npm ci`,
    `npm run build`,
    `pm2 restart salonora-eu`,
    `pm2 delete staging-salonora-eu 2>/dev/null || true`,
    `pm2 save`,
    `pm2 list`,
  ].join(" && ");
  return ssh(envPatch);
}

function verify() {
  console.log("\n==> Verify HTTPS …");
  return ssh(
    `curl -sIk --max-time 15 https://salonora.eu/ | head -5; echo '---'; curl -sIk --max-time 15 https://salonora.eu/en | head -5; curl -s https://salonora.eu/ | grep -o 'staging.salonora.eu' | head -3 || echo 'no staging refs in html'`,
  );
}

const up = uploadSslScript();
if ((up.status ?? 1) !== 0) process.exit(up.status ?? 1);

let sslOk = true;
if (!skipSsl) {
  const sslStatus = runSslScript();
  sslOk = sslStatus === 0;
  if (!sslOk) {
    console.error(
      "\nSSL step failed (sudo password required). Run on the server:\n  sudo bash /tmp/omb-fix-salonora-ssl.sh\nOr use Ploi → salonora.eu → SSL → Let's Encrypt → Save.\n",
    );
  }
}

const deploy = updateEnvAndDeploy();
if ((deploy.status ?? 1) !== 0) process.exit(deploy.status ?? 1);

verify();
process.exit(sslOk ? 0 : 2);
