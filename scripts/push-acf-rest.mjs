/**
 * Safe ACF sync: merge-only layout pushes, never partial replace imports.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { config } from "dotenv";
import { syncAcfImportBundle } from "./sync-acf-import-bundle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env"), quiet: true });
config({ path: resolve(__dirname, "../.env.local"), override: true, quiet: true });

const JSON_PATH = resolve(__dirname, "../acf-import-bundle.json");
const WP_URL = process.env.WORDPRESS_API_URL?.trim();
const SECRET = process.env.REVALIDATION_SECRET?.trim();
const WP_BASE = WP_URL ? WP_URL.replace(/\/$/, "") : "";

const dryRun = process.argv.includes("--dry-run");
const withGroups = process.argv.includes("--with-groups");
const onlyLayoutArg = process.argv.find((a) => a.startsWith("--only="));
const onlyLayoutName = onlyLayoutArg ? onlyLayoutArg.slice("--only=".length).trim() : "";

const REQUEST_TIMEOUT_MS = 120_000;
const PAGE_BUILDER_KEY = "group_omb_page_builder";
const PAGE_SECTIONS_FIELD_KEY = "field_omb_page_sections";

if (!WP_URL || !SECRET) {
  console.error("[acf:push] Missing WORDPRESS_API_URL or REVALIDATION_SECRET.");
  process.exit(1);
}

if (!WP_BASE.toLowerCase().endsWith("/wp-json")) {
  console.error("[acf:push] WORDPRESS_API_URL must end with /wp-json");
  process.exit(1);
}

syncAcfImportBundle({ quiet: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

function layoutHash(layout) {
  return createHash("sha256").update(stableStringify(layout)).digest("hex");
}

function dedupeBundle(groups) {
  const byKey = new Map();
  for (const g of groups) if (g?.key) byKey.set(g.key, g);
  return [...byKey.values()];
}

async function fetchStatus() {
  const res = await fetch(`${WP_BASE}/omb-headless/v1/acf-sync-status`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`acf-sync-status HTTP ${res.status}`);
  return res.json();
}

function planPageSectionLayouts(pageSectionsField, beforeStatus) {
  const localLayouts = pageSectionsField.layouts ?? {};
  const serverEntries = beforeStatus?.page_sections_layout_entries ?? [];
  const serverByKey = new Map(serverEntries.map((e) => [e.layout_key, e]));
  const plan = [];

  for (const [layoutKey, layout] of Object.entries(localLayouts)) {
    const name = layout?.name ?? layoutKey;
    if (onlyLayoutName && name !== onlyLayoutName) continue;
    const server = serverByKey.get(layoutKey);
    const hash = layoutHash(layout);
    if (!server) plan.push({ action: "add", layoutKey, name, layout });
    else if (process.argv.includes("--force") && server.hash !== hash) plan.push({ action: "update", layoutKey, name, layout });
    else plan.push({ action: "skip", layoutKey, name });
  }

  const localNames = new Set(Object.values(localLayouts).map((l) => l?.name));
  for (const entry of serverEntries) {
    if (!localNames.has(entry.name)) {
      plan.push({ action: "server-only", layoutKey: entry.layout_key, name: entry.name });
    }
  }
  return plan;
}

function logPlan(plan) {
  const counts = { add: 0, update: 0, skip: 0, "server-only": 0 };
  for (const item of plan) counts[item.action] = (counts[item.action] ?? 0) + 1;
  console.log(
    `[acf:push] Plan: add=${counts.add} update=${counts.update} skip=${counts.skip} server-only=${counts["server-only"]}`
  );
  for (const item of plan) {
    if (item.action !== "skip") console.log(`  ${item.action}: ${item.name}`);
  }
}

async function postLayoutMerge(items, label) {
  const res = await fetch(`${WP_BASE}/omb-headless/v1/acf-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Sync-Secret": SECRET },
    body: JSON.stringify({ merge_layouts: items }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  if (!res.ok || !parsed?.success) {
    console.error(`[acf:push] ${label} failed HTTP ${res.status}`, text.slice(0, 300));
    return false;
  }
  return true;
}

async function postFieldGroupMerge(group, label) {
  const res = await fetch(`${WP_BASE}/omb-headless/v1/acf-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sync-Secret": SECRET,
      "X-Acf-Merge-Layouts": "1",
      "X-Acf-Merge-Field-Group": "1",
    },
    body: JSON.stringify([group]),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  if (!res.ok || !parsed?.success) {
    console.error(`[acf:push] ${label} failed HTTP ${res.status}`, text.slice(0, 300));
    return false;
  }
  return true;
}

async function main() {
  const bundle = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  const groups = dedupeBundle(bundle);
  const pageBuilder = groups.find((g) => g.key === PAGE_BUILDER_KEY);
  if (!pageBuilder) {
    console.error("[acf:push] group_omb_page_builder missing.");
    process.exit(1);
  }

  const beforeStatus = await fetchStatus();
  console.log(
    `[acf:push] Server: ${beforeStatus.page_sections_layout_count} layouts, ${beforeStatus.field_group_duplicate_posts ?? 0} dupes`
  );

  const dupCount = Number(beforeStatus?.field_group_duplicate_posts ?? 0);
  if (dupCount > 0) {
    console.warn(`[acf:push] WARNING: ${dupCount} duplicate field groups. Run: npm run acf:cleanup-duplicates`);
  }

  const pageSectionsField = pageBuilder.fields?.find((f) => f.name === "page_sections");
  const plan = planPageSectionLayouts(pageSectionsField, beforeStatus);
  logPlan(plan);

  const pushItems = plan.filter((p) => p.action === "add" || p.action === "update");
  if (onlyLayoutName && pushItems.length === 0) {
    const names = Object.values(pageSectionsField.layouts ?? {}).map((l) => l?.name);
    if (!names.includes(onlyLayoutName)) {
      console.error(`[acf:push] Layout "${onlyLayoutName}" not in bundle.`);
      process.exit(1);
    }
    console.log(`[acf:push] "${onlyLayoutName}" already synced.`);
  } else if (pushItems.length === 0) {
    console.log("[acf:push] All layouts in sync.");
  } else if (dryRun) {
    console.log(`[acf:push] Dry run — would push ${pushItems.length} layout(s).`);
  } else {
    if (beforeStatus?.layout_merge_supported !== true) {
      console.error("[acf:push] Deploy latest acf-sync.php (layout_merge_supported).");
      process.exit(1);
    }
    const serverCount = Number(beforeStatus.page_sections_layout_count ?? 0);
    const localCount = Object.keys(pageSectionsField.layouts ?? {}).length;
    if (!process.argv.includes("--force") && serverCount > localCount) {
      console.error(`[acf:push] Refusing: server ${serverCount} > bundle ${localCount}. Use --force.`);
      process.exit(1);
    }
    for (let i = 0; i < pushItems.length; i++) {
      const item = pushItems[i];
      const ok = await postLayoutMerge(
        [{ field_key: PAGE_SECTIONS_FIELD_KEY, layouts: { [item.layoutKey]: item.layout } }],
        `${item.name} (${i + 1}/${pushItems.length})`
      );
      if (!ok) process.exit(1);
      await sleep(800);
    }
    console.log(`[acf:push] Pushed ${pushItems.length} layout(s).`);
  }

  if (withGroups && !dryRun) {
    for (const group of groups.filter((g) => g.key !== PAGE_BUILDER_KEY)) {
      console.log(`[acf:push] Syncing ${group.key}`);
      if (!(await postFieldGroupMerge(group, group.key))) process.exit(1);
      await sleep(1000);
    }
  }

  if (!dryRun) {
    const after = await fetchStatus();
    console.log(`[acf:push] Done. Server layouts: ${after.page_sections_layout_count}`);
  }
}

await main();
