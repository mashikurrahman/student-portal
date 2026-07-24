/** @type {import('next').NextConfig} */

// Security headers (SECURITY §6 / ADR-009). CSP ships in Report-Only first so we
// can observe violations without breaking the app, then flip to enforcing once
// the report is clean. The rest are enforced immediately — they are safe.
const isProd = process.env.NODE_ENV === "production";

const cspReportOnly = [
  "default-src 'self'",
  // Next.js requires inline/eval for its runtime; tightened with nonces later.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // HSTS only in production (avoids pinning HTTP during local dev).
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep server-only packages (argon2, prisma) out of the client bundle.
  serverExternalPackages: ["@node-rs/argon2", "@prisma/client"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
