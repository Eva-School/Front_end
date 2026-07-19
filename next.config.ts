import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize OpenNext adapter in development mode
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const backendApiUrl = process.env.BACKEND_API_URL
  ?? (process.env.NODE_ENV === "development" ? "http://localhost:5080/api" : "");
if (!backendApiUrl) {
  throw new Error("BACKEND_API_URL must be configured for production builds.");
}
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
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
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
