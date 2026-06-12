/**
 * Layout data for the "apps blow out of the jar" homepage visual.
 *
 * All coordinates are in the Figma frame space (490 x 512, node 346:6701).
 * The visual container renders at `aspect-[490/512]`, so px values are
 * converted to percentages at render time and stay responsive.
 */

export const ORBIT_FRAME = { width: 490, height: 512 } as const;

/** Jar mouth — where every icon starts before bursting out. */
export const ORBIT_JAR_ORIGIN = { x: 248, y: 356 } as const;

/** Jar base sprite (Group 577). Always visible. */
export const ORBIT_JAR = {
  src: "/image-intro-split/jar.png",
  x: 120,
  y: 346,
  width: 256,
  height: 127,
} as const;

export type OrbitRing = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Concentric rings + faint glow behind the bubbles. */
export const ORBIT_RINGS: OrbitRing[] = [
  { src: "/image-intro-split/ring-outer.png", x: 4, y: 27, width: 484, height: 485 },
  { src: "/image-intro-split/ring-glow.png", x: 82, y: 106, width: 331, height: 331 },
  { src: "/image-intro-split/ring-inner.png", x: 92, y: 115, width: 308, height: 309 },
];

/** Small accent dots sitting on the ring paths. */
export const ORBIT_DOTS: OrbitRing[] = [
  { src: "/image-intro-split/dot.png", x: 341, y: 44, width: 10, height: 10 },
  { src: "/image-intro-split/dot.png", x: 0, y: 277, width: 10, height: 10 },
  { src: "/image-intro-split/dot.png", x: 480, y: 300, width: 10, height: 10 },
];

export type OrbitIcon = {
  id: string;
  label: string;
  src: string;
  /** White bubble center in frame space. */
  cx: number;
  cy: number;
  /** Bubble diameter in frame space. */
  size: number;
  /** Logo width inside the bubble (frame space); height auto. */
  logo: number;
  /** Subtle resting tilt (deg) to match the Figma composition. */
  rotate?: number;
  /** Burst order — lower pops first (icons nearest the jar lead). */
  order: number;
};

export const ORBIT_ICONS: OrbitIcon[] = [
  { id: "excel", label: "Excel", src: "/image-intro-split/icons/excel.png", cx: 290, cy: 343, size: 76, logo: 42, rotate: 5, order: 0 },
  { id: "gmail", label: "Gmail", src: "/image-intro-split/icons/gmail.png", cx: 198, cy: 339, size: 82, logo: 38, rotate: -7, order: 1 },
  { id: "facebook", label: "Facebook", src: "/image-intro-split/icons/facebook.png", cx: 251.5, cy: 217.5, size: 65, logo: 45, order: 2 },
  { id: "slack", label: "Slack", src: "/image-intro-split/icons/slack.png", cx: 398, cy: 257, size: 72, logo: 42, rotate: 13, order: 3 },
  { id: "whatsapp", label: "WhatsApp", src: "/image-intro-split/icons/whatsapp.png", cx: 94.5, cy: 251.5, size: 69, logo: 39, rotate: -13, order: 4 },
  { id: "calendly", label: "Calendly", src: "/image-intro-split/icons/calendly.png", cx: 323, cy: 134.5, size: 62, logo: 43, rotate: 12, order: 5 },
  { id: "teamwork", label: "Teamwork", src: "/image-intro-split/icons/teamwork.png", cx: 167, cy: 140.5, size: 62, logo: 52, rotate: -11, order: 6 },
  { id: "instagram", label: "Instagram", src: "/image-intro-split/icons/instagram.png", cx: 448, cy: 144, size: 58, logo: 32, rotate: 14, order: 7 },
  { id: "supersaas", label: "SuperSaaS", src: "/image-intro-split/icons/supersaas.png", cx: 41.5, cy: 134.5, size: 51, logo: 36, rotate: -11, order: 8 },
  { id: "trello", label: "Trello", src: "/image-intro-split/icons/trello.png", cx: 231.5, cy: 27.5, size: 55, logo: 27, order: 9 },
];

export function pctX(px: number): string {
  return `${(px / ORBIT_FRAME.width) * 100}%`;
}

export function pctY(px: number): string {
  return `${(px / ORBIT_FRAME.height) * 100}%`;
}
