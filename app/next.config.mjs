/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // fully static (client-only app) → deployable as plain static files
  images: { unoptimized: true },
  transpilePackages: ["@verdict/shared"],
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
