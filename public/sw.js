// Service Worker for Push Notifications
const CACHE_NAME = 'hrms-cache-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Holiday update notification',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    sound: 'default', // Default notification sound
    requireInteraction: true, // Keep notification visible until user interacts
    data: {
      url: data.url || '/holidays' // Default redirect URL
    },
    actions: [
      {
        action: 'view',
        title: 'View Holidays'
      }
    ]
  };


  event.waitUntil(
    self.registration.showNotification(data.title || 'HRMS Notification', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/holidays';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no suitable window is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Cache management (optional, for PWA features)
self.addEventListener('fetch', (event) => {
  // You can add caching logic here if needed
  // For now, just pass through all requests
  event.respondWith(fetch(event.request));
});