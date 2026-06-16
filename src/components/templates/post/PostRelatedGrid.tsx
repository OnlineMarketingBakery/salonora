import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { BlogPostMetaRow } from "@/components/blog/BlogPostMetaRow";
import type { BlogPostOverviewCardT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { title: "Gerelateerde blogs", readFallback: "Lees de blog" },
  en: { title: "Related posts", readFallback: "Read article" },
} as const;

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
                    <BlogPostMetaRow
                      authorName={card.authorName}
                      authorAvatarUrl={card.authorAvatarUrl}
                      dateLabel={card.dateLabel}
                      readMinutes={card.readMinutes}
                      lang={lang}
                      variant="compact"
                    />
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
