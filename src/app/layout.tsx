import type { Metadata } from "next";
import { headers } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { localeFromPathname } from "@/lib/i18n/locale-url";
import { fetchGlobals } from "@/lib/wordpress/fetch-globals";
import {
  GoogleTagManagerBody,
  GoogleTagManagerHead,
  sanitizeGtmId,
} from "@/components/analytics/GoogleTagManager";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Salonora", template: "%s | Salonora" },
  description: "Online bookings for salons",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

function resolveHtmlLang(pathname: string): Locale {
  const fromPath = localeFromPathname(pathname);
  if (isLocale(fromPath)) return fromPath;
  return defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? `/${defaultLocale}`;
  const lang = resolveHtmlLang(pathname);
  const globals = await fetchGlobals(lang);
  const gtmId = sanitizeGtmId(globals.integrations.gtmId);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <GoogleTagManagerHead gtmId={gtmId} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <GoogleTagManagerBody gtmId={gtmId} />
        {children}
      </body>
    </html>
  );
}
