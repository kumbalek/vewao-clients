import { withPayload } from "@payloadcms/next/withPayload"
import createNextIntlPlugin from "next-intl/plugin"

import checkEnvVariables from "./check-env-variables.js"

const withNextIntl = createNextIntlPlugin()
checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // No generated AGENTS.md: the repository has its own agent guidance.
  agentRules: false,
  reactStrictMode: true,
  // The vendored kit ships TypeScript source (vendor/README.md).
  transpilePackages: ["@vewao/storefront-kit"],
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // The herb lines were collections until 2026-11-22; they are Herbs'
  // subcategories now (vewao-clients#67). Old links keep working.
  async redirects() {
    return [
      { source: "/:countryCode/collections/gold", destination: "/:countryCode/categories/gold-edition", permanent: true },
      { source: "/:countryCode/collections/acute", destination: "/:countryCode/categories/acute", permanent: true },
      // The list of all products is gone (vewao-clients#70); /store?q= still
      // serves the header search.
      {
        source: "/:countryCode/store",
        missing: [{ type: "query", key: "q" }],
        destination: "/:countryCode/shop",
        permanent: true,
      },
    ]
  },
  images: {
    // Next 16 allows only quality 75 by default; thumbnails use 50.
    qualities: [50, 75],
    // Next 16 refuses to optimise images from local IPs (SSRF guard). Local dev
    // and the Playwright mock serve images from 127.0.0.1; production fetches
    // them from the public backend and S3 domains.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      // Files uploaded to Medusa (content and product images) are served from
      // /static. A bare URL would allow only its own path "/", nothing below it.
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        ? [new URL("/static/**", process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)]
        : []),
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "vewao.stream",
      },
    ],
    // remotePatterns: [
    //   {
    //     protocol: "http",
    //     hostname: "localhost",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "medusa-server-testing.s3.amazonaws.com",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
    //   },
    // ],
  },
}

// Payload CMS runs inside the storefront (D22): admin at /admin, REST under /api.
export default withPayload(withNextIntl(nextConfig))
