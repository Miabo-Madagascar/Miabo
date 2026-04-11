import type { NextConfig } from "next"

/**
 * Configuration Next.js — MIABO v2.
 *
 * Le proxy /api/backend/* est géré par le Route Handler
 * app/api/backend/[...path]/route.ts (plus de rewrites nécessaires).
 */
const nextConfig: NextConfig = {
  trailingSlash: false,
}

export default nextConfig
