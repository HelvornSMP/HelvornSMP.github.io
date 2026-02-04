const CACHE_NAME = 'helvornsmp-v1';
const ASSETS = [
  '/',
  '/helvornsmp.html',
  '/app.js',
  '/worker.js',
  '/manifest.json'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e)=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>{})));
});
