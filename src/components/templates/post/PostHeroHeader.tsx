import Link from "next/link";
import { RichText } from "@/components/ui/RichText";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import type { Locale } from "@/lib/i18n/locales";
import type { PostDocument } from "@/types/documents";
import { decodeHtmlEntitiesPlain } from "@/lib/utils/decode-html-entities-plain";
import { stripTags, toPlainText } from "@/lib/utils/strings";
import { PostArticleMeta } from "./PostArticleMeta";
import { PostHeroEyebrow } from "./PostHeroEyebrow";
import { PostShareActions } from "./PostShareActions";

const COPY = {
  nl: { blog: "Blog" },
  en: { blog: "Blog" },
} as const;

/** Short category-style excerpt wrongly stored instead of ACF post_eyebrow. */
function looksLikeEyebrowLine(text: string): boolean {
  const t = text.trim();
  return t.length > 0 && t.length < 160 && t.includes("·");
}

function resolveHeroCopy(doc: PostDocument) {
  const excerptPlain = toPlainText(doc.excerpt).trim();

  let eyebrow = doc.postEyebrow?.trim() || null;
  let leadHtml = doc.postLeadHtml;
  let leadPlain: string | null = null;

  if (leadHtml) {
    const leadAsPlain = toPlainText(leadHtml).trim();
    if (!eyebrow && looksLikeEyebrowLine(leadAsPlain)) {
      eyebrow = leadAsPlain;
      leadHtml = null;
    }
  }

  if (!eyebrow && excerptPlain && looksLikeEyebrowLine(excerptPlain)) {
    eyebrow = excerptPlain;
  }

  if (leadHtml) {
    const remaining = toPlainText(leadHtml).trim();
    if (!remaining || remaining === eyebrow) leadHtml = null;
  }

  if (!leadHtml && excerptPlain && excerptPlain !== eyebrow && !looksLikeEyebrowLine(excerptPlain)) {
    leadPlain = excerptPlain;
  }

  return { eyebrow, leadHtml, leadPlain };
}

function HeroDivider() {
  return (
    <div
      className="h-px w-full shrink-0 bg-[#acc6ea]"
      aria-hidden
    />
  );
}

export function PostHeroHeader({
  doc,
  lang,
  shareUrl,
}: {
  doc: PostDocument;
  lang: Locale;
  shareUrl: string;
}) {
  const title = toPlainText(doc.title);
  const { eyebrow, leadHtml, leadPlain } = resolveHeroCopy(doc);
  const t = COPY[lang];
  const titlePlain = stripTags(doc.title).trim() || "—";

  return (
    <header className="flex min-w-0 flex-col">
      {doc.breadcrumbParent ? (
        <a
          href={doc.breadcrumbParent.href}
          className="mb-4 block text-[24px] font-medium leading-[1.6] text-brand transition hover:underline"
        >
          {doc.breadcrumbParent.label}
        </a>
      ) : null}

      <nav aria-label="Breadcrumb" className="sr-only">
        <ol>
          <li>
            <Link href={buildLocalePath(lang, doc.blogArchivePath)}>{t.blog}</Link>
          </li>
          <li aria-current="page">{titlePlain}</li>
        </ol>
      </nav>

      {/* Figma 1643:234 — brand line above H1 */}
      {eyebrow ? <PostHeroEyebrow text={eyebrow} /> : null}

      {/* Figma 1643:235 — 48px semibold navy */}
      <h1
        className={`text-[48px] font-semibold leading-[1.1] tracking-normal text-navy ${eyebrow ? "mt-[18px]" : ""}`}
      >
        {title}
      </h1>

      {/* Figma 1643:236 — 24px medium lead */}
      {leadHtml ? (
        <RichText
          html={leadHtml}
          className="post-lead mt-[18px] max-w-none text-[24px] font-medium leading-[1.4] prose-p:my-0 prose-p:text-[24px] prose-p:font-medium prose-p:leading-[1.4] prose-headings:text-navy prose-p:text-navy prose-strong:text-navy prose-a:text-brand"
        />
      ) : leadPlain ? (
        <p className="mt-[18px] text-[24px] font-medium leading-[1.4] text-navy">
          {decodeHtmlEntitiesPlain(leadPlain)}
        </p>
      ) : null}

      {/* Figma 1643:237–262 — 77px band: divider, meta, divider */}
      <div className="mt-7 flex min-h-[77px] w-full max-w-[59.3125rem] flex-col justify-between">
        <HeroDivider />
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PostArticleMeta
            author={doc.author}
            dateLabel={doc.dateLabel}
            readMinutes={doc.readMinutes}
            lang={lang}
          />
          <PostShareActions lang={lang} shareUrl={shareUrl} shareTitle={title} />
        </div>
        <HeroDivider />
      </div>
    </header>
  );
}
