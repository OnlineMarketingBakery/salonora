import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";

/** Figma **892:603** — 44×44 calendar well (pill fill + stroke + brand glyph). */
function BlogMetaCalendarWell({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="0.5"
        y="0.5"
        width="43"
        height="43"
        rx="21.5"
        fill="var(--palette-pill)"
        stroke="color-mix(in srgb, var(--palette-brand) 18%, var(--palette-white))"
      />
      <path
        d="M19.5 12.6667V14.3333H24.5V12.6667H26.1667V14.3333H29.5C29.9602 14.3333 30.3333 14.7064 30.3333 15.1667V28.5C30.3333 28.9602 29.9602 29.3333 29.5 29.3333H14.5C14.0398 29.3333 13.6667 28.9602 13.6667 28.5V15.1667C13.6667 14.7064 14.0398 14.3333 14.5 14.3333H17.8333V12.6667H19.5ZM28.6667 21H15.3333V27.6667H28.6667V21ZM17.8333 16H15.3333V19.3333H28.6667V16H26.1667V17.6667H24.5V16H19.5V17.6667H17.8333V16Z"
        fill="var(--palette-brand)"
      />
    </svg>
  );
}

/** Figma **892:603** — 44×44 clock well. */
function BlogMetaClockWell({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="0.5"
        y="0.5"
        width="43"
        height="43"
        rx="21.5"
        fill="var(--palette-pill)"
        stroke="color-mix(in srgb, var(--palette-brand) 18%, var(--palette-white))"
      />
      <path
        d="M22 31C17.0294 31 13 26.9705 13 22C13 17.0294 17.0294 13 22 13C26.9705 13 31 17.0294 31 22C31 26.9705 26.9705 31 22 31ZM22 29.2C25.9765 29.2 29.2 25.9765 29.2 22C29.2 18.0235 25.9765 14.8 22 14.8C18.0235 14.8 14.8 18.0235 14.8 22C14.8 25.9765 18.0235 29.2 22 29.2ZM22.9 22H26.5V23.8H21.1V17.5H22.9V22Z"
        fill="var(--palette-brand)"
      />
    </svg>
  );
}

/** Figma **892:603** / **1643:237** hairline between meta rows. */
export function BlogMetaDivider() {
  return <div className="h-px w-full shrink-0 bg-[#acc6ea]" aria-hidden />;
}

const READ_COPY = {
  nl: (n: number) => `${n} minuten`,
  en: (n: number) => `${n} min read`,
} as const;

export type BlogPostMetaRowProps = {
  authorName: string;
  authorAvatarUrl: string | null;
  dateLabel: string;
  readMinutes: number;
  lang: Locale;
  /** `featured` — Figma 892:603 (44px wells). `compact` — Figma 892:617 grid cards (24px icons). */
  variant?: "featured" | "compact";
};

export function BlogPostMetaRow({
  authorName,
  authorAvatarUrl,
  dateLabel,
  readMinutes,
  lang,
  variant = "featured",
}: BlogPostMetaRowProps) {
  const isFeatured = variant === "featured";
  const author = authorName.trim() || "—";
  const readLabel = READ_COPY[lang](readMinutes);

  if (isFeatured) {
    return (
      <div className="flex flex-wrap items-center gap-6 text-base font-medium leading-[1.4] text-navy">
        <span className="inline-flex items-center gap-[7px]">
          {authorAvatarUrl ? (
            <Image
              src={authorAvatarUrl}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <span
              className="size-11 shrink-0 rounded-full bg-pill ring-1 ring-[color-mix(in_srgb,var(--palette-brand)_18%,var(--palette-white))]"
              aria-hidden
            />
          )}
          <span>{author}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <BlogMetaCalendarWell className="size-11 shrink-0" />
          <span>{dateLabel || "—"}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <BlogMetaClockWell className="size-11 shrink-0" />
          <span>{readLabel}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-[18px] text-base font-normal leading-[1.4] text-muted">
      <span className="inline-flex items-center gap-0.5">
        {authorAvatarUrl ? (
          <Image
            src={authorAvatarUrl}
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span
            className="size-6 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--palette-brand)_10%,var(--palette-white))]"
            aria-hidden
          />
        )}
        <span>{author}</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <BlogMetaCalendarWell className="size-6 shrink-0" />
        <span>{dateLabel || "—"}</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <BlogMetaClockWell className="size-6 shrink-0" />
        <span>{readLabel}</span>
      </span>
    </div>
  );
}

/** Figma **892:603** — dividers + 18px vertical rhythm around meta row. */
export function BlogFeaturedMetaBand(props: BlogPostMetaRowProps) {
  return (
    <div className="flex w-full flex-col gap-[18px]">
      <BlogMetaDivider />
      <BlogPostMetaRow {...props} variant="featured" />
      <BlogMetaDivider />
    </div>
  );
}
