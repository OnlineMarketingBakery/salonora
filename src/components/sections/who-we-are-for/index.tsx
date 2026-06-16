import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { WhoWeAreForPill } from "@/components/sections/who-we-are-for/WhoWeAreForPill";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { SECTION_SHELL_WHITE } from "@/lib/layout/section-spacing";
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
    <section lang={lang} className={`bg-white ${SECTION_SHELL_WHITE}`}>
      <Container>
        <div
          className={`${REVEAL_ITEM} mx-auto flex w-full max-w-[81.375rem] flex-col items-center gap-6 sm:gap-8 lg:gap-[52px]`}
        >
          {section.title ? (
            <RichText
              html={section.title}
              className="mx-auto max-w-[458px] text-center font-sans text-[32px] font-semibold leading-[1.15] text-navy sm:text-[40px] sm:leading-[1.12] lg:text-[48px] lg:leading-[56px] [&_*]:text-navy [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-2 prose-headings:text-navy prose-strong:text-navy"
            />
          ) : null}

          {/*
            Figma 597:3972 — one row at lg. Mobile/tablet: flex-wrap + justify-center so an
            odd last pill centers instead of hanging left in a 2-col grid.
          */}
          <div className="flex w-full max-w-[81.375rem] flex-wrap justify-center gap-x-4 gap-y-4 sm:gap-x-5 sm:gap-y-5 lg:flex-nowrap lg:justify-center lg:gap-5">
            {section.items.map((item, index) => (
              <WhoWeAreForPill
                key={`${section.id}-item-${index}`}
                item={item}
                lang={lang}
                className={pillWidthClass(index)}
              />
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
