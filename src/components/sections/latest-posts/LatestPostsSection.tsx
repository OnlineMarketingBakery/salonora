import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { LatestPostsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function LatestPostsSection({ section }: { section: LatestPostsSectionT; lang: Locale }) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        {section.title && (
          <SectionHeading
            as="h2"
            text={section.title}
            className={`${REVEAL_ITEM} text-3xl font-semibold leading-tight text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]`}
          />
        )}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className={`${REVEAL_ITEM} block rounded-2xl border border-surface bg-white p-5 shadow-sm transition hover:border-brand/30`}
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
