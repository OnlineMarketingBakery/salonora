import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { BlogPostOverviewCardT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { title: "Gerelateerde blogs", readFallback: "Lees de blog", minRead: (n: number) => `${n} minuten` },
  en: { title: "Related posts", readFallback: "Read article", minRead: (n: number) => `${n} min read` },
} as const;

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

function MetaRow({ card, lang }: { card: BlogPostOverviewCardT; lang: Locale }) {
  const t = COPY[lang];
  const author = card.authorName.trim() || "—";
  return (
    <div className="flex flex-wrap items-center gap-[18px] text-base font-normal leading-[1.4] text-muted">
      <span className="inline-flex items-center gap-0.5">
        {card.authorAvatarUrl ? (
          <Image
            src={card.authorAvatarUrl}
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-full object-cover"
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
        <span className="inline-flex size-6 shrink-0 items-center justify-center text-brand">
          <CalendarIcon className="size-6" />
        </span>
        <span>{card.dateLabel || "—"}</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <span className="inline-flex size-6 shrink-0 items-center justify-center text-brand">
          <ClockIcon className="size-6" />
        </span>
        <span>{t.minRead(card.readMinutes)}</span>
      </span>
    </div>
  );
}

/** Figma 1643:147–209 — related posts (1299px band, 417px cards, 64px title gap). */
export function PostRelatedGrid({
  items,
  lang,
}: {
  items: BlogPostOverviewCardT[];
  lang: Locale;
}) {
  if (items.length === 0) return null;
  const t = COPY[lang];
  return (
    <section className="blog-single-related bg-white py-14 md:py-20">
      <Container>
        <div className="mx-auto w-full max-w-[81.1875rem]">
          <h2 className={`text-center text-4xl font-semibold leading-[1.1] text-navy md:text-[48px] ${REVEAL_ITEM}`}>
            {t.title}
          </h2>
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {items.map((card) => (
              <li key={card.id} className="flex justify-center">
                <article
                  className={`flex h-full w-full max-w-[26.0625rem] flex-col overflow-hidden rounded-[14px] bg-surface p-6 transition hover:shadow-[0_6px_24px_rgba(57,144,240,0.12)] ${REVEAL_ITEM}`}
                >
                  <div className="relative aspect-[369/260] w-full overflow-hidden rounded-[10px] bg-white">
                    {card.image ? (
                      <Image
                        src={card.image.url}
                        alt={card.image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="mt-7 flex min-h-0 flex-1 flex-col gap-4">
                    <MetaRow card={card} lang={lang} />
                    <div className="h-px w-full bg-[color-mix(in_srgb,var(--palette-navy)_10%,transparent)]" aria-hidden />
                    <div className="flex min-h-0 flex-1 flex-col gap-3">
                      <h3 className="text-2xl font-semibold leading-[1.24] text-navy">{card.title}</h3>
                      {card.excerpt ? (
                        <p className="line-clamp-3 flex-1 text-base font-normal leading-[1.4] text-muted">
                          {card.excerpt}
                        </p>
                      ) : null}
                      <Link
                        href={card.href}
                        className="mt-auto inline-flex items-center gap-2.5 text-base font-normal leading-[1.4] text-brand no-underline transition hover:opacity-90"
                      >
                        {t.readFallback}
                        <ArrowInCircle variant="on-light" className="size-[16.667px]" />
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
