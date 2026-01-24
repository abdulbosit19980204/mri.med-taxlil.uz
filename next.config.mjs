/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    'cornerstone-core',
    'cornerstone-wado-image-loader',
    'dicom-parser',
    'cornerstone-math',
    'cornerstone-tools',
    'hammerjs'
  ],
}

export default nextConfig