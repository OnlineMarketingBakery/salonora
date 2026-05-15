/**
 * Unified split: framed media + copy (legacy WP layouts `audience_promo_card`, `is_this_for_you`,
 * and native `split_copy_framed` all normalize to `type: "split_copy_framed"`).
 */
import {
  SplitChecklistRows,
  SplitCopyFramedVisualLayout,
} from "@/components/sections/shared/split-copy-framed-visual-layout";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { SplitCopyFramedSectionT } from "@/types/sections";

export function SplitCopyFramedSection({
  section,
  lang,
}: {
  section: SplitCopyFramedSectionT;
  lang: Locale;
}) {
  const resolved = resolveLink(section.button, lang);
  const ctaLabel = resolved?.label?.trim() || section.button?.title?.trim() || "";
  const ctaHref = resolved?.href;

  const listRows = section.list
    .map((r) => ({ text: r.text.trim(), icon: r.icon }))
    .filter((r) => r.text);

  const isCard = section.layout_mode === "card_grid";
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const hasFlushCopy =
    Boolean(section.title.trim()) ||
    Boolean(section.subtitle.trim()) ||
    listRows.length > 0 ||
    Boolean(section.footer_note.trim());

  const hasFlushBody =
    hasFlushCopy || section.image != null || Boolean(ctaHref && ctaLabel);

  if (!isCard && !hasFlushBody) return null;

  const listBlock =
    listRows.length > 0 ? (
      <>
        {section.show_list_dividers ? (
          <div
            className="h-px w-full bg-[color-mix(in_srgb,var(--palette-brand)_35%,transparent)]"
            aria-hidden
          />
        ) : null}
        <SplitChecklistRows
          idPrefix={`${section.id}-list`}
          rows={listRows}
          variant={section.list_style}
          ulClassName={
            section.list_style === "outlined_tile"
              ? "flex w-full min-w-0 list-none flex-col gap-1 p-0"
              : undefined
          }
          rowTextClassName={
            section.list_style === "outlined_tile"
              ? "min-w-0 flex-1 pt-[9px] font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)]"
              : "min-w-0 flex-1 pt-[7px] font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)]"
          }
        />
        {section.show_list_dividers ? (
          <div
            className="h-px w-full bg-[color-mix(in_srgb,var(--palette-brand)_35%,transparent)]"
            aria-hidden
          />
        ) : null}
      </>
    ) : null;

  const trailingIconClass = section.cta_trailing_icon_invert
    ? "h-6 w-6 brightness-0 invert"
    : "h-6 w-6";

  const ctaButton =
    ctaHref && ctaLabel ? (
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
                className={trailingIconClass}
                sizes="24px"
                preferLargestSource
              />
            </span>
          ) : undefined
        }
        className={
          isCard
            ? "h-12 min-h-12 w-full max-w-[325px] shrink-0 self-start px-[18px] py-3 shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:w-auto"
            : "h-12 min-h-12 w-full max-w-[13.25rem] shrink-0 self-start px-3 py-3 shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:w-auto sm:px-[14px]"
        }
      >
        {ctaLabel}
      </Button>
    ) : null;

  const copy = isCard ? (
    <div className="flex min-w-0 flex-col gap-6 lg:max-w-[608px] lg:flex-1">
      {section.badge_text.trim() ? (
        <div className="inline-flex h-[42px] max-w-full shrink-0 items-center justify-center self-start rounded-[21px] border border-[color-mix(in_srgb,var(--palette-brand)_14%,transparent)] bg-[var(--palette-pill)] px-[19px] py-[15px] text-base font-semibold leading-[1.6] text-[var(--palette-brand)]">
          {section.badge_text.trim()}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-[14px]">
          {titleLines.length > 0 ? (
            <h2 className="font-sans text-[40px] font-bold leading-tight tracking-[-0.04em] text-[var(--palette-navy)] sm:text-[48px] sm:leading-[56px]">
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
              className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-none !prose-p:text-left !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.54] !prose-p:text-[var(--palette-muted)] [&_p+p]:mt-4 [&_strong]:font-semibold [&_strong]:text-[var(--palette-navy)]"
            />
          ) : null}
        </div>

        {listBlock}

        {ctaButton}
      </div>
    </div>
  ) : (
    <div className="flex min-w-0 w-full max-w-[34.125rem] flex-col gap-6 self-start">
      <div className={`${REVEAL_ITEM} flex min-w-0 flex-col gap-6`}>
        {(section.title.trim() || section.subtitle.trim()) && (
          <div className="flex max-w-[20.875rem] flex-col gap-2.5">
            {section.title.trim() ? (
              <h2 className="font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--palette-navy)]">
                {section.title.trim()}
              </h2>
            ) : null}
            {section.subtitle.trim() ? (
              <p className="font-sans text-xl font-normal leading-[1.4] text-[var(--palette-muted)] sm:text-2xl">
                {section.subtitle.trim()}
              </p>
            ) : null}
          </div>
        )}

        {listBlock}

        {section.footer_note.trim() ? (
          <RichText
            html={section.footer_note}
            className="max-w-[30.75rem] font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)] [&_*]:text-[var(--palette-muted)] [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-2"
          />
        ) : null}
      </div>

      {ctaButton}
    </div>
  );

  return (
    <SplitCopyFramedVisualLayout
      lang={lang}
      layoutMode={section.layout_mode}
      visualPosition={section.visual_position}
      cardShadow={section.show_card_shadow}
      sectionClassName={
        isCard
          ? "bg-[var(--palette-white)] py-7 md:py-8"
          : "bg-[var(--palette-white)] py-16 md:py-24"
      }
      containerClassName="!max-w-[85rem]"
      innerClassName={isCard ? REVEAL_ITEM : undefined}
      visualInnerClassName={!isCard && section.image != null ? REVEAL_ITEM : undefined}
      copy={copy}
      framedImage={section.image}
    />
  );
}
