import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { TalkDualCardsSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import type { CSSProperties } from "react";

/**
 * Figma Frame 2147228537 (right card): soft spotlight top-left (cooler / brighter blue), falling off to
 * near-black navy bottom-right — layered radial wash over a diagonal base. Tokens only.
 */
const NAVY_CARD_BACKGROUND_STYLE: CSSProperties = {
  backgroundImage: [
    "radial-gradient(ellipse 125% 105% at 10% 12%, color-mix(in srgb, var(--palette-brand) 30%, var(--palette-navy)) 0%, transparent 58%)",
    "linear-gradient(158deg, var(--palette-navy) 0%, var(--palette-navy-deep) 88%, var(--palette-navy-deep) 100%)",
  ].join(", "),
};

function CtaTrailingIcon({ image }: { image: WpImage | null }) {
  if (!image) return null;
  return (
    <span
      className="inline-flex size-[22px] shrink-0 items-center justify-center [&_img]:object-contain"
      aria-hidden
    >
      <Media
        image={image}
        width={22}
        height={22}
        className="h-[22px] w-[22px]"
        sizes="22px"
        preferLargestSource
      />
    </span>
  );
}

export function TalkDualCardsSection({
  section,
  lang,
}: {
  section: TalkDualCardsSectionT;
  lang: Locale;
}) {
  const left = resolveLink(section.left_link, lang);
  const rightPrimary = resolveLink(section.right_primary_link, lang);
  const rightSecondary = resolveLink(section.right_secondary_link, lang);

  /** Figma Frame 2147228539 — 1300×402 outer; cards 638×314, gap 24px, radius 24px, inset 48px. */
  const cardShell =
    "relative flex h-full min-h-[314px] flex-col overflow-hidden rounded-[24px] p-12";

  return (
    <section className="bg-[var(--palette-white)] pt-16 md:-pt-20 pb-16 md:pb-28">
      <Container className="!max-w-[81.25rem]">
        <div className="flex flex-col items-center gap-[54px]">
          {section.title ? (
            <h2
              className={`${REVEAL_ITEM} text-center font-sans text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.17] tracking-[-0.04em] text-[var(--palette-navy)] md:text-[48px] md:leading-[56px]`}
            >
              {section.title}
            </h2>
          ) : null}

          <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-6">
            <div
              className={`${REVEAL_ITEM} ${cardShell} justify-center bg-[linear-gradient(135deg,var(--palette-brand)_0%,var(--palette-brand-strong)_100%)]`}
            >
              {section.left_corner_graphic ? (
                <div
                  className="pointer-events-none absolute bottom-0 right-0 z-0 max-h-[min(65%,220px)] w-[min(62%,320px)] select-none [&_img]:h-auto [&_img]:w-full [&_img]:max-w-none [&_img]:object-contain [&_img]:object-[bottom_right]"
                  style={{
                    maskImage:
                      "radial-gradient(ellipse 115% 115% at 100% 100%, black 8%, color-mix(in srgb, black 42%, transparent) 52%, transparent 78%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 115% 115% at 100% 100%, black 8%, color-mix(in srgb, black 42%, transparent) 52%, transparent 78%)",
                  }}
                  aria-hidden
                >
                  <Media
                    image={section.left_corner_graphic}
                    width={320}
                    height={240}
                    className="opacity-95"
                    sizes="(max-width: 1024px) 55vw, 320px"
                    preferLargestSource
                  />
                </div>
              ) : null}

              <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-[52px]">
                {section.left_body ? (
                  <RichText
                    html={section.left_body}
                    className="text-left !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[24px] !prose-p:leading-[1.4] !prose-p:text-[var(--palette-white)] !prose-strong:font-semibold !prose-strong:text-[var(--palette-white)] !prose-li:text-[var(--palette-white)] !prose-a:text-[var(--palette-white)] prose-a:underline [&_*]:text-[var(--palette-white)]"
                  />
                ) : null}

                {left?.href ? (
                  <div className="w-full max-w-[209px]">
                    <Button
                      href={left.href}
                      target={left.target}
                      variant="ctaWhite"
                      ctaElevation="footerSecondary"
                      ctaJustify="between"
                      ctaFullWidth
                      showArrow={Boolean(section.left_button_icon)}
                      arrowContent={
                        <CtaTrailingIcon image={section.left_button_icon} />
                      }
                      className="min-h-12 border-0 px-3 text-[16px] font-normal text-[var(--palette-navy)] shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)]"
                    >
                      {left.label}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className={`${REVEAL_ITEM} ${cardShell} justify-center`}
              style={NAVY_CARD_BACKGROUND_STYLE}
            >
              {section.right_overlay_graphic ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full select-none">
                  <Media
                    image={section.right_overlay_graphic}
                    width={638}
                    height={120}
                    className="h-auto w-full object-cover object-top opacity-90"
                    sizes="(min-width: 1024px) 638px, 100vw"
                    preferLargestSource
                  />
                </div>
              ) : null}

              <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-[52px]">
                {section.right_body ? (
                  <RichText
                    html={section.right_body}
                    className="text-left !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[24px] !prose-p:leading-[1.4] !prose-p:text-[var(--palette-white)] !prose-strong:font-semibold !prose-strong:text-[var(--palette-white)] !prose-li:text-[var(--palette-white)] !prose-a:text-[var(--palette-white)] prose-a:underline [&_*]:text-[var(--palette-white)]"
                  />
                ) : null}

                {(rightPrimary?.href || rightSecondary?.href) && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[14px]">
                    {rightPrimary?.href ? (
                      <Button
                        href={rightPrimary.href}
                        target={rightPrimary.target}
                        variant="ctaBrand"
                        ctaElevation="none"
                        ctaJustify="between"
                        ctaFullWidth={false}
                        showArrow={Boolean(section.right_primary_button_icon)}
                        arrowContent={
                          <CtaTrailingIcon
                            image={section.right_primary_button_icon}
                          />
                        }
                        className="min-h-12 w-full max-w-[209px] shrink-0 border-0 px-3 text-[16px] font-normal !bg-[linear-gradient(135deg,var(--palette-brand)_0%,var(--palette-brand-strong)_100%)] text-white shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:w-[209px]"
                      >
                        {rightPrimary.label}
                      </Button>
                    ) : null}
                    {rightSecondary?.href ? (
                      <Button
                        href={rightSecondary.href}
                        target={rightSecondary.target}
                        variant="ctaWhite"
                        ctaElevation="footerSecondary"
                        ctaJustify="between"
                        ctaFullWidth={false}
                        showArrow={Boolean(section.right_secondary_button_icon)}
                        arrowContent={
                          <CtaTrailingIcon
                            image={section.right_secondary_button_icon}
                          />
                        }
                        className="min-h-12 w-full max-w-[283px] shrink-0 border-0 px-4 text-[16px] font-normal text-[var(--palette-navy)] sm:w-[283px]"
                      >
                        {rightSecondary.label}
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
