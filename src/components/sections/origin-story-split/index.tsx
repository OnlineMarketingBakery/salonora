import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { OriginStorySplitSectionT } from "@/types/sections";

export function OriginStorySplitSection({
  section,
  lang,
}: {
  section: OriginStorySplitSectionT;
  lang: Locale;
}) {
  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section className="bg-white py-10">
      <Container className="max-w-340!">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-[60px]">
          <div
            className={`${REVEAL_ITEM} flex w-full min-w-0 flex-col gap-6 lg:max-w-[626px]`}
          >
            {section.eyebrow ? (
              <div className="inline-flex h-[42px] self-start items-center justify-center rounded-[21px] bg-pill px-[21px] text-base font-medium leading-[1.6] text-brand">
                {section.eyebrow}
              </div>
            ) : null}

            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[48px] sm:leading-[56px]">
                {titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}

            {section.body ? (
              <RichText
                html={section.body}
                className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:mt-[14px]! [&_strong]:font-semibold [&_strong]:text-navy-deep"
              />
            ) : null}

            {ctaHref ? (
              <Button
                href={ctaHref}
                target={ctaLink?.target}
                variant="ctaBrand"
                ctaElevation="none"
                ctaFullWidth={false}
                className="h-12! max-w-full self-start whitespace-normal shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:whitespace-nowrap"
                arrowClassName="h-6 w-6"
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>

          {section.image ? (
            <div
              className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[460px] shrink-0 lg:mx-0`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 top-2 z-0 aspect-460/523 w-[min(100%,460px)] origin-center rotate-[-4.13deg] rounded-[14px] bg-brand sm:top-3"
              />
              <div className="relative z-10 aspect-460/523 w-full max-w-[460px] translate-x-[5%] translate-y-3 overflow-hidden rounded-[14px] sm:translate-x-[22px] sm:translate-y-4">
                <Media
                  image={section.image}
                  width={920}
                  height={1046}
                  className="h-full w-full object-cover object-center "
                  sizes="(min-width: 1024px) 460px, 90vw"
                  preferLargestSource
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
