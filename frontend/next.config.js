/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phép rewrites để proxy API calls đến backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;




