import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { CF7Form } from "@/components/forms/CF7Form";
import { resolveLink } from "@/lib/utils/links";
import type { FormEmbedSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function FormEmbedSection({ section, lang }: { section: FormEmbedSectionT; lang: Locale }) {
  const redirect = resolveLink(section.redirectLink, lang);
  return (
    <section className="py-16 md:py-24">
      <Container>
        {section.title && <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>}
        {section.intro && <RichText html={section.intro} className="mt-4 text-muted" />}
        <div className="mt-8 max-w-lg">
          <CF7Form
            formId={section.formId}
            definition={section.formDefinition}
            successMode={section.successMode}
            redirectUrl={redirect?.href}
            trackingContext={section.trackingContext}
          />
        </div>
      </Container>
    </section>
  );
}
