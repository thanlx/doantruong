// ==============================================================================
// DỊCH VỤ THÔNG BÁO ĐẨY ĐIỆN THOẠI & MÁY TÍNH (WEB NOTIFICATION & VIBRATION)
// Hỗ trợ thông báo giao việc mới, đôn đốc tiến độ và nhắc lịch hẹn trên Mobile/Desktop
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
 * Yêu cầu người dùng cấp quyền nhận thông báo trên điện thoại/máy tính
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Thiết bị hoặc trình duyệt không hỗ trợ Web Notification.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Gửi ngay thông báo xác nhận thành công
      sendMobileNotification({
        title: 'Đoàn trường HCMUTE: Đã bật thông báo!',
        body: 'Đồng chí sẽ nhận được thông báo rung chuông ngay khi có công việc mới hoặc đôn đốc tiến độ.',
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
    // Rung điện thoại nếu thiết bị hỗ trợ (mô thức: rung 200ms, nghỉ 100ms, rung 200ms)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    const notificationOptions: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/images/huy-hieu-doan.png',
      badge: '/images/huy-hieu-doan.png',
      tag: payload.tag || 'btv-hcmute-' + Date.now(),
      requireInteraction: payload.requireInteraction || false,
    };

    // Ưu tiên phát qua Service Worker (cho phép hiện thông báo ngay cả khi màn hình khóa trên Android/iOS PWA)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(payload.title, notificationOptions);
      });
    } else {
      // Phát trực tiếp qua Notification API
      const notif = new Notification(payload.title, notificationOptions);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }

    return true;
  } catch (err) {
    console.warn('Lỗi phát thông báo:', err);
    return false;
  }
}
