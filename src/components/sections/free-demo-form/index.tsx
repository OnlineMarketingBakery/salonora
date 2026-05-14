import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import { resolveLink } from "@/lib/utils/links";
import type { FreeDemoFormSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import { FreeDemoCf7Form } from "./FreeDemoCf7Form";

export function FreeDemoFormSection({ section, lang }: { section: FreeDemoFormSectionT; lang: Locale }) {
  const redirect = resolveLink(section.redirectLink, lang);
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div
          className={`${REVEAL_ITEM} relative overflow-hidden rounded-[14px] bg-surface px-4 py-10 sm:px-8 md:px-12 md:py-14`}
        >
          <div className="mx-auto flex max-w-[566px] flex-col items-center gap-6 text-center">
            {section.title ? (
              <h2
                className={`${REVEAL_ITEM} text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
              >
                {section.title}
              </h2>
            ) : null}
            {section.subtitle ? (
              <RichText html={section.subtitle} className={`${REVEAL_ITEM} text-base text-muted`} />
            ) : null}
            <div
              className={`${REVEAL_ITEM} w-full rounded-xl bg-white px-6 py-8 shadow-[0px_10px_28px_rgba(67,87,128,0.15)] sm:px-10 sm:py-9 md:px-11`}
            >
              <FreeDemoCf7Form
                formId={section.formId}
                definition={section.formDefinition}
                successMode={section.successMode}
                redirectUrl={redirect?.href}
                trackingContext={section.trackingContext}
              />
              {section.footer_note ? (
                <RichText
                  html={section.footer_note}
                  className={`${REVEAL_ITEM} mt-6 text-center text-sm font-medium text-navy-deep`}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
