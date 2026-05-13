import type { CaseStudyOverviewMetricT } from "@/types/sections";

/** Single case study — gradient metrics strip (Figma 879:27: 24px below lead, 152px band, 54×46 padding, 42px column gap, 10px label/value). */
export function CaseStudyMetricsBar({ metrics }: { metrics: CaseStudyOverviewMetricT[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="mt-6 w-full overflow-hidden rounded-[14px] bg-gradient-to-b from-[var(--palette-brand)] to-[var(--palette-brand-strong)] px-4 py-8 text-[var(--palette-white)] sm:min-h-[152px] sm:px-[54px] sm:py-[46px]">
      <ul className="flex h-full flex-col divide-y divide-white/25 sm:flex-row sm:divide-y-0">
        {metrics.map((m, i) => (
          <li
            key={`${m.label}-${m.value}-${i}`}
            className={`flex min-w-0 flex-col gap-2.5 py-5 first:pt-0 last:pb-0 sm:flex-1 sm:justify-center sm:border-l sm:border-white/25 sm:py-0 sm:pl-10 sm:first:border-l-0 sm:first:pl-0`}
          >
            <p className="text-base font-normal leading-[1.4] text-white">{m.label}</p>
            <p className="text-[34px] font-medium leading-[58px] tracking-tight">{m.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
