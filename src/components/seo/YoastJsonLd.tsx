import { rewriteMarketingUrl } from "@/lib/seo/map-yoast-to-metadata";

function rewriteSchemaUrls(value: unknown): unknown {
  if (typeof value === "string") {
    const rewritten = rewriteMarketingUrl(value);
    return rewritten ?? value;
  }
  if (Array.isArray(value)) {
    return value.map(rewriteSchemaUrls);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = rewriteSchemaUrls(v);
    }
    return out;
  }
  return value;
}

/** Renders Yoast `@graph` JSON-LD with marketing-site URL rewriting. */
export function YoastJsonLd({ schema }: { schema?: unknown }) {
  if (!schema) return null;
  const rewritten = rewriteSchemaUrls(schema);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(rewritten) }}
    />
  );
}
