import Link from "next/link";
import { resolveLink } from "@/lib/utils/links";
import type { GlobalSettings } from "@/types/globals";
import type { Locale } from "@/lib/i18n/locales";

export function GlobalAnnouncementBar({ globals, lang }: { globals: GlobalSettings; lang: Locale }) {
  if (!globals.site.enableAnnouncement || !globals.site.announcementText) return null;
  const l = resolveLink(globals.site.announcementLink, lang);
  const content = <span className="text-sm">{globals.site.announcementText}</span>;
  return (
    <div className="bg-amber-50 py-1.5 text-center text-amber-950">
      {l ? (
        <Link href={l.href} className="hover:underline" target={l.target}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
