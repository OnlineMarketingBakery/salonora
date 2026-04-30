import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { ImageIntroSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";
import type { WpImage } from "@/types/wordpress";

function ImageTextRow({ icon, text }: { icon: WpImage | null; text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {icon ? (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_1px_3px_rgba(0,39,82,0.12)] ring-1 ring-navy-deep/8 sm:h-14 sm:w-14">
          <Media
            image={icon}
            width={92}
            height={92}
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            sizes="100vw"
            preferLargestSource
          />
        </div>
      ) : null}
      <p className="min-w-0 text-base font-semibold leading-snug text-brand sm:text-lg">{text}</p>
    </div>
  );
}

export function ImageIntroSplitSection({ section }: { section: ImageIntroSplitSectionT; lang: Locale }) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const showLowerBlock = section.imageTextRows.some((r) => r.text.trim());

  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-14 xl:gap-[72px]">
          <div
            className={`${REVEAL_ITEM} flex w-full shrink-0 justify-center lg:w-[min(100%,46%)] lg:max-w-none`}
          >
            {section.image ? (
              <div className="relative w-full max-w-[520px]">
                <Media
                  image={section.image}
                  width={1040}
                  height={1040}
                  className="h-auto w-full object-contain object-center"
                  sizes="100vw"
                  preferLargestSource
                />
              </div>
            ) : null}
          </div>

          <div className={`${REVEAL_ITEM} flex min-w-0 flex-1 flex-col gap-5 lg:max-w-[640px]`}>
            {section.eyebrow ? (
              <span className="inline-flex w-fit max-w-full rounded-full bg-brand/12 px-6 py-2 text-sm font-semibold leading-tight text-brand sm:px-8 sm:py-3 sm:text-[15px]">
                {section.eyebrow}
              </span>
            ) : null}

            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[32px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[40px] sm:leading-[1.1] md:text-[44px] lg:text-[48px] lg:leading-[56px]">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}

            {section.intro ? (
              <RichText
                html={section.intro}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.5] !prose-p:text-muted [&_p+_p]:!mt-[18px] [&_strong]:font-semibold [&_strong]:text-navy"
              />
            ) : null}

            {showLowerBlock ? (
              <>
                <div className="h-px w-full max-w-full bg-navy-deep/10" aria-hidden />
                <div className="flex flex-col gap-4 sm:gap-5">
                  {section.imageTextRows.map((row, i) => (
                    <ImageTextRow key={`${section.id}-row-${i}`} icon={row.icon} text={row.text} />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
