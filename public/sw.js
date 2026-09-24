// ==============================================================================
// SERVICE WORKER - BTV ĐOÀN TRƯỜNG HCMUTE
// Caching tĩnh giao diện offline & Xử lý Push Notification
// ==============================================================================

const CACHE_NAME = 'btv-doan-truong-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon.png',
  '/images/huy-hieu-doan.png',
  '/images/hcmute-campus.webp',
];

// 1. Cài đặt Service Worker và lưu cache tĩnh các asset cốt lõi
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Lỗi cache tĩnh một số asset:', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Kích hoạt và dọn dẹp cache phiên bản cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Xử lý Fetch: Network-first cho API / Supabase, Cache-first cho static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Không cache API hoặc Supabase websocket / realtime
  if (
    url.pathname.startsWith('/api/') ||
    url.origin.includes('supabase.co') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // Cache-first cho ảnh, CSS, JS tĩnh
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first có fallback về cache cho trang HTML
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});

// 4. Lắng nghe sự kiện Push Notification từ Server/Admin
self.addEventListener('push', (event) => {
  let data = {
    title: 'Đoàn trường HCMUTE',
    body: 'Có thông báo mới về công việc BTV',
    icon: '/images/huy-hieu-doan.png',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/images/huy-hieu-doan.png',
    badge: '/images/huy-hieu-doan.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 5. Mở hoặc chuyển tab khi người dùng bấm vào thông báo
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
