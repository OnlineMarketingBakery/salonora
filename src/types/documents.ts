import type { AnySectionT } from "./sections";
import type { SeoPayload } from "./seo";

export type PageDocument = {
  kind: "page";
  id: number;
  slug: string;
  title: string;
  content: string;
  hidePageTitle: boolean;
  sections: AnySectionT[];
  seo: SeoPayload;
};

export type ServiceDocument = {
  kind: "service";
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  serviceIntro: string;
  serviceHighlights: string[];
  sections: AnySectionT[];
  seo: SeoPayload;
};

export type PostDocument = {
  kind: "post";
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string;
  featuredFormId: number | null;
  sections: AnySectionT[];
  seo: SeoPayload;
};

export type ContentDocument = PageDocument | ServiceDocument | PostDocument;
