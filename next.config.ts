import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['ag-grid-react', 'ag-grid-community'],
};

export default nextConfig;
