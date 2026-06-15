import { NextRequest, NextResponse } from "next/server";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { pathAfterLocale } from "@/lib/i18n/locale-url";
import { supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { getLocaleHrefsForPathname } from "@/lib/wordpress/polylang-locale-hrefs";

function sameSlugHrefsForPathname(pathname: string): Record<Locale, string> {
  const p = pathAfterLocale(pathname);
  return Object.fromEntries(
    supportedLocales.map((l) => [l, buildLocalePath(l, p)])
  ) as Record<Locale, string>;
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname || !pathname.startsWith("/")) {
    return NextResponse.json({ hrefs: sameSlugHrefsForPathname("/") });
  }
  const res = await getLocaleHrefsForPathname(pathname);
  if (!res) {
    return NextResponse.json({ hrefs: sameSlugHrefsForPathname(pathname) });
  }
  return NextResponse.json({ hrefs: res });
}
