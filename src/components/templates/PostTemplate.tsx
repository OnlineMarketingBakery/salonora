import Image from "next/image";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/Container";
import { CF7Form } from "@/components/forms/CF7Form";
import { fetchCf7Form } from "@/lib/wordpress/fetch-cf7-form";
import type { PostDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";
import { extractPostToc } from "@/lib/blog/post-html";
import { getSiteUrl } from "@/lib/wordpress/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { toPlainText } from "@/lib/utils/strings";
import { PostBreadcrumbs } from "./post/PostBreadcrumbs";
import { PostTableOfContents } from "./post/PostTableOfContents";
import { PostAuthorCard } from "./post/PostAuthorCard";
import { PostArticleMeta } from "./post/PostArticleMeta";
import { PostShareActions } from "./post/PostShareActions";
import { PostRelatedGrid } from "./post/PostRelatedGrid";

export async function PostTemplate({ document: doc, lang }: { document: PostDocument; lang: Locale }) {
  const formDef = doc.featuredFormId ? await fetchCf7Form(doc.featuredFormId, lang) : null;
  const toc = extractPostToc(doc.content);
  const lead = toPlainText(doc.excerpt);
  const site = getSiteUrl();
  const path = buildLocalePath(lang, doc.slug).replace(/^\//, "");
  const shareUrl = `${site}/${path}`;

  return (
    <article className="bg-[var(--palette-white)]">
      <Container className="pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,25.125rem)_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-0">
          <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:max-w-[54rem]">
            <header className="flex flex-col gap-4">
              <PostBreadcrumbs
                lang={lang}
                blogArchivePath={doc.blogArchivePath}
                postTitleHtml={doc.title}
                breadcrumbParent={doc.breadcrumbParent}
              />
              <h1 className="text-[2rem] font-semibold leading-[1.1] text-[var(--palette-navy)] sm:text-[2.375rem] md:text-[2.75rem] lg:text-[48px] lg:leading-[1.1]">
                {toPlainText(doc.title)}
              </h1>
              {doc.postLeadHtml ? (
                <div className="max-w-[52rem] text-[16px] font-normal leading-[1.4] text-[var(--palette-muted)] md:max-w-[48.5rem]">
                  <RichText
                    html={doc.postLeadHtml}
                    className="post-lead max-w-none prose-p:my-0 prose-p:text-[16px] prose-p:leading-[1.4] prose-headings:text-[var(--palette-navy)] prose-p:text-[var(--palette-muted)] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)]"
                  />
                </div>
              ) : lead ? (
                <p className="max-w-[52rem] text-[16px] font-normal leading-[1.4] text-[var(--palette-muted)] md:max-w-[48.5rem]">
                  {lead}
                </p>
              ) : null}
              <div className="flex flex-col gap-4 border-t border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] py-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between lg:gap-x-16">
                <PostArticleMeta
                  author={doc.author}
                  dateLabel={doc.dateLabel}
                  readMinutes={doc.readMinutes}
                  lang={lang}
                />
                <PostShareActions lang={lang} shareUrl={shareUrl} shareTitle={toPlainText(doc.title)} />
              </div>
            </header>
            {doc.featuredImage ? (
              <div className="relative mt-[34px] aspect-[16/9] w-full overflow-hidden rounded-[14px] bg-[var(--palette-surface)] lg:mt-[34px]">
                <Image
                  src={doc.featuredImage}
                  alt={doc.featuredImageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 864px"
                  priority
                />
              </div>
            ) : null}
            <RichText
              html={doc.content}
              className="post-article-body post-prose mt-[34px] max-w-none text-base font-normal leading-[1.4] prose-headings:font-semibold prose-h2:text-[34px] prose-h2:leading-[1.1] prose-h2:font-semibold prose-h3:text-2xl prose-h3:leading-[1.1] prose-h3:font-semibold prose-p:my-0 prose-p:leading-[1.4] prose-li:leading-[1.4] prose-headings:text-[var(--palette-navy)] prose-p:text-[var(--palette-muted)] prose-li:text-[var(--palette-muted)] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)] prose-img:rounded-[10px] lg:mt-[34px]"
            />
            {doc.featuredFormId && formDef ? (
              <div className="mt-10 max-w-lg">
                <CF7Form formId={doc.featuredFormId} definition={formDef} successMode="inline" />
              </div>
            ) : null}
          </div>
          <aside className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1 lg:sticky lg:top-28 lg:self-start">
            {doc.showToc ? <PostTableOfContents items={toc} lang={lang} /> : null}
            <PostAuthorCard author={doc.author} lang={lang} />
          </aside>
        </div>
      </Container>
      {doc.relatedPosts.length > 0 ? <PostRelatedGrid items={doc.relatedPosts} lang={lang} /> : null}
      <SectionRenderer sections={doc.sections} lang={lang} />
    </article>
  );
}
