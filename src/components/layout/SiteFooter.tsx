import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { resolveLink } from "@/lib/utils/links";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { GlobalSettings } from "@/types/globals";
import type { MenuItem } from "@/types/menu";
import type { Locale } from "@/lib/i18n/locales";

const socials = (g: GlobalSettings) =>
  [
    g.contact.linkedinUrl && { href: g.contact.linkedinUrl, label: "LinkedIn" },
    g.contact.instagramUrl && { href: g.contact.instagramUrl, label: "Instagram" },
    g.contact.facebookUrl && { href: g.contact.facebookUrl, label: "Facebook" },
    g.contact.youtubeUrl && { href: g.contact.youtubeUrl, label: "YouTube" },
  ].filter(Boolean) as { href: string; label: string }[];

type Props = {
  globals: GlobalSettings;
  lang: Locale;
  footerMenu: MenuItem[];
  legalMenu: MenuItem[];
};

export function SiteFooter({ globals, lang, footerMenu, legalMenu }: Props) {
  return (
    <footer className="mt-auto bg-[#0c1d3a] text-sky-100/90">
      {globals.site.globalCtaTitle && (
        <div className="border-b border-white/10 py-10 text-center">
          <h2 className="text-2xl font-bold text-white">{globals.site.globalCtaTitle}</h2>
          {globals.site.globalCtaText && <p className="mt-2 text-sm text-sky-200">{globals.site.globalCtaText}</p>}
          {globals.site.globalCtaLink && (
            <a
              href={resolveLink(globals.site.globalCtaLink, lang)?.href}
              className="mt-4 inline-block rounded-full bg-[#1e5bb8] px-6 py-2 text-sm font-semibold text-white"
            >
              {globals.site.globalCtaLink.title}
            </a>
          )}
        </div>
      )}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          {globals.footer.footerLogo ? (
            <Media image={globals.footer.footerLogo} width={200} height={50} className="h-10 w-auto" />
          ) : (
            <p className="text-lg font-bold text-white">Salonora</p>
          )}
          {globals.footer.footerText && <RichText html={globals.footer.footerText} className="mt-3 text-sm" />}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase text-white/90">Contact</h3>
          {globals.contact.mainPhone && <p className="mt-2 text-sm">{globals.contact.mainPhone}</p>}
          {globals.contact.mainEmail && (
            <a href={`mailto:${globals.contact.mainEmail}`} className="mt-1 block text-sm hover:underline">
              {globals.contact.mainEmail}
            </a>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase text-white/90">Links</h3>
          <ul className="mt-2 space-y-1">
            {footerMenu.map((m) => (
              <li key={m.id}>
                <Link href={m.href} className="text-sm hover:underline" target={m.target}>
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {globals.site.siteNameOverride && <p className="text-sm font-semibold text-white">{globals.site.siteNameOverride}</p>}
          {globals.site.defaultTagline && <p className="mt-2 text-sm">{globals.site.defaultTagline}</p>}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-sky-200/80">{globals.footer.footerCopyright || `© ${new Date().getFullYear()} Salonora`}</p>
          <div className="flex items-center gap-3">
            {legalMenu.map((m) => (
              <Link key={m.id} href={m.href} className="text-xs text-sky-200/80 hover:underline" target={m.target}>
                {m.label}
              </Link>
            ))}
            {globals.footer.showFooterLanguageSwitcher && <LanguageSwitcher lang={lang} />}
          </div>
          {socials(globals).length > 0 && (
            <ul className="flex gap-3" aria-label="Social">
              {socials(globals).map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-xs hover:underline" rel="noreferrer" target="_blank">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
