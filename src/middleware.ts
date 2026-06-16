import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/config";
import {
  isSecondaryLocalePrefix,
  localeFromPathname,
  pathAfterLocale,
  stripPrimaryLocalePrefix,
  toInternalAppPath,
} from "@/lib/i18n/locale-url";
import { getFaqLegacyRedirectPath } from "@/lib/legal/faq-slugs";
import { getLegalLegacyRedirectPath } from "@/lib/legal/legal-slugs";
import type { Locale } from "@/lib/i18n/locales";

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

function legacyRedirects(lang: Locale, segment: string): string | null {
  if (segment === "about-us-2") {
    return lang === "nl" ? "/voor-wie-wij-er-zijn" : "/en/for-whom-we-are-here";
  }
  if (lang === "en" && (segment === "blog" || segment === "blog-2")) {
    return "/en/blogs";
  }
  return getFaqLegacyRedirectPath(lang, segment) ?? getLegalLegacyRedirectPath(lang, segment);
}

export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  const segments = p.split("/").filter(Boolean);

  // Replace public /nl and /nl/* with unprefixed primary paths (site not live).
  if (segments[0] === defaultLocale) {
    const target = stripPrimaryLocalePrefix(p);
    if (target !== p) {
      return redirectTo(request, target);
    }
  }

  const lang = localeFromPathname(p);
  const afterLocale = pathAfterLocale(p);

  if (afterLocale) {
    const last = afterLocale.split("/").filter(Boolean).pop();
    if (last) {
      const legacy = legacyRedirects(lang, last);
      if (legacy) {
        return redirectTo(request, legacy);
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", p);

  // Secondary locale: pass through to app/[lang]/...
  if (segments[0] && isSecondaryLocalePrefix(segments[0])) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Primary locale unprefixed: rewrite to internal /nl/...
  const internal = toInternalAppPath(p);
  if (internal !== p) {
    const url = request.nextUrl.clone();
    url.pathname = internal;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
