/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope

sw.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Nueva Notificación'
  const options = {
    body: data.body || 'Tienes un nuevo mensaje en Couple Wallet',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/',
    vibrate: [200, 100, 200]
  }

  event.waitUntil(sw.registration.showNotification(title, options))
})

sw.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlToOpen = new URL(event.notification.data, sw.location.origin).href
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(urlToOpen)
      }
    })
  )
})

