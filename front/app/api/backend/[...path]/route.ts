/**
 * Proxy API — Route Handler Next.js.
 *
 * Remplace les `rewrites` de next.config.ts pour le préfixe /api/backend/*.
 * Avantage : transmet les headers (Authorization) sans jamais suivre les
 * redirections (308 FastAPI /sessions → /sessions/), évitant ainsi que le
 * navigateur refasse la requête directement vers le backend (cross-origin)
 * ce qui strippait le header Authorization.
 *
 * Toutes les méthodes HTTP sont gérées via le handler générique `handler`.
 */

import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.API_URL ?? "http://127.0.0.1:8000"

async function handler(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const apiPrefix = "/api/backend"
  let targetPath = pathname.slice(apiPrefix.length) || "/"
  
  if (targetPath.length > 1 && targetPath.endsWith("/")) {
    targetPath = targetPath.slice(0, -1)
  }

  const search     = request.nextUrl.search
  const targetUrl  = `${BACKEND_URL}/api/v1${targetPath}${search}`

  // Recopie les headers essentiels en évitant les conflits
  const headers = new Headers()
  const forbiddenHeaders = ["host", "content-length", "connection", "keep-alive"]
  
  request.headers.forEach((value, key) => {
    if (!forbiddenHeaders.includes(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  // On bufferise le body pour pouvoir le re-transmettre en cas de redirection (307/308).
  const requestBody = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer()

  try {
    const backendResponse = await fetch(targetUrl, {
      method:   request.method,
      headers,
      body:     requestBody,
      redirect: "follow",
    })

    // Construit la réponse Next en recopiant status + headers backend
    const responseHeaders = new Headers(backendResponse.headers)
    // Supprime le transfer-encoding pour éviter les erreurs de décodage
    responseHeaders.delete("transfer-encoding")

    return new NextResponse(backendResponse.body, {
      status:  backendResponse.status,
      headers: responseHeaders,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new NextResponse(JSON.stringify({
      detail: "Proxy Error",
      message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Force le mode dynamique pour que Next.js ne mette pas en cache les réponses
// (indispensable pour les flux SSE qui doivent rester ouverts).
export const dynamic = "force-dynamic"

export const GET     = handler
export const POST    = handler
export const PUT     = handler
export const PATCH   = handler
export const DELETE  = handler
export const OPTIONS = handler
