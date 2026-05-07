import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { resolveLink } from "@/lib/utils/links";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { ctaVariantAt } from "@/lib/ui/ctaAlternation";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { HeroSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function HeroSection({ section, lang }: { section: HeroSectionT; lang: Locale }) {
  const showSocial = Boolean(section.trustImage || section.trustLine);
  const isCompact = section.variant === "compact";
  const hasTagline = Boolean(section.tagline?.trim());
  const hasFloatingCard = Boolean(
    section.floatingCard?.replace(/<[^>]+>/g, "").trim()
  );
  const sectionPaddingClass = isCompact
    ? "pt-20 sm:pt-24 md:pt-28"
    : "pt-28 sm:pt-32 md:pt-36";
  const titleSizeClass = isCompact
    ? "text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3.25rem] lg:leading-[3.75rem]"
    : "text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl md:text-5xl lg:text-[4rem] lg:leading-[4.625rem]";

  const offerSize = section.offerTextSize ?? "large";
  const offerSizeClass =
    offerSize === "small"
      ? "text-lg sm:text-xl lg:text-[24px]"
      : offerSize === "medium"
        ? "text-xl sm:text-2xl lg:text-[30px]"
        : "text-2xl sm:text-3xl lg:text-[36px]";

  return (
    <section className={`relative overflow-hidden pb-0 ${sectionPaddingClass}`}>
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-gradiant.png')" }}
        aria-hidden
      />
      <Container>
        <div className="grid min-w-0 items-stretch lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)]">
          <div className="min-w-0 w-full self-start pb-10 sm:pb-12 lg:pb-[60px]">
            {section.eyebrow && (
              <p
                className={`${REVEAL_ITEM} mb-2 text-base font-medium leading-normal text-brand sm:text-lg md:text-[20px] md:leading-relaxed`}
              >
                {section.eyebrow}
              </p>
            )}
            {hasTagline && (
              <p
                className={`${REVEAL_ITEM} mb-3 text-sm font-normal leading-snug text-muted sm:text-base`}
              >
                {section.tagline?.trim()}
              </p>
            )}
            <h1 className={`${REVEAL_ITEM} ${titleSizeClass}`}>
              {section.title}
            </h1>
            {section.text && (
              <RichText html={section.text} className={`${REVEAL_ITEM} mt-4 text-base leading-relaxed text-muted`} />
            )}
            {section.offerText && (
              <RichText
                html={section.offerText}
                className={`${REVEAL_ITEM} mt-3 !prose-p:text-inherit ${offerSizeClass} font-semibold !text-accent !prose-p:text-inherit !prose-strong:text-navy lg:mt-4 [&_p]:!m-0 [&_p]:leading-tight`}
              />
            )}
            {section.ctas.length > 0 && (
              <div className={`${REVEAL_ITEM} mt-8 flex w-full min-w-0 flex-row flex-wrap items-start gap-[18px] sm:mt-9`}>
                {section.ctas.map((cta, i) => {
                  const r = resolveLink(cta.url, lang);
                  if (!r) return null;
                  return (
                    <Button
                      key={`${section.id}-cta-${i}`}
                      href={r.href}
                      target={r.target}
                      variant={ctaVariantAt(i)}
                      ctaSize="hero"
                      ctaFullWidth={false}
                    >
                      {cta.text || r.label}
                    </Button>
                  );
                })}
              </div>
            )}
            {showSocial && (
              <div
                className={`${REVEAL_ITEM} mt-9 flex flex-col items-start justify-start gap-2 sm:mt-10 sm:flex-row sm:items-center sm:gap-4`}
              >
                {section.trustImage && (
                  <Media
                    image={section.trustImage}
                    preferLargestSource
                    width={960}
                    height={180}
                    sizes="(max-width: 640px) 92vw, 480px"
                    quality={92}
                    className="h-10 w-auto max-w-full shrink-0 object-contain object-left sm:h-12"
                  />
                )}
                {section.trustLine && (
                  <div className="flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
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
          {section.behindImage && (
            <div className="pointer-events-none absolute inset-y-0 pt-32 right-0 z-0 flex w-1/2 min-w-0 items-end justify-end">
              <Media
                image={section.behindImage}
                preferLargestSource
                className="h-auto max-h-full w-full object-contain object-bottom object-right"
                width={560}
                height={640}
                sizes="100vw"
                quality={90}
              />
            </div>
          )}
          <div className={`${REVEAL_ITEM} relative flex w-full min-w-0 items-end self-stretch lg:h-full lg:pt-2`}>
            {section.image && (
              <Media
                image={section.image}
                className="relative z-10 h-auto w-full max-w-none object-contain object-bottom"
                width={600}
                height={750}
                sizes="(min-width: 1024px) 38vw, 100vw"
              />
            )}
            {hasFloatingCard && (
              <div
                className="pointer-events-auto absolute z-20 left-1/2 top-auto bottom-6 w-[min(86%,260px)] -translate-x-1/2 rounded-2xl bg-white px-5 py-4 shadow-[0_11px_24px_color-mix(in_srgb,var(--palette-muted)_12%,transparent)] sm:bottom-8 lg:left-auto lg:right-0 lg:translate-x-0 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 lg:px-6 lg:py-5"
              >
                <RichText
                  html={section.floatingCard ?? ""}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-sm !prose-p:font-medium !prose-p:leading-snug !prose-p:text-navy-deep sm:!prose-p:text-base [&_p+_p]:mt-2!"
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
