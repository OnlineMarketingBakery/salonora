import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { TestimonialsSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function TestimonialsSection({ section, lang }: { section: TestimonialsSectionT; lang: Locale }) {
  const c = resolveLink(section.cta, lang);
  return (
    <section className="bg-surface/60 py-16 md:py-24">
      <Container>
        {section.title && (
          <h2 className="text-center text-3xl font-semibold leading-tight tracking-[-0.04em] text-navy sm:text-4xl lg:text-[48px] lg:leading-[56px]">
            {section.title}
          </h2>
        )}
        {section.intro && <RichText html={section.intro} className="mx-auto mt-4 max-w-2xl text-center text-muted" />}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {section.items.map((t) => (
            <blockquote key={t.id} className="flex h-full flex-col rounded-2xl border border-surface bg-white p-6 shadow-sm">
              <RichText html={t.clientTestimonial} className="text-sm text-muted" />
              {typeof t.rating === "number" && t.rating > 0 && (
                <p className="mt-3 text-amber-500" aria-label={`${t.rating} sterren`}>
                  {"★".repeat(Math.min(5, t.rating))}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                {t.avatar && <Media image={t.avatar} width={48} height={48} className="h-12 w-12 rounded-full" />}
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.clientName}</p>
                  <p className="text-xs text-muted">{t.clientRole}</p>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
        {c && (
          <div className="mt-10 flex justify-center">
            <Button href={c.href} variant="primary" target={c.target}>
              {c.label}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
