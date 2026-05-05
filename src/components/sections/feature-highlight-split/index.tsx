import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { resolveLink } from "@/lib/utils/links";
import type { FeatureHighlightSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { CSSProperties } from "react";

function linesFromHeading(raw: string | undefined): string[] {
  return (raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

const sectionBackdrop: CSSProperties = {
  background: `
    radial-gradient(
      ellipse 120% 85% at 50% 0%,
      color-mix(in srgb, var(--palette-brand) 18%, var(--palette-white)) 0%,
      var(--palette-surface) 42%,
      color-mix(in srgb, var(--palette-brand) 7%, var(--palette-surface)) 100%
    )
  `,
};

const cardFace: CSSProperties = {
  background: `linear-gradient(
    90deg,
    var(--palette-white) 0%,
    color-mix(in srgb, var(--palette-white) 53%, transparent) 100%
  )`,
  boxShadow: `0 11px 12px color-mix(in srgb, var(--palette-muted) 12%, transparent)`,
};

const cardProse = [
  "!prose-p:mb-1 !prose-p:mt-0 last:!prose-p:mb-0",
  "!prose-p:max-w-none !prose-p:text-lg !prose-p:font-medium !prose-p:leading-snug",
  "!prose-p:text-navy-deep prose-strong:text-navy-deep",
  "[&_p+_p]:!mt-1",
].join(" ");

export function FeatureHighlightSplitSection({
  section,
  lang,
}: {
  section: FeatureHighlightSplitSectionT;
  lang: Locale;
}) {
  const titleLines = linesFromHeading(section.title);
  const ctas = section.ctas ?? [];
  const primaryCta = ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel = primaryCta?.text || ctaLink?.label || "";

  const promises = (section.promise_items ?? []).filter((p) => p.text?.trim());
  const mockup = section.mockup_image ?? null;

  const hasLeft =
    Boolean(section.badge?.trim()) ||
    titleLines.length > 0 ||
    Boolean(ctaHref && ctaLabel.trim());
  const hasVisual = Boolean(mockup);
  const hasPromises = promises.length > 0;

  const leftCol =
    hasVisual ? "lg:col-span-3 lg:max-w-sm xl:col-span-3" : "lg:col-span-6 lg:max-w-none";
  const visualCol = "lg:col-span-5 xl:col-span-6";
  const promisesCol =
    hasVisual ? "lg:col-span-4 xl:col-span-3" : "lg:col-span-6";

  if (!hasLeft && !hasVisual && !hasPromises) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 md:py-24" style={sectionBackdrop}>
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background: `radial-gradient(
            ellipse 80% 55% at 50% 100%,
            color-mix(in srgb, var(--palette-brand) 12%, transparent) 0%,
            transparent 65%
          )`,
        }}
      />
      <Container className="relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {hasLeft ? (
            <div className={`${REVEAL_ITEM} flex flex-col gap-7 ${leftCol}`}>
              <div className="flex flex-col gap-5">
                {section.badge?.trim() ? (
                  <Button
                    type="button"
                    variant="white"
                    className="h-auto min-h-0 w-fit rounded-full border-0 bg-white px-5 py-2.5 text-base font-medium leading-relaxed text-brand shadow-none hover:bg-white"
                  >
                    {section.badge.trim()}
                  </Button>
                ) : null}
                {titleLines.length > 0 ? (
                  <h2 className="font-sans text-4xl font-semibold leading-tight tracking-tight text-navy-deep sm:text-5xl md:text-6xl md:leading-none lg:text-7xl lg:leading-none">
                    {titleLines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </h2>
                ) : null}
              </div>
              {ctaHref && ctaLabel.trim() ? (
                <Button
                  href={ctaHref}
                  target={ctaLink?.target}
                  variant="ctaBrand"
                  ctaSize="package"
                  ctaElevation="default"
                  ctaFullWidth={false}
                  className="max-w-full self-start sm:w-auto"
                  arrowClassName="size-7 shrink-0"
                >
                  {ctaLabel.trim()}
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasVisual && mockup ? (
            <div className={`${REVEAL_ITEM} flex justify-center ${visualCol} lg:justify-center`}>
              <div className="relative w-full max-w-lg">
                <Media
                  image={mockup}
                  width={568}
                  height={618}
                  className="mx-auto h-auto w-full max-w-full object-contain"
                  sizes="(min-width: 1024px) 42vw, 90vw"
                  preferLargestSource
                />
              </div>
            </div>
          ) : null}

          {hasPromises ? (
            <div className={`${REVEAL_ITEM} flex flex-col gap-5 ${promisesCol}`}>
              {promises.map((item, i) => (
                <div
                  key={i}
                  className="flex min-h-20 flex-col justify-center rounded-xl px-8 py-6 sm:min-h-20 sm:px-8 sm:py-8"
                  style={cardFace}
                >
                  <RichText html={item.text ?? ""} className={`max-w-none ${cardProse}`} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
