/**
 * Figma Group 111 (`597:2283` / `597:2971`) — exact vector paths exported from Figma.
 * Three filled stroke shapes radiating from the corner (left bar, top bar, long diagonal).
 */
type SparkMarkProps = {
  className?: string;
  /** Figma wraps Group 111 in `rotate-180` on the founder + origin image stacks. */
  rotated?: boolean;
};

export function SparkMark({
  className = "size-[27.372px] text-brand",
  rotated = true,
}: SparkMarkProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${rotated ? "rotate-180" : ""} ${className}`.trim()}
      aria-hidden
    >
      <svg
        viewBox="0 0 27.372 27.3721"
        width={28}
        height={28}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block size-full"
      >
        <path
          d="M0.00011872 26.089V9.83732C0.00011872 9.12872 0.574551 8.55428 1.28315 8.55428C1.99175 8.55428 2.56618 9.12872 2.56618 9.83732V26.089C2.56618 26.7976 1.99175 27.3721 1.28315 27.3721C0.574551 27.3721 0.00011872 26.7976 0.00011872 26.089Z"
          fill="currentColor"
        />
        <path
          d="M10.3078 0.951279C10.4913 0.267005 11.1954 -0.139226 11.8798 0.0441364L26.4208 3.94084C27.105 4.12443 27.5113 4.82775 27.328 5.51205C27.1445 6.19643 26.4403 6.60257 25.7559 6.4192L11.2149 2.52333C10.5306 2.33981 10.1244 1.63564 10.3078 0.951279Z"
          fill="currentColor"
        />
        <path
          d="M7.25396 6.3299C7.77368 5.84846 8.58581 5.87961 9.06741 6.39923L25.3191 23.934C25.8006 24.4537 25.7694 25.2658 25.2498 25.7474C24.7301 26.2289 23.918 26.1977 23.4364 25.6781L7.18463 8.14335C6.70319 7.62364 6.73434 6.81151 7.25396 6.3299Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
