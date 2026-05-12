/** @see Figma **597:3503** (“Frame 2147228620”) — two-column audience card: stacked media + copy, checklist, accent pricing line, brand CTA. */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { MediaTextChecklistSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";

function ChecklistIcon({ icon }: { icon: WpImage | null }) {
  if (icon) {
    return (
      <span className="mt-0.5 inline-flex size-[25px] shrink-0 items-center justify-center [&_img]:object-contain">
        <Media
          image={icon}
          width={25}
          height={25}
          className="h-[25px] w-[25px]"
          sizes="25px"
          preferLargestSource
        />
      </span>
    );
  }
  return <CheckIcon />;
}

function CheckIcon() {
  return (
    <span
      className="relative mt-0.5 inline-flex size-[25px] shrink-0 items-center justify-center rounded-full bg-[var(--palette-brand)]"
      aria-hidden
    >
      <svg
        className="h-[13px] w-[15px] text-[var(--palette-white)]"
        viewBox="0 0 15 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 6.5L5.5 11L14 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function MediaTextChecklistSection({
  section,
  lang,
}: {
  section: MediaTextChecklistSectionT;
  lang: Locale;
}) {
  const resolved = resolveLink(section.button, lang);
  const ctaLabel =
    resolved?.label?.trim() || section.button?.title?.trim() || "";
  const ctaHref = resolved?.href;

  const outerCard =
    section.panel_style === "white_card"
      ? "bg-[var(--palette-white)] border border-[color-mix(in_srgb,var(--palette-brand)_18%,transparent)] shadow-[0_6px_20px_0px_rgba(57,144,240,0.14)]"
      : "bg-[var(--palette-surface)]";

  const bottomFrameBg =
    section.panel_style === "white_card"
      ? "bg-[var(--palette-surface)]"
      : "bg-[var(--palette-white)]";

  const mediaOrder =
    section.media_position === "left"
      ? "order-1 lg:order-1"
      : "order-1 lg:order-2";
  const copyOrder =
    section.media_position === "left"
      ? "order-2 lg:order-2"
      : "order-2 lg:order-1";

  const hasMedia = Boolean(section.image_top || section.image_bottom);
  const hasUpperBlock =
    Boolean(section.title || section.subtitle || section.description) ||
    Boolean(section.checklist_title) ||
    section.checklist.length > 0;
  const hasChecklistBlock =
    Boolean(section.checklist_title) || section.checklist.length > 0;
  const hasTitleBlock = Boolean(
    section.title || section.subtitle || section.description,
  );

  const hasFooter = Boolean(section.pricing_label || (ctaHref && ctaLabel));
  const hasTestimonial = Boolean(
    section.testimonial_heading ||
    section.testimonial_body ||
    section.testimonial_author_image ||
    section.testimonial_author_name ||
    section.testimonial_author_role,
  );
  const hasAuthorRow = Boolean(
    section.testimonial_author_image ||
    section.testimonial_author_name ||
    section.testimonial_author_role,
  );

  const mediaColumn = (
    <div
      className={`flex min-w-0 flex-col gap-4 sm:gap-6 lg:h-full lg:min-h-0 ${hasMedia ? mediaOrder : ""}`}
    >
      {section.image_top ? (
        <div className="relative h-[min(188px,52vw)] w-full shrink-0 overflow-hidden rounded-[14px] sm:rounded-2xl lg:h-[188px]">
          <Media
            image={section.image_top}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 42vw, 100vw"
            preferLargestSource
          />
        </div>
      ) : null}
      {section.image_bottom ? (
        <div
          className={`flex min-h-0 flex-col rounded-2xl p-2.5 sm:p-3 lg:min-h-0 lg:flex-1 lg:p-4 ${bottomFrameBg}`}
        >
          <div className="relative h-[min(415px,80vw)] w-full overflow-hidden rounded-xl sm:rounded-2xl lg:h-auto lg:min-h-[400px] lg:flex-1">
            <Media
              image={section.image_bottom}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
              preferLargestSource
            />
          </div>
        </div>
      ) : null}
    </div>
  );

  const titleBlock = hasTitleBlock ? (
    <div className="flex flex-col gap-3.5">
      {section.title ? (
        <h2 className="font-sans text-[32px] font-semibold leading-[1.17] text-[var(--palette-navy)] sm:text-[40px] lg:text-[48px] lg:leading-[56px]">
          {section.title}
        </h2>
      ) : null}
      {section.subtitle ? (
        <p className="font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
          {section.subtitle}
        </p>
      ) : null}
      {section.description ? (
        <RichText
          html={section.description}
          className="!prose-p:mb-0 !prose-p:mt-0 [&_p+p]:mt-[14px] [&_p]:text-[16px] [&_p]:font-normal [&_p]:leading-[1.5] [&_p]:text-[var(--palette-muted)] prose-strong:font-semibold prose-strong:text-[var(--palette-navy)]"
        />
      ) : null}
    </div>
  ) : null;

  const checklistBlock = hasChecklistBlock ? (
    <div className="flex flex-col gap-3.5">
      {section.checklist_title ? (
        <p className="font-sans text-[20px] font-semibold leading-[1.4] text-[var(--palette-navy)]">
          {section.checklist_title}
        </p>
      ) : null}
      {section.checklist.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {section.checklist.map((row, idx) =>
            row.text ? (
              <li
                key={`${section.id}-chk-${idx}`}
                className="flex items-center gap-2"
              >
                <ChecklistIcon icon={row.icon} />
                <span className="font-sans text-base font-normal leading-[1.4] text-[var(--palette-muted)]">
                  {row.text}
                </span>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </div>
  ) : null;

  const copyColumn = (
    <div
      className={`flex min-w-0 flex-col gap-6 lg:min-h-0 lg:max-w-[36rem] ${hasMedia ? `${copyOrder} lg:h-full lg:justify-between lg:gap-0` : ""}`}
    >
      {hasUpperBlock || hasTestimonial ? (
        <div className="flex shrink-0 flex-col gap-6">
          {hasUpperBlock ? (
            <div className="flex flex-col gap-4.5">
              {titleBlock}
              {checklistBlock}
            </div>
          ) : null}
          {hasTestimonial ? (
            <div className="flex flex-col gap-3.5">
              {section.testimonial_heading ? (
                <p className="font-sans text-[20px] font-semibold leading-[1.4] tracking-[-0.02em] text-[var(--palette-navy)]">
                  {section.testimonial_heading}
                </p>
              ) : null}
              {section.testimonial_body ? (
                <RichText
                  html={section.testimonial_body}
                  className="!prose-p:mb-0 !prose-p:mt-0 [&_p+p]:mt-[14px] [&_p]:text-[16px] [&_p]:font-normal [&_p]:leading-[1.5] [&_p]:text-[var(--palette-muted)] prose-strong:font-semibold prose-strong:text-[var(--palette-navy)]"
                />
              ) : null}
              {hasAuthorRow ? (
                <div className="flex items-start gap-4">
                  {section.testimonial_author_image ? (
                    <span className="relative mt-0.5 inline-flex size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-[color-mix(in_srgb,var(--palette-navy)_8%,transparent)] [&_img]:object-cover">
                      <Media
                        image={section.testimonial_author_image}
                        width={44}
                        height={44}
                        className="h-11 w-11"
                        sizes="44px"
                        preferLargestSource
                      />
                    </span>
                  ) : null}
                  {section.testimonial_author_name ||
                  section.testimonial_author_role ? (
                    <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                      {section.testimonial_author_name ? (
                        <span className="font-sans text-base font-semibold leading-[1.35] text-[var(--palette-navy)]">
                          {section.testimonial_author_name}
                        </span>
                      ) : null}
                      {section.testimonial_author_role ? (
                        <span className="font-sans text-[15px] font-normal leading-[1.4] text-[var(--palette-muted)]">
                          {section.testimonial_author_role}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasFooter ? (
        <div className="flex shrink-0 flex-col gap-6">
          {section.pricing_label ? (
            <p className="font-sans text-[20px] font-semibold leading-[1.4] text-[var(--palette-accent)] mt-2">
              {section.pricing_label}
            </p>
          ) : null}

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
                  <span className="inline-flex size-5 shrink-0 items-center justify-center [&_img]:object-contain">
                    <Media
                      image={section.button_trailing_icon}
                      width={20}
                      height={20}
                      className="h-5 w-5"
                      sizes="20px"
                      preferLargestSource
                    />
                  </span>
                ) : undefined
              }
              className="h-12 min-h-12 w-[290px] max-w-full shrink-0 self-start px-5 shadow-[0px_6px_10px_rgba(57,144,240,0.54)]"
            >
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section lang={lang} className="bg-[var(--palette-white)] py-7 md:py-8">
      <Container className="!max-w-[85rem]">
        <div
          className={`${REVEAL_ITEM} grid gap-10 rounded-[20px] p-6 sm:p-10 md:gap-12 lg:items-stretch lg:gap-15 lg:p-14 ${hasMedia ? "lg:grid-cols-2" : ""} ${outerCard}`}
        >
          {hasMedia ? mediaColumn : null}
          {copyColumn}
        </div>
      </Container>
    </section>
  );
}
