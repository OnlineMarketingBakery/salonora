import type { CaseStudyOverviewMetricT } from "@/types/sections";

/** Single case study — full-width brand metrics strip (Figma 879:27). */
export function CaseStudyMetricsBar({ metrics }: { metrics: CaseStudyOverviewMetricT[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="mt-[34px] w-full overflow-hidden rounded-[14px] bg-[var(--palette-brand)] px-4 py-6 text-[var(--palette-white)] sm:px-8 sm:py-8 lg:mt-[34px]">
      <ul className="flex flex-col divide-y divide-white/25 sm:flex-row sm:divide-x sm:divide-y-0">
        {metrics.map((m, i) => (
          <li key={`${m.label}-${m.value}-${i}`} className="flex min-w-0 flex-1 flex-col gap-2 py-5 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0">
            <p className="text-base font-normal leading-[1.4] text-white/90">{m.label}</p>
            <p className="text-[1.75rem] font-medium leading-none sm:text-[2.125rem]">{m.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
