/** @see Figma **692:196** (“Frame 2147229635”) — white card, media + tilted brand panel, badge, checklist, CTA. */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { AudiencePromoCardSectionT } from "@/types/sections";

function CheckIcon() {
  return (
    <span
      className="relative mt-0.5 inline-flex size-[39px] shrink-0 items-center justify-center rounded-full bg-[var(--palette-brand)]"
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

export function AudiencePromoCardSection({
  section,
  lang,
}: {
  section: AudiencePromoCardSectionT;
  lang: Locale;
}) {
  const resolved = resolveLink(section.button, lang);
  const ctaLabel =
    resolved?.label?.trim() || section.button?.title?.trim() || "";
  const ctaHref = resolved?.href;

  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const featureRows = section.features.map((f) => f.text.trim()).filter(Boolean);

  const copy = (
    <div className="flex min-w-0 flex-col gap-6 lg:max-w-[608px] lg:flex-1">
      {section.badge_text.trim() ? (
        <div className="inline-flex h-[42px] max-w-full shrink-0 items-center justify-center self-start rounded-[21px] bg-[color-mix(in_srgb,var(--palette-brand)_10%,transparent)] px-[19px] py-[15px] text-base font-medium leading-[1.6] text-[var(--palette-brand)]">
          {section.badge_text.trim()}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-[14px]">
          {titleLines.length > 0 ? (
            <h2 className="font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-[var(--palette-navy)] sm:text-[48px] sm:leading-[56px]">
              {titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>
          ) : null}

          {section.description.trim() ? (
            <RichText
              html={section.description}
              className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.54] !prose-p:text-[var(--palette-muted)] [&_p+_p]:mt-3! [&_strong]:font-semibold [&_strong]:text-[var(--palette-navy)]"
            />
          ) : null}
        </div>

        {featureRows.length > 0 ? (
          <ul className="flex list-none flex-col gap-2.5 p-0">
            {featureRows.map((text, i) => (
              <li key={i} className="flex items-start gap-[7px]">
                <CheckIcon />
                <span className="min-w-0 flex-1 pt-[7px] font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {ctaHref && ctaLabel ? (
          <Button
            href={ctaHref}
            target={resolved?.target}
            variant="ctaBrand"
            ctaSize="default"
            ctaFullWidth={false}
            ctaElevation="none"
            ctaJustify="between"
            arrowContent={
              section.button_trailing_icon ? (
                <span className="inline-flex size-6 shrink-0 items-center justify-center [&_img]:object-contain">
                  <Media
                    image={section.button_trailing_icon}
                    width={24}
                    height={24}
                    className="h-6 w-6"
                    sizes="24px"
                    preferLargestSource
                  />
                </span>
              ) : undefined
            }
            className="h-12 min-h-12 w-full max-w-[325px] shrink-0 self-start px-[18px] py-3 shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:w-auto"
          >
            {ctaLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );

  const visual =
    section.image != null ? (
      <div className="relative mx-auto w-full max-w-[496px] shrink-0 lg:mx-0 lg:w-[min(100%,496px)]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-[33px] z-0 aspect-[460/524] w-[min(100%,460px)] origin-center rotate-[-4.13deg] rounded-[14px] bg-[var(--palette-brand)]"
        />
        <div className="relative z-10 ml-[18px] mt-[17px] aspect-[460/523] w-[min(calc(100%-18px),460px)] overflow-hidden rounded-[14px]">
          <Media
            image={section.image}
            width={920}
            height={1046}
            className="h-full w-full object-cover object-center"
            sizes="(min-width: 1024px) 460px, 90vw"
            preferLargestSource
          />
        </div>
      </div>
    ) : null;

  return (
    <section lang={lang} className="bg-[var(--palette-white)] py-7 md:py-8">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} rounded-[14px] bg-[var(--palette-white)] p-10 shadow-[0px_12px_24px_color-mix(in_srgb,var(--palette-muted)_18%,transparent)] sm:p-12 md:p-14 lg:p-[54px] ${visual ? "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-[60px]" : ""}`}
        >
          {visual ? (
            <>
              <div className="order-1 min-w-0 lg:order-1">{visual}</div>
              <div className="order-2 min-w-0 lg:order-2">{copy}</div>
            </>
          ) : (
            copy
          )}
        </div>
      </Container>
    </section>
  );
}
