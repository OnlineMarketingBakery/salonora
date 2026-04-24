import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { resolveLink } from "@/lib/utils/links";
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { PrimaryCtaLink } from "@/components/ui/PrimaryCtaLink";
import { StarRating } from "@/components/ui/StarRating";
import type { HeroSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const heroSecondary =
  "group inline-flex h-12 w-full min-w-0 max-w-full items-center justify-center gap-[17px] rounded-[24px] bg-white px-3.5 text-base font-medium leading-normal text-navy shadow-[0px_6px_20px_0px_rgba(57,144,240,0.54)] transition font-sans hover:brightness-[0.99]";

export function HeroSection({ section, lang }: { section: HeroSectionT; lang: Locale }) {
  const showSocial = Boolean(section.trustImage || section.trustLine);
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 md:pt-36 pb-0">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/25 via-surface/50 to-surface"
        aria-hidden
      />
      <Container>
        <div className="grid min-w-0 items-stretch lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)]">
          <div className="min-w-0 w-full self-start pb-10 sm:pb-12 lg:pb-[60px]">
            {section.eyebrow && (
              <p className="mb-2 text-base font-medium leading-normal text-brand sm:text-lg md:text-[20px] md:leading-relaxed">
                {section.eyebrow}
              </p>
            )}
            <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl md:text-5xl lg:text-[4rem] lg:leading-[4.625rem]">
              {section.title}
            </h1>
            {section.text && <RichText html={section.text} className="mt-4 text-base leading-relaxed text-muted" />}
            {section.offerText && (
              <RichText
                html={section.offerText}
                className="mt-3 !prose-p:text-inherit text-2xl font-semibold !text-accent !prose-p:text-inherit !prose-strong:text-navy sm:text-3xl lg:mt-4 lg:text-[36px] [&_p]:!m-0 [&_p]:leading-tight"
              />
            )}
            <div className="mt-8 flex max-w-[475px] flex-col items-start gap-[18px] sm:mt-9">
              {section.ctas.map((cta, i) => {
                const r = resolveLink(cta.url, lang);
                if (!r) return null;
                if (i === 0) {
                  return (
                    <PrimaryCtaLink
                      key={`${section.id}-cta-${i}`}
                      href={r.href}
                      target={r.target}
                      size="hero"
                    >
                      {cta.text || r.label}
                    </PrimaryCtaLink>
                  );
                }
                return (
                  <Link
                    key={`${section.id}-cta-${i}`}
                    href={r.href}
                    target={r.target}
                    rel={r.target === "_blank" ? "noopener noreferrer" : undefined}
                    className={heroSecondary}
                  >
                    <span className="min-w-0 break-words text-balance sm:whitespace-nowrap">{cta.text || r.label}</span>
                    <ArrowInCircle variant="on-light" />
                  </Link>
                );
              })}
            </div>
            {showSocial && (
              <div className="mt-9 flex flex-col justify-start gap-2 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                {section.trustImage && (
                  <Media
                    image={section.trustImage}
                    preferLargestSource
                    width={960}
                    height={180}
                    sizes="(max-width: 640px) 92vw, 480px"
                    quality={92}
                    className="h-10 w-auto max-w-full shrink-0 sm:h-12"
                  />
                )}
                {section.trustLine && (
                  <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
                    <StarRating className="shrink-0" />
                    <RichText
                      html={section.trustLine}
                      className="text-sm font-medium leading-normal tracking-[-0.04em] text-muted [&_strong]:font-bold [&_strong]:text-navy"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative flex w-full min-w-0 items-end self-stretch lg:h-full lg:pt-2">
            {section.image && (
              <Media
                image={section.image}
                className="h-auto w-full max-w-none object-contain object-bottom"
                width={600}
                height={750}
                sizes="(min-width: 1024px) 38vw, 100vw"
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
