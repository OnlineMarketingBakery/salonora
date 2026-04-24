import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { LatestPostsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function LatestPostsSection({ section }: { section: LatestPostsSectionT; lang: Locale }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        {section.title && <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{section.title}</h2>}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="block rounded-2xl border border-surface bg-white p-5 shadow-sm transition hover:border-brand/30"
            >
              <h3 className="font-semibold text-foreground">{p.title}</h3>
              {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
