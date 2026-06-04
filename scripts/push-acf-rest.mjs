import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { syncAcfImportBundle } from "./sync-acf-import-bundle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envLocal = resolve(__dirname, "../.env.local");
const envFallback = resolve(__dirname, "../.env");

/** Full acf_import_field_group tolerates ~23 layouts (~97 KB) on production. */
const MAX_IMPORT_BYTES = 95_000;
const REQUEST_TIMEOUT_MS = 180_000;
const CHUNK_FLEXIBLE_FIELD_NAMES = new Set(["page_sections", "page_footer_sections"]);
const HEAVY_GROUP_KEYS = new Set(["group_omb_page_builder"]);

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlyKey = onlyArg ? onlyArg.slice("--only=".length).trim() : "";
const fromChunkArg = process.argv.find((a) => a.startsWith("--from-chunk="));
const fromChunk = fromChunkArg ? Math.max(1, parseInt(fromChunkArg.slice("--from-chunk=".length), 10) || 1) : 1;
const forceBulk = process.argv.includes("--bulk");

function readEnvFileText(absPath) {
  const buf = readFileSync(absPath);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.slice(2).toString("utf16le");
  }
  return buf.toString("utf8").replace(/^\uFEFF/, "");
}

function mergeEnvFromFile(absPath, { override = false } = {}) {
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
    if (override || cur === undefined || cur === "") process.env[key] = val;
  }
}

config({ path: envFallback, quiet: true });
config({ path: envLocal, override: true, quiet: true });
mergeEnvFromFile(envFallback);
mergeEnvFromFile(envLocal, { override: true });

const JSON_PATH = resolve(__dirname, "../acf-import-bundle.json");
const WP_URL = process.env.WORDPRESS_API_URL?.trim();
const SECRET = process.env.REVALIDATION_SECRET?.trim();
const WP_BASE = WP_URL ? WP_URL.replace(/\/$/, "") : "";

if (!WP_URL || !SECRET) {
  const missing = [!WP_URL && "WORDPRESS_API_URL", !SECRET && "REVALIDATION_SECRET"].filter(Boolean);
  console.error(`[acf:push] Missing: ${missing.join(", ")}. See .env.example`);
  process.exit(1);
}

if (!WP_BASE.toLowerCase().endsWith("/wp-json")) {
  console.error("[acf:push] WORDPRESS_API_URL must end with /wp-json (no trailing slash).");
  process.exit(1);
}

syncAcfImportBundle({ quiet: true });

function dedupeAcfBundleByKey(groups) {
  const byKey = new Map();
  for (const group of groups) {
    if (group?.key) byKey.set(group.key, group);
  }
  return [...byKey.values()];
}

const bundle = JSON.parse(readFileSync(JSON_PATH, "utf8"));
if (!Array.isArray(bundle)) {
  console.error("[acf:push] Expected acf-import-bundle.json to be a JSON array.");
  process.exit(1);
}

const dedupedAll = dedupeAcfBundleByKey(bundle);
const deduped = onlyKey
  ? dedupedAll.filter((g) => g?.key === onlyKey)
  : dedupedAll;

if (onlyKey && deduped.length === 0) {
  console.error(`[acf:push] No field group with key "${onlyKey}" in acf-import-bundle.json.`);
  process.exit(1);
}

const syncUrl = `${WP_BASE}/omb-headless/v1/acf-sync`;
const headers = { "Content-Type": "application/json", "X-Sync-Secret": SECRET };

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function payloadBytes(data) {
  return JSON.stringify(data).length;
}

function cloneGroup(group) {
  return JSON.parse(JSON.stringify(group));
}

function groupNeedsChunking(group) {
  const key = group?.key ?? "";
  if (HEAVY_GROUP_KEYS.has(key)) return true;
  return payloadBytes([group]) > MAX_IMPORT_BYTES;
}

