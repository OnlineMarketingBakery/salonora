import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { resolveLink } from "@/lib/utils/links";
import type { FreeDemoFormSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { FreeDemoLeadForm } from "./FreeDemoLeadForm";

/** Figma **1417:36** — Group 606: brand tilt underlay (−1.66°), 14px surface shell, 12px white card, 566px heading column, 476px form column. */
export function FreeDemoFormSection({ section, lang }: { section: FreeDemoFormSectionT; lang: Locale }) {
  const redirect = resolveLink(section.redirectLink, lang);
  return (
    <section className="overflow-visible pt-16 pb-24 md:pt-24 md:pb-32 lg:pb-40">
      <Container className="overflow-visible">
        <div className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[73.875rem] px-2 sm:px-4`}>
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[52%] z-0 h-[104%] w-[101%] max-w-none rounded-[14px] bg-brand sm:h-[102%] sm:w-[100%]"
            style={{ transform: "translate(-50%, -50%) rotate(-1.66deg)" }}
          />
          <div
            className={`${REVEAL_ITEM} relative z-10 flex justify-center rounded-[14px] bg-surface px-5 py-14 shadow-none sm:px-10 sm:py-16 md:px-16 md:py-20 lg:px-28 lg:py-28`}
          >
            <div className="flex w-full max-w-[35.375rem] flex-col items-center gap-6 text-center">
              <div className="flex w-full flex-col items-center gap-3">
                {section.title ? (
                  <h2
                    className={`${REVEAL_ITEM} w-full max-w-[34.25rem] text-3xl font-semibold leading-tight tracking-[-0.035em] text-navy sm:text-4xl md:text-[2.75rem] md:leading-[1.12] lg:text-[3rem] lg:leading-[56px]`}
                  >
                    {section.title}
                  </h2>
                ) : null}
                {section.subtitle ? (
                  <RichText
                    html={section.subtitle}
                    className={`${REVEAL_ITEM} max-w-[36ch] text-base leading-[1.54] text-muted [&_p]:m-0`}
                  />
                ) : null}
              </div>
              {/* No REVEAL_ITEM here: nested .reveal-item gets its own GSAP autoAlpha; can stay invisible while the parent shell looks visible, which breaks the form/button. */}
              <div className="w-full rounded-[12px] bg-white px-6 py-8 shadow-[0px_10px_27.8px_color-mix(in_srgb,var(--palette-muted)_15%,transparent)] sm:px-8 sm:py-9 md:px-11 md:py-[34px]">
                <div className="flex flex-col gap-5">
                  <FreeDemoLeadForm
                    lang={lang}
                    ombFormId={section.ombFormId}
                    successMode={section.successMode}
                    redirectUrl={redirect?.href}
                    trackingContext={section.trackingContext}
                  />
                  {section.footer_note ? (
                    <div className="flex justify-center px-2.5 py-2.5">
                      <RichText
                        html={section.footer_note}
                        className={`${REVEAL_ITEM} text-center text-sm font-medium leading-[1.54] text-navy-deep [&_p]:m-0 [&_p+p]:mt-0`}
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
