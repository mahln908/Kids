// service-worker.js
const CACHE_NAME = 'radio-gospel-v2';

// Instalação
self.addEventListener('install', e => {
  console.log('📻 Rádio Gospel - SW instalando...');
  self.skipWaiting(); // Ativar imediatamente
});

// Ativação
self.addEventListener('activate', e => {
  console.log('📻 Rádio Gospel - SW ativo');
  e.waitUntil(clients.claim()); // Tomar controle imediato
});

// Mensagens do app
self.addEventListener('message', e => {
  console.log('📻 Mensagem recebida:', e.data);
  
  if (e.data.type === 'PLAYING_IN_BACKGROUND') {
    // Manter notificação ativa durante background play
    showPlaybackNotification(e.data.song);
  }
});

// Notificação de playback em background
function showPlaybackNotification(songTitle) {
  self.registration.getNotifications().then(notifications => {
    // Fechar notificações antigas
    notifications.forEach(notification => notification.close());
    
    // Criar nova notificação
    self.registration.showNotification('Rádio Gospel Litoral', {
      body: `Tocando: ${songTitle || 'Louvor e Adoração'}`,
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0OCIgY3k9IjQ4IiByPSI0NiIgZmlsbD0iIzFEQjk1NCIvPjx0ZXh0IHg9IjQ4IiB5PSI1NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+UjwvdGV4dD48L3N2Zz4=',
      badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzNiIgY3k9IjM2IiByPSIzNiIgZmlsbD0iIzFEQjk1NCIvPjwvc3ZnPg==',
      tag: 'radio-playback',
      requireInteraction: false,
      silent: true,
      data: {
        url: '/',
        timestamp: Date.now()
      },
      // Ações na notificação
      actions: [
        {
          action: 'prev',
          title: '⏮ Anterior',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiA2aDJ2MTJINnptMy41IDZsNi02djEybC02LTZ6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=='
        },
        {
          action: 'playpause',
          title: '⏯ Play/Pause',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCA1djE0bDExLTd6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg=='
        },
        {
          action: 'next',
          title: '⏭ Próxima',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNiAxOGw4LjUtNkw2IDZ2MTJ6TTE2IDZ2MTJoLTJWNmgydjEyek0xNiA2aDJ2MTJoLTJWNnoiIGZpbGw9IndoaXRlIi8+PC9zdmc+'
        }
      ]
    });
  });
}

// Clique em notificações
self.addEventListener('notificationclick', e => {
  console.log('📻 Notificação clicada:', e.action);
  
  e.notification.close();
  
  // Processar ação da notificação
  switch(e.action) {
    case 'prev':
      sendMessageToClient({ action: 'prev' });
      break;
    case 'playpause':
      sendMessageToClient({ action: 'playpause' });
      break;
    case 'next':
      sendMessageToClient({ action: 'next' });
      break;
    default:
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

// Manter SW vivo periodicamente
setInterval(() => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage('ping');
    });
  });
}, 30000); // A cada 30 segundos
