/** @see Figma **696:4046** â€” qualification split: â€œvoor jouâ€ / â€œniet voor jouâ€ cards, gradient portrait column, footer CTA band. */
import { Button } from "@/components/ui/Button";
import { CtaTrailingIcon } from "@/components/ui/CtaTrailingIcon";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { IsDemoForYouSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import Image from "next/image";
import type { CSSProperties } from "react";

/** Figma 696:4123 â€” vertical brand gradient on the portrait column. */
const panelGradient: CSSProperties = {
  background: "linear-gradient(180deg, var(--palette-brand) 0%, #0079ff 100%)",
};

/** Figma 696:4124 â€” all three ring strokes, exported as one RGBA overlay (576Ã—677). */
const PORTRAIT_PANEL_RINGS_SRC = "/is-demo-for-you/portrait-panel-rings.png";

function PortraitPanelRings() {
  return (
    <Image
      src={PORTRAIT_PANEL_RINGS_SRC}
      alt=""
      width={576}
      height={677}
      unoptimized
      className="block h-full w-full select-none object-fill"
      draggable={false}
      aria-hidden
    />
  );
}

const footerBarGradient: CSSProperties = {
  background: [
    "linear-gradient(118deg, var(--palette-navy-deep) 0%, color-mix(in srgb, var(--palette-navy) 65%, var(--palette-navy-deep)) 28%, color-mix(in srgb, var(--palette-brand) 22%, var(--palette-navy-deep)) 56%, var(--palette-navy-deep) 82%, color-mix(in srgb, var(--palette-navy) 90%, var(--palette-navy-deep)) 100%)",
  ].join(" "),
};

/** Outer slot: identical for yes / no / CMS (Figma: light ring + filled disc + white mark). */
const LIST_ICON_SLOT =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center sm:h-[3.25rem] sm:w-[3.25rem]";

const listGlyphShell =
  "flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10";

function ListGlyphFallback({ variant }: { variant: "yes" | "no" }) {
  const ring =
    variant === "yes" ? "rounded-full bg-surface" : "rounded-full bg-surface";
  const fill = variant === "yes" ? "bg-brand" : "bg-rose";
  return (
    <span className={`${LIST_ICON_SLOT} ${ring}`} aria-hidden>
      <span className={`${listGlyphShell} ${fill}`}>
        {variant === "yes" ? (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-white"
            fill="none"
            aria-hidden
          >
            <path
              d="M6.5 12.5 10.5 16.5 18.5 7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-white"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 8l8 8M16 8l-8 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </span>
  );
}

function RowListIcon({
  icon,
  variant,
}: {
  icon: WpImage | null;
  variant: "yes" | "no";
}) {
  if (icon) {
    return (
      <span className={`${LIST_ICON_SLOT}`} aria-hidden>
        <Media
          image={icon}
          width={48}
          height={48}
          className="h-9 w-9 object-contain sm:h-12 sm:w-12"
          sizes="48px"
          preferLargestSource
        />
      </span>
    );
  }
  return <ListGlyphFallback variant={variant} />;
}

function QualCard({
  heading,
  rows,
  variant,
  listIcon,
}: {
  heading: string;
  rows: { text: string }[];
  variant: "yes" | "no";
  listIcon: WpImage | null;
}) {
  if (!heading.trim() && !rows.length) return null;
  return (
    <div
      className={`${REVEAL_ITEM} flex flex-col gap-4 rounded-xl bg-surface p-6 sm:p-7 md:p-8 lg:gap-4`}
    >
      {heading.trim() ? (
        <h3 className="m-0 max-w-[22rem] font-sans text-xl font-semibold leading-snug text-navy md:text-2xl">
          {heading.trim()}
        </h3>
      ) : null}
      {rows.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {rows.map((row, i) => (
            <li key={i} className="flex items-center gap-3">
              <RowListIcon icon={listIcon} variant={variant} />
              <span className="min-w-0 flex-1 font-sans text-base font-normal leading-normal text-muted">
                {row.text}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function IsDemoForYouSection({
  section,
  lang,
}: {
  section: IsDemoForYouSectionT;
  lang: Locale;
}) {
  const portraitImage = section.portrait_image;
  const title = section.title.trim();
  const hasLists =
    Boolean(section.for_you_heading.trim()) ||
    section.for_you_list.length > 0 ||
    Boolean(section.not_for_you_heading.trim()) ||
    section.not_for_you_list.length > 0;
  const hasPortrait = Boolean(portraitImage);
  const footerHtml = section.footer_message.trim();
  const cta = resolveLink(section.cta_link, lang);
  const hasFooter = Boolean(footerHtml) || Boolean(cta?.href);

  if (!title && !hasLists && !hasPortrait && !hasFooter) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 lg:py-14">
      <Container>
        <div className="flex w-full min-w-0 flex-col gap-10 md:gap-12">
          {title ? (
            <SectionHeading
              as="h2"
              text={section.title}
              className={`${REVEAL_ITEM} m-0 text-center font-sans text-3xl font-semibold leading-tight text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
            />
          ) : null}

          {(hasLists || hasPortrait) && (
            <div
              className={`grid w-full min-w-0 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-8 ${REVEAL_ITEM}`}
            >
              <div className="flex min-w-0 w-full flex-col gap-6">
                <QualCard
                  heading={section.for_you_heading}
                  rows={section.for_you_list}
                  variant="yes"
                  listIcon={section.for_you_list_icon}
                />
                <QualCard
                  heading={section.not_for_you_heading}
                  rows={section.not_for_you_list}
                  variant="no"
                  listIcon={section.not_for_you_list_icon}
                />
              </div>

              {hasPortrait ? (
                <div
                  className={`${REVEAL_ITEM} relative isolate mx-auto flex w-full max-w-[36rem] flex-col overflow-hidden rounded-xl max-lg:aspect-[576/677] lg:mx-0 lg:h-full lg:max-w-none lg:min-h-0`}
                  style={panelGradient}
                >
                  <div
                    className="pointer-events-none absolute inset-0 z-0"
                    aria-hidden
                  >
                    <PortraitPanelRings />
                  </div>
                  {/* Figma 696:4128 â€” portrait starts ~56px from panel top (8.3%). */}
                  <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-2 pt-[8.3%] sm:px-4 lg:min-h-[677px] lg:px-0">
                    <div className="relative mx-auto w-full max-w-[34.125rem] lg:max-w-none">
                      <Media
                        image={portraitImage}
                        width={546}
                        height={621}
                        className="mx-auto h-auto w-full max-h-[min(38.625rem,78vh)] object-contain object-bottom lg:max-h-[38.8125rem]"
                        sizes="(min-width: 1024px) 50vw, 92vw"
                        preferLargestSource
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {hasFooter ? (
            <div
              className={`${REVEAL_ITEM} relative isolate overflow-hidden rounded-xl px-6 py-6 sm:px-8 sm:py-6 md:px-10`}
              style={footerBarGradient}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                aria-hidden
                style={{
                  backgroundImage: `radial-gradient(ellipse 90% 80% at 100% 50%, color-mix(in srgb, var(--palette-brand) 35%, transparent) 0%, transparent 55%)`,
                }}
              />
              <div className="relative z-10 flex flex-col items-stretch justify-between gap-6 lg:flex-row lg:items-center lg:gap-10 xl:gap-16">
                {footerHtml ? (
                  <div className="min-w-0 flex-1 font-sans text-lg font-normal leading-snug text-white lg:max-w-xl xl:max-w-none">
                    <RichText
                      html={section.footer_message}
                      className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:text-white prose-strong:font-semibold prose-strong:text-white"
                    />
                  </div>
                ) : (
                  <div className="flex-1" />
                )}
                {cta?.href ? (
                  <Button
                    href={cta.href}
                    target={cta.target}
                    variant="ctaWhite"
                    ctaSize="default"
                    ctaFullWidth
                    ctaJustify="spread"
                    ctaElevation="none"
                    arrowContent={
                      section.cta_trailing_icon ? (
                        <CtaTrailingIcon image={section.cta_trailing_icon} />
                      ) : undefined
                    }
                    className="min-h-16 w-full border border-white sm:w-auto [&_[data-cta-label]]:text-pretty"
                  >
                    {(section.cta_link?.title || cta.label).trim() ||
                      "Demo aanvragen"}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
