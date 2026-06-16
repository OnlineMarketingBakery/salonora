import Image from "next/image";
import { RichText } from "@/components/ui/RichText";
import type { CaseStudyProductShotSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

const descriptionProse =
  "post-article-body post-prose max-w-none text-left text-base font-normal leading-[1.4] prose-p:my-0 [&_p+p]:mt-4 prose-headings:font-semibold prose-h2:text-[34px] prose-h2:leading-[1.1] prose-h2:font-semibold prose-h3:text-2xl prose-h3:leading-[1.1] prose-h3:font-semibold prose-p:leading-[1.4] prose-li:leading-[1.4] prose-headings:text-[var(--palette-navy)] prose-p:text-[var(--palette-muted)] prose-li:text-[var(--palette-muted)] prose-strong:text-[var(--palette-navy)] prose-a:text-[var(--palette-brand)]";

export function CaseStudyProductShotSection({ section, lang }: { section: CaseStudyProductShotSectionT; lang: Locale }) {
  void lang;
  if (!section.image?.url) return null;
  const title = section.title.trim();
  const dividerClass = section.showDivider
    ? "border-b border-[color-mix(in_srgb,var(--palette-navy)_12%,transparent)] pb-8"
    : "";
  return (
    <section id={section.tocAnchorId || undefined} className={`flex flex-col gap-[34px] ${dividerClass}`}>
      {title ? (
        <h2 className="scroll-mt-28 text-left text-[34px] font-semibold leading-[1.1] text-[var(--palette-navy)]">
          {title}
        </h2>
      ) : null}
      <div className="flex flex-col gap-4">
        <div className="relative aspect-[859/407] w-full overflow-hidden rounded-[14px]">
          <Image
            src={section.image.url}
            alt={section.image.alt || title || ""}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 864px"
          />
        </div>
        <RichText html={section.description} className={descriptionProse} />
      </div>
    </section>
  );
}
