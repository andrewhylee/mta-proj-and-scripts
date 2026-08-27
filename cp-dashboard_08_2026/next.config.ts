import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  webpack: (config) => {
    // Handle .geojson files
    config.module.rules.push(
      {
        test: /\.geojson$/,
        type: 'json',
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.json$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]', // Adds a content hash to the filename
            },
          },
        ],
        type: 'javascript/auto', // Required for file-loader with JSON
      }
    );

    // Handle OpenLayers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
  // Enable static file serving from public directory
  async rewrites() {
    return [
      {
        source: '/src/favicon.svg',
        destination: '/favicon.svg',
      },
    ];
  },
};

export default nextConfig;
