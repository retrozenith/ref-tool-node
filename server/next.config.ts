import type { NextConfig } from "next";
import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV !== "production";

const baseConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // enable PWA only in production by default
  runtimeCaching: [
    {
      // Cache PDF templates
      urlPattern: ({ url }: any) => url.pathname.startsWith("/reports/"),
      handler: "CacheFirst",
      options: {
        cacheName: "reports-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      // Cache fonts
      urlPattern: ({ url }: any) => url.pathname.startsWith("/fonts/"),
      handler: "CacheFirst",
      options: {
        cacheName: "fonts-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      // Documents
      urlPattern: ({ request }: any) => request.destination === "document",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "html-cache" },
    },
    {
      // Scripts & styles
      urlPattern: ({ request }: any) =>
        request.destination === "script" || request.destination === "style",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "assets-cache" },
    },
    {
      // Images
      urlPattern: ({ request }: any) => request.destination === "image",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "images-cache" },
    },
  ],
})(baseConfig);
