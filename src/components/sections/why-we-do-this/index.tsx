import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { WhyWeDoThisSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function WhyWeDoThisSection({ section }: { section: WhyWeDoThisSectionT; lang: Locale }) {
  return (
    <section className="bg-white py-20 md:py-24">
      <Container className="max-w-340!">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className={`${REVEAL_ITEM} relative w-full max-w-[560px] shrink-0`}>
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(560px,88vw)] w-[min(420px,72vw)] translate-x-[-52%] -translate-y-1/2 rotate-[-4deg] rounded-2xl bg-brand"
            />
            {section.image ? (
              <div className="relative z-10 mx-auto w-full max-w-[520px] rotate-[-4deg]">
                <Media
                  image={section.image}
                  width={1040}
                  height={1040}
                  preferLargestSource
                  className="h-auto w-full max-w-full object-contain object-bottom"
                  sizes="(min-width: 1024px) 520px, 92vw"
                />
              </div>
            ) : null}
          </div>

          <div className={`${REVEAL_ITEM} flex w-full min-w-0 max-w-[560px] flex-col gap-5`}>
            {section.eyebrow ? (
              <div className="inline-flex h-10 w-fit items-center justify-center rounded-full bg-white px-4 text-sm font-medium leading-none text-muted shadow-[0_10px_22px_color-mix(in_srgb,var(--palette-navy-deep)_10%,transparent)]">
                {section.eyebrow}
              </div>
            ) : null}
            {section.title ? (
              <h2 className="font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[48px] sm:leading-[56px]">
                {section.title}
              </h2>
            ) : null}
            {section.body ? (
              <RichText
                html={section.body}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-muted [&_p+_p]:mt-[18px]! [&_strong]:font-bold [&_strong]:text-navy-deep"
              />
            ) : null}
            {section.highlightLine ? (
              <RichText
                html={section.highlightLine}
                className="text-xl font-semibold leading-[1.6] text-navy-deep [&_p]:m-0"
              />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

