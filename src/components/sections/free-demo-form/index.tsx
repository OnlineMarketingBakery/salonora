import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { FreeDemoFormSectionT } from "@/types/sections";
import { FreeDemoLeadForm } from "./FreeDemoLeadForm";

/** Figma **1417:36** / **696:3847** — brand panel −1.66° under 1182px surface shell; **696:4148** white card. */
const BRAND_UNDERLAY_ROTATE_CLASS = "rotate-[-1.66deg]";

const FORM_CARD_SHADOW =
  "shadow-[0px_10px_27.8px_color-mix(in_srgb,var(--palette-muted)_15%,transparent)]";

export function FreeDemoFormSection({
  section,
  lang,
}: {
  section: FreeDemoFormSectionT;
  lang: Locale;
}) {
  const redirect = resolveLink(section.redirectLink, lang);
  return (
    <section
      className="scroll-mt-[5.75rem] overflow-visible pb-12 pt-2 sm:scroll-mt-24 sm:pt-4 lg:scroll-mt-32 lg:pb-28 lg:pt-20"
      id="free-demo-form"
    >
      <Container className="overflow-visible" outerClassName="max-lg:px-4">
        <div
          className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[73.875rem] overflow-visible`}
        >
          {/* Figma 696:3847 — full-size brand layer behind surface; desktop only */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-0 hidden rounded-[14px] bg-brand lg:block ${BRAND_UNDERLAY_ROTATE_CLASS}`}
          />
          {/* Mobile: one white card (title + form). Desktop: surface shell + nested white form card. */}
          <div
            className={`${REVEAL_ITEM} relative z-10 flex w-full justify-center rounded-[14px] bg-white px-5 py-7 ${FORM_CARD_SHADOW} sm:px-6 sm:py-8 lg:bg-surface lg:px-16 lg:py-20 lg:shadow-none xl:px-24 xl:py-24`}
          >
            <div className="flex w-full max-w-[35.375rem] flex-col items-center gap-5 text-center sm:gap-6">
              <div className="flex w-full flex-col items-center gap-2 sm:gap-3">
                {section.title ? (
                  <SectionHeading
                    as="h2"
                    text={section.title}
                    className={`${REVEAL_ITEM} w-full text-[1.625rem] font-semibold leading-[1.2] text-navy sm:text-3xl sm:leading-tight lg:max-w-[34.25rem] lg:text-[2.75rem] lg:leading-[1.12] xl:text-[3rem] xl:leading-[56px]`}
                  />
                ) : null}
                {section.subtitle ? (
                  <RichText
                    html={section.subtitle}
                    className={`${REVEAL_ITEM} max-w-[36ch] text-[15px] leading-[1.54] text-muted sm:text-base [&_p]:m-0`}
                  />
                ) : null}
              </div>
              {/* Desktop only: inner white card. Mobile: form sits in the outer white shell above. */}
              <div
                className={`w-full max-lg:p-0 lg:rounded-[12px] lg:bg-white lg:px-11 lg:py-[34px] ${FORM_CARD_SHADOW} max-lg:rounded-none max-lg:bg-transparent max-lg:shadow-none`}
              >
                <div className="flex flex-col gap-5">
                  <FreeDemoLeadForm
                    lang={lang}
                    ombFormId={section.ombFormId}
                    successMode={section.successMode}
                    redirectUrl={redirect?.href}
                    trackingContext={section.trackingContext}
                  />
                  {section.footer_note ? (
                    <div className="flex justify-center px-0 py-1 sm:px-2.5 sm:py-2.5">
                      <RichText
                        html={section.footer_note}
                        className={`${REVEAL_ITEM} text-center text-[13px] font-medium leading-[1.54] text-navy-deep sm:text-sm [&_p]:m-0 [&_p+p]:mt-0`}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
