/** Figma **1325:38** (“Frame 2147230004”) — split checklist + CTA + framed media with rotated brand panel. */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { IsThisForYouSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";

/** Figma checklist: thin brand ring + brand check on white, on a soft square `--palette-surface` pad with light bloom (not a solid brand disc). */
function ChecklistGlyph({ icon }: { icon: WpImage | null }) {
  const surfacePad =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]";

  if (icon) {
    return (
      <span className={`mt-[2px] ${surfacePad} [&_img]:object-contain`}>
        <Media
          image={icon}
          width={39}
          height={39}
          className="h-[39px] max-h-[39px] w-[39px] max-w-[39px]"
          sizes="39px"
          preferLargestSource
        />
      </span>
    );
  }
  return (
    <span className={`relative mt-[2px] ${surfacePad}`} aria-hidden>
      <span className="flex size-[39px] items-center justify-center rounded-full border-2 border-[var(--palette-brand)] bg-[var(--palette-white)]">
        <svg
          className="h-[13px] w-[15px] text-[var(--palette-brand)]"
          viewBox="0 0 15 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 6.5L5.5 11L14 1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

export function IsThisForYouSection({
  section,
  lang,
}: {
  section: IsThisForYouSectionT;
  lang: Locale;
}) {
  const resolved = resolveLink(section.button, lang);
  const ctaLabel = resolved?.label?.trim() || section.button?.title?.trim() || "";
  const ctaHref = resolved?.href;

  const checklistRows = section.checklist.map((r) => r.text.trim()).filter(Boolean);

  const hasCopy =
    Boolean(section.title.trim()) ||
    Boolean(section.subtitle.trim()) ||
    checklistRows.length > 0 ||
    Boolean(section.footer_note.trim());

  const hasBody = hasCopy || section.image != null || Boolean(ctaHref && ctaLabel);

  if (!hasBody) return null;

  const copy = (
    <div className="flex min-w-0 w-full max-w-[34.125rem] flex-col gap-6">
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

        {checklistRows.length > 0 ? (
          <>
            <div
              className="h-px w-full max-w-[33.875rem] bg-[color-mix(in_srgb,var(--palette-brand)_35%,transparent)]"
              aria-hidden
            />
            <ul className="flex max-w-[27.375rem] list-none flex-col gap-2.5 p-0">
              {section.checklist.map((row, i) => {
                const line = row.text.trim();
                if (!line) return null;
                return (
                  <li key={`${section.id}-chk-${i}`} className="flex items-start gap-[7px]">
                    <ChecklistGlyph icon={row.icon} />
                    <span className="min-w-0 flex-1 pt-[9px] font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                      {line}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div
              className="h-px w-full max-w-[33.875rem] bg-[color-mix(in_srgb,var(--palette-brand)_35%,transparent)]"
              aria-hidden
            />
          </>
        ) : null}

        {section.footer_note.trim() ? (
          <RichText
            html={section.footer_note}
            className="max-w-[30.75rem] font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)] [&_*]:text-[var(--palette-muted)] [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-2"
          />
        ) : null}
      </div>

      {ctaHref && ctaLabel ? (
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
                  className="h-6 w-6 brightness-0 invert"
                  sizes="24px"
                  preferLargestSource
                />
              </span>
            ) : undefined
          }
          className="h-12 min-h-12 w-full max-w-[13.25rem] shrink-0 self-start px-3 py-3 shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:w-auto sm:px-[14px]"
        >
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );

  const visual =
    section.image != null ? (
      <div
        className={`${REVEAL_ITEM} relative mx-auto w-full max-w-[31rem] shrink-0 lg:mx-0 lg:w-[min(100%,31rem)]`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-[33px] z-0 aspect-[460/524] w-[min(100%,28.75rem)] origin-center rotate-[-4.13deg] rounded-[14px] bg-[var(--palette-brand)]"
        />
        <div className="relative z-10 ml-[18px] mt-[17px] aspect-[460/523] w-[min(calc(100%-18px),28.75rem)] overflow-hidden rounded-[14px]">
          <Media
            image={section.image}
            width={920}
            height={1046}
            className="h-full w-full object-cover object-center"
            sizes="(min-width: 1024px) 460px, 90vw"
            preferLargestSource
          />
        </div>
      </div>
    ) : null;

  return (
    <section lang={lang} className="bg-[var(--palette-white)] py-16 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-center lg:gap-[5.8125rem]">
          <div className="order-2 min-w-0 shrink-0 lg:order-1">{copy}</div>
          {visual ? <div className="order-1 w-full min-w-0 lg:order-2 lg:w-auto">{visual}</div> : null}
        </div>
      </Container>
    </section>
  );
}
