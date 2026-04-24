import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { resolveLink } from "@/lib/utils/links";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { GlobalSettings } from "@/types/globals";
import type { MenuItem } from "@/types/menu";
import type { Locale } from "@/lib/i18n/locales";
import { buildLocalePath } from "@/lib/i18n/get-alternates";

type Props = {
  globals: GlobalSettings;
  lang: Locale;
  menu: MenuItem[];
};

function resolveHeaderLogo(header: GlobalSettings["header"]): GlobalSettings["header"]["headerLogo"] {
  const { headerStyle, headerLogo, headerLogoDark } = header;
  if (headerStyle === "dark") {
    return headerLogoDark ?? headerLogo;
  }
  return headerLogo ?? headerLogoDark;
}

function HeaderCtaArrow() {
  return (
    <span
      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-white/80 transition-transform duration-200 ease-out group-hover:translate-x-px"
      aria-hidden
    >
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="text-white">
        <path
          d="M2 7h9M8 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function SiteHeader({ globals, lang, menu }: Props) {
  const logo = resolveHeaderLogo(globals.header);
  const c = resolveLink(globals.header.headerCtaLink, lang);
  const sticky = globals.header.headerSticky;
  const hasAnnouncement = Boolean(globals.site.enableAnnouncement && globals.site.announcementText);
  /* Pull <main> up so the hero sits under the bar; larger pull when an announcement bar sits above the header. */
  const overlapPull = hasAnnouncement ? "-mb-[7.5rem]" : "-mb-24";

  return (
    <header
      className={
        sticky
          ? `sticky top-3 z-50 w-full bg-transparent px-4 py-2 sm:px-6 lg:px-8 ${overlapPull}`
          : `relative z-50 w-full bg-transparent px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8 ${overlapPull}`
      }
    >
      <div className="mx-auto max-w-6xl">
        <div
          className={
            "flex min-h-[52px] items-center justify-between gap-3 rounded-full border border-surface bg-white px-4 py-2.5 shadow-[0_10px_25px_-5px_rgba(0,39,82,0.06),0_12px_32px_-10px_rgba(21,41,81,0.1)] outline outline-1 outline-offset-[3px] outline-brand/25 sm:gap-5 sm:px-6 sm:py-3"
          }
        >
          <Link href={buildLocalePath(lang, "")} className="flex shrink-0 items-center gap-2" aria-label="Home">
            {logo ? (
              <Media image={logo} width={180} height={40} className="h-8 w-auto sm:h-9" />
            ) : (
              <span className="text-[17px] font-semibold tracking-tight text-navy">Salonora</span>
            )}
          </Link>

          <nav
            className="mx-auto hidden min-w-0 max-w-[min(100%,520px)] flex-1 items-center justify-center gap-6 px-2 md:flex lg:gap-8"
            aria-label="Primary"
          >
            {menu.map((m) => (
              <Link
                key={m.id}
                href={m.href}
                className="relative whitespace-nowrap py-1 text-[14px] font-medium tracking-wide text-muted transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-navy/50 after:transition-transform after:duration-200 after:ease-out hover:text-navy hover:after:scale-x-100"
                target={m.target}
              >
                {m.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {globals.header.showLanguageSwitcher && <LanguageSwitcher lang={lang} variant="header" />}
            {globals.header.showHeaderCta && c && (
              <Link
                href={c.href}
                target={c.target}
                rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-[14px] font-medium tracking-wide text-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:brightness-110 hover:shadow-md hover:shadow-navy-deep/18 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:px-6 sm:py-2.5 sm:text-[15px]"
              >
                <span className="max-w-[9rem] truncate sm:max-w-none">{c.label}</span>
                <HeaderCtaArrow />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
