/** Content: Figma **597:4037** (“Frame 2147228715”). Decorative shell: **597:3568** (“Frame 2147228001”). */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { FeaturesChecklistSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import type { CSSProperties } from "react";

/**
 * Figma 597:4079 “Mask group”: 528×382 rounded photo **minus** 201×60 rect at (327, 322) → L-shape + BR notch.
 * Percentages are of the media box; CTA sits in the notch on the same navy as the section.
 */
const FC_MASKED_IMAGE_CLIP: CSSProperties = {
  clipPath: `polygon(0% 0%, 100% 0%, 100% ${(322 / 382) * 100}%, ${(327 / 528) * 100}% ${(322 / 382) * 100}%, ${(327 / 528) * 100}% 100%, 0% 100%)`,
  WebkitClipPath: `polygon(0% 0%, 100% 0%, 100% ${(322 / 382) * 100}%, ${(327 / 528) * 100}% ${(322 / 382) * 100}%, ${(327 / 528) * 100}% 100%, 0% 100%)`,
};

const FC_NOTCH_SLOT: CSSProperties = {
  width: `${(201 / 528) * 100}%`,
  height: `${(60 / 382) * 100}%`,
  minHeight: "72px",
};

/** Figma shell 597:3568 — light grid on navy (reference screenshot density). */
const GRID_BG: CSSProperties = {
  backgroundImage: `
    linear-gradient(color-mix(in srgb, var(--palette-brand) 30%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--palette-brand) 30%, transparent) 1px, transparent 1px)
  `,
  backgroundSize: "28px 28px",
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

  /** CMS icon (e.g. circled arrow); slightly smaller than default slot; white on brand pill. */
  const trailing = section.button_trailing_icon ? (
    <Media
      image={section.button_trailing_icon}
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 object-contain brightness-0 invert"
      sizes="28px"
      preferLargestSource
    />
  ) : undefined;

  const hasBody =
    Boolean(section.title?.trim()) ||
    Boolean(section.description?.trim()) ||
    section.checklist.length > 0 ||
    Boolean(section.image);

  if (!hasBody) return null;

  /** Symmetric vertical rhythm (Figma 880px-tall band ≈ generous top/bottom). */
  const sectionPad = "py-[clamp(3.25rem,10vw,9.4375rem)]";

  return (
    <section className={`relative isolate overflow-hidden bg-[var(--palette-navy-deep)] ${sectionPad}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={GRID_BG}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_0%_0%,color-mix(in_srgb,var(--palette-brand)_52%,transparent)_0%,transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_100%_100%,color-mix(in_srgb,var(--palette-brand)_48%,transparent)_0%,transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[min(28%,12rem)] top-0 h-[418px] w-[358px] rounded-full bg-[var(--palette-brand)] opacity-[0.12] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-[10%] -right-[min(22%,10rem)] h-[418px] w-[358px] rounded-full bg-[var(--palette-brand)] opacity-[0.12] blur-[100px]"
        aria-hidden
      />

      <Container className="relative z-[1]">
        <div className={`flex flex-col gap-[34px] ${REVEAL_ITEM}`}>
          {(section.title || section.description) && (
            <header className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-5 text-center text-[var(--palette-white)] sm:gap-6">
              {section.title ? (
                <h2 className="w-full max-w-[720px] text-pretty font-sans text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--palette-white)] lg:text-[48px] lg:leading-[1.1]">
                  {section.title}
                </h2>
              ) : null}
              {section.description ? (
                <RichText
                  html={section.description}
                  className="prose max-w-none w-full min-w-0 font-sans !text-[color-mix(in_srgb,var(--palette-white)_94%,transparent)] prose-p:!my-0 prose-p:!text-[color-mix(in_srgb,var(--palette-white)_94%,transparent)] prose-strong:!font-semibold prose-strong:!text-[var(--palette-white)] prose-a:!text-[var(--palette-white)] prose-a:!underline prose-a:!decoration-white/35 prose-a:!underline-offset-[3px] prose-li:!text-[color-mix(in_srgb,var(--palette-white)_92%,transparent)] prose-ul:!my-0 [&_p+p]:!mt-[1.125rem] prose-p:first-of-type:!mx-auto prose-p:first-of-type:!max-w-[42rem] prose-p:first-of-type:!text-center prose-p:first-of-type:!font-normal prose-p:first-of-type:!text-[17px] prose-p:first-of-type:!leading-[1.65] prose-p:first-of-type:!tracking-[-0.01em] [&_p:not(:first-of-type)]:!mx-auto [&_p:not(:first-of-type)]:!max-w-[36rem] [&_p:not(:first-of-type)]:!text-center [&_p:not(:first-of-type)]:!font-normal [&_p:not(:first-of-type)]:!text-[16px] [&_p:not(:first-of-type)]:!leading-[1.65] [&_p:not(:first-of-type)]:!tracking-[-0.01em]"
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
              <ul className="flex w-full min-w-0 shrink-0 flex-col gap-[15px] lg:w-[528px] lg:max-w-[528px] lg:shrink-0">
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
                        className="pointer-events-none absolute bottom-0 right-0 z-10 flex items-center justify-center rounded-tl-[40px] bg-[var(--palette-navy-deep)] px-2 py-2 sm:px-3 sm:py-2.5"
                        style={FC_NOTCH_SLOT}
                      >
                        <div className="pointer-events-auto w-max min-w-0 max-w-full">
                          {/*
                            `Button` only renders the trailing slot when `showArrow` is true; `arrowContent`
                            replaces the default circled arrow when set.
                          */}
                          <Button
                            href={ctaHref}
                            variant="ctaBrand"
                            ctaSize="promo"
                            ctaFullWidth={false}
                            target={resolved?.target}
                            showArrow
                            arrowContent={trailing}
                            arrowClassName={trailing ? undefined : "h-4 w-4 shrink-0"}
                            className="min-w-[min(100%,17.5rem)] px-6 shadow-[0px_10px_28px_color-mix(in_srgb,var(--palette-brand)_45%,transparent)] sm:min-w-[18.5rem] sm:px-7"
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
    </section>
  );
}
