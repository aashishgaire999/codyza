const CACHE_VERSION = "codyza-static-v3"
const OFFLINE_URL = "/offline.html"
const PRECACHE = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting()
})

self.addEventListener("push", (event) => {
  if (!event.data) return
  let payload = {}
  try { payload = event.data.json() } catch { payload = { body: event.data.text() } }
  const title = payload.title || "Codyza"
  const options = {
    body: payload.body || "There’s something new from the Codyza crew.",
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-192.png",
    data: { url: payload.url || "/member" },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const requested = new URL(event.notification.data?.url || "/member", self.location.origin)
  const target = requested.origin === self.location.origin ? requested.href : new URL("/member", self.location.origin).href
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((window) => window.url.startsWith(self.location.origin))
    if (existing) return existing.focus().then(() => existing.navigate(target))
    return clients.openWindow(target)
  }))
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error())
    )
    return
  }

  const safeStaticAsset = ["/_next/static/", "/icons/", "/logo/", "/decor/", "/press/"].some((prefix) => url.pathname.startsWith(prefix))
  if (!safeStaticAsset || !["style", "script", "font", "image"].includes(request.destination)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone()
          void caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
        }
        return response
      })
    })
  )
})
