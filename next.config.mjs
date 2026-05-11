/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow deployment on Vercel without lint errors blocking the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