function getLayoutPools(group) {
  const flexFields = (group.fields ?? []).filter(
    (f) =>
      f?.type === "flexible_content" &&
      CHUNK_FLEXIBLE_FIELD_NAMES.has(f.name) &&
      f.layouts &&
      typeof f.layouts === "object"
  );
  return flexFields.map((f) => ({
    name: f.name,
    fieldKey: f.key,
    entries: Object.entries(f.layouts),
  }));
}

function buildGroupWithLayoutCount(group, layoutPools, primaryName, count) {
  const g = cloneGroup(group);
  for (const pool of layoutPools) {
    const subset = pool.entries.slice(0, pool.name === primaryName ? count : pool.entries.length);
    for (const field of g.fields ?? []) {
      if (field?.name === pool.name && field?.type === "flexible_content") {
        field.layouts = Object.fromEntries(subset);
      }
    }
  }
  return g;
}

/**
 * Replace imports up to ~23 layouts, then append one layout at a time (no full re-import).
 */
function chunkPageBuilder(group) {
  const steps = [];
  const layoutPools = getLayoutPools(group);
  if (layoutPools.length === 0) {
    return [{ mode: "replace", groups: [group], note: "full group" }];
  }

  const primary = layoutPools.find((p) => p.name === "page_sections") ?? layoutPools[0];
  const total = primary.entries.length;
  const pageSectionsField = (group.fields ?? []).find((f) => f.name === primary.name);
  const fieldKey = pageSectionsField?.key ?? "";

  let offset = 0;

  while (offset < total) {
    let best = offset;
    for (let tryCount = offset + 1; tryCount <= total; tryCount++) {
      const trial = buildGroupWithLayoutCount(group, layoutPools, primary.name, tryCount);
      if (payloadBytes([trial]) <= MAX_IMPORT_BYTES) {
        best = tryCount;
      } else {
        break;
      }
    }
    if (best === offset) {
      break;
    }
    const g = buildGroupWithLayoutCount(group, layoutPools, primary.name, best);
    steps.push({
      mode: "replace",
      groups: [g],
      note: `replace layouts 1-${best}/${total}`,
    });
    offset = best;
    if (best >= total) {
      return steps;
    }
  }

  while (offset < total) {
    const [layoutKey, layoutDef] = primary.entries[offset];
    steps.push({
      mode: "append",
      append: [
        {
          field_key: fieldKey,
          layouts: { [layoutKey]: layoutDef },
        },
      ],
      note: `append ${layoutDef?.name ?? layoutKey} (${offset + 1}/${total})`,
    });
    offset += 1;
  }

  return steps;
}

function chunkFieldGroup(group) {
  if (group?.key === "group_omb_page_builder") {
    return chunkPageBuilder(group);
  }
  if (payloadBytes([group]) <= MAX_IMPORT_BYTES) {
    return [{ mode: "replace", groups: [group], note: "full group" }];
  }
  console.warn(`[acf:push] ${group.key} exceeds import limit.`);
  return [{ mode: "replace", groups: [group], note: "full group (may 502)" }];
}

