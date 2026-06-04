import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { LegalMobileToc } from "@/components/templates/legal/LegalMobileToc";
import { LegalPageColumn } from "@/components/templates/legal/LegalPageColumn";
import { LegalScrollSpyToc } from "@/components/sections/legal-content/LegalScrollSpyToc";
import { enhanceLegalLinks, wrapLegalBodySections } from "@/lib/legal/enhance-legal-html";
import { LEGAL_PROSE_CLASS } from "@/lib/legal/legal-prose-classes";
import { extractLegalHeadings, splitLegalLead } from "@/lib/legal/parse-legal-html";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
  html: string;
  lang: Locale;
};

/**
 * Shared privacy / terms body: card shell, sticky TOC, ~680px prose column, section bands.
 */
export function LegalDocumentBody({ html, lang }: Props) {
  if (!html?.trim()) return null;

  const { leadHtml, bodyHtml } = splitLegalLead(html);
  const headings = extractLegalHeadings(html);
  const lead = leadHtml ? enhanceLegalLinks(leadHtml) : "";
  const body = enhanceLegalLinks(wrapLegalBodySections(bodyHtml));

  return (
    <section className="legal-page-main">
      <Container padding="header" className="legal-page-main-wrap pt-4 md:pt-6">
        <LegalPageColumn>
          <div className="legal-page-card">
            <LegalMobileToc headings={headings} lang={lang} />

            <div className="legal-page-grid">
              <LegalScrollSpyToc
                headings={headings}
                lang={lang}
                className="legal-desktop-toc hidden lg:block"
              />

              <div className="legal-page-article min-w-0">
                {lead ? (
                  <div className="legal-prose-lead">
                    <RichText html={lead} className={LEGAL_PROSE_CLASS} prose={false} />
                  </div>
                ) : null}
                {body ? (
                  <RichText html={body} className={LEGAL_PROSE_CLASS} prose={false} />
                ) : null}
              </div>
            </div>
          </div>
        </LegalPageColumn>
      </Container>
    </section>
  );
}
