import Image from "next/image";
import type { PostAuthorT } from "@/types/documents";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { title: "Over de auteur" },
  en: { title: "About the author" },
} as const;

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function PostAuthorCard({ author, lang }: { author: PostAuthorT; lang: Locale }) {
  const t = COPY[lang];
  if (!author.name && !author.bio) return null;
  return (
    <section className="rounded-[14px] border border-[color-mix(in_srgb,var(--palette-brand)_16%,transparent)] bg-[var(--palette-surface)] px-[30px] py-[30px]">
      <h2 className="text-2xl font-semibold leading-[1.1] text-[var(--palette-navy)]">{t.title}</h2>
      <div className="mt-4 flex gap-4">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt=""
            width={89}
            height={89}
            className="size-[5.5625rem] shrink-0 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="size-[5.5625rem] shrink-0 rounded-full bg-[var(--palette-white)] ring-1 ring-[color-mix(in_srgb,var(--palette-brand)_12%,transparent)]" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          {author.name ? (
            <p className="text-2xl font-semibold leading-[1.1] text-[var(--palette-navy)]">{author.name}</p>
          ) : null}
          {author.bio ? <p className="mt-[14px] text-base font-normal leading-[1.4] text-[var(--palette-muted)]">{author.bio}</p> : null}
          {(author.linkedinUrl || author.profileUrl) && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {author.linkedinUrl ? (
                <a
                  href={author.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-[30px] items-center justify-center rounded-full bg-[var(--palette-white)] text-[var(--palette-brand)] transition hover:bg-[var(--palette-brand)] hover:text-white"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="size-[18px]" />
                </a>
              ) : null}
              {author.profileUrl ? (
                <a
                  href={author.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[30px] items-center rounded-full bg-[var(--palette-white)] px-3 text-sm font-medium text-[var(--palette-brand)] transition hover:bg-[var(--palette-brand)] hover:text-white"
                >
                  {lang === "nl" ? "Website" : "Website"}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
