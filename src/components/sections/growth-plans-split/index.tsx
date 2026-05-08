/** @see Figma node 1149:32 “Group 600” — split row only (~1087×505), not the lower banner frame. */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { GrowthPlansSplitSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";

function CtaTrailingIcon({ image }: { image: WpImage | null }) {
  if (!image) return null;
  return (
    <span
      className="inline-flex size-7 shrink-0 items-center justify-center [&_img]:object-contain"
      aria-hidden
    >
      <Media
        image={image}
        width={28}
        height={28}
        className="h-7 w-7"
        sizes="28px"
        preferLargestSource
      />
    </span>
  );
}

/** Collage column **30.25rem** wide; circle slots vs Figma ellipses — align CMS repeater order. */
const FLOATING_CIRCLE_LAYOUT = [
  "right-[7%] top-[11%] z-[3] size-[min(86px,22vw)] sm:right-[8%] sm:top-[10%]",
  "left-[0] bottom-[13%] z-[3] size-[min(110px,28vw)] sm:left-[1%] sm:bottom-[14%]",
  "right-[2%] bottom-[8%] z-[3] size-[min(96px,24vw)] sm:right-[4%] sm:bottom-[10%]",
] as const;

function ListRowIcon({ icon }: { icon: WpImage | null }) {
  if (!icon) {
    return (
      <span className="mt-0.5 inline-block size-[39px] shrink-0" aria-hidden />
    );
  }
  return (
    <span className="mt-0.5 inline-flex size-[39px] shrink-0 items-center justify-center [&_img]:object-contain">
      <Media
        image={icon}
        width={39}
        height={39}
        className="h-[39px] w-[39px] max-h-[39px] max-w-[39px]"
        sizes="39px"
        preferLargestSource
      />
    </span>
  );
}

export function GrowthPlansSplitSection({
  section,
  lang,
}: {
  section: GrowthPlansSplitSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const primaryCta = section.ctas[0];
  const ctaResolved = primaryCta ? resolveLink(primaryCta.url, lang) : null;
  const ctaHref = ctaResolved?.href;
  const ctaLabel =
    primaryCta?.text ||
    ctaResolved?.label ||
    (ctaHref ? "Meer informatie" : "");

  const copyColumn = (
    <div
      className={`${REVEAL_ITEM} flex w-full min-w-0 flex-col gap-[30px] lg:max-w-[32rem]`}
    >
      {/* Figma 597:2816 — upper block: title + intro (14px), then upcoming + body (21px between blocks). */}
      <div className="flex min-w-0 flex-col gap-[21px]">
        {(titleLines.length > 0 || section.intro) && (
          <div className="flex min-w-0 flex-col gap-[14px]">
            {titleLines.length > 0 ? (
              <h2 className="font-sans text-[32px] font-semibold leading-[1.12] tracking-[-0.04em] text-navy sm:text-[40px] sm:leading-[1.1] lg:text-[48px] lg:leading-[56px]">
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
                className="!prose-p:mb-0 !prose-p:mt-0 [&_p+p]:mt-[14px] [&_p]:text-[16px] [&_p]:font-normal [&_p]:leading-[1.4] [&_p]:text-muted prose-strong:font-semibold prose-strong:text-navy"
              />
            ) : null}
          </div>
        )}

        {section.upcoming_heading || section.upcoming_items.length > 0 ? (
          <div className="flex max-w-[18.0625rem] flex-col gap-[5px]">
            {section.upcoming_heading ? (
              <p className="font-sans text-[20px] font-semibold leading-[1.4] text-muted">
                {section.upcoming_heading}
              </p>
            ) : null}
            {section.upcoming_items.length > 0 ? (
              <ul className="flex flex-col gap-[5px]">
                {section.upcoming_items.map((row, idx) => (
                  <li key={idx} className="flex min-w-0 items-start gap-[10px]">
                    <ListRowIcon icon={row.icon} />
                    <RichText
                      html={row.text}
                      className="min-w-0 prose-strong:font-semibold prose-strong:text-navy !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[16px] !prose-p:leading-[1.4] prose-p:text-muted"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {section.body ? (
          <RichText
            html={section.body}
            className="!prose-p:mb-0 !prose-p:mt-0 [&_p+p]:mt-[14px] [&_p]:text-[16px] [&_p]:font-normal [&_p]:leading-[1.4] [&_p]:text-muted prose-strong:font-semibold prose-strong:text-navy"
          />
        ) : null}
      </div>

      {section.highlight_line ? (
        <RichText
          html={section.highlight_line}
          className="font-sans text-[24px] font-semibold leading-[1.22] text-accent [&_p]:mb-0 [&_p]:mt-0 prose-strong:text-accent [&_*]:text-accent"
        />
      ) : null}

      {ctaHref && ctaLabel ? (
        <div>
          <Button
            href={ctaHref}
            target={ctaResolved?.target}
            variant="ctaBrand"
            ctaElevation="none"
            ctaJustify="between"
            ctaSize="promo"
            ctaFullWidth={false}
            showArrow={Boolean(section.cta_trailing_icon)}
            arrowContent={<CtaTrailingIcon image={section.cta_trailing_icon} />}
            className="min-h-[54px] w-auto max-w-[15.8125rem] shrink-0 border-0 px-[18px] text-[20px] font-normal !bg-[linear-gradient(135deg,var(--palette-brand)_0%,var(--palette-brand-strong)_100%)] text-white shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)]"
          >
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );

  const visualColumn = (
    <div
      className={`${REVEAL_ITEM} relative mx-auto flex w-full max-w-[30.25rem] flex-col items-center justify-center`}
    >
      {/* No decorative_panel layer, wash, or drop shadows — visuals only (Figma flat collage). */}

      {section.main_visual ? (
        <div className="relative z-1 w-full">
          <Media
            image={section.main_visual}
            width={712}
            height={908}
            className="h-auto w-full object-cover"
            sizes="(min-width: 1024px) min(30.25rem, 100vw), 90vw"
            preferLargestSource
          />
        </div>
      ) : null}

      {section.floating_circles.map((img, i) => (
        <div
          key={`${section.id}-circle-${i}`}
          className={`pointer-events-none absolute ${FLOATING_CIRCLE_LAYOUT[i % FLOATING_CIRCLE_LAYOUT.length]}`}
          aria-hidden
        >
          <Media
            image={img}
            width={220}
            height={220}
            className="size-full rounded-full border-[3px] border-[var(--palette-white)] object-cover"
            sizes="(min-width: 1024px) 110px, 28vw"
            preferLargestSource
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-[var(--palette-white)] py-10 lg:py-[4.5rem]">
      <Container className="!max-w-[85rem]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
          {section.media_position === "left" ? (
            <>
              {visualColumn}
              {copyColumn}
            </>
          ) : (
            <>
              {copyColumn}
              {visualColumn}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
