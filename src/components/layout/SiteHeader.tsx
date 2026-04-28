import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNavDrawer } from "./MobileNavDrawer";
import type { GlobalSettings } from "@/types/globals";
import type { MenuItem } from "@/types/menu";
import type { Locale } from "@/lib/i18n/locales";
import { buildLocalePath } from "@/lib/i18n/get-alternates";

type Props = {
  globals: GlobalSettings;
  lang: Locale;
  menu: MenuItem[];
  languageSwitcherPathname: string;
  languageSwitcherHrefs: Record<Locale, string> | null;
};

function resolveHeaderLogo(header: GlobalSettings["header"]): GlobalSettings["header"]["headerLogo"] {
  const { headerStyle, headerLogo, headerLogoDark } = header;
  if (headerStyle === "dark") {
    return headerLogoDark ?? headerLogo;
  }
  return headerLogo ?? headerLogoDark;
}

export function SiteHeader({
  globals,
  lang,
  menu,
  languageSwitcherPathname,
  languageSwitcherHrefs,
}: Props) {
  const logo = resolveHeaderLogo(globals.header);
  const c = resolveLink(globals.header.headerCtaLink, lang);
  const mobileCta =
    globals.header.showHeaderCta && c ? { href: c.href, label: c.label, target: c.target } : null;
  const sticky = globals.header.headerSticky;
  const hasAnnouncement = Boolean(globals.site.enableAnnouncement && globals.site.announcementText);
  const overlapPull = hasAnnouncement ? "-mb-[7.5rem]" : "-mb-24";

  return (
    <header
      className={
        sticky
          ? `sticky top-3 z-50 w-full bg-transparent px-4 py-2 sm:px-6 md:px-8 lg:px-10 xl:px-12 ${overlapPull}`
          : `relative z-50 w-full bg-transparent px-4 pt-5 sm:px-6 sm:pt-6 md:px-8 md:pt-5 lg:px-10 lg:pt-5 xl:px-12 ${overlapPull}`
      }
    >
      <div className="mx-auto w-full max-w-[82rem]">
        <div className="rounded-[40px] border border-[rgba(57,144,240,0.14)] p-1.5 sm:p-1.5">
          <div
            className="flex min-h-[68px] w-full items-center justify-between gap-2 rounded-[34px] bg-white pl-4 pr-3 py-2.5 shadow-[0_4px_28px_0px_rgba(48,89,133,0.17)] sm:pl-5"
          >
            <Link
              href={buildLocalePath(lang, "")}
              className="flex min-w-0 shrink-0 items-center gap-2.5 pl-0 sm:pl-1"
              aria-label="Home"
            >
              {logo ? (
                <Media image={logo} width={180} height={40} className="h-8 w-auto sm:h-9" />
              ) : (
                <span className="text-[17px] font-semibold tracking-[-0.04em] text-navy">Salonora</span>
              )}
            </Link>

            <nav
              className="mx-auto hidden min-w-0 max-w-[min(100%,560px)] flex-1 items-center justify-center gap-8 px-1 md:flex lg:gap-[38px]"
              aria-label="Primary"
            >
              {menu.map((m) => (
                <Link
                  key={m.id}
                  href={m.href}
                  className="relative whitespace-nowrap py-1 text-[16px] font-medium tracking-[-0.04em] text-navy transition-colors duration-200 hover:opacity-85"
                  target={m.target}
                >
                  {m.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex min-w-min shrink-0 items-center gap-2.5 sm:gap-3 md:ml-0">
              {globals.header.showLanguageSwitcher && (
                <div className="hidden md:block">
                  <LanguageSwitcher
                    lang={lang}
                    variant="header"
                    serverPathname={languageSwitcherPathname}
                    serverLocaleHrefs={languageSwitcherHrefs}
                  />
                </div>
              )}
              {globals.header.showHeaderCta && c && (
                <Button
                  href={c.href}
                  target={c.target}
                  variant="ctaNavy"
                  ctaSize="compact"
                  ctaFullWidth={false}
                  className="hidden md:inline-flex"
                >
                  <span className="truncate sm:whitespace-nowrap">{c.label}</span>
                </Button>
              )}
              <MobileNavDrawer
                className="md:hidden"
                menu={menu}
                lang={lang}
                showLanguageSwitcher={globals.header.showLanguageSwitcher}
                cta={mobileCta}
                languageSwitcherPathname={languageSwitcherPathname}
                languageSwitcherHrefs={languageSwitcherHrefs}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
