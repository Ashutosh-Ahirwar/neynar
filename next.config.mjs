/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Middleware now handles CORS, so we can remove the async headers() block 
  // to avoid duplication, or leave it as a fallback. 
  // I recommend removing the headers() block if you use the middleware above.
};

export default nextConfig;