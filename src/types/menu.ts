import type { Locale } from "@/lib/i18n/locales";

export type MenuItem = {
  id: number;
  label: string;
  href: string;
  target?: string;
  children: MenuItem[];
};

export type MenuByLocation = Record<"primary" | "footer" | "legal", MenuItem[]>;

export type MenusByLocale = Record<Locale, MenuByLocation>;
