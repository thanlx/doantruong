// ==============================================================================
// DỊCH VỤ THÔNG BÁO ĐẨY ĐIỆN THOẠI & MÁY TÍNH (WEB NOTIFICATION & VIBRATION)
// Hỗ trợ thông báo công văn mới, sự kiện, tin nhắn nhóm chat và giao việc trên Mobile/Desktop
// ==============================================================================

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
}

/**
 * Phát âm thanh chuông thông báo nhẹ nhàng thông qua Web Audio API (không cần tải file ngoài, chạy 100% offline)
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Tiếng chuông 2 âm điệu thanh nhã chuẩn nhận diện (Sol 784Hz -> Đô 1046.5Hz)
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    // Không làm gián đoạn ứng dụng nếu chính sách audio bị hạn chế
  }
}

/**
 * Kiểm tra xem trình duyệt có hỗ trợ Notification API hay không
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Lấy trạng thái cấp quyền hiện tại ('default' | 'granted' | 'denied')
 */
export function getNotificationPermissionState(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Đăng ký Service Worker cho ứng dụng PWA
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Không thể đăng ký Service Worker:', err);
    return null;
  }
}

/**
 * Yêu cầu người dùng cấp quyền nhận thông báo trên điện thoại/máy tính
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Thiết bị hoặc trình duyệt không hỗ trợ Web Notification.');
    return false;
  }

  try {
    // Đăng ký Service Worker trước để sẵn sàng showNotification
    await registerServiceWorker();

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Gửi ngay thông báo xác nhận thành công kèm chuông và rung
      sendMobileNotification({
        title: 'Đoàn trường HCMUTE: Đã kích hoạt thông báo!',
        body: 'Đồng chí sẽ nhận được thông báo rung chuông ngay khi có công văn mới, sự kiện, tin nhắn nhóm chat và công việc.',
        icon: '/images/huy-hieu-doan.png',
        tag: 'notification-enabled',
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Lỗi yêu cầu quyền thông báo:', err);
    return false;
  }
}

/**
 * Phát thông báo đẩy trực tiếp tới điện thoại/máy tính kèm rung chuông
 */
export function sendMobileNotification(payload: NotificationPayload): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    // 1. Phát âm thanh chuông thông báo
    playNotificationSound();

    // 2. Rung điện thoại nếu thiết bị hỗ trợ (mô thức: rung 250ms, nghỉ 100ms, rung 250ms)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250]);
      } catch (e) {}
    }

    const notificationOptions: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/images/huy-hieu-doan.png',
      badge: '/images/huy-hieu-doan.png',
      tag: payload.tag || 'btv-hcmute-' + Date.now(),
      requireInteraction: payload.requireInteraction || false,
      data: {
        url: payload.url || '/',
      },
    };

    // 3. Ưu tiên phát qua Service Worker (Bắt buộc trên Android Chrome và PWA, tránh lỗi Illegal Constructor)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(payload.title, notificationOptions);
        })
        .catch(() => {
          try {
            const notif = new Notification(payload.title, notificationOptions);
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch (e) {}
        });
    } else {
      try {
        const notif = new Notification(payload.title, notificationOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {}
    }

    return true;
  } catch (err) {
    console.warn('Lỗi phát thông báo:', err);
    return false;
  }
}

/**
 * Bấm thử phát thông báo ngay lập tức để kiểm tra trên điện thoại
 */
export async function sendTestNotification(): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  return sendMobileNotification({
    title: '🔔 Kiểm tra thông báo Đoàn trường HCMUTE',
    body: 'Hệ thống thông báo đẩy, âm thanh chuông và rung trên điện thoại đang hoạt động hoàn hảo!',
    icon: '/images/huy-hieu-doan.png',
    tag: 'test-notification-' + Date.now(),
    url: '/',
    requireInteraction: true,
  });
}
