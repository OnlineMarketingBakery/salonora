import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import type { AboutVisualSplitSectionT } from "@/types/sections";
import type { CSSProperties } from "react";

const floatingCardClassName =
  "mt-8 max-w-[280px] rounded-2xl bg-white px-5 py-4 shadow-[0px_11px_24px_color-mix(in_srgb,var(--palette-muted)_12%,transparent)] lg:absolute lg:mt-0 lg:max-w-[min(100%,260px)] lg:-translate-y-1/2 lg:translate-x-2 lg:right-0 lg:top-[46%] lg:px-6 lg:py-5";

function titleLines(raw: string | undefined): string[] {
  return (raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\r?\n+/)
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}

const sectionSurface: CSSProperties = {
  background: `linear-gradient(
    132deg,
    var(--palette-white) 0%,
    color-mix(in srgb, var(--palette-white) 58%, var(--palette-surface)) 45%,
    color-mix(in srgb, var(--palette-white) 22%, var(--palette-surface)) 100%
  )`,
};

const headlineStyle: CSSProperties = {
  fontSize: "clamp(2rem, 4.2vw + 0.85rem, 3.75rem)",
  lineHeight: "clamp(2.35rem, 4.2vw + 1.1rem, 4.125rem)",
};

export function AboutVisualSplitSection({
  section,
  lang,
}: {
  section: AboutVisualSplitSectionT;
  lang: Locale;
}) {
  void lang;
  const lines = titleLines(section.title);
  const floatingHtml = section.floating_card?.trim() ?? "";
  const hasFloating = Boolean(floatingHtml.replace(/<[^>]+>/g, "").trim());
  const hasCopy =
    Boolean(section.eyebrow?.trim()) ||
    Boolean(section.tagline?.trim()) ||
    lines.length > 0;
  const visual = section.visual ?? null;
  const hasVisual = Boolean(visual);

  if (!hasCopy && !hasVisual) {
    return null;
  }

  return (
    <section className="relative isolate overflow-hidden py-14 sm:py-16 md:py-20" style={sectionSurface}>
      <Container className="relative z-10 max-w-[90rem]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0">
          {hasCopy ? (
            <div className={`${REVEAL_ITEM} flex min-w-0 flex-col gap-4 sm:gap-5`}>
              {section.eyebrow?.trim() ? (
                <p className="text-base font-semibold tracking-tight text-navy-deep sm:text-lg">
                  {section.eyebrow.trim()}
                </p>
              ) : null}
              {section.tagline?.trim() ? (
                <p className="text-base font-normal leading-snug text-muted">{section.tagline.trim()}</p>
              ) : null}
              {lines.length > 0 ? (
                <h2
                  className="min-w-0 font-sans font-semibold tracking-tight text-navy-deep"
                  style={headlineStyle}
                >
                  {lines.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              ) : null}
            </div>
          ) : null}

          {hasVisual && visual ? (
            <div
              className={`${REVEAL_ITEM} relative mx-auto flex w-full max-w-[min(100%,560px)] justify-center lg:mx-0 lg:max-w-none lg:justify-end`}
            >
              <div className="relative w-full max-w-[560px]">
                <Media
                  image={visual}
                  width={1120}
                  height={1120}
                  className="h-auto w-full object-contain object-center"
                  sizes="(min-width: 1024px) 560px, 100vw"
                  preferLargestSource
                />
                {hasFloating ? (
                  <div className={floatingCardClassName}>
                    <RichText
                      html={floatingHtml}
                      className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-sm !prose-p:font-medium !prose-p:leading-snug !prose-p:text-navy-deep sm:!prose-p:text-base [&_p+_p]:!mt-2"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
