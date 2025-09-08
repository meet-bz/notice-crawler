import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'clone-deep', 'merge-deep'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'clone-deep': 'commonjs clone-deep',
        'merge-deep': 'commonjs merge-deep'
      });
    }
    return config;
  },
  experimental: {
    turbo: {
      rules: {
        '*.node': {
          loaders: ['node-loader'],
          as: '*.node'
        }
      }
    }
  }
};

export default nextConfig;
