import Image from "next/image";
import type { PostAuthorT } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

/** Figma 902:819 (Salonora New Design) — author card */
const CARD =
  "font-sans rounded-[14px] bg-[var(--palette-surface)] py-[30px] pl-[30px] pr-[33px] text-[var(--palette-navy)]";

const TITLE_GREETING = "text-[24px] font-semibold leading-[1.1] text-[var(--palette-navy)]";

const BIO = "whitespace-pre-line text-[16px] font-normal leading-[1.4] text-[var(--palette-muted)]";

/** Figma 902:814 — 30×30 white well, `rounded-[33px]`, 4px inset, 18px glyphs (exported from design) */
const socialBtnClass =
  "inline-flex size-[30px] shrink-0 items-center justify-center rounded-[33px] bg-[var(--palette-white)] p-[4px] text-[var(--palette-brand)] transition hover:opacity-90";

const COPY = {
  nl: {
    title: "Over de auteur",
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    website: "Website",
  },
  en: {
    title: "About the author",
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    website: "Website",
  },
} as const;

/** Figma 902:819 — 18×18 SVG assets from design file (brand `#3990F0` fills) */
function AuthorSocialGlyph({ kind }: { kind: "facebook" | "instagram" | "linkedin" }) {
  return (
    <img
      src={`/images/author-social/${kind}.svg`}
      width={18}
      height={18}
      alt=""
      className="pointer-events-none block size-[18px] shrink-0 select-none"
      loading="lazy"
      decoding="async"
    />
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 0 0 18M12 3a15 15 0 0 1 0 18" />
    </svg>
  );
}

/** Placeholder when no avatar — Figma uses 89px circle */
function AuthorAvatarPlaceholder({ className }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--palette-muted)_14%,var(--palette-white))] ${className ?? ""}`}
      aria-hidden
    >
      <svg className="size-[42%] text-[color-mix(in_srgb,var(--palette-muted)_38%,var(--palette-white))]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </span>
  );
}

/**
 * Author bio card — Figma **902:819** (same on blog + case study).
 * WP user meta: `omb_author_facebook`, `omb_author_instagram` → REST `omb_author_social`.
 */
export function PostAuthorCard({ author, lang }: { author: PostAuthorT; lang: Locale }) {
  const t = COPY[lang];
  if (!author.name && !author.bio) return null;

  const greeting =
    author.name.trim().length > 0
      ? lang === "nl"
        ? `Hallo, ik ben ${author.name}.`
        : `Hi, I'm ${author.name}.`
      : null;

  const avatarSizeClass = "size-[89px] shrink-0";

  const avatarEl = author.avatarUrl ? (
    <Image
      src={author.avatarUrl}
      alt=""
      width={89}
      height={89}
      className={`${avatarSizeClass} rounded-full object-cover`}
      unoptimized
    />
  ) : (
    <AuthorAvatarPlaceholder className={avatarSizeClass} />
  );

  const socialInner =
    author.facebookUrl || author.instagramUrl || author.linkedinUrl || author.profileUrl ? (
      <div className="flex flex-wrap gap-[6px]">
        {author.facebookUrl ? (
          <a
            href={author.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={socialBtnClass}
            aria-label={t.facebook}
          >
            <AuthorSocialGlyph kind="facebook" />
          </a>
        ) : null}
        {author.instagramUrl ? (
          <a
            href={author.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={socialBtnClass}
            aria-label={t.instagram}
          >
            <AuthorSocialGlyph kind="instagram" />
          </a>
        ) : null}
        {author.linkedinUrl ? (
          <a
            href={author.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={socialBtnClass}
            aria-label={t.linkedin}
          >
            <AuthorSocialGlyph kind="linkedin" />
          </a>
        ) : null}
        {author.profileUrl ? (
          <a
            href={author.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={socialBtnClass}
            aria-label={t.website}
          >
            <GlobeIcon className="size-[18px]" />
          </a>
        ) : null}
      </div>
    ) : null;

  const hasCopy = Boolean(greeting || author.bio);

  return (
    <section className={CARD}>
      <div className="flex min-w-0 flex-col gap-4">
        <h2 className={TITLE_GREETING}>{t.title}</h2>

        {avatarEl}

        {hasCopy || socialInner ? (
          <div className="flex min-w-0 flex-col gap-5">
            {hasCopy ? (
              <div className="flex min-w-0 flex-col gap-[14px]">
                {greeting ? <p className={TITLE_GREETING}>{greeting}</p> : null}
                {author.bio ? <p className={BIO}>{author.bio}</p> : null}
              </div>
            ) : null}
            {socialInner}
          </div>
        ) : null}
      </div>
    </section>
  );
}
