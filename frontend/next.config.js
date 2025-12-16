/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  swcMinify: true,

  // Optimize images and fonts
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Cho phép rewrites để proxy API calls đến backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
    // Enable faster builds and HMR
    turbo: {
      resolveAlias: {
        '@': './app',
      },
    },
    // Enable memory cache
    memoryBasedWorkersCount: true,
    // Faster webpack config
    webpackBuildWorker: true,
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Optimize chunking
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;










