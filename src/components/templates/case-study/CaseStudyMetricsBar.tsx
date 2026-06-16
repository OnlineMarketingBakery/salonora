import { Fragment } from "react";
import type { CaseStudyOverviewMetricT } from "@/types/sections";

/** Figma 879:27 / 919:436 — 152px band, 54×46 padding, left-aligned metrics, 42px gaps, 59.5px dividers. */
export function CaseStudyMetricsBar({ metrics }: { metrics: CaseStudyOverviewMetricT[] }) {
  if (metrics.length === 0) return null;

  return (
    <div className="mt-6 w-full overflow-hidden rounded-[14px] bg-linear-to-b from-brand to-brand-strong px-6 py-8 text-white sm:h-[152px] sm:px-[54px] sm:py-0">
      <div className="flex h-full items-center">
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-8 sm:flex sm:flex-nowrap sm:items-center sm:gap-[42px]">
          {metrics.map((m, i) => (
            <Fragment key={`${m.label}-${m.value}-${i}`}>
              {i > 0 ? (
                <div
                  className="hidden h-[59.5px] w-px shrink-0 self-center bg-white/25 sm:block"
                  aria-hidden
                />
              ) : null}
              <div className="flex min-w-0 flex-col items-start gap-2.5 text-left sm:shrink-0">
                <p className="text-base font-normal leading-[1.4]">{m.label}</p>
                <p className="text-[34px] font-medium leading-[58px]">{m.value}</p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
