import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/Container";
import type { PageDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

export function PageTemplate({ document: doc, lang }: { document: PageDocument; lang: Locale }) {
  return (
    <article>
      {!doc.hidePageTitle && (
        <Container className="pt-10">
          <h1 className="text-3xl font-bold text-[#0c1d3a] md:text-4xl">{doc.title}</h1>
        </Container>
      )}
      {doc.content && !doc.sections.length && (
        <Container className="py-8">
          <RichText html={doc.content} className="text-slate-700" />
        </Container>
      )}
      <SectionRenderer sections={doc.sections} lang={lang} />
    </article>
  );
}
