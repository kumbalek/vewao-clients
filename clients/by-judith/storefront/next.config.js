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