async function checkPageBuilderSyncSupport() {
  try {
    const res = await fetch(`${WP_BASE}/omb-headless/v1/acf-sync-status`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { append: false };
    const data = await res.json();
    return { append: data?.append_supported === true };
  } catch {
    return { append: false };
  }
}

async function postStep(step, { label, maxAttempts = 5 }) {
  const isAppend = step.mode === "append";
  const body = isAppend ? JSON.stringify({ append: step.append }) : JSON.stringify(step.groups);
  const reqHeaders = { ...headers };
  if (isAppend) reqHeaders["X-Acf-Append-Layouts"] = "1";

  const pauseBeforeAttempt = [0, 3000, 8000, 15000, 25000];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pause = pauseBeforeAttempt[attempt] ?? 0;
    if (pause > 0) {
      console.warn(`[acf:push] Waiting ${pause / 1000}s before retry (${label})...`);
      await sleep(pause);
    }

    let res;
    let rawText = "";
    try {
      res = await fetch(syncUrl, {
        method: "POST",
        headers: reqHeaders,
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      rawText = await res.text();
    } catch (err) {
      const msg = err?.cause?.message || err?.message || String(err);
      if (attempt < maxAttempts - 1) {
        console.warn(`[acf:push] ${label}: ${msg}. Retrying...`);
        continue;
      }
      console.error(`[acf:push] Could not reach WordPress (${label}): ${msg}`);
      process.exit(1);
    }

    let parsed = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
      parsed = null;
    }

    const transient = res.status === 502 || res.status === 504 || res.status === 429;
    if (res.ok && parsed !== null) {
      if (isAppend && parsed.mode !== "append") {
        console.error(
          "[acf:push] Server missing append support. Deploy latest wordpress/.../includes/acf-sync.php, then retry."
        );
        process.exit(1);
      }
      return { failed: false };
    }
    if (transient && attempt < maxAttempts - 1) {
      console.warn(`[acf:push] ${label}: HTTP ${res.status}. Retrying...`);
      continue;
    }
    console.error(`[acf:push] ${label} failed: HTTP ${res.status}`);
    const preview = rawText.replace(/\s+/g, " ").slice(0, 600);
    if (preview) console.error("   Body preview:", preview);
    return { failed: true };
  }
  return { failed: true };
}

async function postAcfSync(groups, opts) {
  return postStep({ mode: "replace", groups }, opts);
}

async function pushGroup(group) {
  const key = group?.key ?? "(unknown)";

  if (!groupNeedsChunking(group)) {
    const kb = (payloadBytes([group]) / 1024).toFixed(0);
    console.log(`[acf:push] ${key} (~${kb} KB)`);
    const { failed } = await postAcfSync([group], { label: key });
    if (failed) process.exit(1);
    return;
  }

  const steps = chunkFieldGroup(group);
  const needsAppend = steps.some((s) => s.mode === "append");

  if (needsAppend) {
    const { append } = await checkPageBuilderSyncSupport();
    if (!append) {
      console.error(
        "[acf:push] Layout append requires updated acf-sync.php on WordPress (omb_rest_acf_append_layouts_to_field). Deploy the plugin, then retry."
      );
      process.exit(1);
    }
  }

  console.log(`[acf:push] ${key} - ${steps.length} step(s)`);
  const startIdx = Math.max(0, fromChunk - 1);
  if (fromChunk > 1) {
    console.log(`[acf:push] Resuming from step ${fromChunk}/${steps.length}`);
  }

  for (let i = startIdx; i < steps.length; i++) {
    const step = steps[i];
    const kb = (
      step.mode === "append" ? payloadBytes({ append: step.append }) : payloadBytes(step.groups)
    / 1024
    ).toFixed(0);
    const label = `${key} step ${i + 1}/${steps.length} (${step.note})`;
    console.log(`[acf:push]   ${label} (~${kb} KB)`);
    const { failed } = await postStep(step, { label });
    if (failed) {
      console.error(
        `[acf:push] Stopped at step ${i + 1}. Resume: npm run acf:push -- --only=${key} --from-chunk=${i + 1}`
      );
      process.exit(1);
    }
    await sleep(step.mode === "append" ? 1200 : 800);
  }
}

async function pushAll() {
  const totalKb = (payloadBytes(deduped) / 1024).toFixed(0);
  console.log(`[acf:push] ${deduped.length} field group(s), ~${totalKb} KB in bundle.`);

  if (forceBulk) {
    const { failed } = await postAcfSync(deduped, { label: "bulk" });
    if (!failed) {
      console.log(`[acf:push] Bulk sync OK.`);
      return;
    }
    console.warn("[acf:push] Bulk failed - using stepped sync.");
  }

  for (const group of deduped) {
    await pushGroup(group);
  }

  console.log(`[acf:push] Done. Synced ${deduped.length} field group(s).`);
}

await pushAll();
