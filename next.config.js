/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["socket.io", "socket.io-client"],
  },
  output: "standalone",
  webpack: (config) => {
    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: "asset/resource",
      generator: {
        filename: "static/fonts/[name].[hash][ext]",
      },
    });
    return config;
  },
};

module.exports = nextConfig;
