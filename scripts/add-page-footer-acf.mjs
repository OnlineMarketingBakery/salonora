/**
 * Idempotently adds per-page custom footer fields to group_omb_page_builder in acf-import-bundle.json.
 * Run: node scripts/add-page-footer-acf.mjs
 * Then: npm run acf:sync-bundle && npm run acf:push
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = path.join(root, "acf-import-bundle.json");

const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const gi = bundle.findIndex((g) => g.key === "group_omb_page_builder");
if (gi < 0) throw new Error("group_omb_page_builder not found");

const group = bundle[gi];
const fields = group.fields;
if (fields.some((f) => f.name === "use_custom_footer")) {
  console.log("Footer fields already present — nothing to do.");
  process.exit(0);
}

const flexTabIdx = fields.findIndex((f) => f.key === "field_omb_sections_tab");
if (flexTabIdx < 0) throw new Error("field_omb_sections_tab not found");

const useCustomFooter = {
  key: "field_omb_use_custom_footer",
  label: "Use custom footer",
  name: "use_custom_footer",
  "aria-label": "",
  type: "true_false",
  instructions:
    "When enabled, the site layout renders Page footer sections below the page content instead of the global footer (Footer settings). Leave off to use the default footer.",
  required: 0,
  conditional_logic: 0,
  wrapper: { width: "", class: "", id: "" },
  message: "",
  default_value: 0,
  ui: 1,
  ui_on_text: "Yes",
  ui_off_text: "No",
};

const footerTab = {
  key: "field_omb_page_footer_tab",
  label: "Page Footer",
  name: "",
  "aria-label": "",
  type: "tab",
  instructions: "",
  required: 0,
  conditional_logic: [[{ field: "field_omb_use_custom_footer", operator: "==", value: "1" }]],
  wrapper: { width: "", class: "", id: "" },
  placement: "top",
  endpoint: 0,
  selected: 0,
};

const pageFooterSections = {
  key: "field_omb_page_footer_sections",
  label: "Page footer sections",
  name: "page_footer_sections",
  "aria-label": "",
  type: "clone",
  instructions:
    "Flexible sections shown as this page footer (CTA, rich text, FAQ, etc.). Same layouts as Page Sections. Only used when Use custom footer is on.",
  required: 0,
  conditional_logic: [[{ field: "field_omb_use_custom_footer", operator: "==", value: "1" }]],
  wrapper: { width: "", class: "", id: "" },
  clone: ["field_omb_page_sections"],
  display: "seamless",
  layout: "block",
  prefix_label: 0,
  prefix_name: 1,
};

fields.splice(flexTabIdx, 0, useCustomFooter, footerTab, pageFooterSections);
group.modified = Math.floor(Date.now() / 1000);
bundle[gi] = group;

fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 4)}\n`);
console.log("Updated", bundlePath);
console.log("Next: npm run acf:sync-bundle && npm run acf:push");
