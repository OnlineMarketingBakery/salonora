import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetaRow({ card, lang }: { card: BlogPostOverviewCardT; lang: Locale }) {
  const t = COPY[lang];
  const author = card.authorName.trim() || "—";
  return (
    <div className="flex flex-wrap items-center gap-[18px] text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
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
          <span className="size-6 shrink-0 rounded-full bg-[var(--palette-white)]" aria-hidden />
        )}
        <span>{author}</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <CalendarIcon className="size-6 shrink-0 text-[var(--palette-brand)]" />
        <span>{card.dateLabel || "—"}</span>
      </span>
      <span className="inline-flex items-center gap-0.5">
        <ClockIcon className="size-6 shrink-0 text-[var(--palette-brand)]" />
        <span>{t.minRead(card.readMinutes)}</span>
      </span>
    </div>
  );
}

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
    <section className="border-t border-[color-mix(in_srgb,var(--palette-brand)_12%,transparent)] bg-[var(--palette-white)] py-14 md:py-20">
      <Container>
        <h2 className={`text-center text-4xl font-semibold leading-[1.1] text-[var(--palette-navy)] md:text-[48px] ${REVEAL_ITEM}`}>
          {t.title}
        </h2>
        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
          {items.map((card) => (
            <li key={card.id}>
              <article
                className={`flex h-full flex-col overflow-hidden rounded-[14px] bg-[var(--palette-surface)] p-6 transition hover:shadow-md ${REVEAL_ITEM}`}
              >
                <div className="relative aspect-[369/260] w-full overflow-hidden rounded-[10px] bg-[var(--palette-white)]">
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
                <div className="mt-[18px] flex flex-1 flex-col gap-4">
                  <MetaRow card={card} lang={lang} />
                  <div className="h-px w-full bg-[color-mix(in_srgb,var(--palette-navy)_10%,transparent)]" aria-hidden />
                  <h3 className="text-2xl font-semibold leading-[1.24] text-[var(--palette-navy)]">{card.title}</h3>
                  {card.excerpt ? (
                    <p className="line-clamp-3 flex-1 text-base leading-[1.4] text-[var(--palette-muted)]">{card.excerpt}</p>
                  ) : null}
                  <Link
                    href={card.href}
                    className="mt-1 inline-flex items-center gap-2.5 text-base font-normal leading-[1.4] text-[var(--palette-brand)] hover:underline"
                  >
                    {t.readFallback}
                    <ArrowRightIcon className="size-[16.667px] shrink-0" />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
