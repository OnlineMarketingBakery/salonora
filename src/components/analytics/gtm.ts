/** GTM container IDs look like `GTM-XXXX`; reject anything else before interpolating into script/HTML. */
export function sanitizeGtmId(raw: string | undefined | null): string | null {
  const id = raw?.trim();
  if (!id || !/^GTM-[A-Z0-9]+$/i.test(id)) return null;
  return id;
}

export function gtmHeadScript(gtmId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
}

export function gtmNoscriptSrc(gtmId: string): string {
  return `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`;
}
