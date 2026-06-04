import Link from "next/link";
import type { LegalBreadcrumbItem } from "@/lib/legal/legal-breadcrumbs";

export function LegalBreadcrumbs({ items }: { items: LegalBreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="legal-breadcrumbs">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-navy/90">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-2">
              {i > 0 ? (
                <span className="text-brand/50 select-none" aria-hidden>
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-brand transition-colors hover:text-brand-strong hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "truncate text-navy" : "text-brand"} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
