/** @see Figma **696:4046** — qualification split: “voor jou” / “niet voor jou” cards, gradient portrait column, footer CTA band. */
import { ArrowInCircle } from "@/components/ui/ArrowInCircle";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { IsDemoForYouSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";
import Link from "next/link";
import type { CSSProperties } from "react";

/** Single-line `background` — newlines inside the value break `background` in some engines (flat blue panel). */
const panelGradient: CSSProperties = {
  background: [
    "radial-gradient(120% 85% at 50% -5%, color-mix(in srgb, var(--palette-white) 32%, transparent) 0%, transparent 45%)",
    "radial-gradient(95% 70% at 100% 100%, color-mix(in srgb, var(--palette-brand-strong) 55%, transparent) 0%, transparent 55%)",
    "linear-gradient(168deg, var(--palette-brand) 0%, color-mix(in srgb, var(--palette-brand) 55%, var(--palette-brand-strong)) 48%, var(--palette-brand-strong) 100%)",
  ].join(", "),
};

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
      <Container className="!max-w-[85rem]">
        <div className="flex flex-col gap-10 md:gap-12">
          {title ? (
            <h2
              className={`${REVEAL_ITEM} m-0 text-center font-sans text-3xl font-semibold leading-tight tracking-tight text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
            >
              {title}
            </h2>
          ) : null}

          {(hasLists || hasPortrait) && (
            <div
              className={`grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-x-8 ${REVEAL_ITEM}`}
            >
              <div className="flex min-w-0 flex-col gap-6">
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
                  className={`${REVEAL_ITEM} relative isolate flex min-h-[min(24rem,70vw)] w-full flex-col overflow-hidden rounded-xl lg:min-h-[36rem]`}
                  style={panelGradient}
                >
                  {section.panel_overlay ? (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-90"
                      aria-hidden
                    >
                      <Media
                        image={section.panel_overlay}
                        fill
                        className="object-cover object-center"
                        sizes="(min-width: 1024px) 40vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-25"
                    aria-hidden
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--palette-white) 55%, transparent) 0%, transparent 55%)`,
                    }}
                  />
                  {/* Padding on all sides + contain so head and feet stay inside the gradient card. */}
                  <div className="relative flex min-h-0 flex-1 flex-col justify-end px-3 pt-14 sm:px-5 sm:pt-16 md:pt-20 lg:min-h-[28rem] lg:px-6 lg:pt-24">
                    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                      <Media
                        image={portraitImage}
                        width={546}
                        height={621}
                        className="mx-auto h-auto w-full max-h-[min(30rem,75vh)] object-contain object-center lg:max-h-[min(34rem,70vh)]"
                        sizes="(min-width: 1024px) 40vw, 90vw"
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
                  <Link
                    href={cta.href}
                    target={cta.target}
                    className="inline-flex min-h-16 w-full shrink-0 items-center justify-between gap-6 rounded-full border border-white bg-white px-5 py-3 font-sans text-base font-normal leading-6 text-navy-deep shadow-sm transition hover:bg-surface sm:px-6 sm:text-lg lg:w-auto lg:min-w-[26rem] lg:max-w-md xl:max-w-lg"
                  >
                    <span className="min-w-0 text-pretty text-left">
                      {(section.cta_link?.title || cta.label).trim() ||
                        "Demo aanvragen"}
                    </span>
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9"
                      aria-hidden
                    >
                      {section.cta_trailing_icon ? (
                        <Media
                          image={section.cta_trailing_icon}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <ArrowInCircle
                          variant="on-light"
                          className="!h-8 !w-8 sm:!h-9 sm:!w-9"
                        />
                      )}
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
