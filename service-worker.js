const CACHE_NAME = 'radio-gospel-v1';
self.addEventListener('install', e => {
  console.log('📻 Rádio Gospel - SW instalado');
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  console.log('📻 Rádio Gospel - SW ativo');
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
