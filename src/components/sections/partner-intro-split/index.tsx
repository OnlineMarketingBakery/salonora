import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { PartnerIntroSplitSectionT } from "@/types/sections";

export function PartnerIntroSplitSection({
  section,
  lang,
}: {
  section: PartnerIntroSplitSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  return (
    <section className="bg-[var(--palette-white)] py-10 lg:py-16">
      <Container className="!max-w-[90rem]">
        {/* Reference: sharp 50/50; left navy + portal disc; right pale surface (~Figma 597:2353). */}
        <div className="flex min-h-0 flex-col overflow-hidden lg:min-h-[523px] lg:flex-row lg:items-stretch">
          <div
            className={`${REVEAL_ITEM} relative flex min-h-[360px] w-full shrink-0 flex-col items-center justify-end overflow-hidden bg-navy-deep lg:w-1/2 lg:max-w-none lg:flex-1 lg:items-center lg:pb-12 lg:pt-14`}
          >
            {/* Vibrant gradient disc anchored bottom-left (“portal”), full white rim + soft glow — matches reference comps. */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 aspect-square w-[min(168vw,920px)] max-w-none translate-x-[-46%] translate-y-[34%] rounded-full border-2 border-(--palette-white) bg-[radial-gradient(circle_at_30%_72%,var(--palette-brand)_0%,var(--palette-brand-strong)_36%,color-mix(in_srgb,var(--palette-navy-deep)_22%,var(--palette-brand-strong))_72%,color-mix(in_srgb,var(--palette-navy-deep)_55%,var(--palette-brand-strong))_100%)] shadow-[0_0_72px_12px_color-mix(in_srgb,var(--palette-brand)_36%,transparent)] sm:w-[min(140vw,880px)] sm:translate-x-[-42%] sm:translate-y-[32%] lg:w-[min(135%,860px)] lg:translate-x-[-44%] lg:translate-y-[36%]"
            />
            {section.image ? (
              <div className="relative z-10 flex w-full justify-center px-5 pb-8 pt-10 sm:px-8 sm:pb-10 lg:max-w-[556px] lg:px-0 lg:pb-14">
                <Media
                  image={section.image}
                  width={1112}
                  height={956}
                  className="h-auto w-full max-w-[556px] object-contain object-bottom -mb-14"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  preferLargestSource
                />
              </div>
            ) : null}
          </div>

          <div
            className={`${REVEAL_ITEM} flex w-full shrink-0 flex-col justify-center gap-6 bg-surface px-6 py-10 sm:px-10 sm:py-12 lg:w-1/2 lg:flex-1 lg:gap-6 lg:px-16 lg:py-16`}
          >
            <div className="mx-auto flex w-full max-w-[35.125rem] flex-col gap-6 lg:mx-0">
              {titleLines.length > 0 ? (
                <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[40px] sm:leading-[1.1] lg:text-[48px] lg:leading-[56px]">
                  {titleLines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              ) : null}

              {section.body ? (
                <RichText
                  html={section.body}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-[14px]! [&_strong]:font-semibold [&_strong]:text-navy"
                />
              ) : null}

              {section.highlightLine ? (
                <>
                  <div
                    aria-hidden
                    className="h-px w-full max-w-[33.59375rem] bg-[color-mix(in_srgb,var(--palette-brand)_42%,transparent)]"
                  />
                  <RichText
                    html={section.highlightLine}
                    className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left [&_p]:text-[22px]! [&_p]:font-semibold! [&_p]:leading-snug! [&_p]:text-brand! sm:[&_p]:text-2xl! sm:[&_p]:leading-[1.22]!"
                  />
                </>
              ) : null}

              {ctaHref ? (
                <Button
                  href={ctaHref}
                  target={ctaLink?.target}
                  variant="ctaBrand"
                  ctaElevation="none"
                  ctaFullWidth={false}
                  className="mt-1 h-12! max-w-full self-start whitespace-normal shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:whitespace-nowrap"
                  arrowClassName="h-6 w-6"
                >
                  {ctaLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
