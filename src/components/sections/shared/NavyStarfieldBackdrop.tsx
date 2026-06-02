import Image from "next/image";

/** Figma **1714:244** / **597:3568** — full decorative shell raster (1440×816). */
const NAVY_SHELL_BG_SRC = "/images/navy-starfield-shell.png";

export function NavyStarfieldBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-navy-deep" aria-hidden>
      <Image
        src={NAVY_SHELL_BG_SRC}
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority={false}
      />
    </div>
  );
}
