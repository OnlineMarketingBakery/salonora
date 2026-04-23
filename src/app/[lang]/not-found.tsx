import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buildLocalePath } from "@/lib/i18n/get-alternates";
import { defaultLocale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/locales";

type P = { params?: Promise<{ lang: string }> };

export default async function NotFound({ params }: P) {
  const raw = params ? (await params).lang : defaultLocale;
  const lang: Locale = isLocale(raw) ? raw : (defaultLocale as Locale);
  return (
    <Container className="py-20 text-center">
      <h1 className="text-2xl font-bold text-[#0c1d3a]">Page not found</h1>
      <p className="mt-2 text-slate-600">We could not find this page or it is not available in WordPress.</p>
      <Link href={buildLocalePath(lang, "")} className="mt-6 inline-block text-[#1e5bb8] hover:underline">
        Back to home
      </Link>
    </Container>
  );
}
