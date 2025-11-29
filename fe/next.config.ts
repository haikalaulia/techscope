import { env } from "@/configs/env.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: i18n is handled via routing structure in App Router, not via config
  // For App Router with i18n, use middleware or file-based routing like /[lang]/page.tsx

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: env.NEXT_PUBLIC_BASEPATH || "/en/home",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
