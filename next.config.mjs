/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep server-only packages (argon2, prisma) out of the client bundle.
  serverExternalPackages: ["@node-rs/argon2", "@prisma/client"],
};

export default nextConfig;
