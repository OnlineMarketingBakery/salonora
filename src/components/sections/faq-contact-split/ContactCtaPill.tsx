"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Media } from "@/components/ui/Media";
import {
  FAQ_CONTACT_MAIL_ICON,
  FAQ_CONTACT_PHONE_ICON,
  isCompositeIconTile,
  shouldUseCmsContactGlyph,
} from "@/components/sections/faq-contact-split/faq-contact-icons";
import { getImageUrl } from "@/lib/utils/media";
import { registerGsapClient } from "@/lib/gsap/register";
import { REVEAL_ITEM } from "@/lib/animation-classes";
import type { WpImage } from "@/types/wordpress";

function ContactPillGlyph({ kind }: { kind: "mail" | "phone" }) {
  const src = kind === "mail" ? FAQ_CONTACT_MAIL_ICON : FAQ_CONTACT_PHONE_ICON;
  return (
    <Image
      src={src}
      width={28}
      height={28}
      alt=""
      unoptimized
      className="size-7 object-contain"
      aria-hidden
    />
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
      {icon && isCompositeIconTile(icon, 40) ? (
        <span data-pill-icon className="relative size-[50px] shrink-0 will-change-transform">
          <Media
            image={icon}
            width={50}
            height={50}
            className="size-[50px] object-contain"
            sizes="50px"
            preferLargestSource
            quality={90}
          />
        </span>
      ) : shouldUseCmsContactGlyph(icon) && getImageUrl(icon) ? (
        <span
          data-pill-icon
          className="flex size-[50px] shrink-0 items-center justify-center rounded-[25px] bg-brand will-change-transform"
        >
          <Media
            image={icon}
            width={28}
            height={28}
            className="size-7 object-contain"
            sizes="28px"
            unoptimized
          />
        </span>
      ) : (
        <span
          data-pill-icon
          className="flex size-[50px] shrink-0 items-center justify-center rounded-[25px] bg-brand will-change-transform"
        >
          <ContactPillGlyph kind={iconFallback} />
        </span>
      )}
      <span className="min-w-0 flex-1 text-pretty text-[20px] font-medium leading-[1.1] text-slate-900 [text-align:left]">
        {text}
      </span>
    </Link>
  );
}
