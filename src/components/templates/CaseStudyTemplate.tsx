import Image from "next/image";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/Container";
import type { CaseStudyDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

export function CaseStudyTemplate({
  document: doc,
  lang,
}: {
  document: CaseStudyDocument;
  lang: Locale;
}) {
  return (
    <article>
      <Container className="pt-28 pb-16 md:pt-32 md:pb-24">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold text-[var(--palette-navy)] md:text-4xl">{doc.title}</h1>
          {doc.excerpt ? (
            <div className="mt-4 text-base leading-[1.5] text-[var(--palette-muted)]">
              <RichText html={doc.excerpt} className="text-[var(--palette-muted)]" />
            </div>
          ) : null}
        </header>
        {doc.featuredImage ? (
          <div className="relative mt-10 aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-[14px] bg-[var(--palette-surface)]">
            <Image
              src={doc.featuredImage}
              alt={doc.featuredImageAlt || doc.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        ) : null}
        {doc.content ? (
          <div className="mt-10 max-w-3xl">
            <RichText html={doc.content} className="post-article-body text-[var(--palette-navy)]" />
          </div>
        ) : null}
      </Container>
      <SectionRenderer sections={doc.sections} lang={lang} />
    </article>
  );
}
