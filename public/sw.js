// Kill-switch service worker.
// When a browser that registered the previous (Lovable) service worker
// re-checks the SW source URL, it downloads this file. The browser sees
// the content has changed, installs this as the new SW, and activates it.
// On activation we destroy all caches, unregister ourselves, and force
// every open client to reload — which then fetches the live site from
// Vercel directly with no SW in the way.

self.addEventListener("install", () => {
  // Skip the waiting phase so we activate immediately on next reload
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Delete every cache this origin has
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      } catch (e) {
        // Ignore cache errors — we're tearing down anyway
      }
      try {
        // Unregister ourselves so we never run again
        await self.registration.unregister();
      } catch (e) {
        // Ignore
      }
      try {
        // Force every controlled tab to reload with fresh content
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          client.navigate(client.url);
        }
      } catch (e) {
        // Ignore
      }
    })()
  );
});

// Don't intercept any fetches while we wait to activate
self.addEventListener("fetch", () => {});
