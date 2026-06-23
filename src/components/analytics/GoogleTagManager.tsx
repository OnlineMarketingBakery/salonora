import { sanitizeGtmId, gtmHeadScript, gtmNoscriptSrc } from "@/components/analytics/gtm";

export function GoogleTagManagerHead({ gtmId }: { gtmId: string | null }) {
  if (!gtmId) return null;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: gtmHeadScript(gtmId),
      }}
    />
  );
}

export function GoogleTagManagerBody({ gtmId }: { gtmId: string | null }) {
  if (!gtmId) return null;
  return (
    <noscript>
      <iframe
        src={gtmNoscriptSrc(gtmId)}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

export { sanitizeGtmId };
