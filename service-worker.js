// service-worker.js
const CACHE_NAME = 'radio-gospel-v3';

// Instalação
self.addEventListener('install', e => {
  console.log('📻 Rádio Gospel - Instalando Service Worker');
  self.skipWaiting(); // Ativar imediatamente
});

// Ativação
self.addEventListener('activate', e => {
  console.log('📻 Rádio Gospel - Service Worker ativo');
  e.waitUntil(clients.claim()); // Tomar controle imediato
});

// Receber mensagens do app
self.addEventListener('message', e => {
  if (e.data.type === 'RADIO_PLAYING') {
    // Mostrar notificação permanente durante a reprodução
    showPersistentNotification(e.data.song);
  }
});

// Notificação persistente para background play
function showPersistentNotification(songTitle) {
  self.registration.getNotifications().then(notifications => {
    // Manter apenas uma notificação ativa
    notifications.forEach(notification => {
      if (notification.tag === 'radio-active') {
        notification.close();
      }
    });
    
    // Criar nova notificação
    self.registration.showNotification('Rádio Gospel Litoral', {
      body: `🎵 ${songTitle.substring(0, 40)}${songTitle.length > 40 ? '...' : ''}`,
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSI0NiIgZmlsbD0iIzFEQjk1NCIvPjx0ZXh0IHg9IjQ4IiB5PSI1NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+UjwvdGV4dD48L3N2Zz4=',
      badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzNiIgY3k9IjM2IiByPSIzNiIgZmlsbD0iIzFEQjk1NCIvPjwvc3ZnPg==',
      tag: 'radio-active',
      requireInteraction: false,
      silent: true,
      renotify: true,
      data: {
        url: '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'playpause',
          title: '⏯️',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCA1djE0bDExLTd6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=='
        }
      ]
    });
  });
}

// Clique na notificação
self.addEventListener('notificationclick', e => {
  e.notification.close();
  
  if (e.action === 'playpause') {
    // Enviar comando play/pause para o app
    sendMessageToClient({ action: 'playpause' });
  } else {
    // Abrir/focar no app
    e.waitUntil(
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

// Enviar mensagem para o app
function sendMessageToClient(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

// Manter SW vivo
setInterval(() => {
  self.clients.matchAll().then(clients => {
    if (clients.length > 0) {
      console.log('📻 Service Worker ativo');
    }
  });
}, 60000); // Verificar a cada minuto
