import type { PageDocument } from "@/types/documents";
import type { AnySectionT, FaqSectionT, LegalContentSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import {
  isWordPressPrivacyBoilerplate,
  stripHtmlToText,
} from "@/lib/legal/parse-legal-html";
import { getGlobalFaqItems } from "./faq-items";
import { shouldUseStaticLegalCopy, wpLegalTitleLooksEnglish } from "./legal-locale-guard";
import { resolveLegalPageKey, type LegalPageKey } from "./legal-slugs";
import { buildStaticLegalPage } from "./static-pages";

export function isLegalContentSection(s: AnySectionT): s is LegalContentSectionT {
  return s.type === "legal_content";
}

/** WP block editor content that is safe to show on legal pages (excludes auto-generated WP privacy template). */
export function isUsableLegalEditorContent(html: string): boolean {
  const text = stripHtmlToText(html);
  if (!text) return false;
  return !isWordPressPrivacyBoilerplate(html);
}

export function hasUsableLegalPageContent(doc: PageDocument, lang: Locale, urlSlug: string): boolean {
  const key = resolveLegalPageKey(lang, urlSlug);
  if (!key) return true;

  if (key === "faq") {
    return doc.sections.some(
      (s) => s.type === "faq" && "items" in s && Array.isArray(s.items) && s.items.length > 0
    );
  }

  const hasSection = doc.sections.some(
    (s) => isLegalContentSection(s) && stripHtmlToText(s.body).length > 0
  );
  if (hasSection) {
    if (shouldUseStaticLegalCopy(doc, lang, key)) return false;
    return true;
  }

  const editorUsable = isUsableLegalEditorContent(doc.content);
  if (editorUsable && shouldUseStaticLegalCopy(doc, lang, key)) return false;
  return editorUsable;
}

/** Merge static Salonora legal copy into an empty WP page (keeps WP id, title, SEO). */
export function applyStaticLegalFallback(
  doc: PageDocument,
  lang: Locale,
  urlSlug: string
): PageDocument {
  const key = resolveLegalPageKey(lang, urlSlug);
  if (!key) return doc;

  const fallback = buildStaticLegalPage(lang, key);

  if (key === "faq") {
    const globalCount = getGlobalFaqItems(lang).length;
    const wpFaq = doc.sections.find((s): s is FaqSectionT => s.type === "faq");
    const wpCount = wpFaq?.items?.length ?? 0;
    const useWp = wpCount >= globalCount;
    return {
      ...doc,
      slug: fallback.slug,
      title: doc.title.trim() ? doc.title : fallback.title,
      sections: useWp ? doc.sections : fallback.sections,
      isStaticLegalPage: !useWp,
    };
  }

  const hasLegalSection = doc.sections.some(
    (s) => isLegalContentSection(s) && stripHtmlToText(s.body).length > 0
  );
  const hasUsableEditor = isUsableLegalEditorContent(doc.content);
  const useStaticNl = shouldUseStaticLegalCopy(doc, lang, key);

  if ((hasLegalSection || hasUsableEditor) && !useStaticNl) {
    if (!hasLegalSection && hasUsableEditor) return { ...doc, slug: fallback.slug, isLegalPage: true };
    return {
      ...doc,
      slug: fallback.slug,
      content: hasLegalSection ? "" : doc.content,
      isLegalPage: true,
    };
  }

  const keepWpTitle =
    doc.title.trim() &&
    !(lang === "nl" && wpLegalTitleLooksEnglish(doc.title, key));

  return {
    ...doc,
    slug: fallback.slug,
    title: keepWpTitle ? doc.title : fallback.title,
    content: "",
    sections: fallback.sections,
    isLegalPage: true,
    isStaticLegalPage: true,
  };
}
