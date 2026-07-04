/** @type {import('next').NextConfig} */
const isStatic = process.env.EXPORT_STATIC === 'true';

const nextConfig = {
  reactStrictMode: true,
  distDir: isStatic ? 'dist' : '.next',
  output: isStatic ? 'export' : undefined,
  async rewrites() {
    if (isStatic) return [];
    return [
      {
        source: '/api/:path*',
        destination: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
