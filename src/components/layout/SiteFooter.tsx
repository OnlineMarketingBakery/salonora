import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import {
  SITE_CONTENT_GUTTER_CLASS,
  SITE_CONTENT_INNER_CLASS,
  SITE_CONTENT_MAX_WIDTH_CLASS,
} from "@/lib/layout/site-content-width";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { GlobalSettings } from "@/types/globals";
import type { MenuItem } from "@/types/menu";
import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Mobile notch curve (Figma `Subtract` 807:4502 — Rectangle 479 minus Ellipse 2000).
 *
 * Path coords are shifted so the bowl begins at x=0 (rather than x=114 inside the original
 * 412-wide viewBox). The SVG is rendered at a FIXED 188.712×65 px size centered horizontally,
 * so the curve never distorts when the viewport changes — flat navy shoulders simply grow or
 * shrink either side. This is the cleanest way to keep the bezier shoulders truly pixel-perfect
 * with Figma; `preserveAspectRatio="none"` was scaling the X dimension and visibly stretching
 * the smooth shoulders into long S-curves at narrow viewports.
 */
const MOBILE_NOTCH_WIDTH = 188.712;
const MOBILE_NOTCH_HEIGHT = 65;
const MOBILE_NOTCH_PATH =
  "M0 0 H188.712 C179.985 0 172.895 6.73265 170.005 14.9668 C159.862 43.8638 129.828 64.8135 94.355 64.8135 C58.883 64.8134 28.85 43.8637 18.707 14.9668 C15.816 6.73264 8.727 0 0 0 Z";

/**
 * Desktop notch (Figma 1285:35). Same bezier as `MOBILE_NOTCH_PATH` scaled by the LOGO ratio
 * 180/138 = 1.30435 (not the previous width-only 218/188.712 = 1.155).
 *
 * Why: the 180 px logo with its centre at navy_top − 14 reaches 76 px below the navy top edge.
 * A 75-deep bowl is therefore 1 px shallower than the logo's intrusion → the navy curve sits
 * *on top of* the logo and the Figma white halo around the badge disappears. Scaling by the
 * logo ratio gives 246.13 × 84.78 ≈ a 9 px centre clearance + ~34 px shoulder clearance, which
 * preserves the visible gap from the mobile design (188.712 × 65 has the same proportional
 * clearance against the 138 px mobile logo).
 */
const DESKTOP_NOTCH_WIDTH = 246.13;
const DESKTOP_NOTCH_HEIGHT = 84.78;
const DESKTOP_NOTCH_PATH =
  "M0 0 H246.13 C234.764 0 225.514 8.781 221.745 19.522 C208.493 57.215 169.341 84.547 123.065 84.547 C76.794 84.547 37.642 57.214 24.391 19.522 C20.621 8.780 11.381 0 0 0 Z";

/**
 * Subtle grid on dark footer (Figma reference PNG 597:6103). Cells are ~48px square and the
 * lattice fades out below the top quarter so the grid mainly decorates the upper corners while
 * the middle/bottom of the panel reads as a flat deep navy. White line opacity is set just
 * higher than before so the pattern is detectable against `#002752` without dominating the
 * panel.
 */
const gridStyleDark = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
  backgroundSize: "48px 48px",
  WebkitMaskImage:
    "linear-gradient(to bottom, #000 0%, #000 22%, rgba(0,0,0,0.55) 38%, transparent 60%)",
  maskImage:
    "linear-gradient(to bottom, #000 0%, #000 22%, rgba(0,0,0,0.55) 38%, transparent 60%)",
} as const;

const socials = (g: GlobalSettings) =>
  [
    g.contact.facebookUrl && { href: g.contact.facebookUrl, label: "Facebook" },
    g.contact.instagramUrl && {
      href: g.contact.instagramUrl,
      label: "Instagram",
    },
    g.contact.youtubeUrl && { href: g.contact.youtubeUrl, label: "Youtube" },
    g.contact.linkedinUrl && { href: g.contact.linkedinUrl, label: "Linkedin" },
  ].filter(Boolean) as { href: string; label: string }[];

