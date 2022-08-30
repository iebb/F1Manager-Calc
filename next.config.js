/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://f1setup.deta.dev/:path*',
      },
    ]
  },
}

module.exports = nextConfig
