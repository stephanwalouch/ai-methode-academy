/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.bunnycdn.com' },
      { protocol: 'https', hostname: '**.b-cdn.net' },
      { protocol: 'https', hostname: 'supabase.co' },
      { protocol: 'https', hostname: 'www.ai-methode.de' },
      { protocol: 'https', hostname: 'ai-methode.de' },
    ],
  },
}

module.exports = nextConfig
