import Image from "next/image";

/** Figma **696:3562** — white ring + brand check (audience promo / `filled_disc` lists). */
export const PROMO_CHECKLIST_RING_SRC = "/icons/promo-check-ring.svg";
export const PROMO_CHECKLIST_MARK_SRC = "/icons/promo-check-mark.svg";

export function PromoChecklistGlyph({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative mt-0.5 inline-grid size-[39px] shrink-0 place-items-start ${className}`.trim()}
      aria-hidden
    >
      <span className="absolute inset-[-25.64%]">
        <Image
          src={PROMO_CHECKLIST_RING_SRC}
          alt=""
          width={59}
          height={59}
          unoptimized
          className="block size-full max-w-none"
        />
      </span>
      <Image
        src={PROMO_CHECKLIST_MARK_SRC}
        alt=""
        width={27}
        height={23}
        unoptimized
        className="relative ml-2 mt-2 block h-[23px] w-[27px] max-w-none"
      />
    </span>
  );
}
