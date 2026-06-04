"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { legalTocLabel } from "@/lib/legal/legal-labels";
import type { LegalHeading } from "@/lib/legal/parse-legal-html";
import type { Locale } from "@/lib/i18n/locales";

export function LegalScrollSpyToc({
  headings,
  lang,
  className = "",
}: {
  headings: LegalHeading[];
  lang: Locale;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
          return;
        }
        const above = entries
          .filter((e) => e.boundingClientRect.top < 140)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        if (above[0]?.target.id) setActiveId(above[0].target.id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.12, 0.5, 1] }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const label = legalTocLabel(lang);

  return (
    <nav aria-label={label} className={`legal-sidebar-toc ${className}`}>
      <p className="legal-sidebar-toc-label">{label}</p>
      <ol className="legal-sidebar-toc-list">
        {headings.map((h, index) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id}>
              <Link
                href={`#${h.id}`}
                className={`legal-sidebar-toc-link ${isActive ? "is-active" : ""}`}
              >
                <span className="legal-sidebar-toc-num">{index + 1}.</span>
                <span className="legal-sidebar-toc-text">{h.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
