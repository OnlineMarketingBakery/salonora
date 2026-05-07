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
        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,var(--palette-brand),var(--palette-brand-strong))] px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-10 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rotate-[-28deg] rounded-[56px] bg-white/8"
          />

          <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row lg:gap-12">
            <div className={`${REVEAL_ITEM} relative w-full max-w-[560px] shrink-0`}>
              {section.image ? (
                <Media
                  image={section.image}
                  width={1120}
                  height={1120}
                  preferLargestSource
                  className="h-auto w-full max-w-full object-contain object-bottom"
                  sizes="(min-width: 1024px) 520px, 92vw"
                />
              ) : null}
            </div>

            <div className={`${REVEAL_ITEM} flex w-full min-w-0 max-w-[560px] flex-col gap-5`}>
              {section.eyebrow ? (
                <div className="inline-flex h-[42px] w-fit items-center justify-center rounded-full bg-white/95 px-4 text-sm font-medium leading-none text-brand">
                  {section.eyebrow}
                </div>
              ) : null}
              {section.title ? (
                <h2 className="font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[48px] sm:leading-[56px]">
                  {section.title}
                </h2>
              ) : null}
              {section.body ? (
                <RichText
                  html={section.body}
                  className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-white/90 [&_p+_p]:mt-[18px]! [&_strong]:font-bold [&_strong]:text-white"
                />
              ) : null}
              {section.highlightLine ? (
                <RichText
                  html={section.highlightLine}
                  className="text-xl font-semibold leading-[1.6] text-white [&_p]:m-0"
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

