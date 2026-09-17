const checkEnvVariables = require("./check-env-variables")
const createNextIntlPlugin = require("next-intl/plugin")

const withNextIntl = createNextIntlPlugin()
checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        ? [new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)]
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

module.exports = withNextIntl(nextConfig)
