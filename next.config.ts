import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const backendApiUrl = process.env.BACKEND_API_URL ?? "https://evaschool.runasp.net/api";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {},
  // Permit development access from this local-network address without opening
  // the dev server to arbitrary origins.
  allowedDevOrigins: ["192.168.1.10"],
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApiUrl.replace(/\/+$/, "")}/:path*`,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withNextIntl(nextConfig);
