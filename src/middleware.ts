import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (p === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
