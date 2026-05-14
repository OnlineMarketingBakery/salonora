#!/usr/bin/env node
// Validates that all 4 section pipeline layers are in sync:
// types (AnySectionT), normalizer (PAGE_SECTION_ACF_LAYOUTS), registry (sectionRegistry), renderer (SectionRenderer switch)
// Also checks that every registry key has a corresponding folder in src/components/sections/

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

// ── 1. Types: extract type literals from AnySectionT union ──────────────────
function extractTypesFromSectionsTs() {
  const src = read("src/types/sections.ts");
  // Match lines like: | HeroSectionT  and then find the type: "hero" inside each type def
  // Simpler: match all `type: "snake_case"` occurrences in the union members
  // The union is defined as AnySectionT = T1 | T2 | ...
  // Each TN has `type: "key"` in its definition — extract all unique snake_case values
  const matches = [...src.matchAll(/\btype:\s*"([a-z][a-z0-9_]*)"/g)];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

// ── 2. Normalizer: extract PAGE_SECTION_ACF_LAYOUTS keys ─────────────────────
function extractNormalizerKeys() {
  const src = read("src/lib/acf/normalize-page-sections.ts");
  // Match object keys inside PAGE_SECTION_ACF_LAYOUTS { key: true, ... }
  const blockMatch = src.match(/PAGE_SECTION_ACF_LAYOUTS\s*=\s*\{([^}]+)\}/s);
  if (!blockMatch) throw new Error("Could not find PAGE_SECTION_ACF_LAYOUTS block");
  const block = blockMatch[1];
  const matches = [...block.matchAll(/^\s+([a-z][a-z0-9_]*):/gm)];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

// ── 3. Registry: extract sectionRegistry keys ────────────────────────────────
function extractRegistryKeys() {
  const src = read("src/lib/acf/section-registry.ts");
  // Match lines like: `  hero: asSection(` or `  case_study_chapter: asSection(`
  const blockMatch = src.match(/export const sectionRegistry\s*=\s*\{([\s\S]+?)\}\s*satisfies/);
  if (!blockMatch) throw new Error("Could not find sectionRegistry block");
  const block = blockMatch[1];
  const matches = [...block.matchAll(/^\s+([a-z][a-z0-9_]*):\s*asSection\(/gm)];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

// ── 4. Renderer: extract switch case values ───────────────────────────────────
function extractRendererCases() {
  const src = read("src/components/sections/SectionRenderer.tsx");
  const matches = [...src.matchAll(/case\s+"([a-z][a-z0-9_]*)"\s*:/g)];
  return [...new Set(matches.map((m) => m[1]))].sort();
}

// ── 5. Folders: list kebab-case folders under src/components/sections/ ────────
function listSectionFolders() {
  const sectionsDir = join(ROOT, "src/components/sections");
  return readdirSync(sectionsDir).filter((name) => {
    try {
      return statSync(join(sectionsDir, name)).isDirectory();
    } catch {
      return false;
    }
  });
}

function snakeToKebab(key) {
  return key.replace(/_/g, "-");
}

// ── Compare & report ──────────────────────────────────────────────────────────
const types = extractTypesFromSectionsTs();
const normalizer = extractNormalizerKeys();
const registry = extractRegistryKeys();
const renderer = extractRendererCases();
const folders = listSectionFolders();

// Keys that share a folder instead of having their own dedicated folder.
// These are intentional exceptions — add new ones here when a section lives inside a shared folder.
const SHARED_FOLDERS = {
  case_study_chapter: "case-study-body",
  case_study_product_shot: "case-study-body",
  case_study_client_review: "case-study-body",
  case_study_conversion_cta: "case-study-body",
};

const allKeys = [...new Set([...types, ...normalizer, ...registry, ...renderer])].sort();

let pass = true;
const issues = [];

// Keys covered by a known exception (shared folder)
const exceptionCovered = [];
// Keys that have no folder and are not in SHARED_FOLDERS
const missingFolderKeys = [];

// Check folder coverage for every key across all layers
for (const key of allKeys) {
  if (key in SHARED_FOLDERS) {
    const sharedFolder = SHARED_FOLDERS[key];
    if (!folders.includes(sharedFolder)) {
      pass = false;
      issues.push(
        `  NO SHARED FOLDER for exception key "${key}" (expected: src/components/sections/${sharedFolder}/)`
      );
    } else {
      exceptionCovered.push({ key, folder: sharedFolder });
    }
  } else {
    const expectedFolder = snakeToKebab(key);
    if (!folders.includes(expectedFolder)) {
      pass = false;
      missingFolderKeys.push(key);
      issues.push(
        `  NO FOLDER for key "${key}" (expected: src/components/sections/${expectedFolder}/)`
      );
    }
  }
}

// Unique shared folders used (for the count annotation)
const sharedFolderCount = new Set(Object.values(SHARED_FOLDERS)).size;
const effectiveFoldersNeeded = allKeys.length - exceptionCovered.length + sharedFolderCount;

console.log("=== Section Pipeline Validation ===\n");

// Check cross-layer consistency
for (const key of allKeys) {
  const inTypes = types.includes(key);
  const inNormalizer = normalizer.includes(key);
  const inRegistry = registry.includes(key);
  const inRenderer = renderer.includes(key);

  if (!inTypes || !inNormalizer || !inRegistry || !inRenderer) {
    pass = false;
    const missing = [];
    if (!inTypes) missing.push("types");
    if (!inNormalizer) missing.push("normalizer");
    if (!inRegistry) missing.push("registry");
    if (!inRenderer) missing.push("renderer");
    issues.push(`  MISSING from [${missing.join(", ")}]: ${key}`);
  }
}

console.log(`Types (AnySectionT):          ${types.length} keys`);
console.log(`Normalizer (PAGE_SECTION_*):  ${normalizer.length} keys`);
console.log(`Registry (sectionRegistry):   ${registry.length} keys`);
console.log(`Renderer (switch cases):      ${renderer.length} keys`);
console.log(
  `Component folders:            ${folders.length} folders` +
    ` (${allKeys.length} keys − ${exceptionCovered.length} exceptions + ${sharedFolderCount} shared = ${effectiveFoldersNeeded} expected)`
);
console.log();

if (missingFolderKeys.length > 0) {
  console.log("Keys missing a dedicated component folder:");
  missingFolderKeys.forEach((k) =>
    console.log(`  ✗ ${k}  →  src/components/sections/${snakeToKebab(k)}/`)
  );
  console.log();
}

if (exceptionCovered.length > 0) {
  // Group by shared folder for readability
  const byFolder = {};
  for (const { key, folder } of exceptionCovered) {
    (byFolder[folder] ??= []).push(key);
  }
  console.log("Known exceptions (shared folder — intentional, not missing):");
  for (const [folder, keys] of Object.entries(byFolder)) {
    console.log(`  src/components/sections/${folder}/`);
    keys.forEach((k) => console.log(`    • ${k}`));
  }
  console.log();
}

// ACF bulk-import JSON: repo root (canonical) must match theme mirror (see scripts/sync-acf-import-bundle.mjs)
const acfCanon = join(ROOT, "acf-import-bundle.json");
const acfTheme = join(ROOT, "wordpress/wp-content/themes/omb-headless/acf-import-bundle.json");
function acfBundleNormalized(absPath) {
  return JSON.stringify(JSON.parse(readFileSync(absPath, "utf8")));
}
if (existsSync(acfCanon) && existsSync(acfTheme)) {
  try {
    if (acfBundleNormalized(acfCanon) !== acfBundleNormalized(acfTheme)) {
      pass = false;
      issues.push(
        "  ACF bundle drift: root acf-import-bundle.json differs from wordpress/wp-content/themes/omb-headless/acf-import-bundle.json. Run: npm run acf:sync-bundle",
      );
    }
  } catch (e) {
    pass = false;
    issues.push(`  ACF bundle JSON compare failed: ${e?.message || e}`);
  }
} else if (existsSync(acfCanon) && !existsSync(acfTheme)) {
  pass = false;
  issues.push(
    "  Missing theme mirror acf-import-bundle.json. Run: npm run acf:sync-bundle",
  );
}

if (issues.length > 0) {
  console.log("ISSUES FOUND:");
  issues.forEach((msg) => console.log(msg));
  console.log();
}

if (pass) {
  console.log(
    `✓ PASS — all ${allKeys.length} keys consistent across 4 layers and accounted for` +
      (exceptionCovered.length > 0
        ? ` (${exceptionCovered.length} via shared-folder exceptions listed above).`
        : ".")
  );
} else {
  console.log(`✗ FAIL — ${issues.length} issue(s) found above.`);
  process.exit(1);
}
