// Service Worker — Hirondelles Gaume
// Cache l'outil terrain pour une utilisation hors ligne

const CACHE = 'hirondelles-v2';
const CORE = [
  './hirondelles_terrain_mobile.html',
  './style.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
];

// Installation : mise en cache des ressources essentielles
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Stratégie : cache en priorité, réseau en fallback
// Les tuiles OSM sont mises en cache après premier chargement
self.addEventListener('fetch', e => {
  // Ignorer tout ce qui n'est pas https (chrome-extension://, etc.)
  if (!e.request.url.startsWith('https://')) return;
  // Ne pas intercepter les appels Supabase (toujours réseau)
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Mettre en cache les ressources valides (tuiles OSM, leaflet, etc.)
        if (res && res.status === 200 && (
          e.request.url.includes('tile.openstreetmap.org') ||
          e.request.url.includes('cdnjs.cloudflare.com') ||
          e.request.url.includes('.css') ||
          e.request.url.includes('.js')
        )) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached); // hors ligne → version cache
    })
  );
});
