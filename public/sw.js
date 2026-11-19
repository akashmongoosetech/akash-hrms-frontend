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

  // Determine action text based on notification type or URL
  let actionTitle = 'View';
  const url = data.url || '/holidays';
  if (url.includes('events')) actionTitle = 'View Events';
  else if (url.includes('holidays')) actionTitle = 'View Holidays';
  else if (url.includes('leave')) actionTitle = 'View Leave';
  else if (url.includes('tickets')) actionTitle = 'View Tickets';
  else if (url.includes('todo')) actionTitle = 'View Todos';

  const options = {
    body: data.body || 'HRMS notification',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    sound: 'default', // Default notification sound
    requireInteraction: true, // Keep notification visible until user interacts
    data: {
      url: url // Default redirect URL
    },
    actions: [
      {
        action: 'view',
        title: actionTitle
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

// NOTE: No pass-through `fetch` handler. Calling
// `event.respondWith(fetch(event.request))` for every request can turn a
// transient network blip into a hard navigation failure (seen in the console
// as "The FetchEvent ... resulted in a network error response"). Push
// notifications do not need a fetch handler.