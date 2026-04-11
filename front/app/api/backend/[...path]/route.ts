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
  
  // Normalise le chemin pour éviter les doubles slashes et les redirections de FastAPI
  const pathPart = pathname.slice(apiPrefix.length).replace(/\/+$/, "")
  const targetUrl = `${BACKEND_URL}/api/v1${pathPart || "/"}${request.nextUrl.search}`

  console.log(`[Proxy] ${request.method} ${pathname} -> ${targetUrl}`)

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

  console.log(`[Proxy Request] ${request.method} ${pathname} -> ${targetUrl}`)
  console.log(`[Proxy Auth] Token: ${headers.get("Authorization") ? "Present" : "Missing"}`)

  try {
    let backendResponse = await fetch(targetUrl, {
      method:   request.method,
      headers,
      body:     requestBody,
      redirect: "manual",
    })

    console.log(`[Proxy Response] ${backendResponse.status} from ${targetUrl}`)

    if ([307, 308].includes(backendResponse.status)) {
      const location = backendResponse.headers.get("location")
      if (location) {
        const newTargetUrl = new URL(location, targetUrl).toString()
        backendResponse = await fetch(newTargetUrl, {
          method:   request.method,
          headers,
          body:     requestBody,
          redirect: "manual",
        })
      }
    }

    const responseHeaders = new Headers(backendResponse.headers)
    responseHeaders.delete("transfer-encoding")
    responseHeaders.delete("content-encoding")

    const bodyBuffer = await backendResponse.arrayBuffer()

    return new NextResponse(bodyBuffer, {
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
