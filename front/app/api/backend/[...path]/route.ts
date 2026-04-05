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

const BACKEND_URL = process.env.API_URL ?? "http://localhost:8000"

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params

  // Reconstruit l'URL backend : /api/backend/xxx -> /api/v1/xxx
  const targetPath = "/" + path.join("/")
  const search     = request.nextUrl.search   // query string (?status=pending…)
  const targetUrl  = `${BACKEND_URL}/api/v1${targetPath}${search}`

  // Recopie tous les headers sauf host (qui doit pointer vers le backend)
  const headers = new Headers(request.headers)
  headers.delete("host")

  // On laisse fetch suivre les redirections INTERNELLEMENT (redirect: "follow").
  // Ainsi, si FastAPI redirige /sessions -> /sessions/ (307/308),
  // le proxy suit la redirection et renvoie directement le résultat final au navigateur.
  // Cela évite que le navigateur reçoive le 307 vers le port 8000 et ne strippe le header Authorization.
  const backendResponse = await fetch(targetUrl, {
    method:   request.method,
    headers,
    body:     ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "follow",
    // @ts-expect-error — duplex requis pour le streaming du body
    duplex:   "half",
  })

  // Construit la réponse Next en recopiant status + headers backend
  const responseHeaders = new Headers(backendResponse.headers)
  // Supprime le transfer-encoding pour éviter les erreurs de décodage
  responseHeaders.delete("transfer-encoding")

  return new NextResponse(backendResponse.body, {
    status:  backendResponse.status,
    headers: responseHeaders,
  })
}

export const GET     = handler
export const POST    = handler
export const PUT     = handler
export const PATCH   = handler
export const DELETE  = handler
export const OPTIONS = handler
