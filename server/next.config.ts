import type { NextConfig } from "next";
import withPWA from "next-pwa";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const isDev = process.env.NODE_ENV !== "production";

const baseConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // enable PWA only in production by default
  additionalManifestEntries: (() => {
    try {
      const pub = path.join(__dirname, 'public');
      const assets = [
        '/fonts/Roboto-Medium.ttf',
        '/reports/referee_template_u9.pdf',
        '/reports/referee_template_u11.pdf',
        '/reports/referee_template_u13.pdf',
        '/reports/referee_template_u15.pdf',
      ];
      const rev = (p: string) => {
        const full = path.join(pub, p);
        const buf = fs.readFileSync(full);
        return crypto.createHash('md5').update(buf).digest('hex').slice(0, 12);
      };
      return assets.map((url) => ({ url, revision: rev(url) }));
    } catch {
      return [] as { url: string; revision: string }[];
    }
  })(),
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
