/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["socket.io", "socket.io-client"],
  },
  output: "standalone",
};

module.exports = nextConfig;
