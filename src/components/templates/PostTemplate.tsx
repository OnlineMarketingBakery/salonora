import Image from "next/image";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/Container";
import { CF7Form } from "@/components/forms/CF7Form";
import { fetchCf7Form } from "@/lib/wordpress/fetch-cf7-form";
import type { PostDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

export async function PostTemplate({ document: doc, lang }: { document: PostDocument; lang: Locale }) {
  const formDef = doc.featuredFormId ? await fetchCf7Form(doc.featuredFormId, lang) : null;
  return (
    <article>
      <Container className="pt-10">
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{doc.title}</h1>
        {doc.featuredImage && (
          <div className="relative mt-6 aspect-[21/9] w-full max-w-4xl overflow-hidden rounded-2xl">
            <Image
              src={doc.featuredImage}
              alt={doc.featuredImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 56rem) 100vw, 56rem"
              priority
            />
          </div>
        )}
        <div className="prose mt-8 max-w-3xl font-sans prose-headings:text-foreground prose-p:text-muted prose-li:text-muted prose-a:text-brand">
          <RichText html={doc.content} />
        </div>
        {doc.featuredFormId && formDef && (
          <div className="mt-10 max-w-lg">
            <CF7Form formId={doc.featuredFormId} definition={formDef} successMode="inline" />
          </div>
        )}
      </Container>
      <SectionRenderer sections={doc.sections} lang={lang} />
    </article>
  );
}
