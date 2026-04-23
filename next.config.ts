import type { NextConfig } from "next";
import { URL } from "node:url";

function imageConfig(): NextConfig["images"] {
  const raw = process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_API_URL;
  if (!raw) {
    return { unoptimized: true };
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
      ],
    };
  } catch {
    return { unoptimized: true };
  }
}

const nextConfig: NextConfig = {
  images: imageConfig(),
};

export default nextConfig;
