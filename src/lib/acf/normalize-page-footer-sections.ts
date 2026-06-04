import type { FooterSectionT } from "@/types/sections";
import { asString, newSectionId } from "./field-mappers";
import { mapFooterFieldsFromAcfRow } from "./map-footer-fields";

type RawRow = Record<string, unknown> & { acf_fc_layout?: string };

/** Clone of `page_sections` may nest rows under `page_sections` inside `page_footer_sections`. */
export function extractPageFooterSectionRows(value: unknown): unknown[] | null {
  if (Array.isArray(value) && value.length > 0) return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const o = value as Record<string, unknown>;
  for (const key of ["page_footer_sections", "page_sections", "footer_section"] as const) {
    const nested = o[key];
    if (Array.isArray(nested) && nested.length > 0) return nested;
  }
  return null;
}

function keyOf(i: number, row: RawRow): string {
  const k = row._key ?? row.key;
  return typeof k === "string" && k ? k : `page_footer_${i}`;
}

/** ACF clone group `footer_content` nests footer fields under one object in REST. */
function flattenFooterSectionRow(row: RawRow): RawRow {
  const nested = row.footer_content;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return { ...row, ...(nested as Record<string, unknown>) };
  }
  return row;
}

export function normalizePageFooterSections(raw: unknown): FooterSectionT[] {
  const rows =
    extractPageFooterSectionRows(raw) ?? (Array.isArray(raw) ? raw : []);
  const out: FooterSectionT[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = flattenFooterSectionRow(rows[i] as RawRow);
    const layout = asString(row.acf_fc_layout);
    if (layout !== "footer_section") continue;
    out.push({
      type: "footer_section",
      id: newSectionId(),
      _key: keyOf(i, row),
      hasLanguageSwitcherOverride: Object.prototype.hasOwnProperty.call(
        row,
        "show_footer_language_switcher",
      ),
      ...mapFooterFieldsFromAcfRow(row),
    });
  }
  return out;
}
