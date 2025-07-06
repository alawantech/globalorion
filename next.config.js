/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "vercel.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless", "bcryptjs", "nodemailer"],
  },
  api: {
    externalResolver: true,
    bodyParser: false,
  },
}

module.exports = nextConfig
