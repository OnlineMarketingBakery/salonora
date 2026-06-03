import Image from "next/image";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { RichText } from "@/components/ui/RichText";
import { Container } from "@/components/ui/Container";
import { CF7Form } from "@/components/forms/CF7Form";
import { fetchCf7Form } from "@/lib/wordpress/fetch-cf7-form";
import type { PostDocument } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";
import { extractPostToc, filterBlogPostTocItems } from "@/lib/blog/post-html";
import { appendBlogFaqTocItem } from "@/lib/blog/post-toc";
import { pickBlogTailFaqSections } from "@/lib/wordpress/fetch-blog-single-tail-sections";
import { getSiteUrl } from "@/lib/wordpress/config";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { toPlainText } from "@/lib/utils/strings";
import { PostBreadcrumbs } from "./post/PostBreadcrumbs";
import { PostTableOfContents } from "./post/PostTableOfContents";
import { PostArticleMeta } from "./post/PostArticleMeta";
import { PostShareActions } from "./post/PostShareActions";
import { PostRelatedGrid } from "./post/PostRelatedGrid";
import { PostTwoColumnGrid } from "./post/PostContentColumn";
import { PostHeroEyebrow } from "./post/PostHeroEyebrow";

export async function PostTemplate({ document: doc, lang }: { document: PostDocument; lang: Locale }) {
  const formDef = doc.featuredFormId ? await fetchCf7Form(doc.featuredFormId, lang) : null;
  const faqSections = pickBlogTailFaqSections(doc.layoutSections);
  const postSections = doc.sections.filter(
    (s) => s.type !== "faq_contact_split" && s.type !== "blog_conclusion_panel"
  );
  const toc = appendBlogFaqTocItem(
    filterBlogPostTocItems(extractPostToc(doc.content)),
    lang,
    faqSections.length > 0
  );
  const lead = toPlainText(doc.excerpt);
  const site = getSiteUrl();
  const path = buildLocalePath(lang, doc.slug).replace(/^\//, "");
  const shareUrl = `${site}/${path}`;

  let faqBlockIndex = 0;
  const templateTailNodes = doc.layoutSections.map((section) => {
    if (section.type === "faq_contact_split") {
      const isFirstFaq = faqBlockIndex === 0;
      faqBlockIndex += 1;
      return (
        <div
          key={section.id}
          id={isFirstFaq ? "post-faq" : undefined}
          className="post-single-faq scroll-mt-28"
        >
          <SectionRenderer sections={[section]} lang={lang} />
        </div>
      );
    }
    return <SectionRenderer key={section.id} sections={[section]} lang={lang} />;
  });

  return (
    <article className="blog-single-post bg-white">
      <Container className="pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20">
        <PostTwoColumnGrid
          aside={
            <aside className="flex min-w-0 flex-col lg:sticky lg:top-28 lg:self-start">
              {doc.showToc ? <PostTableOfContents items={toc} lang={lang} variant="post" /> : null}
            </aside>
          }
        >
          <header className="flex min-w-0 flex-col">
            <PostBreadcrumbs
              lang={lang}
              blogArchivePath={doc.blogArchivePath}
              postTitleHtml={doc.title}
              breadcrumbParent={doc.breadcrumbParent}
            />
            {doc.postEyebrow ? <PostHeroEyebrow text={doc.postEyebrow} /> : null}
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] text-navy sm:text-[2.375rem] md:text-[2.75rem] lg:text-[48px]">
              {toPlainText(doc.title)}
            </h1>
            {doc.postLeadHtml ? (
              <RichText
                html={doc.postLeadHtml}
                className="post-lead mt-5 max-w-none text-2xl font-medium leading-[1.4] prose-p:my-0 prose-p:text-2xl prose-p:font-medium prose-p:leading-[1.4] prose-headings:text-navy prose-p:text-navy prose-strong:text-navy prose-a:text-brand"
              />
            ) : lead ? (
              <p className="mt-5 text-2xl font-medium leading-[1.4] text-navy">{lead}</p>
            ) : null}
            <div className="mt-5 flex min-h-[77px] flex-col justify-between gap-4 border-t border-b border-[color-mix(in_srgb,var(--palette-brand)_14%,transparent)] py-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
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
            <div className="relative mt-[30px] aspect-[968/421] w-full overflow-hidden rounded-[12px] bg-surface">
              <Image
                src={doc.featuredImage}
                alt={doc.featuredImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 969px"
                priority
              />
            </div>
          ) : null}
          <RichText
            html={doc.content}
            className="post-article-body post-prose mt-[34px] max-w-none text-base font-normal leading-[1.4] prose-headings:font-semibold prose-h2:mt-[2.125rem] prose-h2:mb-4 prose-h2:text-[2.125rem] prose-h2:leading-[1.1] prose-h3:text-2xl prose-h3:leading-[1.1] prose-p:my-0 prose-p:mb-4 prose-p:leading-[1.4] prose-li:leading-[1.4] prose-headings:text-navy prose-p:text-muted prose-li:text-muted prose-strong:text-navy prose-a:text-brand prose-img:rounded-[12px]"
          />
          {doc.featuredFormId && formDef ? (
            <div className="mt-10 max-w-lg">
              <CF7Form formId={doc.featuredFormId} definition={formDef} successMode="inline" />
            </div>
          ) : null}
        </PostTwoColumnGrid>
      </Container>
      {templateTailNodes}
      {doc.showRelatedPosts && doc.relatedPosts.length > 0 ? (
        <PostRelatedGrid items={doc.relatedPosts} lang={lang} />
      ) : null}
      {postSections.length > 0 ? <SectionRenderer sections={postSections} lang={lang} /> : null}
    </article>
  );
}
