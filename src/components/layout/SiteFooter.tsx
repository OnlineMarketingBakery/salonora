import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { resolveLink } from "@/lib/utils/links";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import type { GlobalSettings } from "@/types/globals";
import type { MenuItem } from "@/types/menu";
import type { Locale } from "@/lib/i18n/locales";
import { REVEAL_ITEM } from "@/lib/animation-classes";

const gridStyle = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
  backgroundSize: "24px 24px",
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
      className="h-[15px] w-[15px] text-brand"
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
      className="h-[15px] w-[15px] text-brand"
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
      className="h-[15px] w-[15px] text-brand"
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
      className="h-[15px] w-[15px] text-brand"
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

  return (
    <footer className="relative z-0 mt-auto overflow-x-clip overflow-y-visible text-white">
      <div className="relative rounded-t-3xl bg-navy-deep sm:rounded-t-[1.5rem] md:rounded-t-[50px]">
        <div
          className="pointer-events-none absolute inset-0 rounded-t-[inherit]"
          style={{
            background:
              "radial-gradient(ellipse 50% 80% at 50% 0%, rgba(57,144,240,0.1) 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-t-[inherit] opacity-30"
          style={gridStyle}
          aria-hidden
        />

        {g.footer.footerLogo && (
          <div className="relative z-20 flex justify-center pt-3">
            <div className="flex h-[100px] w-[100px] -translate-y-1/2 items-center justify-center rounded-full border border-brand bg-white p-2 shadow-[0px_23px_17px_rgba(67,87,128,0.34)] sm:h-[140px] sm:w-[140px] sm:-translate-y-[50%] sm:p-2.5 md:h-[180px] md:w-[180px] md:pb-[39px] md:pl-[55px] md:pr-[54px] md:pt-[38px]">
              <Media
                image={g.footer.footerLogo}
                width={120}
                height={64}
                className="h-10 w-auto sm:h-18"
              />
            </div>
          </div>
        )}

        <div
          className={[
            "relative z-10 mx-auto w-full max-w-[1300px] px-4 sm:px-6 md:px-8",
            g.footer.footerLogo ? "pt-2 sm:pt-0" : "pt-14 sm:pt-16",
            g.footer.footerLogo && "sm:pt-2 md:pt-3",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-10 lg:pl-0 xl:gap-14 2xl:gap-20 2xl:pl-2 2xl:pr-0 mb-4 sm:mb-10">
            <div className={`${REVEAL_ITEM} w-full min-w-0 max-w-[712px] text-left`}>
              {heading && (
                <h2 className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[2.5rem] lg:text-[3rem] xl:text-[48px]">
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
              {!g.footer.footerText && g.site.defaultTagline && (
                <p className="mt-6 text-base font-normal leading-[1.6] text-white">
                  {g.site.defaultTagline}
                </p>
              )}

              <div className="mt-6 flex w-full min-w-0 max-w-3xl flex-col flex-wrap gap-2.5 sm:flex-row sm:items-center">
                {primaryCta && (
                  <Button
                    href={primaryCta.href}
                    target={primaryCta.target}
                    variant="ctaBrand"
                    ctaJustify="between"
                    ctaElevation="none"
                    arrowClassName="h-5 w-5 shrink-0"
                    className="w-full min-w-0 gap-[15px] pl-[18px] pr-3.5 leading-[normal] sm:w-auto sm:max-w-none"
                  >
                    {g.footer.footerCtaPrimaryLink?.title || primaryCta.label}
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    href={secondaryCta.href}
                    target={secondaryCta.target}
                    variant="ctaWhite"
                    ctaJustify="between"
                    ctaElevation="footerSecondary"
                    arrowClassName="h-5 w-5 shrink-0"
                    className="w-full min-w-0 text-navy-deep gap-[17px] px-4 leading-[normal] sm:w-auto sm:max-w-[368px]"
                  >
                    {g.footer.footerCtaSecondaryLink?.title || secondaryCta.label}
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

            <div className="flex w-full min-w-0 flex-1 flex-col justify-center sm:justify-end gap-10 min-[500px]:flex-row min-[500px]:items-stretch min-[500px]:gap-8 min-[500px]:pl-0 sm:pl-0 lg:max-w-2xl lg:gap-6 xl:max-w-none 2xl:pl-0">
              {(hasNav || hasFollow) && (
                <div
                  className="hidden w-px min-h-[268px] shrink-0 self-stretch bg-white/15 lg:block"
                  aria-hidden
                />
              )}
              {hasNav && (
                <div className={`${REVEAL_ITEM} w-full min-w-0 min-[500px]:max-w-[8.2rem] sm:min-w-[6.5rem] sm:pl-0 md:pl-0 lg:min-w-[7.2rem]`}>
                  <h3 className="text-2xl font-semibold leading-none text-white">
                    Quick Links
                  </h3>
                  <div
                    className="mt-[17px] h-0.5 w-32 max-w-full bg-white/50"
                    aria-hidden
                  />
                  <ul className="mt-4 space-y-2.5" role="list">
                    {footerMenu.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={m.href}
                          className="text-base font-medium leading-[normal] text-white transition hover:text-white/80"
                          target={m.target}
                        >
                          {m.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showMidDivider && (
                <div
                  className="hidden w-px min-h-[200px] shrink-0 self-stretch bg-white/15 min-[500px]:block"
                  aria-hidden
                />
              )}

              {hasFollow && (
                <div className={`${REVEAL_ITEM} w-full min-w-0 min-[500px]:w-auto`}>
                  <h3 className="text-2xl font-semibold leading-none text-white">
                    Follow us
                  </h3>
                  <div
                    className="mt-[17px] h-0.5 w-32 max-w-full bg-white/50"
                    aria-hidden
                  />
                  <ul
                    className="mt-4 space-y-2.5"
                    aria-label="Social"
                    role="list"
                  >
                    {sList.map((s) => {
                      const icon = socialIcon(s.label);
                      return (
                        <li key={s.label}>
                          <a
                            href={s.href}
                            className="group inline-flex min-h-0 items-center gap-1.5 text-base font-normal leading-[normal] text-white transition hover:text-white/80"
                            rel="noreferrer"
                            target="_blank"
                          >
                            {icon && (
                              <span className="inline-flex h-[23px] w-[23px] flex-shrink-0 items-center justify-center rounded-[11.5px] bg-white p-1 text-brand">
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
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="w-[75%] mx-auto pointer-events-none relative [filter:drop-shadow(0_-6px_24px_rgba(57,144,240,0.55))_drop-shadow(0_-16px_48px_rgba(57,144,240,0.4))_drop-shadow(0_-28px_72px_rgba(57,144,240,0.28))_drop-shadow(0_-40px_104px_rgba(57,144,240,0.16))_drop-shadow(0_-52px_140px_rgba(57,144,240,0.08))_drop-shadow(0_-64px_180px_rgba(57,144,240,0.04))]">
            <img
              src="/footer-shape-top.svg"
              width={1283}
              height={54}
              alt=""
              className="block h-auto w-full"
              role="presentation"
              decoding="async"
            />
          </div>
          <div className={` bg-navy-deep relative z-10`}>
            <div className="mx-auto flex w-full max-w-[1300px] flex-col items-center justify-center gap-3 px-4 sm:px-6 pb-5 md:px-8">
              <p className="order-1 text-center text-base font-light text-white/90 md:order-none md:text-left mt-2 sm:-mt-6">
                {g.footer.footerCopyright ||
                  `Copyright ©${new Date().getFullYear()} Salonora all right reserved.`}
              </p>
              <div className="order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:order-none md:justify-end">
                {legalMenu.map((m) => (
                  <Link
                    key={m.id}
                    href={m.href}
                    className="text-sm font-medium text-white/80 transition hover:text-white hover:underline"
                    target={m.target}
                  >
                    {m.label}
                  </Link>
                ))}
                {g.footer.showFooterLanguageSwitcher && (
                  <LanguageSwitcher
                    lang={lang}
                    className="text-sm text-white/80"
                    serverPathname={languageSwitcherPathname}
                    serverLocaleHrefs={languageSwitcherHrefs}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
