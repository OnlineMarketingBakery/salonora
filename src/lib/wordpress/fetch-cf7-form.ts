import { getWordpressBaseUrl } from "./config";
import type { CF7FormDefinition, CF7FormField } from "@/types/forms";
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
    return {
      id: String(json.id),
      hash: json.hash,
      title: json.title,
      properties: json.properties || {},
      fields: heuristicsFromHtml(rawFormHtml),
    };
  } catch (e) {
    logger.warn("fetchCf7Form", e);
    return null;
  }
}

function heuristicsFromHtml(html: string): CF7FormField[] {
  if (!html) return [];
  const re = /name="([^"]+)"[^>]*class="[^"]*wpcf7-([^ "\]]+)/g;
  const fields: CF7FormField[] = [];
  for (const m of html.matchAll(re)) {
    const name = m[1];
    const kind = m[2] || "text";
    const basetype = /submit|button/.test(kind) ? "submit" : kind === "email" ? "email" : "text";
    fields.push({
      name,
      type: `wpcf7${kind[0].toUpperCase() + kind.slice(1)}`,
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
