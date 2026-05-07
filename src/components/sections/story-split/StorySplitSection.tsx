import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { StorySplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function StorySplitSection({ section, lang }: { section: StorySplitSectionT; lang: Locale }) {
  const theme = section.theme ?? "default";
  const imageStyle = section.imageStyle ?? "card";
  const hasEyebrow = Boolean(section.eyebrow?.trim());
  const hasHighlightLine = Boolean(section.highlightLine?.replace(/<[^>]+>/g, "").trim());

  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  const imageBlock = (() => {
    if (!section.image) return null;
    if (imageStyle === "cutout") {
      return (
        <div className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[540px] shrink-0`}>
          <Media
            image={section.image}
            width={1080}
            height={1080}
            className="h-auto w-full max-w-full object-contain object-bottom"
            sizes="(min-width: 1024px) 520px, 92vw"
            preferLargestSource
          />
        </div>
      );
    }

    return (
      <div className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[460px] shrink-0`}>
        {section.showAccentShape ? (
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-2 z-0 aspect-460/616 w-[min(100%,460px)] max-w-full origin-center rotate-[-4.13deg] rounded-[14px] bg-brand sm:top-3 sm:rounded-2xl"
          />
        ) : null}
        <div
          className={
            section.showAccentShape
              ? "relative z-10 aspect-460/616 w-full max-w-[460px] translate-x-[5%] translate-y-3 overflow-hidden rounded-[14px] sm:translate-x-[22px] sm:translate-y-4 sm:rounded-2xl"
              : "relative z-10 aspect-460/616 w-full max-w-[460px] overflow-hidden rounded-[14px] sm:rounded-2xl"
          }
        >
          <Media
            image={section.image}
            width={920}
            height={1232}
            className="h-full w-full object-cover object-center"
            sizes="(min-width: 1024px) 460px, 90vw"
            preferLargestSource
          />
        </div>
      </div>
    );
  })();

  const copy = (
    <div className={`${REVEAL_ITEM} flex w-full min-w-0 max-w-[748px] flex-col gap-6`}>
      <div className="flex min-w-0 flex-col gap-6">
        {hasEyebrow ? (
          <div className="inline-flex h-[42px] w-fit items-center justify-center rounded-full bg-white/95 px-4 text-base font-medium leading-[1.6] text-brand shadow-[0_10px_22px_color-mix(in_srgb,var(--palette-navy-deep)_16%,transparent)]">
            {section.eyebrow?.trim()}
          </div>
        ) : null}
        {titleLines.length > 0 && (
          <h2
            className={
              theme === "brand_gradient"
                ? "font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[48px] sm:leading-[56px]"
                : "font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[48px] sm:leading-[56px]"
            }
          >
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
        )}
        {section.body ? (
          <RichText
            html={section.body}
            className={
              theme === "brand_gradient"
                ? "!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-white/90 [&_p+_p]:mt-[18px]! [&_strong]:font-bold [&_strong]:text-white"
                : "!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-[18px]! [&_strong]:font-bold [&_strong]:text-navy-deep"
            }
          />
        ) : null}
        {hasHighlightLine ? (
          <RichText
            html={section.highlightLine ?? ""}
            className={
              theme === "brand_gradient"
                ? "text-xl font-semibold leading-[1.6] text-white [&_p]:m-0"
                : "text-xl font-semibold leading-[1.6] text-navy-deep [&_p]:m-0"
            }
          />
        ) : null}
      </div>

      {ctaHref ? (
        <Button
          href={ctaHref}
          target={ctaLink?.target}
          variant="ctaBrand"
          ctaElevation="none"
          ctaFullWidth={false}
          className="h-12! max-w-full self-start whitespace-normal shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:whitespace-nowrap"
          arrowClassName="h-6 w-6"
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );

  const layoutClass =
    theme === "brand_gradient"
      ? "flex flex-col items-center justify-between gap-10 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,var(--palette-brand),var(--palette-brand-strong))] px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:gap-12 lg:px-16"
      : "flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-[37px]";

  return (
    <section className="bg-white py-20 md:py-24">
      <Container className="max-w-340!">
        <div className={layoutClass}>
          {imageBlock}
          {copy}
        </div>
      </Container>
    </section>
  );
}
