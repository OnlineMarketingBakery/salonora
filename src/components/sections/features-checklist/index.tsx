/** Content: Figma **597:4037** (â€œFrame 2147228715â€). Decorative shell: **597:3568** (same as **1714:244**). */
import { Button } from "@/components/ui/Button";
import { CtaTrailingIcon } from "@/components/ui/CtaTrailingIcon";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NavyStarfieldBackdrop } from "@/components/sections/shared/NavyStarfieldBackdrop";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { FeaturesChecklistSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import type { CSSProperties } from "react";

/** Figma 597:4079 mask artboard — 528×382 photo with BR notch cutout. */
const FC_MASK_W = 528;
const FC_MASK_H = 382;
const FC_NOTCH_X = 327;
const FC_NOTCH_Y = 322;
/** Matches outer frame `rounded-[28px]` and notch `rounded-tl-[28px]`. */
const FC_INNER_CORNER_RADIUS = 28;

function buildFeaturesChecklistImageClip(radiusPx = FC_INNER_CORNER_RADIUS): string {
  const nx = FC_NOTCH_X;
  const ny = FC_NOTCH_Y;
  const r = radiusPx;
  const pct = (x: number, y: number) => `${(x / FC_MASK_W) * 100}% ${(y / FC_MASK_H) * 100}%`;

  const steps = 12;
  const arcPoints: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI / 2 + (Math.PI / 2) * (i / steps);
    const x = nx + r + r * Math.cos(angle);
    const y = ny + r + r * Math.sin(angle);
    arcPoints.push(pct(x, y));
  }

  return [
    pct(0, 0),
    pct(FC_MASK_W, 0),
    pct(FC_MASK_W, ny),
    pct(nx + r, ny),
    ...arcPoints,
    pct(nx, FC_MASK_H),
    pct(0, FC_MASK_H),
  ].join(", ");
}

const FC_MASKED_IMAGE_CLIP: CSSProperties = {
  clipPath: `polygon(${buildFeaturesChecklistImageClip()})`,
  WebkitClipPath: `polygon(${buildFeaturesChecklistImageClip()})`,
};

