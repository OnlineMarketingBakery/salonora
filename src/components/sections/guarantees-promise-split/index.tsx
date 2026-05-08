import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { GuaranteesPromiseSplitSectionT } from "@/types/sections";
import type { WpImage } from "@/types/wordpress";

function ListPointGraphic({ icon }: { icon: WpImage | null }) {
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

function PointRow({ icon, text }: { icon: WpImage | null; text: string }) {
  return (
    <li className="flex min-w-0 items-start gap-[18px]">
      <ListPointGraphic icon={icon} />
      <RichText
        html={text}
        className="prose-strong:font-semibold prose-strong:text-[var(--palette-navy)] !prose-p:mb-0 !prose-p:mt-0 !prose-p:text-[16px] !prose-p:leading-[1.4] prose-p:text-[var(--palette-muted)] prose-p:tracking-normal"
      />
    </li>
  );
}

function BadgeIcon({
  icon,
  accent,
}: {
  icon: WpImage | null;
  accent: "brand" | "rose";
}) {
  const bg =
    accent === "rose"
      ? "bg-[var(--palette-rose)]"
      : "bg-[var(--palette-brand)]";
  return (
    <span
      className={`grid size-[45px] shrink-0 place-items-center rounded-full ${bg}`}
    >
      {icon ? (
        <Media
          image={icon}
          width={24}
          height={24}
          className="h-6 w-6 object-contain brightness-0 invert"
        />
      ) : (
        <span
          className="h-6 w-6 rounded-[6px] bg-[var(--palette-white)]"
          aria-hidden
        />
      )}
    </span>
  );
}

function FloatingBadge({
  text,
  icon,
  accent,
  position,
}: {
  text: string;
  icon: WpImage | null;
  accent: "brand" | "rose";
  position: "left" | "right";
}) {
  /**
   * Figma “Group 584” — left badge sits on viewer’s-left / subject’s outer arm,
   * slightly higher; right badge sits viewer’s-right, lower.
   */
  const pos =
    position === "right"
      ? "right-[1%] bottom-[14%] sm:right-[5%] sm:bottom-[12%]"
      : "left-[-2%] top-[42%] sm:left-[0] sm:top-[44%]";

  return (
    <div
      className={`pointer-events-none absolute ${pos} z-10 flex h-[54px] min-h-[54px] items-center gap-2 rounded-[47px] bg-[var(--palette-white)] pl-2 pr-4 shadow-[0_10px_30px_-4px_color-mix(in_srgb,var(--palette-navy-deep)_7%,transparent),0_2px_8px_-2px_color-mix(in_srgb,var(--palette-muted)_12%,transparent)] sm:h-[65px] sm:min-h-[65px] sm:gap-2.5 sm:pr-5`}
      aria-hidden
    >
      <BadgeIcon icon={icon} accent={accent} />
      {/* Figma pills use near-black headline type on white */}
      <span className="whitespace-nowrap font-sans text-[17px] font-bold leading-[1.35] tracking-[-0.02em] text-[var(--foreground)] sm:text-[20px] sm:leading-[1.4]">
        {text}
      </span>
    </div>
  );
}

export function GuaranteesPromiseSplitSection({
  section,
  lang,
}: {
  section: GuaranteesPromiseSplitSectionT;
  lang: Locale;
}) {
  const titleLines = section.title
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const dl = resolveLink(section.downloadLink, lang);

  return (
    <section className="bg-[var(--palette-white)] py-20 md:py-24">
      <Container className="!max-w-[85rem]">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:items-start lg:gap-[53px]">
          <div className={`${REVEAL_ITEM} relative min-w-0`}>
            {/*
              Figma Group 584: 612×624 — pale surface slab, emphasis on rounded bottom;
              portrait + ripples centered; pills overlay.
            */}
            <div className="relative mx-auto w-full max-w-[612px] pb-2 lg:mx-0">
              {/*
                overflow-visible so floating pills aren’t clipped; extra bottom padding
                matches Figma space below the lower badge.
              */}
              <div
                className="relative overflow-visible rounded-t-2xl rounded-b-[40px] px-4 pt-10 pb-14 sm:px-6 sm:pt-12 sm:pb-[4.25rem]"
                style={
                  {
                    /*
                     * Pale field: faint warm center radiating outward (broadcast rings read
                     * from a subtly brighter core), still token-only.
                     */
                  }
                }
              >
                <div className="relative mx-auto aspect-[509/624] w-full max-w-[509px]">
                  {/*
                    Figma: four thin concentric strokes behind the head (553 / 405 / … scaled).
                  */}
                  <div
                    className="pointer-events-none absolute left-1/2 top-[48%] z-0 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-[color-mix(in_srgb,var(--palette-brand)_38%,transparent)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 top-[48%] z-0 aspect-square w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-[color-mix(in_srgb,var(--palette-brand)_30%,transparent)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 top-[48%] z-0 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color-mix(in_srgb,var(--palette-brand)_24%,transparent)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 top-[48%] z-0 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color-mix(in_srgb,var(--palette-brand)_18%,transparent)]"
                    aria-hidden
                  />

                  <div className="absolute inset-0 z-[1]">
                    <div
                      className="relative size-full [&_img]:object-top"
                      style={{
                        /* Soft silhouette fade toward the bottom (cutout/portrait dissolve). */
                        maskImage:
                          "linear-gradient(180deg, black 0%, black min(71%,17.5rem), transparent 96%)",
                        WebkitMaskImage:
                          "linear-gradient(180deg, black 0%, black min(71%,17.5rem), transparent 96%)",
                      }}
                    >
                      <Media
                        image={section.image}
                        fill
                        preferLargestSource
                        sizes="(min-width: 1024px) min(509px, 45vw), 90vw"
                        className="object-contain object-top"
                      />
                    </div>
                    {/*
                      Second read: torso dissolves toward white section (Figma foreground),
                      then subtle surface tie-in under the ripple.
                    */}
                    <div
                      className="pointer-events-none absolute inset-x-[-6%] bottom-0 z-[2] h-[42%] bg-[linear-gradient(180deg,transparent_0%,transparent_42%,color-mix(in_srgb,var(--palette-white)_55%,transparent)_72%,color-mix(in_srgb,var(--palette-white)_92%,var(--palette-surface))_100%)]"
                      aria-hidden
                    />
                  </div>

                  {section.floatingBadges.map((b, i) => (
                    <FloatingBadge
                      key={i}
                      text={b.text}
                      icon={b.icon}
                      accent={b.accent}
                      position={b.position}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${REVEAL_ITEM} flex min-w-0 max-w-[625px] flex-col gap-[31px]`}
          >
            <div className="flex min-w-0 flex-col gap-5 lg:gap-5">
              {section.badge ? (
                <div className="inline-flex h-[42px] min-h-[42px] w-fit max-w-full items-center justify-center rounded-[21px] bg-[color-mix(in_srgb,var(--palette-brand)_10%,transparent)] px-5">
                  <span className="font-sans text-[16px] font-medium leading-[1.6] text-[var(--palette-brand)]">
                    {section.badge}
                  </span>
                </div>
              ) : null}

              {titleLines.length ? (
                <h2 className="max-w-[574px] font-sans text-[48px] font-semibold leading-[56px] tracking-[-0.04em] text-[var(--palette-navy)]">
                  {titleLines.map((l, i) => (
                    <span key={i} className="block">
                      {l}
                    </span>
                  ))}
                </h2>
              ) : null}
            </div>

            {section.points.length ? (
              <ul className="flex min-w-0 flex-col gap-5">
                {section.points.map((p, i) => (
                  <PointRow key={i} icon={p.icon} text={p.text} />
                ))}
              </ul>
            ) : null}

            {dl?.href ? (
              <div className="w-full max-w-[min(100%,453px)] sm:max-w-[453px]">
                <Button
                  href={dl.href}
                  target={dl.target}
                  variant="ctaBrand"
                  ctaElevation="default"
                  ctaJustify="between"
                  showArrow={Boolean(section.cta_trailing_icon)}
                  arrowContent={
                    section.cta_trailing_icon ? (
                      <span
                        className="inline-flex shrink-0 items-center justify-center [&_img]:object-contain"
                        aria-hidden
                      >
                        <Media
                          image={section.cta_trailing_icon}
                          width={21}
                          height={21}
                          className="h-[28px] w-[28px]"
                          sizes="(max-width: 640px) 28px"
                          preferLargestSource
                        />
                      </span>
                    ) : undefined
                  }
                  className="h-auto min-h-12 w-full gap-3 px-4 py-3.5 text-left text-[15px] leading-snug shadow-[0px_6px_10px_color-mix(in_srgb,var(--palette-brand)_54%,transparent)] sm:h-12 sm:min-h-12 sm:gap-[26px] sm:px-[19px] sm:py-0 sm:text-base sm:leading-normal [&_[data-cta-label]]:min-w-0 [&_[data-cta-label]]:flex-1 [&_[data-cta-label]]:pr-1"
                >
                  {dl.label ||
                    "Download onze volledige garanties en voorwaarden"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
