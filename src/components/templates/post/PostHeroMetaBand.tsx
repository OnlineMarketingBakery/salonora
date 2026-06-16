import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";
import type { PostAuthorT } from "@/types/documents";
import { PostArticleMeta } from "./PostArticleMeta";
import { PostShareActions } from "./PostShareActions";

const READ_COPY = {
  nl: (n: number) => `${n} minuten`,
  en: (n: number) => `${n} min read`,
} as const;

function AuthorChip({
  author,
}: {
  author: PostAuthorT;
}) {
  const name = author.name.trim() || "—";
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      {author.avatarUrl ? (
        <Image
          src={author.avatarUrl}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <span
          className="size-10 shrink-0 rounded-full bg-pill ring-1 ring-[color-mix(in_srgb,var(--palette-brand)_18%,var(--palette-white))]"
          aria-hidden
        />
      )}
      <span className="min-w-0 truncate text-base font-medium leading-snug text-navy">
        {name}
      </span>
    </div>
  );
}

export function PostHeroMetaBand({
  author,
  dateLabel,
  readMinutes,
  lang,
  shareUrl,
  shareTitle,
}: {
  author: PostAuthorT;
  dateLabel: string;
  readMinutes: number;
  lang: Locale;
  shareUrl: string;
  shareTitle: string;
}) {
  const readLabel = READ_COPY[lang](readMinutes);
  const date = dateLabel.trim() || "—";

  return (
    <>
      {/* Mobile — author + share on one row; date + read time as a quiet second line */}
      <div className="flex min-w-0 w-full flex-col gap-2 lg:hidden">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <AuthorChip author={author} />
          <PostShareActions
            lang={lang}
            shareUrl={shareUrl}
            shareTitle={shareTitle}
            size="compact"
            className="shrink-0"
          />
        </div>
        <p className="m-0 text-sm leading-snug text-muted">
          <span>{date}</span>
          <span className="px-2 text-brand/35" aria-hidden>
            ·
          </span>
          <span>{readLabel}</span>
        </p>
      </div>

      {/* Desktop — Figma 1643:237 featured wells + share */}
      <div className="hidden min-w-0 w-full flex-wrap items-center justify-between gap-4 lg:flex">
        <PostArticleMeta
          author={author}
          dateLabel={dateLabel}
          readMinutes={readMinutes}
          lang={lang}
        />
        <PostShareActions
          lang={lang}
          shareUrl={shareUrl}
          shareTitle={shareTitle}
          className="shrink-0"
        />
      </div>
    </>
  );
}
