"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Media } from "@/components/ui/Media";
import { registerGsapClient } from "@/lib/gsap/register";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { WpImage } from "@/types/wordpress";

function MailGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16v10H4V7zm0 0 8 5 8-5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 4.5C8 4 6.5 3 4.5 5.5L6 7c.5.5.5 1.5 0 2.5-1.5 3-1 3.5 0L11 16c.5.5 1.5.5 2.5-1.5L15 19c-2.5 2-4-1-4-1-1-2-1-2.5h0c0-.5-1-2-1.5-2.5-1.5-1-2.5-2.5-3.5-3-2.5-2-4.5-3.5-6.5-5-2-2-2.5-3-2-4v0z"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  href: string;
  text: string;
  icon: WpImage | null;
  iconFallback: "mail" | "phone";
  target?: string;
};

export function ContactCtaPill({ href, text, icon, iconFallback, target }: Props) {
  const rootRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (ctx, contextSafe) => {
      registerGsapClient();
      const root = rootRef.current;
      if (!root) return;
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const safe = contextSafe ?? ((fn: () => void) => fn);
      const iconSlot = root.querySelector<HTMLElement>("[data-pill-icon]");
      gsap.set(root, { transformOrigin: "50% 50%" });

      const onEnter = safe(() => {
        gsap.killTweensOf([root, iconSlot].filter(Boolean));
        gsap.to(root, { y: -3, scale: 1.02, duration: 0.35, ease: "power2.out" });
        if (iconSlot) gsap.to(iconSlot, { scale: 1.08, duration: 0.4, ease: "back.out(1.4)" });
      });
      const onLeave = safe(() => {
        gsap.killTweensOf([root, iconSlot].filter(Boolean));
        gsap.to(root, { y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
        if (iconSlot) gsap.to(iconSlot, { scale: 1, duration: 0.35, ease: "power2.out" });
      });

      root.addEventListener("pointerenter", onEnter);
      root.addEventListener("pointerleave", onLeave);
      return () => {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: rootRef },
  );

  return (
    <Link
      ref={rootRef}
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={`${REVEAL_ITEM} flex h-[74px] w-full min-w-0 max-w-full items-center gap-[9px] rounded-[49px] bg-gradient-to-b from-white to-white/70 p-3 drop-shadow-[0px_11px_11.2px_#2463a9] transition hover:brightness-[0.99] will-change-transform`}
    >
      <span
        data-pill-icon
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[25px] bg-brand text-white will-change-transform"
      >
        {icon ? (
          <Media
            image={icon}
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            sizes="28px"
            preferLargestSource
            quality={90}
          />
        ) : iconFallback === "mail" ? (
          <MailGlyph className="h-7 w-7" />
        ) : (
          <PhoneGlyph className="h-7 w-7" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-pretty text-xl font-regular leading-[1.1] tracking-[-0.8px] text-slate-900 [text-align:left]">
        {text}
      </span>
    </Link>
  );
}
