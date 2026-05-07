import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { StorySplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function StorySplitSection({ section, lang }: { section: StorySplitSectionT; lang: Locale }) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const primaryCta = section.ctas[0];
  const ctaLink = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaLink?.href;
  const ctaLabel =
    primaryCta?.text || ctaLink?.label || (ctaHref ? "Meer informatie" : "");

  const imageBlock = section.image ? (
    <div className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[460px] shrink-0`}>
      {section.showAccentShape ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-2 z-0 aspect-[460/616] w-[min(100%,460px)] max-w-full origin-center -rotate-[4.13deg] rounded-[14px] bg-brand sm:top-3 sm:rounded-2xl"
        />
      ) : null}
      <div
        className={
          section.showAccentShape
            ? "relative z-10 aspect-[460/616] w-full max-w-[460px] translate-x-[5%] translate-y-3 overflow-hidden rounded-[14px] sm:translate-x-[22px] sm:translate-y-4 sm:rounded-2xl"
            : "relative z-10 aspect-[460/616] w-full max-w-[460px] overflow-hidden rounded-[14px] sm:rounded-2xl"
        }
      >
        <Media
          image={section.image}
          width={920}
          height={1232}
          className="h-full w-full object-cover object-center"
          sizes="(min-width: 1024px) 460px, 90vw"
          preferLargestSource
        />
      </div>
    </div>
  ) : null;

  const copy = (
    <div className={`${REVEAL_ITEM} flex w-full min-w-0 max-w-[748px] flex-col gap-6`}>
      <div className="flex min-w-0 flex-col gap-6">
        {titleLines.length > 0 && (
          <h2 className="font-sans text-[40px] font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-[48px] sm:leading-[56px]">
            {titleLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
        )}
        {section.body ? (
          <RichText
            html={section.body}
            className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.4] !prose-p:text-muted [&_p+_p]:!mt-[18px] [&_strong]:font-bold [&_strong]:text-navy-deep"
          />
        ) : null}
      </div>

      {ctaHref ? (
        <Button
          href={ctaHref}
          target={ctaLink?.target}
          variant="ctaBrand"
          ctaElevation="none"
          ctaFullWidth={false}
          className="!h-12 max-w-full self-start whitespace-normal shadow-[0px_6px_10px_rgba(57,144,240,0.54)] sm:whitespace-nowrap"
          arrowClassName="h-6 w-6"
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );

  return (
    <section className="bg-white py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-[37px]">
          {imageBlock}
          {copy}
        </div>
      </Container>
    </section>
  );
}
