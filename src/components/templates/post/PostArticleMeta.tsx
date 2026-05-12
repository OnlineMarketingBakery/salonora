import Image from "next/image";
import type { PostAuthorT } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 3.5h1.5V2.75a.75.75 0 011.5 0V3.5h4V2.75a.75.75 0 011.5 0V3.5H15A1.5 1.5 0 0116.5 5v10A1.5 1.5 0 0115 16.5H5A1.5 1.5 0 013.5 15V5A1.5 1.5 0 015 3.5zm-1 4v8.5h11V7.5h-11z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3a7 7 0 110 14 7 7 0 010-14zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm.75 2.25a.75.75 0 00-1.5 0V10a.75.75 0 00.22.53l2 2a.75.75 0 101.06-1.06l-1.78-1.78V6.75z"
        fill="currentColor"
      />
    </svg>
  );
}

const COPY = {
  nl: { readLabel: "Leestijd", minRead: (n: number) => `${n} minuten` },
  en: { readLabel: "Reading time", minRead: (n: number) => `${n} min read` },
} as const;

export function PostArticleMeta({
  author,
  dateLabel,
  readMinutes,
  lang,
}: {
  author: PostAuthorT;
  dateLabel: string;
  readMinutes: number;
  lang: Locale;
}) {
  const t = COPY[lang];
  const authorName = author.name.trim() || "—";
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[16px] font-medium leading-[1.4] text-[var(--palette-navy)]">
      <span className="inline-flex items-center gap-3">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt=""
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span
            className="size-11 shrink-0 rounded-full bg-[var(--palette-surface)] ring-1 ring-[color-mix(in_srgb,var(--palette-brand)_12%,transparent)]"
            aria-hidden
          />
        )}
        <span>{authorName}</span>
      </span>
      <span className="inline-flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--palette-surface)] ring-1 ring-[color-mix(in_srgb,var(--palette-brand)_10%,transparent)]"
          aria-hidden
        >
          <CalendarIcon className="size-5 text-[var(--palette-brand)]" />
        </span>
        <span>{dateLabel || "—"}</span>
      </span>
      <span className="inline-flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--palette-surface)] ring-1 ring-[color-mix(in_srgb,var(--palette-brand)_10%,transparent)]"
          aria-hidden
        >
          <ClockIcon className="size-5 text-[var(--palette-brand)]" />
        </span>
        <span>
          {lang === "nl" ? (
            <>
              {t.readLabel} {t.minRead(readMinutes)}
            </>
          ) : (
            <>
              {t.readLabel}: {t.minRead(readMinutes)}
            </>
          )}
        </span>
      </span>
    </div>
  );
}