function ChecklistGlyph({ icon }: { icon: WpImage | null }) {
  if (icon) {
    return (
      <span className="mt-[2px] inline-flex h-[23px] w-[26px] shrink-0 items-center justify-center [&_img]:object-contain">
        <Media
          image={icon}
          width={26}
          height={23}
          className="h-[23px] max-h-[23px] w-[26px] max-w-[26px]"
          sizes="26px"
          preferLargestSource
        />
      </span>
    );
  }
  return (
    <span
      className="relative mt-[2px] inline-flex h-[23px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--palette-brand)]"
      aria-hidden
    >
      <svg
        className="h-[13px] w-[15px] text-[var(--palette-white)]"
        viewBox="0 0 15 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 6.5L5.5 11L14 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function FeaturesChecklistSection({
  section,
  lang,
}: {
  section: FeaturesChecklistSectionT;
  lang: Locale;
}) {
  const resolved = resolveLink(section.button, lang);
  const ctaLabel =
    resolved?.label?.trim() || section.button?.title?.trim() || "";
  const ctaHref = resolved?.href;

  const hasBody =
    Boolean(section.title?.trim()) ||
    Boolean(section.description?.trim()) ||
    section.checklist.length > 0 ||
    Boolean(section.image);

  if (!hasBody) return null;

  const sectionPad = "py-10 sm:py-14 md:py-24 lg:py-36 xl:py-40";
  const whiteTopBand = "pt-6 sm:pt-8 md:pt-12";

  return (
    <section className={`bg-[var(--palette-white)] ${whiteTopBand}`}>
      <div className={`relative isolate overflow-hidden bg-navy-deep ${sectionPad}`}>
        <NavyStarfieldBackdrop />

        <Container className="relative z-[1]">
          <div className={`flex flex-col gap-5 sm:gap-7 lg:gap-9 ${REVEAL_ITEM}`}>
            {(section.title || section.description) && (
              <header className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-3 text-center text-[var(--palette-white)] sm:gap-3.5 lg:gap-4">
                {section.title ? (
                  <SectionHeading
                    as="h2"
                    text={section.title}
                    multiline
                    className="w-full max-w-[720px] text-pretty font-sans text-[32px] font-semibold leading-[1.15] text-[var(--palette-white)] sm:text-[40px] sm:leading-[1.12] lg:text-[48px] lg:leading-[1.1]"
                  />
                ) : null}
              {section.description ? (
                <RichText
                  html={section.description}
                  className="prose max-w-none w-full min-w-0 font-sans !text-[color-mix(in_srgb,var(--palette-white)_94%,transparent)] prose-p:!my-0 prose-p:!text-[color-mix(in_srgb,var(--palette-white)_94%,transparent)] prose-strong:!font-semibold prose-strong:!text-[var(--palette-white)] prose-a:!text-[var(--palette-white)] prose-a:!underline prose-a:!decoration-white/35 prose-a:!underline-offset-[3px] prose-li:!text-[color-mix(in_srgb,var(--palette-white)_92%,transparent)] prose-ul:!my-0 [&_p+p]:!mt-[1.125rem] prose-p:first-of-type:!mx-auto prose-p:first-of-type:!max-w-[42rem] prose-p:first-of-type:!text-center prose-p:first-of-type:!font-normal prose-p:first-of-type:!text-[17px] prose-p:first-of-type:!leading-[1.65] prose-p: [&_p:not(:first-of-type)]:!mx-auto [&_p:not(:first-of-type)]:!max-w-[36rem] [&_p:not(:first-of-type)]:!text-center [&_p:not(:first-of-type)]:!font-normal [&_p:not(:first-of-type)]:!text-[16px] [&_p:not(:first-of-type)]:!leading-[1.65] [&_p:not(:first-of-type)]:"
                />
              ) : null}
            </header>
          )}

          {/*
            Figma 597:4042: 528 + 24 + 528 = 1080px. `lg:w-fit` shrinks the row to exact width so
            `mx-auto` centers the pair like the reference (flex+max-w alone can leave extra space).
          */}
          <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 lg:w-fit lg:max-w-none lg:flex-row lg:items-start lg:gap-x-6">
            {section.checklist.length > 0 ? (
              <ul className="flex w-full min-w-0 shrink-0 flex-col gap-4 lg:w-[528px] lg:max-w-[528px] lg:shrink-0">
                {section.checklist.map((row, idx) => (
                  <li
                    key={`${section.id}-chk-${idx}`}
                    className="flex min-h-[60px] w-full items-start rounded-[10px] border border-[color-mix(in_srgb,var(--palette-navy-deep)_6%,transparent)] bg-[var(--palette-white)] p-4 shadow-[0_4px_28px_-6px_color-mix(in_srgb,var(--palette-navy-deep)_28%,transparent)]"
                  >
                    <div className="flex min-w-0 items-start gap-[9px]">
                      <ChecklistGlyph icon={row.icon} />
                      <p className="text-left font-sans text-[20px] font-medium leading-[1.4] text-[var(--palette-navy)]">
                        {row.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {section.image ? (
              <div className="relative flex min-h-0 w-full min-w-0 shrink-0 flex-col lg:w-[528px] lg:max-w-[528px] lg:self-stretch">
                {/*
                  Row uses `items-start` + `self-stretch` so this column matches checklist height; `flex-col` +
                  `flex-1` lets the photo frame grow vertically on lg while `object-cover` fills the slot.
                */}
                <div className="relative aspect-[528/382] w-full min-h-[min(52vw,20rem)] flex-1 overflow-hidden rounded-[28px] bg-[var(--palette-navy-deep)] lg:aspect-auto lg:min-h-0 lg:w-full">
                  {ctaHref && ctaLabel ? (
                    <>
                      <div className="absolute inset-0" style={FC_MASKED_IMAGE_CLIP}>
                        <Media
                          image={section.image}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 528px, 100vw"
                          preferLargestSource
                        />
                      </div>
                      <div
                        className="pointer-events-none absolute bottom-0 right-0 z-10 flex w-max max-w-[calc(100%-0.75rem)] min-w-[201px] min-h-[60px] items-center justify-center rounded-tl-[28px] bg-[var(--palette-navy-deep)] p-1.5"
                      >
                        <div className="pointer-events-auto w-max shrink-0">
                          <Button
                            href={ctaHref}
                            variant="ctaBrand"
                            ctaFullWidth={false}
                            target={resolved?.target}
                            showArrow
                            arrowContent={
                              section.button_trailing_icon ? (
                                <CtaTrailingIcon image={section.button_trailing_icon} />
                              ) : undefined
                            }
                          >
                            {ctaLabel}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 overflow-hidden rounded-[28px]">
                      <Media
                        image={section.image}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 528px, 100vw"
                        preferLargestSource
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
