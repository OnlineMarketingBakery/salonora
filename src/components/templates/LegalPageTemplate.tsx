import { LegalDocumentBody } from "@/components/templates/legal/LegalDocumentBody";
import { LegalPageHero } from "@/components/templates/legal/LegalPageHero";
import {
  isLegalContentSection,
  isUsableLegalEditorContent,
} from "@/lib/legal/page-content";
import type { PageDocument } from "@/types/documents";
import type { AnySectionT, LegalContentSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

function legalContentSections(sections: AnySectionT[]): LegalContentSectionT[] {
  return sections.filter((s): s is LegalContentSectionT => isLegalContentSection(s));
}

function combineLegalHtml(sections: LegalContentSectionT[]): string {
  return sections.map((s) => s.body).filter(Boolean).join("\n");
}

/**
 * One layout for Privacy Policy and Terms & Conditions (NL + EN). Content only differs.
 */
export function LegalPageTemplate({ document: doc, lang }: { document: PageDocument; lang: Locale }) {
  const sections = legalContentSections(doc.sections);
  const html = sections.length > 0 ? combineLegalHtml(sections) : doc.content;
  const hasBody = Boolean(html?.trim());
  const showEditorFallback = !sections.length && isUsableLegalEditorContent(doc.content);

  return (
    <article className="legal-page legal-page-layout">
      {!doc.hidePageTitle ? (
        <LegalPageHero title={doc.title} slug={doc.slug} lang={lang} />
      ) : null}

      {hasBody || showEditorFallback ? (
        <LegalDocumentBody html={hasBody ? html : doc.content} lang={lang} />
      ) : null}
    </article>
  );
}
