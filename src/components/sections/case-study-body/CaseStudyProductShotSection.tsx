import Image from "next/image";
import { RichText } from "@/components/ui/RichText";
import type { CaseStudyProductShotSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const descriptionProse =
  "post-article-body post-prose max-w-none text-left text-base font-normal leading-[1.4] prose-headings:font-semibold prose-h2:text-[34px] prose-h2:leading-[1.1] prose-h2:font-semibold prose-h3:text-2xl prose-h3:leading-[1.1] prose-h3:font-semibold prose-p:my-0 prose-p:leading-[1.4] prose-li:leading-[1.4] prose-headings:text-[var(--palette-navy)] prose-p:text-[var(--palette-muted)] prose-li:text-[var(--palette-muted)] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)]";

export function CaseStudyProductShotSection({ section, lang }: { section: CaseStudyProductShotSectionT; lang: Locale }) {
  void lang;
  if (!section.image?.url) return null;
  const title = section.title.trim();
  const dividerClass = section.showDivider
    ? "border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] pb-8"
    : "";
  return (
    <section className={`space-y-8 ${dividerClass}`}>
      {title ? (
        <h3 className="text-left text-[34px] font-semibold leading-[1.1] text-[var(--palette-navy)]">
          {title}
        </h3>
      ) : null}
      <div className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-[14px] border border-black/[0.06] bg-[var(--palette-white)] shadow-sm">
          <div className="relative aspect-[755/355] w-full max-h-[min(55vh,24rem)] sm:max-h-none sm:aspect-[16/9]">
            <Image
              src={section.image.url}
              alt={section.image.alt || title || ""}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 864px"
            />
          </div>
        </div>
        <RichText html={section.description} className={descriptionProse} />
      </div>
    </section>
  );
}
