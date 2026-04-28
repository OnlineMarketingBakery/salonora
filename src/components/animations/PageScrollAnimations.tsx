"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { registerGsapClient } from "@/lib/gsap/register";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageScrollAnimations() {
  useGSAP(() => {
    registerGsapClient();
    if (prefersReducedMotion()) return;

    // const sections = gsap.utils.toArray<HTMLElement>("main section");
    // gsap.set(sections, { y: 40 });
    // sections.forEach((section) => {
    //   gsap.to(section, {
    //     y: 0,
    //     duration: 0.72,
    //     ease: "power2.out",
    //     scrollTrigger: {
    //       trigger: section,
    //       start: "top 89%",
    //       once: true,
    //     },
    //   });
    // });

    const items = gsap.utils.toArray<HTMLElement>(".reveal-item");
    if (items.length) {
      gsap.set(items, { autoAlpha: 0, y: 22 });
      ScrollTrigger.batch(items, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
            stagger: 0.07,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
      });
    }
  }, []);

  return null;
}
