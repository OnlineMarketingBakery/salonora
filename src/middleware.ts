import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/config";
import {
  isAnyLocalePrefix,
  pathAfterLocale,
} from "@/lib/i18n/locale-url";
import { getFaqLegacyRedirectPath } from "@/lib/legal/faq-slugs";
import { getLegalLegacyRedirectPath } from "@/lib/legal/legal-slugs";
import type { Locale } from "@/lib/i18n/locales";

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, 301);
}

function legacyRedirects(lang: Locale, segment: string): string | null {
  if (segment === "about-us-2") {
    return lang === "nl" ? "/nl/voor-wie-wij-er-zijn" : "/en/for-whom-we-are-here";
  }
  if (lang === "en" && (segment === "blog" || segment === "blog-2")) {
    return "/en/blogs";
  }
  return getFaqLegacyRedirectPath(lang, segment) ?? getLegalLegacyRedirectPath(lang, segment);
}

export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  const segments = p.split("/").filter(Boolean);

  if (p === "/" || p === "") {
    return redirectTo(request, `/${defaultLocale}`);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", p);

  if (segments[0] && isAnyLocalePrefix(segments[0])) {
    const lang = segments[0] as Locale;
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

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const legacyTarget = `/${defaultLocale}${p.startsWith("/") ? p : `/${p}`}`;
  return redirectTo(request, legacyTarget);
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
