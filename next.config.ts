import type { NextConfig } from "next";
import { URL } from "node:url";

const FIGMA_MCP_IMAGE_PATTERN = {
  protocol: "https" as const,
  hostname: "www.figma.com",
  pathname: "/api/mcp/asset/**",
};

/** Allowlist for `next/image` `quality` prop — default 75 plus retina UI graphics. */
const IMAGE_QUALITIES = [75, 90, 92, 95] as const;

function imageConfig(): NextConfig["images"] {
  const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    FIGMA_MCP_IMAGE_PATTERN,
  ];

  const addOrigin = (raw: string | undefined) => {
    if (!raw) return;
    try {
      const u = new URL(raw);
      const hostname = u.hostname;
      if (remotePatterns.some((p) => p.hostname === hostname)) return;
      remotePatterns.push({
        protocol: (u.protocol.replace(":", "") as "https") || "https",
        hostname,
        pathname: "/**",
      });
    } catch {
      /* noop */
    }
  };

  addOrigin(process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_API_URL);
  addOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  const localPatterns: NonNullable<NextConfig["images"]>["localPatterns"] = [
    { pathname: "/wp-content/**" },
    { pathname: "/images/**" },
  ];

  if (remotePatterns.length === 1) {
    return {
      unoptimized: true,
      remotePatterns,
      localPatterns,
      qualities: [...IMAGE_QUALITIES],
    };
  }

  return {
    remotePatterns,
    localPatterns,
    qualities: [...IMAGE_QUALITIES],
  };
}

function wordpressOrigin(): string | null {
  const raw = process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_API_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  images: imageConfig(),
  async rewrites() {
    const origin = wordpressOrigin();
    if (!origin) return [];
    return [
      {
        source: "/wp-content/:path*",
        destination: `${origin}/wp-content/:path*`,
      },
    ];
  },
};

export default nextConfig;
