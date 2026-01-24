// Nome do cache
const CACHE_NAME = 'mmj-music-v1';

// Instalar e armazenar arquivos essenciais em cache
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  self.skipWaiting(); // Ativar imediatamente
});

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(clients.claim()); // Controlar páginas abertas imediatamente
});

// Estratégia: buscar na rede primeiro, com fallback para cache
self.addEventListener('fetch', event => {
  // Para requisições de áudio/mídia, priorizar a rede
  if (event.request.url.includes('youtube.com') || event.request.destination === 'audio') {
    event.respondWith(fetch(event.request));
    return;
  }
  // Para outros recursos, usar a estratégia padrão
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
