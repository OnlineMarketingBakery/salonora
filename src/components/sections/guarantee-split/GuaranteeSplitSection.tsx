import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { resolveLink } from "@/lib/utils/links";
import type { GuaranteeSplitSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function GuaranteeSplitSection({ section, lang }: { section: GuaranteeSplitSectionT; lang: Locale }) {
  const imageFirst = section.mediaPosition === "left";
  const body = (
    <div>
      {section.title && <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{section.title}</h2>}
      {section.text && <RichText html={section.text} className="mt-4 text-muted" />}
      {section.points.length > 0 && (
        <ul className="mt-6 space-y-3">
          {section.points.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted">
              {p.icon && <Media image={p.icon} width={24} height={24} className="h-6 w-6 shrink-0" />}
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {section.ctas.map((c, i) => {
          const l = resolveLink(c.url, lang);
          return (
            <Button key={i} href={l?.href} variant="primary" target={l?.target}>
              {c.text || l?.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
  const img = section.image && (
    <div className="overflow-hidden rounded-2xl border border-surface">
      <Media image={section.image} width={640} height={480} className="h-full w-full object-cover" />
    </div>
  );
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {imageFirst ? (
            <>
              {img}
              {body}
            </>
          ) : (
            <>
              {body}
              {img}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
