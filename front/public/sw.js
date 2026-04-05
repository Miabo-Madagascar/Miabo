/**
 * Service Worker MIABO — stratégies de cache PWA.
 * TODO PHASE 1 : généré automatiquement par next-pwa.
 * Ce fichier sera remplacé à l'installation de next-pwa.
 *
 * Stratégies prévues :
 * - Network First  : appels API FastAPI (/api/v1/*)
 * - Cache First    : assets statiques (_next/static/*, images)
 * - SWR            : ressources CANOPE (/api/v1/resources)
 * - Background Sync: messages envoyés hors-ligne
 */

const CACHE_NAME = "miabo-v2"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/fr", "/manifest.json"])
    )
  )
})

self.addEventListener("fetch", (event) => {
  // TODO PHASE 1 : implémenter les stratégies de cache
  event.respondWith(fetch(event.request))
})
