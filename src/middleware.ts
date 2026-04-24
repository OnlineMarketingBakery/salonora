import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (p === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/`, request.url));
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", p);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
