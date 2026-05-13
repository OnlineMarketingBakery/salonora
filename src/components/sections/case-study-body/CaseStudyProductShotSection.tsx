import Image from "next/image";
import type { CaseStudyProductShotSectionT } from "@/types/sections";
import type { Locale } from "@/lib/i18n/locales";

export function CaseStudyProductShotSection({ section, lang }: { section: CaseStudyProductShotSectionT; lang: Locale }) {
  void lang;
  if (!section.image?.url) return null;
  return (
    <section className="rounded-[14px] bg-gradient-to-b from-[var(--palette-brand)] to-[var(--palette-brand-strong)] p-6 sm:p-[52px]">
      <div className="relative w-full overflow-hidden rounded-[10px] bg-[var(--palette-white)] shadow-sm">
        <div className="relative aspect-[755/355] w-full max-h-[min(55vh,24rem)] sm:max-h-none sm:aspect-[16/9]">
          <Image
            src={section.image.url}
            alt={section.image.alt || ""}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 864px"
          />
        </div>
      </div>
      {section.caption.trim() ? (
        <p className="mt-4 text-center text-base font-normal leading-[1.4] text-white/95">{section.caption.trim()}</p>
      ) : null}
    </section>
  );
}
