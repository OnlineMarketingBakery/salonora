import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { CaseStudyOverviewCardT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  nl: { title: "Meer casestudies van Salonora", readFallback: "Lees de casestudy" },
  en: { title: "More case studies from Salonora", readFallback: "Read the case study" },
} as const;

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

function CaseStudyCardLinkArrow() {
  return (
    <span
      className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--palette-brand)] text-[var(--palette-brand)]"
      aria-hidden
    >
      <ArrowRightIcon className="size-2.5" />
    </span>
  );
}

export function CaseStudyRelatedGrid({
  items,
  lang,
}: {
  items: CaseStudyOverviewCardT[];
  lang: Locale;
}) {
  if (items.length === 0) return null;
  const t = COPY[lang];
  return (
    <section className="border-t border-[color-mix(in_srgb,var(--palette-brand)_12%,transparent)] bg-[var(--palette-white)] py-16 md:py-24">
      <Container>
        <h2
          className={`text-center text-4xl font-semibold leading-[1.1] text-[var(--palette-navy)] md:text-[48px] ${REVEAL_ITEM}`}
        >
          {t.title}
        </h2>
        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
          {items.map((card) => (
            <li key={card.id}>
              <article
                className={`flex h-full flex-col gap-5 overflow-hidden rounded-[14px] bg-[var(--palette-surface)] p-6 transition hover:shadow-md ${REVEAL_ITEM}`}
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
                <div className="flex min-h-0 flex-1 flex-col gap-4">
                  {card.projectLabel ? (
                    <p className="text-base font-medium leading-[1.4] text-[var(--palette-brand)]">{card.projectLabel}</p>
                  ) : null}
                  {card.projectLabel ? (
                    <div className="h-px w-full bg-[rgba(57,144,240,0.2)]" aria-hidden />
                  ) : null}
                  <h3 className="text-2xl font-semibold leading-[1.2] text-[var(--palette-navy)] md:text-[1.75rem]">
                    {card.title}
                  </h3>
                  {card.excerpt ? <span className="sr-only">{card.excerpt}</span> : null}
                  <Link
                    href={card.href}
                    className="mt-auto inline-flex items-center gap-2.5 text-base font-normal leading-[1.4] text-[var(--palette-brand)] no-underline transition hover:opacity-90"
                  >
                    {t.readFallback}
                    <CaseStudyCardLinkArrow />
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
