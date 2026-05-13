import type { CaseStudyOverviewMetricT } from "@/types/sections";

/** Single case study — gradient metrics strip (Figma 879:27). */
export function CaseStudyMetricsBar({ metrics }: { metrics: CaseStudyOverviewMetricT[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="mt-[34px] w-full overflow-hidden rounded-[14px] bg-gradient-to-b from-[var(--palette-brand)] to-[var(--palette-brand-strong)] px-4 py-8 text-[var(--palette-white)] sm:px-[54px] sm:py-[46px] lg:mt-[34px]">
      <ul className="flex flex-col divide-y divide-white/25 sm:flex-row sm:divide-x sm:divide-y-0 sm:divide-white/25">
        {metrics.map((m, i) => (
          <li
            key={`${m.label}-${m.value}-${i}`}
            className="flex min-w-0 flex-1 flex-col gap-[10px] py-5 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0"
          >
            <p className="text-base font-normal leading-[1.4] text-white">{m.label}</p>
            <p className="text-[34px] font-medium leading-none tracking-tight">{m.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
