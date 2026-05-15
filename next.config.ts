import type { NextConfig } from "next";
import { URL } from "node:url";

const FIGMA_MCP_IMAGE_PATTERN = {
  protocol: "https" as const,
  hostname: "www.figma.com",
  pathname: "/api/mcp/asset/**",
};

function imageConfig(): NextConfig["images"] {
  const raw = process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_API_URL;
  if (!raw) {
    return { unoptimized: true, remotePatterns: [FIGMA_MCP_IMAGE_PATTERN] };
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
    };
  } catch {
    return { unoptimized: true, remotePatterns: [FIGMA_MCP_IMAGE_PATTERN] };
  }
}

const nextConfig: NextConfig = {
  images: imageConfig(),
};

export default nextConfig;
