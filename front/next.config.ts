import type { NextConfig } from "next"

/**
 * Configuration Next.js — MIABO v2.
 *
 * Rewrites : le front appelle /api/backend/* (URL relative, jamais exposée).
 * Next.js proxifie vers FastAPI côté serveur via API_URL (variable serveur,
 * jamais NEXT_PUBLIC_ → invisible du navigateur).
 */
const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL ?? "http://localhost:8000"
    return [
      {
        // /api/backend/auth/register → http://localhost:8000/api/v1/auth/register
        source:      "/api/backend/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
