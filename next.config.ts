import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "https-calls",
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  experimental: {
    ppr: false, // Disable PPR for PWA compatibility
  },
  turbopack: {
    root: __dirname,
  }, // Enable Turbopack configuration with explicit root
  allowedDevOrigins: ["192.168.18.26"], // Allow cross-origin requests from local network
};

export default withPWA(nextConfig);
