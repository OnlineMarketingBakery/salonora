import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/config";
import { getFaqLegacyRedirectPath } from "@/lib/legal/faq-slugs";
import { getLegalLegacyRedirectPath } from "@/lib/legal/legal-slugs";

export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (p === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/`, request.url));
  }
  const legacySlug = p.match(/^\/(nl|en)\/([^/]+)\/?$/);
  if (legacySlug) {
    const lang = legacySlug[1] as "nl" | "en";
    const segment = legacySlug[2];
    const faqTarget = getFaqLegacyRedirectPath(lang, segment);
    if (faqTarget) {
      return NextResponse.redirect(new URL(faqTarget, request.url));
    }
    const legalTarget = getLegalLegacyRedirectPath(lang, segment);
    if (legalTarget) {
      return NextResponse.redirect(new URL(legalTarget, request.url));
    }
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", p);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
