"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Media } from "@/components/ui/Media";
import { SparkMark } from "@/components/ui/SparkMark";
import type { WpImage } from "@/types/wordpress";

/**
 * Figma **1977:29** / **1083:46** — rot flex wrapper **597:2270** / **597:2287**.
 * Canvas origin = spark top (Group 111 outer box).
 */
export const SPLIT_PHOTO_CANVAS_W = 496.557;
export const SPLIT_PHOTO_CANVAS_H = 565.89;

const ROT_BOX_W = 496.557;
const ROT_BOX_H = 555.78;
const BLUE_W = 460;
const BLUE_H = 524;
const BLUE_ROTATE_DEG = -4.13;
const PHOTO_W = 460;
const PHOTO_H = 523;
const SPARK_SIZE = 27.372;

/** Positions from Figma dev export (spark origin y = 0); nudged left/up to taste. */
const SPARK_X = 4.65;
const SPARK_Y = -3;
const ROT_Y = 10.11;
const PHOTO_X = 18.28;
const PHOTO_Y = 27;

type SplitPhotoStackProps = {
  image: WpImage;
  objectPosition: string;
};

/**
 * Pixel-perfect Figma stack scaled to container width.
 * Photo upright; only the 460×524 blue panel rotates −4.13° inside the rot flex box.
 */
export function SplitPhotoStack({ image, objectPosition }: SplitPhotoStackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const sync = () => {
      const width = node.getBoundingClientRect().width;
      if (width > 0) setScale(width / SPLIT_PHOTO_CANVAS_W);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-[496.557px] overflow-visible"
      style={{ height: SPLIT_PHOTO_CANVAS_H * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left overflow-visible"
        style={{
          width: SPLIT_PHOTO_CANVAS_W,
          height: SPLIT_PHOTO_CANVAS_H,
          transform: `scale(${scale})`,
        }}
      >
        {/* Rot flex bbox — blue centered, then −4.13° wrapper */}
        <div
          className="absolute left-0 flex items-center justify-center overflow-visible"
          style={{
            top: ROT_Y,
            width: ROT_BOX_W,
            height: ROT_BOX_H,
          }}
          aria-hidden
        >
          <div className="pointer-events-none shrink-0" style={{ transform: `rotate(${BLUE_ROTATE_DEG}deg)` }}>
            <div
              className="rounded-[14px] bg-brand"
              style={{ width: BLUE_W, height: BLUE_H }}
            />
          </div>
        </div>

        {/* Photo — upright mask */}
        <div
          className="absolute z-10 overflow-hidden rounded-[14px]"
          style={{
            left: PHOTO_X,
            top: PHOTO_Y,
            width: PHOTO_W,
            height: PHOTO_H,
          }}
        >
          <Media
            image={image}
            width={920}
            height={1046}
            className="h-full w-full object-cover"
            style={{ objectPosition }}
            sizes="(min-width: 1024px) 460px, 90vw"
            preferLargestSource
          />
        </div>

        {/* Spark — Group 111: outer box + inner rotate-180 */}
        <div
          className="pointer-events-none absolute z-30 flex items-center justify-center overflow-visible"
          style={{
            left: SPARK_X,
            top: SPARK_Y,
            width: SPARK_SIZE,
            height: SPARK_SIZE,
          }}
        >
          <div className="size-full shrink-0 rotate-180">
            <SparkMark rotated={false} className="size-full text-brand" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Figma **1083:46** — spark top inside card (**597:2283** y = 85). */
export const FOUNDER_PHOTO_STACK_OFFSET_TOP = 85;
/** Figma rot flex left (729.72) minus image column left (720). */
export const FOUNDER_PHOTO_STACK_OFFSET_LEFT = 9.72;
/** Figma rot flex bleeds left of photo column by 18.28px. */
export const ORIGIN_PHOTO_STACK_OFFSET_LEFT = 18.28;
/** Figma photo mask 10px above copy frame; photo canvas y = 27. */
export const ORIGIN_PHOTO_STACK_OFFSET_TOP = -27;
