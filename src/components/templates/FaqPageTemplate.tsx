import { FaqJsonLd } from "@/components/templates/faq/FaqJsonLd";
import { FaqPageContent } from "@/components/templates/faq/FaqPageContent";
import { getGlobalFaqItems, getGlobalFaqTitle } from "@/lib/legal/faq-items";
import type { PageDocument } from "@/types/documents";
import type { FaqSectionT } from "@/types/sections";
import type { ContactSocialSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";

/** Dedicated FAQ shell only — never render WP page_sections (prevents duplicate breadcrumbs/heroes). */
/** WP sometimes returns EN FAQ rows for NL; always use bundled merged catalog. */
function wpFaqLooksEnglish(items: { question: string }[]): boolean {
  const q = items[0]?.question?.trim() ?? "";
  return /^How |^Do |^Can |^What |^Is there |^Will /i.test(q);
}

function resolveFaqItems(doc: PageDocument, lang: Locale) {
  const catalog = getGlobalFaqItems(lang);
  const section = doc.sections.find((s): s is FaqSectionT => s.type === "faq");
  const wpItems = section?.items ?? [];
  if (!wpItems.length) return catalog;
  if (lang === "nl" && wpFaqLooksEnglish(wpItems)) return catalog;
  return catalog;
}

export function FaqPageTemplate({
  document: doc,
  lang,
  contact,
}: {
  document: PageDocument;
  lang: Locale;
  contact: ContactSocialSettings;
}) {
  const items = resolveFaqItems(doc, lang);
  const title = getGlobalFaqTitle(lang);

  return (
    <article className="faq-page overflow-visible bg-background">
      <FaqJsonLd items={items} lang={lang} pageTitle={title} />
      <FaqPageContent
        items={items}
        lang={lang}
        title={title}
        contact={contact}
        showHero={!doc.hidePageTitle}
      />
    </article>
  );
}
