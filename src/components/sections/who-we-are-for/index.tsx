import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { WhoWeAreForSectionT } from "@/types/sections";

/** Figma 597:3973–4025 — outer pills use 245px on ends, 244px in the middle. */
function pillWidthClass(index: number): string {
  return index === 0 || index === 4 ? "lg:w-[245px]" : "lg:w-[244px]";
}

export function WhoWeAreForSection({
  section,
  lang,
}: {
  section: WhoWeAreForSectionT;
  lang: Locale;
}) {
  const primaryCta = section.ctas[0];
  const resolvedCta = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaLabel = primaryCta?.text?.trim() || resolvedCta?.label?.trim() || "";

  return (
    <section lang={lang} className="bg-white py-16 md:py-24">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} mx-auto flex w-full max-w-[81.375rem] flex-col items-center gap-[52px]`}
        >
          {section.title ? (
            <RichText
              html={section.title}
              className="mx-auto max-w-[458px] text-center font-sans text-[clamp(1.75rem,4.2vw,3rem)] font-semibold leading-[1.15] tracking-[-0.04em] text-navy sm:text-[40px] sm:leading-[1.12] lg:text-[48px] lg:leading-[56px] [&_*]:text-navy [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-2 prose-headings:text-navy prose-strong:text-navy"
            />
          ) : null}

          {/*
            Figma 597:3972 — one row at lg (1302px). CMS icons are 57×57 full-tile PNGs;
            render at full bleed — no CSS tile bg or inner padding.
          */}
          <div className="flex w-full max-w-[81.375rem] flex-wrap justify-center gap-5 lg:flex-nowrap">
            {section.items.map((item, index) => (
              <div
                key={`${section.id}-item-${index}`}
                className={`flex h-[227px] w-[min(245px,44vw)] shrink-0 flex-col items-center justify-center rounded-[200px] bg-[linear-gradient(180deg,var(--palette-surface)_0%,var(--palette-white)_100%)] p-6 ${pillWidthClass(index)}`}
              >
                <div className="flex flex-col items-center gap-[30px]">
                  {item.icon ? (
                    <div className="relative size-[57px] shrink-0 overflow-hidden rounded-[12px]">
                      <Media
                        image={item.icon}
                        width={57}
                        height={57}
                        className="size-full object-cover"
                        sizes="57px"
                        preferLargestSource
                      />
                    </div>
                  ) : (
                    <div className="size-[57px] shrink-0" aria-hidden />
                  )}
                  {item.label ? (
                    <RichText
                      html={item.label}
                      className="max-w-[166px] text-center font-sans text-2xl font-medium leading-[1.1] text-navy [&_*]:text-navy [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-[5px]"
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {resolvedCta?.href && ctaLabel ? (
            <Button
              href={resolvedCta.href}
              target={resolvedCta.target}
              variant="ctaBrand"
              ctaSize="compact"
            >
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
