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
    <section className="bg-white py-10 lg:py-16">
      <Container className="max-w-[90rem]!">
        <div className="flex flex-col overflow-hidden rounded-2xl shadow-[0_1px_3px_color-mix(in_srgb,var(--palette-navy-deep)_8%,transparent)] lg:flex-row lg:min-h-[min(520px,70vh)]">
          <div
            className={`${REVEAL_ITEM} relative flex min-h-[320px] flex-1 basis-1/2 items-end justify-center overflow-hidden bg-[var(--palette-navy-deep)] px-6 pb-10 pt-14 sm:min-h-[380px] lg:min-h-0 lg:px-10 lg:pb-14 lg:pt-16`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-[42%] top-[62%] h-[min(132vw,700px)] w-[min(132vw,700px)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--palette-brand)] opacity-[0.28]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-[20%] top-[72%] h-[min(95vw,480px)] w-[min(95vw,480px)] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:color-mix(in_srgb,var(--palette-brand)_55%,transparent)] opacity-40"
            />
            {section.image ? (
              <div className="relative z-10 w-full max-w-[556px]">
                <Media
                  image={section.image}
                  width={1112}
                  height={956}
                  className="h-auto w-full object-contain object-bottom"
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  preferLargestSource
                />
              </div>
            ) : null}
          </div>

          <div
            className={`${REVEAL_ITEM} flex flex-1 basis-1/2 flex-col justify-center gap-6 bg-[var(--palette-surface)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16`}
          >
            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[var(--palette-navy)] sm:text-[40px] sm:leading-[1.1] lg:text-[48px] lg:leading-[56px]">
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
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-[14px]! [&_strong]:font-semibold [&_strong]:text-[var(--palette-navy)]"
              />
            ) : null}

            {section.highlightLine ? (
              <>
                <div
                  aria-hidden
                  className="h-px w-full max-w-[33.75rem] bg-[color:color-mix(in_srgb,var(--palette-brand)_42%,transparent)]"
                />
                <RichText
                  html={section.highlightLine}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left [&_p]:text-[22px]! [&_p]:font-semibold! [&_p]:leading-snug! [&_p]:text-[var(--palette-brand)]! sm:[&_p]:text-2xl!"
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
                className="mt-2 h-12! max-w-full self-start whitespace-normal shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:whitespace-nowrap"
                arrowClassName="h-6 w-6"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
