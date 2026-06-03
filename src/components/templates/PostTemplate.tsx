import Image from "next/image";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
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
import { PostTableOfContents } from "./post/PostTableOfContents";
import { PostRelatedGrid } from "./post/PostRelatedGrid";
import { PostTwoColumnGrid } from "./post/PostContentColumn";
import { PostHeroHeader } from "./post/PostHeroHeader";
import { PostArticleBody } from "./post/PostArticleBody";

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
      <Container className="pb-12 pt-28 sm:px-6 md:pb-16 md:pt-32 lg:px-[70px] lg:pb-20 xl:max-w-[90rem]">
        <PostTwoColumnGrid
          aside={
            <aside className="hidden min-w-0 flex-col lg:sticky lg:top-28 lg:flex lg:self-start">
              {doc.showToc ? <PostTableOfContents items={toc} lang={lang} variant="post" /> : null}
            </aside>
          }
        >
          <PostHeroHeader doc={doc} lang={lang} shareUrl={shareUrl} />
          {doc.featuredImage ? (
            <div className="relative mt-[30px] aspect-[968/421] w-full overflow-hidden rounded-[12px] bg-[#ebf3fe]">
              <Image
                src={doc.featuredImage}
                alt={doc.featuredImageAlt}
                fill
                className="object-cover object-[center_35%]"
                sizes="(max-width: 1024px) 100vw, 969px"
                priority
              />
            </div>
          ) : null}
          {doc.showToc ? (
            <div className="mt-8 lg:hidden">
              <PostTableOfContents items={toc} lang={lang} variant="post" />
            </div>
          ) : null}
          <PostArticleBody html={doc.content} />
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
