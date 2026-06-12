"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerGsapClient } from "@/lib/gsap/register";
import {
  ORBIT_DOTS,
  ORBIT_FRAME,
  ORBIT_ICONS,
  ORBIT_JAR,
  ORBIT_JAR_ORIGIN,
  ORBIT_RINGS,
  pctX,
  pctY,
} from "./orbit-icon-layout";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Layered "apps blow out of the jar" visual (Figma 346:6701).
 * Icons start tucked in the jar and burst into their orbit positions
 * when the section scrolls into view (once).
 */
export function AppsOrbitVisual({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsapClient();
      const root = rootRef.current;
      if (!root) return;

      const bubbles = gsap.utils.toArray<HTMLElement>("[data-orbit-bubble]");
      const decor = gsap.utils.toArray<HTMLElement>("[data-orbit-decor]");

      if (prefersReducedMotion()) {
        gsap.set(decor, { autoAlpha: 1 });
        bubbles.forEach((el) => {
          gsap.set(el, {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotate: Number(el.dataset.rotate) || 0,
            transformOrigin: "50% 50%",
          });
        });
        return;
      }

      const measure = () => {
        const w = root.clientWidth || ORBIT_FRAME.width;
        const h = root.clientHeight || ORBIT_FRAME.height;
        return { sx: w / ORBIT_FRAME.width, sy: h / ORBIT_FRAME.height };
      };

      const setStart = () => {
        const { sx, sy } = measure();
        bubbles.forEach((el) => {
          const cx = Number(el.dataset.cx);
          const cy = Number(el.dataset.cy);
          const rot = Number(el.dataset.rotate) || 0;
          gsap.set(el, {
            x: (ORBIT_JAR_ORIGIN.x - cx) * sx,
            y: (ORBIT_JAR_ORIGIN.y - cy) * sy,
            scale: 0,
            rotate: rot * 0.5,
            autoAlpha: 0,
            transformOrigin: "50% 50%",
          });
        });
        gsap.set(decor, { autoAlpha: 0 });
      };

      setStart();

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });

      tl.to(decor, { autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: "power1.out" }).to(
        bubbles,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotate: (i) => Number(bubbles[i].dataset.rotate) || 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "back.out(1.5)",
          stagger: 0.07,
        },
        "-=0.25",
      );

      // Recompute the (pre-trigger) start offsets if the layout resizes first.
      const onRefresh = () => {
        if (tl.progress() === 0) setStart();
      };
      ScrollTrigger.addEventListener("refreshInit", onRefresh);
      return () => ScrollTrigger.removeEventListener("refreshInit", onRefresh);
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className={`relative aspect-[490/512] w-full max-w-[490px] ${className}`}
    >
      {ORBIT_RINGS.map((r, i) => (
        <Image
          key={`ring-${i}`}
          data-orbit-decor
          src={r.src}
          alt=""
          aria-hidden
          width={r.width}
          height={r.height}
          unoptimized
          className="pointer-events-none absolute max-w-none"
          style={{
            left: pctX(r.x),
            top: pctY(r.y),
            width: pctX(r.width),
            height: pctY(r.height),
          }}
        />
      ))}

      {ORBIT_DOTS.map((d, i) => (
        <Image
          key={`dot-${i}`}
          data-orbit-decor
          src={d.src}
          alt=""
          aria-hidden
          width={d.width}
          height={d.height}
          unoptimized
          className="pointer-events-none absolute max-w-none"
          style={{
            left: pctX(d.x),
            top: pctY(d.y),
            width: pctX(d.width),
            height: pctY(d.height),
          }}
        />
      ))}

      {/* Jar base — always visible, anchors the burst. */}
      <Image
        src={ORBIT_JAR.src}
        alt=""
        aria-hidden
        width={ORBIT_JAR.width}
        height={ORBIT_JAR.height}
        unoptimized
        priority
        className="pointer-events-none absolute z-20 max-w-none"
        style={{
          left: pctX(ORBIT_JAR.x),
          top: pctY(ORBIT_JAR.y),
          width: pctX(ORBIT_JAR.width),
          height: pctY(ORBIT_JAR.height),
        }}
      />

      {ORBIT_ICONS.map((icon) => {
        const isBottom = icon.id === "gmail" || icon.id === "excel";
        return (
          <div
            key={icon.id}
            data-orbit-bubble
            data-cx={icon.cx}
            data-cy={icon.cy}
            data-rotate={icon.rotate ?? 0}
            className={`absolute flex items-center justify-center rounded-full bg-white shadow-[0_12px_24px_-8px_rgba(21,41,81,0.28)] ${isBottom ? "z-30" : "z-10"}`}
            style={{
              left: pctX(icon.cx - icon.size / 2),
              top: pctY(icon.cy - icon.size / 2),
              width: pctX(icon.size),
              height: pctX(icon.size),
              ...(icon.rotate ? { rotate: `${icon.rotate}deg` } : {}),
            }}
          >
            <Image
              src={icon.src}
              alt={icon.label}
              width={icon.logo * 2}
              height={icon.logo * 2}
              unoptimized
              className="object-contain"
              style={{ width: `${(icon.logo / icon.size) * 100}%`, height: "auto" }}
            />
          </div>
        );
      })}
    </div>
  );
}
