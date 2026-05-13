import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { Container } from "@/components/ui/Container";
import type { ServiceDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

export function ServiceTemplate({ document: doc, lang }: { document: ServiceDocument; lang: Locale }) {
  return (
    <article>
      {!doc.hidePageTitle && (
        <Container className="pt-10">
          <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{doc.title}</h1>
          {doc.excerpt && <div className="mt-2 text-muted" dangerouslySetInnerHTML={{ __html: doc.excerpt }} />}
          {doc.serviceIntro && <p className="mt-6 text-lg text-muted">{doc.serviceIntro}</p>}
          {doc.serviceHighlights.length > 0 && (
            <ul className="mt-4 list-inside list-disc text-muted">
              {doc.serviceHighlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </Container>
      )}
      <SectionRenderer sections={doc.sections} lang={lang} />
    </article>
  );
}
