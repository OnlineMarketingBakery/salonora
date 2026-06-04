import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import { getSiteUrl } from "@/lib/wordpress/config";
import type { PageDocument } from "@/types/documents";
import type { FaqSectionT, LegalContentSectionT } from "@/types/sections";
import type { SeoPayload } from "@/types/seo";
import { getGlobalFaqItems, getGlobalFaqTitle } from "./faq-items";
import {
  LEGAL_PAGE_KEYS,
  LEGAL_URL_SLUGS,
  getLegalUrlSlug,
  isLegalUrlSlug,
  resolveLegalPageKey,
  type LegalPageKey,
} from "./legal-slugs";
import { loadLegalHtml } from "./load-legal-html";

/** @deprecated Use LegalPageKey + getLegalUrlSlug(lang, key) */
export const LEGAL_PAGE_SLUGS = {
  privacy: "privacy-policy",
  terms: "terms-conditions",
  faq: LEGAL_URL_SLUGS.en.faq,
} as const;

export type LegalPageSlug = LegalPageKey;

type PageMeta = {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  isLegalPage: boolean;
};

const META: Record<LegalPageKey, PageMeta> = {
  privacy: {
    title: { nl: "Privacybeleid", en: "Privacy Policy" },
    description: {
      nl: "Hoe Salonora persoonsgegevens verwerkt volgens de AVG.",
      en: "How Salonora collects, uses, and protects your personal data under the GDPR.",
    },
    isLegalPage: true,
  },
  terms: {
    title: { nl: "Algemene voorwaarden", en: "Terms & Conditions" },
    description: {
      nl: "Voorwaarden voor het gebruik van salonora.eu en booking.salonora.eu.",
      en: "Terms of Service for salonora.eu and booking.salonora.eu.",
    },
    isLegalPage: true,
  },
  faq: {
    title: { nl: "Veelgestelde vragen", en: "FAQ" },
    description: {
      nl: "Antwoorden op veelgestelde vragen over Salonora voor salons.",
      en: "Answers to common questions about Salonora for salons.",
    },
    isLegalPage: false,
  },
};

function buildSeo(key: LegalPageKey, lang: Locale): SeoPayload {
  const meta = META[key];
  const path = buildLocalePath(lang, getLegalUrlSlug(lang, key));
  const site = getSiteUrl();
  return {
    title: `${meta.title[lang]} – Salonora`,
    description: meta.description[lang],
    canonical: `${site}${path}`,
  };
}

function buildLegalContentSection(lang: Locale, htmlBase: string): LegalContentSectionT {
  return {
    _key: "static-legal-body",
    type: "legal_content",
    id: "static-legal-body",
    body: loadLegalHtml(htmlBase, lang),
    contentWidth: "narrow",
  };
}

function buildFaqSection(lang: Locale): FaqSectionT {
  return {
    _key: "static-faq",
    type: "faq",
    id: "static-faq",
    title: getGlobalFaqTitle(lang),
    items: getGlobalFaqItems(lang).map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  };
}

export function isLegalPageSlug(slug: string): slug is LegalPageKey {
  return (LEGAL_PAGE_KEYS as readonly string[]).includes(slug);
}

/** Built-in pages when WordPress has no matching page (or as CMS reference content). */
export function buildStaticLegalPage(lang: Locale, key: LegalPageKey): PageDocument {
  const meta = META[key];
  const title = meta.title[lang];
  const slug = getLegalUrlSlug(lang, key);

  if (key === "faq") {
    return {
      kind: "page",
      id: 0,
      slug,
      title,
      content: "",
      hidePageTitle: false,
      hidePrimaryMenu: false,
      useCustomFooter: false,
      footerSections: [],
      sections: [buildFaqSection(lang)],
      seo: buildSeo(key, lang),
      isLegalPage: meta.isLegalPage,
      isStaticLegalPage: true,
    };
  }

  const htmlBase = key === "privacy" ? "privacy-policy" : "terms-conditions";

  return {
    kind: "page",
    id: 0,
    slug,
    title,
    content: "",
    hidePageTitle: false,
    hidePrimaryMenu: false,
    useCustomFooter: false,
    footerSections: [],
    sections: [buildLegalContentSection(lang, htmlBase)],
    seo: buildSeo(key, lang),
    isLegalPage: meta.isLegalPage,
    isStaticLegalPage: true,
  };
}

export function tryBuildStaticLegalPage(lang: Locale, urlSlug: string): PageDocument | null {
  const key = resolveLegalPageKey(lang, urlSlug);
  if (!key) return null;
  return buildStaticLegalPage(lang, key);
}

export function isLegalPageSlugForLocale(lang: Locale, slug: string): boolean {
  return isLegalUrlSlug(lang, slug);
}
