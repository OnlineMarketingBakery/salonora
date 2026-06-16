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
  const raw = process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_API_URL;
  if (!raw) {
    return {
      unoptimized: true,
      remotePatterns: [FIGMA_MCP_IMAGE_PATTERN],
      qualities: [...IMAGE_QUALITIES],
    };
  }
  try {
    const u = new URL(raw);
    return {
      remotePatterns: [
        {
          protocol: (u.protocol.replace(":", "") as "https") || "https",
          hostname: u.hostname,
          pathname: "/**",
        },
        FIGMA_MCP_IMAGE_PATTERN,
      ],
      qualities: [...IMAGE_QUALITIES],
    };
  } catch {
    return {
      unoptimized: true,
      remotePatterns: [FIGMA_MCP_IMAGE_PATTERN],
      qualities: [...IMAGE_QUALITIES],
    };
  }
}

const nextConfig: NextConfig = {
  images: imageConfig(),
};

export default nextConfig;
