/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 1. REMOVE the i18n block entirely for App Router
  
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/:path*`,
      },
    ];
  },
  images: {
    // 2. 'domains' is deprecated. Use 'remotePatterns' for better security.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-project.supabase.co',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;