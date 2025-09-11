/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    domains: ['firebasestorage.googleapis.com']
  },
  env: {
    UPLOAD_MAX_MB: process.env.UPLOAD_MAX_MB || '500',
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL || 'http://localhost:3000'
  }
}

module.exports = nextConfig
