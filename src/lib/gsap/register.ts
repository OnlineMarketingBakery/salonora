import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Call from any `"use client"` module before useGSAP / ScrollTrigger run. */
export function registerGsapClient(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}
