import { notFound } from "next/navigation";
import Script from "next/script";
import { headers } from "next/headers";
import { isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { fetchGlobals } from "@/lib/wordpress/fetch-globals";
import { fetchMenu } from "@/lib/wordpress/fetch-menu";
import { getLocaleHrefsForPathname } from "@/lib/wordpress/polylang-locale-hrefs";
import { GlobalAnnouncementBar } from "@/components/layout/GlobalAnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getHidePrimaryMenu } from "@/lib/wordpress/hide-primary-menu-from-pathname";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageScrollAnimations } from "@/components/animations/PageScrollAnimations";
import { getSiteName } from "@/lib/seo/map-yoast-to-metadata";

export const dynamic = "force-dynamic";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export default async function LangLayout({ children, params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const [globals, primary, footer, legal] = await Promise.all([
    fetchGlobals(lang),
    fetchMenu("primary", lang),
    fetchMenu("footer", lang),
    fetchMenu("legal", lang),
  ]);
  const h = await headers();
  const pathname = h.get("x-pathname") ?? `/${lang}/`;
  const [languageSwitcherHrefs, hidePrimaryMenu] = await Promise.all([
    getLocaleHrefsForPathname(pathname),
    getHidePrimaryMenu(globals, lang, pathname),
  ]);
  return (
    <>
      {globals.integrations.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${globals.integrations.gtmId}');`}
        </Script>
      )}
      {globals.integrations.ga4Id && (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${globals.integrations.ga4Id}`} strategy="afterInteractive" />
      )}
      {globals.integrations.ga4Id && (
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${globals.integrations.ga4Id}');`}
        </Script>
      )}
      <div className="flex min-h-screen flex-col" data-site={getSiteName(globals)}>
        <GlobalAnnouncementBar globals={globals} lang={lang} />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <SiteHeader
            globals={globals}
            lang={lang}
            menu={primary}
            hidePrimaryMenu={hidePrimaryMenu}
            languageSwitcherPathname={pathname}
            languageSwitcherHrefs={languageSwitcherHrefs}
          />
          <main className="relative z-0 flex-1">{children}</main>
          <PageScrollAnimations />
        </div>
        <SiteFooter
          globals={globals}
          lang={lang}
          footerMenu={footer}
          legalMenu={legal}
          languageSwitcherPathname={pathname}
          languageSwitcherHrefs={languageSwitcherHrefs}
        />
      </div>
    </>
  );
}

