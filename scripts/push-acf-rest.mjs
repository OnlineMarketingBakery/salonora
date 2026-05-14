import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { syncAcfImportBundle } from "./sync-acf-import-bundle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envLocal = resolve(__dirname, "../.env.local");
const envFallback = resolve(__dirname, "../.env");

function readEnvFileText(absPath) {
  const buf = readFileSync(absPath);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString("utf16le");
  }
  return buf.toString("utf8").replace(/^\uFEFF/, "");
}

function mergeEnvFromFile(absPath) {
  if (!existsSync(absPath)) return;
  let text;
  try {
    text = readEnvFileText(absPath);
  } catch {
    return;
  }
  text = text.replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    let s = line.trim();
    if (!s || s.startsWith("#")) continue;
    if (s.startsWith("export ")) s = s.slice(7).trim();
    const eq = s.indexOf("=");
    if (eq === -1) continue;
    const key = s.slice(0, eq).trim();
    let val = s.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!key) continue;
    const cur = process.env[key];
    if (cur === undefined || cur === "") process.env[key] = val;
  }
}

config({ path: envLocal, quiet: true });
config({ path: envFallback, quiet: true });
mergeEnvFromFile(envLocal);
mergeEnvFromFile(envFallback);

const JSON_PATH = resolve(__dirname, "../acf-import-bundle.json");
const WP_URL = process.env.WORDPRESS_API_URL?.trim();
const SECRET = process.env.REVALIDATION_SECRET?.trim();

const WP_BASE = WP_URL ? WP_URL.replace(/\/$/, "") : "";

if (!WP_URL || !SECRET) {
  const missing = [!WP_URL && "WORDPRESS_API_URL", !SECRET && "REVALIDATION_SECRET"].filter(Boolean);
  const hint = [
    `Missing: ${missing.join(", ")}.`,
    `Expected in ${envLocal} or ${envFallback} as:`,
    "  WORDPRESS_API_URL=https://example.com/wp-json",
    "  REVALIDATION_SECRET=your-secret",
    existsSync(envLocal)
      ? "(file exists - open it in an editor and save as UTF-8 if vars still fail)"
      : `(create ${envLocal} - see .env.example)`,
  ].join("\n");
  console.error(`[acf:push] ${hint}`);
  process.exit(1);
}

if (!WP_BASE.toLowerCase().endsWith("/wp-json")) {
  console.error(
    "[acf:push] WORDPRESS_API_URL must be the REST root ending in /wp-json with no trailing slash (e.g. https://example.com/wp-json).",
  );
  console.error(`   Got: ${WP_URL}`);
  process.exit(1);
}

syncAcfImportBundle({ quiet: true });

const body = readFileSync(JSON_PATH, "utf8");
const syncUrl = `${WP_BASE}/omb-headless/v1/acf-sync`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const maxAttempts = 4;
const pauseBeforeAttempt = [0, 4000, 10000, 20000];

let res;
let rawText = "";
let data;

attempt: for (let attempt = 0; attempt < maxAttempts; attempt++) {
  const pause = pauseBeforeAttempt[attempt] ?? 0;
  if (pause > 0) {
    console.warn(`[acf:push] Waiting ${pause / 1000}s before attempt ${attempt + 1}/${maxAttempts}...`);
    await sleep(pause);
  }

  try {
    res = await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": SECRET,
      },
      body,
    });
  } catch (err) {
    const msg = err?.cause?.message || err?.message || String(err);
    if (attempt < maxAttempts - 1) {
      console.warn(`[acf:push] Network error (${msg}). Will retry...`);
      continue attempt;
    }
    console.error(`[acf:push] Could not reach WordPress (${syncUrl}): ${msg}`);
    console.error(
      "   Set WORDPRESS_API_URL in .env.local to your real REST base, e.g. https://mysite.com/wp-json",
    );
    process.exit(1);
  }

  rawText = await res.text();

  let parsed = null;
  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    parsed = null;
  }

  const transient =
    res.status === 502 || res.status === 504 || res.status === 429;

  if (res.ok && parsed !== null) {
    data = parsed;
    break attempt;
  }

  if (transient && attempt < maxAttempts - 1) {
    console.warn(
      `[acf:push] WordPress returned ${res.status} (often a short-lived nginx/PHP issue). Retrying...`,
    );
    continue attempt;
  }

  const ct = res.headers.get("content-type") || "";
  const preview = rawText.replace(/\s+/g, " ").slice(0, 600);
  console.error("[acf:push] Push failed: expected usable JSON from WordPress, got status", res.status);
  console.error("   Content-Type:", ct || "(none)");
  if (preview) {
    console.error("   Body preview:", preview + (rawText.length > 600 ? "..." : ""));
  }
  if (res.status === 502 || res.status === 504) {
    console.error(
      "   502/504: nginx upstream timeout or PHP crash (memory_limit, max_execution_time, proxy limits).",
    );
    console.error(
      "   If this keeps happening: raise PHP/nginx limits, or import via WP Admin -> ACF -> Tools.",
    );
  }
  process.exit(1);
}

if (!res.ok) {
  console.error("[acf:push] Push failed:", data);
  if (res.status === 404 && data?.code === "rest_no_route") {
    console.error(
      "\nTip: The server does not expose POST /omb-headless/v1/acf-sync.\n" +
        "Deploy wordpress/wp-content/plugins/omb-headless-core/ and ensure the plugin is active.",
    );
  }
  process.exit(1);
}

console.log(`[acf:push] Imported ${data.imported} field group(s)`);

