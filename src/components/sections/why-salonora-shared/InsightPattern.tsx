"use client";

import { useId } from "react";

/** Figma 346:5998 — concentric arc strokes on the insight panel. */
export function InsightPattern() {
  const uid = useId().replace(/:/g, "");
  const clipId = `why-salonora-insight-clip-${uid}`;
  const grad0 = `why-salonora-insight-grad-0-${uid}`;
  const grad1 = `why-salonora-insight-grad-1-${uid}`;
  const grad2 = `why-salonora-insight-grad-2-${uid}`;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 h-full w-[68.4%] max-w-[614px] lg:w-[614px] lg:max-w-none"
      viewBox="0 0 614 509"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <circle cx="262" cy="263" r="330.5" stroke={`url(#${grad0})`} />
        <circle cx="262" cy="263" r="251.5" stroke={`url(#${grad1})`} />
        <circle cx="262" cy="263" r="171.5" stroke={`url(#${grad2})`} />
      </g>
      <defs>
        <linearGradient
          id={grad0}
          x1="262"
          y1="-68"
          x2="262"
          y2="594"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={grad1}
          x1="262"
          y1="11"
          x2="262"
          y2="515"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={grad2}
          x1="262"
          y1="91"
          x2="262"
          y2="435"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect width="614" height="509" rx="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