type Props = {
  globals: GlobalSettings;
  lang: Locale;
  footerMenu: MenuItem[];
  legalMenu: MenuItem[];
  languageSwitcherPathname: string;
  languageSwitcherHrefs: Record<Locale, string> | null;
};

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px] text-brand lg:h-[15px] lg:w-[15px]"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px] text-brand lg:h-[15px] lg:w-[15px]"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px] text-brand lg:h-[15px] lg:w-[15px]"
      fill="currentColor"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px] text-brand lg:h-[15px] lg:w-[15px]"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function socialIcon(label: string) {
  if (label === "Facebook") return <FacebookIcon />;
  if (label === "Instagram") return <InstagramIcon />;
  if (label === "YouTube" || label === "Youtube") return <YouTubeIcon />;
  if (label === "LinkedIn" || label === "Linkedin") return <LinkedinIcon />;
  return null;
}

export function SiteFooter({
  globals,
  lang,
  footerMenu,
  legalMenu,
  languageSwitcherPathname,
  languageSwitcherHrefs,
}: Props) {
  const g = globals;
  const primaryCta = resolveLink(g.footer.footerCtaPrimaryLink, lang);
  const secondaryCta = resolveLink(g.footer.footerCtaSecondaryLink, lang);
  const heading = g.footer.footerTitle;
  const footnoteUnderCtas = g.footer.footerCtaFootnote;
  const sList = socials(g);
  const hasNav = footerMenu.length > 0;
  const hasFollow = sList.length > 0;
  const showMidDivider = hasNav && hasFollow;

  /** Figma stock footer: white type on navy; backgrounds are pure CSS (no CMS image/gradient/color). */
  const fg = "text-white";
  /** Figma 597:6137 — short blue gradient accent under "Quick Links". */
  const ruleGradient =
    "mt-[17px] h-[3px] w-full max-w-[131px] shrink-0 bg-[linear-gradient(90deg,transparent_6%,rgba(57,144,240,0.95)_50%,transparent_94%)] [filter:drop-shadow(0_0_6px_rgba(57,144,240,0.7))]";
  /** Figma 597:6148 — slightly narrower accent under "Follow us". */
  const ruleGradientFollow =
    "mt-[17px] h-[3px] w-full max-w-[111px] shrink-0 bg-[linear-gradient(90deg,transparent_6%,rgba(57,144,240,0.95)_50%,transparent_94%)] [filter:drop-shadow(0_0_6px_rgba(57,144,240,0.7))]";
  /** Vertical separators — fade at top/bottom like Figma gradient rules (597:6134–6170). */
  const colHairline =
    "bg-[linear-gradient(180deg,transparent_6%,rgba(57,144,240,0.95)_50%,transparent_94%)] [filter:drop-shadow(0_0_5px_rgba(57,144,240,0.55))]";
  const showLegalMobile =
    legalMenu.length > 0 || g.footer.showFooterLanguageSwitcher;
  const copyrightText =
    g.footer.footerCopyright.trim() ||
    (g.footer.isCustomFooter
      ? ""
      : `Copyright ©${new Date().getFullYear()} Salonora all right reserved`);

  /** Carve the Figma notch when a footer logo is present (SVG mobile, radial mask desktop). */
  const useNotchMask = Boolean(g.footer.footerLogo);

  return (
    <footer
      className={`relative z-0 mt-auto overflow-x-clip overflow-y-visible ${
        useNotchMask ? "pt-[80px] md:pt-[114px]" : "pt-20 sm:pt-24 md:pt-28"
      } ${fg}`}
    >
      {/*
        Notch is now painted exclusively by the inline SVG overlays below — the radial-gradient
        mask was producing a rough hard-edged circle on tablet/desktop (no Figma shoulders) and is
        gone. Mobile SVG (`< md`) and desktop SVG (`md+`) share the same bezier path family so the
        shoulder shape is consistent at every breakpoint.
      */}

      <div className="relative">
        {/*
          Figma 597:6103 — panel is solid `--palette-navy-deep` (#002752) with a subtle grid
          decorating the upper corners. Top corner radius scales from 17px on mobile to 40px on
          tablet/desktop to match the Figma curve.
        */}
        <div
          className={`footer-notch relative z-2 overflow-x-clip bg-navy-deep ${
            useNotchMask
              ? "rounded-t-[17px] md:rounded-t-[40px]"
              : "sm:rounded-t-[17px] md:rounded-t-[40px]"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 z-2 rounded-t-[inherit] opacity-60"
            style={gridStyleDark}
            aria-hidden
          />

          {/*
            Mobile notch (Figma 1285:34). Inline SVG paints the page bg colour into the carved-out
            dip, replicating Figma's bezier shoulders 1:1. Rendered at a FIXED 188.712×65 px size
            (Figma's exact ellipse subtract width) centred horizontally; this guarantees the curve
            never distorts. Desktop uses the same overlay approach below.
          */}
          {useNotchMask && (
            <svg
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-3 block -translate-x-1/2 md:hidden"
              width={MOBILE_NOTCH_WIDTH}
              height={MOBILE_NOTCH_HEIGHT}
              viewBox={`0 0 ${MOBILE_NOTCH_WIDTH} ${MOBILE_NOTCH_HEIGHT}`}
            >
              <path d={MOBILE_NOTCH_PATH} fill="#ffffff" />
            </svg>
          )}
          {useNotchMask && (
            <svg
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-3 hidden -translate-x-1/2 md:block"
              width={DESKTOP_NOTCH_WIDTH}
              height={DESKTOP_NOTCH_HEIGHT}
              viewBox={`0 0 ${DESKTOP_NOTCH_WIDTH} ${DESKTOP_NOTCH_HEIGHT}`}
            >
              <path d={DESKTOP_NOTCH_PATH} fill="#ffffff" />
            </svg>
          )}

          <div className={`relative z-10 ${SITE_CONTENT_GUTTER_CLASS} pb-0`}>
            <div
              className={[
                `overflow-x-clip ${SITE_CONTENT_INNER_CLASS}`,
                g.footer.footerLogo
                  ? useNotchMask
                    ? "pt-[100px] md:pt-[120px]"
                    : "sm:pt-32 md:pt-36"
                  : "pt-14 sm:pt-16",
              ]
                .filter(Boolean)
                .join(" ")}
            >
            {/*
              At `lg` (1024–1279) the left block flexes to fill the row so longer Dutch CTAs can
              stay side-by-side; at `xl+` we lock to the Figma-exact 625px width with the 183px
              gap, which is the design's intended desktop spec (1440 frame).
            */}
            <div className="mb-0 flex min-w-0 flex-col gap-y-0 lg:flex-row lg:items-start lg:gap-y-0 lg:justify-between lg:gap-x-[40px] xl:justify-start xl:gap-x-[183px]">
              <div
                className={`${REVEAL_ITEM} w-full min-w-0 max-w-[625px] text-left lg:flex-1 lg:max-w-none xl:w-[625px] xl:flex-none xl:max-w-[625px]`}
              >
                {heading && (
                  <h2
                    className={`max-w-[308px] text-[34px] font-semibold leading-[1.34] sm:max-w-none lg:max-w-[586px] lg:text-[40px] ${fg}`}
                  >
                    {heading}
                  </h2>
                )}
                {g.footer.footerText && (
                  <div className={heading ? "mt-6" : ""}>
                    <RichText
                      html={g.footer.footerText}
                      className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-full !prose-p:text-left !prose-p:font-sans !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-white [&>p+_p]:!mt-4 [&_a]:!text-white/90 [&_p]:!text-inherit"
                    />
                  </div>
                )}
                {!g.footer.footerText &&
                  !g.footer.isCustomFooter &&
                  g.site.defaultTagline && (
                  <p
                    className={`mt-6 text-base font-normal leading-[1.6] ${fg}`}
                  >
                    {g.site.defaultTagline}
                  </p>
                )}

                <div className="mt-6 flex w-full min-w-0 max-w-[625px] flex-col flex-wrap items-start gap-[22px] lg:max-w-none lg:flex-row lg:flex-nowrap lg:items-center lg:gap-[10px]">
                  {primaryCta && (
                    <Button
                      href={primaryCta.href}
                      target={primaryCta.target}
                      variant="ctaBrand"
                      ctaJustify="spread"
                      ctaElevation="none"
                      ctaFullWidth={false}
                      className="max-w-full self-start gap-[15px] pl-[18px] pr-3.5 leading-[normal] [&_[data-cta-label]]:whitespace-normal lg:[&_[data-cta-label]]:whitespace-nowrap"
                    >
                      {g.footer.footerCtaPrimaryLink?.title || primaryCta.label}
                    </Button>
                  )}
                  {secondaryCta && (
                    <Button
                      href={secondaryCta.href}
                      target={secondaryCta.target}
                      variant="ctaWhite"
                      ctaJustify="spread"
                      ctaElevation="footerSecondary"
                      ctaFullWidth={false}
                      className="text-navy-deep max-w-full self-start gap-[17px] px-4 leading-[normal] [&_[data-cta-label]]:whitespace-normal lg:[&_[data-cta-label]]:whitespace-nowrap"
                    >
                      {g.footer.footerCtaSecondaryLink?.title ||
                        secondaryCta.label}
                    </Button>
                  )}
                </div>

                {footnoteUnderCtas && (
                  <div className="mt-6">
                    <RichText
                      html={footnoteUnderCtas}
                      className="!prose-p:mb-0 !prose-p:mt-0 !prose-p:max-w-full !prose-p:text-left !prose-p:font-sans !prose-p:text-base !prose-p:font-normal !prose-p:leading-[1.6] !prose-p:text-white/90 [&>p+_p]:!mt-2 [&_a]:!text-white/90"
                    />
                  </div>
                )}
              </div>

              {showLegalMobile && (
                <div className="mt-6 flex w-full min-w-0 flex-row flex-wrap items-center gap-x-[33px] gap-y-2 lg:hidden">
                  {legalMenu.map((m) => (
                    <Link
                      key={m.id}
                      href={m.href}
                      className={`text-base font-normal leading-normal transition hover:underline ${fg} hover:text-white/80`}
                      target={m.target}
                    >
                      {m.label}
                    </Link>
                  ))}
                  {g.footer.showFooterLanguageSwitcher && (
                    <LanguageSwitcher
                      lang={lang}
                      className={`text-base ${fg}`}
                      serverPathname={languageSwitcherPathname}
                      serverLocaleHrefs={languageSwitcherHrefs}
                    />
                  )}
                </div>
              )}

              <div
                className={`${showLegalMobile ? "mt-[51px]" : "mt-8"} flex w-full min-w-0 max-w-[430px] flex-row items-stretch gap-4 lg:mt-0 lg:max-w-none lg:w-auto lg:flex-none lg:gap-[38px]`}
              >
                {/* Figma 807:4528 / 4539 / 4564 — three vertical dividers on mobile + desktop. */}
                {(hasNav || hasFollow) && (
                  <div
                    className={`w-px shrink-0 self-stretch lg:min-h-[268.5px] ${colHairline}`}
                    aria-hidden
                  />
                )}
                {hasNav && (
                  <div
                    className={`${REVEAL_ITEM} min-w-0 flex-1 lg:w-[131px] lg:max-w-[131px] lg:flex-none`}
                  >
                    <h3
                      className={`text-[28px] font-semibold leading-none lg:text-[24px] ${fg}`}
                    >
                      Quick Links
                    </h3>
                    <div className={ruleGradient} aria-hidden />
                    <ul className="mt-[22px] space-y-4 lg:mt-[17px] lg:space-y-2.5" role="list">
                      {footerMenu.map((m) => (
                        <li key={m.id}>
                          <Link
                            href={m.href}
                            className={`text-[17px] font-medium leading-[normal] transition lg:text-base ${fg} hover:text-white/80`}
                            target={m.target}
                          >
                            {m.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Middle divider — visible whenever both columns are present. */}
                {showMidDivider && (
                  <div
                    className={`w-px shrink-0 self-stretch lg:min-h-[268.5px] ${colHairline}`}
                    aria-hidden
                  />
                )}

                {hasFollow && (
                  <div
                    className={`${REVEAL_ITEM} min-w-0 flex-1 lg:w-[130px] lg:max-w-[130px] lg:flex-none`}
                  >
                    <h3
                      className={`text-[28px] font-semibold leading-none lg:text-[24px] ${fg}`}
                    >
                      Follow us
                    </h3>
                    <div className={ruleGradientFollow} aria-hidden />
                    <ul
                      className="mt-[22px] space-y-4 lg:mt-[17px] lg:space-y-2.5"
                      aria-label="Social"
                      role="list"
                    >
                      {sList.map((s) => {
                        const icon = socialIcon(s.label);
                        return (
                          <li key={s.label}>
                            <a
                              href={s.href}
                              className={`group inline-flex min-h-0 items-center gap-2 text-[17px] font-normal leading-[normal] transition lg:gap-1.5 lg:text-base ${fg} hover:text-white/80`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {icon && (
                                <span className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[14px] bg-white p-1.5 text-brand lg:h-[23px] lg:w-[23px] lg:rounded-[11.5px] lg:p-1">
                                  {icon}
                                </span>
                              )}
                              {s.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {(hasNav || hasFollow) && (
                  <div
                    className={`w-px shrink-0 self-stretch lg:min-h-[268.5px] ${colHairline}`}
                    aria-hidden
                  />
                )}
              </div>
            </div>

            {showLegalMobile && (
              // Figma 698:4618 — legal links sit in the navy area, left-aligned, ~50px below the
              // main row, well ABOVE the bottom copyright band. `text-[16px]` `gap-[33px]`.
              <div className="mt-[50px] hidden flex-wrap items-center justify-start gap-x-[33px] gap-y-2 lg:flex">
                {legalMenu.map((m) => (
                  <Link
                    key={m.id}
                    href={m.href}
                    className={`text-[16px] font-normal leading-normal transition hover:underline ${fg} hover:text-white/80`}
                    target={m.target}
                  >
                    {m.label}
                  </Link>
                ))}
                {g.footer.showFooterLanguageSwitcher && (
                  <LanguageSwitcher
                    lang={lang}
                    className={`text-[16px] ${fg}`}
                    serverPathname={languageSwitcherPathname}
                    serverLocaleHrefs={languageSwitcherHrefs}
                  />
                )}
              </div>
            )}
            </div>
          </div>

          {/*
            Figma 597:6115 — gentle wave on top, copyright on the navy band below it.
            Mobile: natural (gentle) wave at the top + solid navy band that covers behind the
            copyright, which sits in flow below the wave with spacing.
            Desktop: copyright overlaid + centred on the natural 54px wave (unchanged).
          */}
          <div className="relative mt-8 w-full bg-navy-deep lg:mt-0 lg:bg-transparent">
            {/* MOBILE wave — STROKE ONLY (no navy fill, so no fill-shadow seam). The band
                container is already #002752, so the line just sits on continuous navy. viewBox is
                tightened to the arc's bounding box, so with preserveAspectRatio="none" the height
                IS the arc's rise (taller = more curve). non-scaling-stroke keeps a crisp 2px line.
                Soft upward halo from drop-shadow, like desktop. */}
            <div
              className="relative z-1 w-full [filter:drop-shadow(0_-2px_6px_rgba(57,144,240,1))_drop-shadow(0_-6px_16px_rgba(57,144,240,0.8))_drop-shadow(0_-14px_38px_rgba(57,144,240,0.55))_drop-shadow(0_-30px_84px_rgba(57,144,240,0.3))] lg:hidden"
              aria-hidden
            >
              <svg
                viewBox="0 -17 1283 70"
                preserveAspectRatio="none"
                className="block h-9 w-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 52.9998C500.334 -16.1125 784.814 -17.2213 1302 52.9997"
                  stroke="url(#footerWaveGradMobile)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <defs>
                  <linearGradient
                    id="footerWaveGradMobile"
                    x1="2"
                    y1="26.8744"
                    x2="1302"
                    y2="26.8743"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#3990F0" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#3990F0" />
                    <stop offset="1" stopColor="#3990F0" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* DESKTOP wave — natural image (unchanged). */}
            <div
              className={`pointer-events-none relative mx-auto hidden w-full ${SITE_CONTENT_MAX_WIDTH_CLASS} [filter:drop-shadow(0_-10px_44px_rgba(57,144,240,0.22))_drop-shadow(0_-30px_100px_rgba(57,144,240,0.1))_drop-shadow(0_-56px_160px_rgba(57,144,240,0.04))] lg:block`}
            >
              <Image
                src="/footer-shape-top.svg"
                width={1283}
                height={54}
                alt=""
                unoptimized
                className="block h-auto w-full"
                role="presentation"
              />
            </div>
            {copyrightText ? (
              <div className="relative z-2 flex items-center justify-center px-5 pb-5 pt-2 md:px-8 lg:absolute lg:inset-0 lg:pb-0 lg:pt-0">
                <p
                  className={`whitespace-nowrap text-center text-[13px] font-normal leading-[1.5] lg:whitespace-normal lg:text-[16px] ${fg}`}
                >
                  {copyrightText}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {g.footer.footerLogo && (
          // Figma 807:4507 places the 138px logo with its top at 80px above the navy top edge
          // (i.e. logo center sits 11px ABOVE the navy top). Desktop equivalent is 14px above.
          <div className="absolute left-1/2 top-[-11px] z-30 -translate-x-1/2 -translate-y-1/2 md:top-[-14px]">
            <div className="flex h-[138px] w-[138px] items-center justify-center rounded-full border border-[#3990F0] bg-white p-2.5 shadow-[0px_23px_17px_rgba(67,87,128,0.34)] sm:h-[140px] sm:w-[140px] md:h-[180px] md:w-[180px] md:pb-[39px] md:pl-[55px] md:pr-[54px] md:pt-[38px]">
              <Media
                image={g.footer.footerLogo}
                width={79}
                height={97}
                className="h-[69px] w-[57px] md:h-[97px] md:w-[79px]"
              />
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
