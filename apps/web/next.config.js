/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@learnsphere/shared-types', '@learnsphere/ui'],
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.learnsphere.dev' }] },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` }];
  },
};

module.exports = nextConfig;
