import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { LatestPostsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function LatestPostsSection({ section }: { section: LatestPostsSectionT; lang: Locale }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        {section.title && <h2 className="text-2xl font-bold text-[#0c1d3a] sm:text-3xl">{section.title}</h2>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="block rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-[#1e5bb8]/30"
            >
              <h3 className="font-semibold text-[#0c1d3a]">{p.title}</h3>
              {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
