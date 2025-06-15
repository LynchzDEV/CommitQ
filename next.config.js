/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['socket.io', 'socket.io-client'],
  },
}

module.exports = nextConfig
