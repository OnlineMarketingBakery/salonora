import { NextRequest, NextResponse } from "next/server";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { supportedLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";
import { getLocaleHrefsForPathname } from "@/lib/wordpress/polylang-locale-hrefs";

function pathAfterLocale(pathname: string): string {
  const s = pathname.split("/").filter(Boolean);
  if (s.length < 1) return "";
  const [first, ...r] = s;
  if (supportedLocales.includes(first as Locale)) {
    return r.join("/");
  }
  return s.join("/");
}

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
