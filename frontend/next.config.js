/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone is for Docker only — Vercel uses its own adapter.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),

  typedRoutes: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async rewrites() {
    // On Vercel multi-service deploys, /api/v1 is routed to the backend service
    // via vercel.json. Only proxy externally when an API URL is configured.
    if (process.env.VERCEL) return []

    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/:path*`,
      },
    ]
  },
}

module.exports = nextConfig