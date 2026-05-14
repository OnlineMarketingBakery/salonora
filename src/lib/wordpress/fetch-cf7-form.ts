import { getWordpressBaseUrl } from "./config";
import type { CF7FieldOption, CF7FormDefinition, CF7FormField } from "@/types/forms";
import type { Locale } from "@/lib/i18n/locales";
import { logger } from "@/lib/utils/logger";

type CF7RestForm = {
  id: string;
  hash: string;
  title: string;
  properties: Record<string, string>;
};

/**
 * Fetches Contact Form 7 form metadata from the public REST API (CF7 5.4+).
 */
export async function fetchCf7Form(
  formId: number,
  lang: Locale
): Promise<CF7FormDefinition | null> {
  if (!formId) return null;
  const base = getWordpressBaseUrl();
  const url = `${base}/wp-json/contact-form-7/v1/contact-forms/${formId}?lang=${lang}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      logger.warn("fetchCf7Form failed", { formId, status: res.status });
      return null;
    }
    const json = (await res.json()) as CF7RestForm;
    const rawFormHtml = json.properties?.form || "";
    const parsed = parseFieldsFromCf7Html(rawFormHtml);
    return {
      id: String(json.id),
      hash: json.hash,
      title: json.title,
      properties: json.properties || {},
      fields: parsed.fields,
      submitLabel: parsed.submitLabel,
    };
  } catch (e) {
    logger.warn("fetchCf7Form", e);
    return null;
  }
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function skipCf7Name(rawName: string): boolean {
  const n = rawName.trim();
  if (!n) return true;
  if (n.includes("[]")) return true;
  if (n.startsWith("_")) return true;
  if (n.includes("_wpcf7")) return true;
  return false;
}

function parseFieldsFromCf7Html(html: string): { fields: CF7FormField[]; submitLabel?: string } {
  if (!html.trim()) return { fields: [] };

  let submitLabel: string | undefined;
  for (const m of html.matchAll(/<input\s+([^>]*?)>/gi)) {
    const attrs = m[1];
    const type = (attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1] || "").toLowerCase();
    if (type === "submit" || type === "button") {
      const val = attrs.match(/\bvalue\s*=\s*["']([^"']*)["']/i)?.[1]?.trim();
      if (val) submitLabel = val;
    }
  }

  type Piece = { index: number; field: CF7FormField };
  const pieces: Piece[] = [];

  for (const m of html.matchAll(/<textarea([^>]*)>/gi)) {
    const attrs = m[1];
    const nameM = attrs.match(/\bname\s*=\s*["']([^"']+)["']/i);
    if (!nameM) continue;
    const rawName = nameM[1];
    const name = rawName.replace(/\[\]$/, "");
    if (skipCf7Name(rawName)) continue;
    pieces.push({
      index: m.index ?? 0,
      field: {
        name,
        type: "wpcf7Textarea",
        basetype: "textarea",
        rawName,
        rawValues: "",
      },
    });
  }

  for (const m of html.matchAll(/<select\s+([^>]*)>([\s\S]*?)<\/select>/gi)) {
    const attrs = m[1];
    const body = m[2];
    const nameM = attrs.match(/\bname\s*=\s*["']([^"']+)["']/i);
    if (!nameM) continue;
    const rawName = nameM[1];
    const name = rawName.replace(/\[\]$/, "");
    if (skipCf7Name(rawName)) continue;
    const options: CF7FieldOption[] = [];
    for (const om of body.matchAll(/<option\s+([^>]*)>([\s\S]*?)<\/option>/gi)) {
      const oa = om[1];
      const rawVal = oa.match(/\bvalue\s*=\s*["']([^"']*)["']/i)?.[1];
      const value = rawVal !== undefined ? rawVal : "";
      let label = stripTags(om[2] ?? "").trim();
      if (!label) label = value;
      if (/\bdisabled\b/i.test(oa) && !value && !label) continue;
      options.push({ value, label: label || value });
    }
    pieces.push({
      index: m.index ?? 0,
      field: {
        name,
        type: "wpcf7Select",
        basetype: "select",
        rawName,
        rawValues: "",
        options,
      },
    });
  }

  const radioGroups = new Map<string, { index: number; options: CF7FieldOption[] }>();

  for (const m of html.matchAll(/<input\s+([^>]+)>/gi)) {
    const attrs = m[1];
    const type = (attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1] || "text").toLowerCase();
    const nameM = attrs.match(/\bname\s*=\s*["']([^"']+)["']/i);
    if (!nameM) continue;
    const rawName = nameM[1];
    const name = rawName.replace(/\[\]$/, "");
    if (skipCf7Name(rawName)) continue;
    const idx = m.index ?? 0;

    if (type === "submit" || type === "button" || type === "hidden") continue;

    if (type === "radio") {
      const value = attrs.match(/\bvalue\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
      const idM = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
      let label = value;
      if (idM) {
        const frag = html.slice(Math.max(0, idx - 500), Math.min(html.length, idx + 500));
        const esc = idM[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const labRe = new RegExp(`<label[^>]+\\sfor\\s*=\\s*["']${esc}["'][^>]*>([\\s\\S]*?)<\\/label>`, "i");
        const lm = frag.match(labRe);
        if (lm) label = stripTags(lm[1]).trim() || label;
      }
      const opt = { value, label: label || value };
      const ex = radioGroups.get(name);
      if (!ex) radioGroups.set(name, { index: idx, options: [opt] });
      else ex.options.push(opt);
      continue;
    }

    let basetype = "text";
    if (type === "email") basetype = "email";
    else if (type === "tel") basetype = "tel";
    else if (type === "url") basetype = "url";
    else if (type === "number") basetype = "number";

    pieces.push({
      index: idx,
      field: {
        name,
        type: `wpcf7${type[0]!.toUpperCase() + type.slice(1)}`,
        basetype,
        rawName,
        rawValues: "",
      },
    });
  }

  for (const [name, group] of radioGroups) {
    pieces.push({
      index: group.index,
      field: {
        name,
        type: "wpcf7Radio",
        basetype: "radio",
        rawName: name,
        rawValues: "",
        options: group.options,
      },
    });
  }

  pieces.sort((a, b) => a.index - b.index);

  const seen = new Set<string>();
  const fields: CF7FormField[] = [];
  for (const p of pieces) {
    if (seen.has(p.field.name)) continue;
    seen.add(p.field.name);
    fields.push(p.field);
  }

  if (fields.length) return { fields, submitLabel };

  return { fields: legacyHeuristicsFromHtml(html), submitLabel };
}

function legacyHeuristicsFromHtml(html: string): CF7FormField[] {
  if (!html) return [];
  const re = /name="([^"]+)"[^>]*class="[^"]*wpcf7-([^ "\]]+)/g;
  const fields: CF7FormField[] = [];
  for (const m of html.matchAll(re)) {
    const name = m[1];
    const kind = m[2] || "text";
    const basetype = /submit|button/.test(kind) ? "submit" : kind === "email" ? "email" : "text";
    fields.push({
      name,
      type: `wpcf7${kind[0]!.toUpperCase() + kind.slice(1)}`,
      basetype,
      rawName: name,
      rawValues: "",
    });
  }
  if (fields.length) return fields;
  const nameOnly = /name="([^"]+)"/g;
  for (const m of html.matchAll(nameOnly)) {
    if (m[1].startsWith("_wpcf7") || m[1] === "_wpcf7" || m[1].includes("[]")) continue;
    fields.push({
      name: m[1].replace("[]", ""),
      type: "wpcf7Text",
      basetype: "text",
      rawName: m[1],
      rawValues: "",
    });
  }
  return fields;
}
