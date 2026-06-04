import { LegalDocumentBody } from "@/components/templates/legal/LegalDocumentBody";
import type { LegalContentSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

/** WP `legal_content` section — uses the shared legal document layout. */
export function LegalContentSection({ section, lang }: { section: LegalContentSectionT; lang: Locale }) {
  if (!section.body) return null;
  return <LegalDocumentBody html={section.body} lang={lang} />;
}
