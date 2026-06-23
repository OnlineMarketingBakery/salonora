import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";

/** Lowercase stray capital O between lowercase letters (e.g. tOday → today). */
function fixMisplacedCapitalO(text: string): string {
  let out = text;
  let prev = "";
  while (prev !== out) {
    prev = out;
    out = out.replace(/([a-z])O([a-z])/g, "$1o$2");
  }
  return out;
}

/**
 * Normalize CMS CTA button labels: decode entities, trim, fix common O-casing typos.
 */
export function normalizeCtaLabel(text: string): string {
  return fixMisplacedCapitalO(decodeHtmlEntitiesPlain(text).trim());
}
