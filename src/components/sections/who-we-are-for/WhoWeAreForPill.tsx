import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import type { Locale } from "@/lib/i18n/locales";
import { resolveLink } from "@/lib/utils/links";
import type { WhoWeAreForItemT } from "@/types/sections";

/** Mobile: square circles. Desktop (lg): Figma 597:3973 — 227×245 pill with rounded-[200px]. */
const pillShellClass = [
  "flex shrink-0 flex-col items-center justify-center",
  "bg-[linear-gradient(180deg,var(--palette-surface)_0%,var(--palette-white)_100%)]",
  "aspect-square w-[calc(50%-0.5rem)] max-w-[158px] rounded-full p-3",
  "sm:max-w-[172px] sm:w-[calc(50%-0.625rem)] sm:p-3.5",
  "md:max-w-[188px]",
  "lg:aspect-auto lg:h-[227px] lg:max-w-none lg:rounded-[200px] lg:p-6",
].join(" ");

const pillInteractiveClass =
  "cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

function PillContent({ item }: { item: WhoWeAreForItemT }) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-2.5 px-1 sm:gap-3 lg:gap-[30px] lg:px-0">
      {item.icon ? (
        <div className="relative size-[44px] shrink-0 overflow-hidden rounded-[12px] sm:size-[50px] lg:size-[57px]">
          <Media
            image={item.icon}
            width={57}
            height={57}
            className="size-full object-cover"
            sizes="57px"
            preferLargestSource
          />
        </div>
      ) : (
        <div className="size-[44px] shrink-0 sm:size-[50px] lg:size-[57px]" aria-hidden />
      )}
      {item.label ? (
        <RichText
          html={item.label}
          className="w-full min-w-0 max-w-[118px] text-balance text-center font-sans text-[15px] font-medium leading-[1.15] text-navy sm:max-w-[132px] sm:text-base lg:max-w-[166px] lg:text-2xl lg:leading-[1.1] [&_*]:text-navy [&_p]:mb-0 [&_p]:mt-0 [&_p+p]:mt-[5px]"
        />
      ) : null}
    </div>
  );
}

export function WhoWeAreForPill({
  item,
  lang,
  className,
}: {
  item: WhoWeAreForItemT;
  lang: Locale;
  className: string;
}) {
  const resolved = resolveLink(item.link, lang);
  const shellClass = `${pillShellClass} ${className}`.trim();

  if (!resolved?.href) {
    return (
      <div className={shellClass}>
        <PillContent item={item} />
      </div>
    );
  }

  const href = resolved.href;
  const useNative =
    /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
  const target = resolved.target;
  const rel = target === "_blank" ? "noopener noreferrer" : undefined;
  const interactiveShell = `${shellClass} ${pillInteractiveClass}`;

  if (useNative) {
    return (
      <a href={href} target={target} rel={rel} className={interactiveShell}>
        <PillContent item={item} />
      </a>
    );
  }

  return (
    <Link href={href} target={target} rel={rel} className={interactiveShell}>
      <PillContent item={item} />
    </Link>
  );
}
