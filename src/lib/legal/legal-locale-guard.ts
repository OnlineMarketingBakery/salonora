import type { PageDocument } from "@/types/documents";
import type { LegalContentSectionT } from "@/types/sections";
import { stripHtmlToText } from "@/lib/legal/parse-legal-html";
import type { Locale } from "@/lib/i18n/locales";
import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";
import type { LegalPageKey } from "./legal-slugs";

function isLegalContentSection(s: { type: string }): s is LegalContentSectionT {
  return s.type === "legal_content";
}

/** WP/Polylang often returns EN copy on NL legal pages; detect and use bundled NL HTML. */
export function wpLegalBodyLooksEnglish(html: string, key: LegalPageKey): boolean {
  const text = stripHtmlToText(html).slice(0, 600);
  if (!text) return false;

  if (key === "terms") {
    const en = /These Terms of Service|Our services/i.test(text);
    const nl = /Deze algemene voorwaarden|Onze diensten/i.test(text);
    return en && !nl;
  }

  if (key === "privacy") {
    const en = /This privacy policy applies|we collect, use/i.test(text);
    const nl = /Dit privacybeleid|persoonsgegevens verzamelen/i.test(text);
    return en && !nl;
  }

  return false;
}

export function wpLegalTitleLooksEnglish(title: string, key: LegalPageKey): boolean {
  const t = decodeHtmlEntitiesPlain(title).trim();
  if (!t) return false;

  if (key === "terms") {
    return /terms/i.test(t) && !/voorwaarden/i.test(t);
  }
  if (key === "privacy") {
    return /privacy policy/i.test(t) && !/privacybeleid/i.test(t);
  }
  return false;
}

export function getLegalBodyHtml(doc: PageDocument): string {
  const section = doc.sections.find(
    (s) => isLegalContentSection(s) && stripHtmlToText(s.body).length > 0
  );
  if (section && isLegalContentSection(section)) return section.body;
  return doc.content;
}

export function shouldUseStaticLegalCopy(
  doc: PageDocument,
  lang: Locale,
  key: LegalPageKey
): boolean {
  if (lang !== "nl" || (key !== "privacy" && key !== "terms")) return false;
  const html = getLegalBodyHtml(doc);
  if (stripHtmlToText(html).length === 0) return false;
  return wpLegalBodyLooksEnglish(html, key);
}
