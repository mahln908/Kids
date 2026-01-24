// service-worker.js
self.addEventListener('install', event => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker ativado');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    // Interceptar requisições se necessário
});

// Manter o service worker ativo
self.addEventListener('message', event => {
    if (event.data === 'keepAlive') {
        setInterval(() => {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage('keepAlive');
                });
            });
        }, 10000);
    }
});
