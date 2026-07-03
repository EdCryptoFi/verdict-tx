/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@verdict/shared"],
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
