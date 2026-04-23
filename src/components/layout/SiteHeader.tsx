import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
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

export function SiteHeader({ globals, lang, menu }: Props) {
  const logo = globals.header.headerStyle === "dark" ? globals.header.headerLogoDark : globals.header.headerLogo;
  const c = resolveLink(globals.header.headerCtaLink, lang);
  return (
    <header
      className={`${
        globals.header.headerSticky ? "sticky top-0 z-50 backdrop-blur-md" : ""
      } border-b border-sky-100/50 bg-white/90`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={buildLocalePath(lang, "")} className="flex items-center gap-2" aria-label="Home">
          {logo ? <Media image={logo} width={180} height={40} className="h-9 w-auto" /> : <span className="text-lg font-bold text-[#0c1d3a]">Salonora</span>}
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {menu.map((m) => (
            <Link key={m.id} href={m.href} className="text-sm font-medium text-slate-700 hover:text-[#1e5bb8]" target={m.target}>
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {globals.header.showLanguageSwitcher && <LanguageSwitcher lang={lang} className="hidden sm:flex" />}
          {globals.header.showHeaderCta && c && (
            <Button href={c.href} variant="primary" className="!px-4 !py-2 text-sm" target={c.target}>
              {c.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
