// service-worker.js
const CACHE_NAME = 'mmj-music-v3';
const OFFLINE_URL = '/offline.html';

// Instalação
self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Cache aberto');
            
            // Cache da página offline
            return cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
        })
        .then(() => {
            console.log('[Service Worker] Instalação completa');
            return self.skipWaiting();
        })
    );
});

// Ativação
self.addEventListener('activate', event => {
    console.log('[Service Worker] Ativando...');
    
    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Tomar controle imediato
            self.clients.claim()
        ]).then(() => {
            console.log('[Service Worker] Ativado e pronto');
        })
    );
});

// Fetch com estratégia de cache
self.addEventListener('fetch', event => {
    // Ignorar requisições não-GET e requisições do YouTube
    if (event.request.method !== 'GET' || 
        event.request.url.includes('youtube.com') ||
        event.request.url.includes('youtube.googleapis.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retornar resposta
                if (response) {
                    return response;
                }
                
                // Não está no cache - buscar na rede
                return fetch(event.request).then(response => {
                    // Verificar se a resposta é válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar a resposta
                    const responseToCache = response.clone();
                    
                    // Adicionar ao cache
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(() => {
                    // Se offline e não está no cache, mostrar página offline
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Background Sync
self.addEventListener('sync', event => {
    console.log('[Service Worker] Sync event:', event.tag);
    
    if (event.tag === 'update-playback') {
        event.waitUntil(syncPlaybackState());
    }
});

// Mensagens do cliente
self.addEventListener('message', event => {
    console.log('[Service Worker] Mensagem recebida:', event.data);
    
    switch (event.data) {
        case 'keepAlive':
            // Manter service worker ativo
            sendMessageToClients('alive');
            break;
            
        case 'PLAYBACK_START':
            // Notificar clients sobre reprodução
            showPlaybackNotification(event.data.song);
            break;
    }
});

// Notificações push
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification recebida');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'MMJ Music';
    const options = {
        body: data.body || 'Reproduzindo em background',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'playback-notification',
        requireInteraction: true,
        silent: true,
        data: {
            url: '/',
            playback: true
        },
        actions: [
            {
                action: 'play',
                title: '▶️ Tocar'
            },
            {
                action: 'pause', 
                title: '⏸️ Pausar'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Clique em notificações
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notificação clicada:', event.action);
    
    event.notification.close();
    
    // Ações da notificação
    if (event.action === 'play') {
        sendMessageToClients({ action: 'play' });
    } else if (event.action === 'pause') {
        sendMessageToClients({ action: 'pause' });
    } else {
        // Abrir/focar no app
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Funções auxiliares
function sendMessageToClients(message) {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage(message);
        });
    });
}

function syncPlaybackState() {
    return new Promise(resolve => {
        console.log('[Service Worker] Sincronizando estado de reprodução');
        resolve();
    });
}

function showPlaybackNotification(songTitle) {
    self.registration.showNotification('MMJ Music', {
        body: `Tocando: ${songTitle || 'Música'}`,
        icon: '/icon-192.png',
        silent: true,
        requireInteraction: false,
        tag: 'current-playback'
    });
}

// Periodicamente limpar notificações antigas
setInterval(() => {
    self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => {
            if (notification.tag === 'current-playback') {
                notification.close();
            }
        });
    });
}, 30000);
