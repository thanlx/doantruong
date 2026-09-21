// ==============================================================================
// HỆ THỐNG QUẢN LÝ CÔNG VIỆC BTV ĐOÀN TRƯỜNG HCMUTE
// Logic tính toán 6 mốc nhắc việc, chống spam, khung giờ yên tĩnh & đôn đốc thủ công
// ==============================================================================

import type { Task, NotificationKind } from '../types/index.ts';

export const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Kiểm tra xem thời điểm hiện tại có thuộc khung giờ yên tĩnh (22:00 - 06:00) theo múi giờ Việt Nam
 */
export function isWithinQuietHours(currentDate: Date = new Date()): boolean {
  // Chuyển sang giờ Việt Nam (UTC+7)
  const utc = currentDate.getTime() + currentDate.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 7 * 3600000);
  const hour = vnTime.getHours();
  return hour >= 22 || hour < 6;
}

/**
 * Kiểm tra có được gửi thông báo đẩy tại thời điểm này không (Tôn trọng giờ yên tĩnh trừ việc KHẨN)
 */
export function shouldDeliverPushNow(priority: Task['priority'], currentDate: Date = new Date()): boolean {
  if (priority === 'khan') {
    return true; // Ưu tiên khẩn: gửi bất kể ngày đêm
  }
  return !isWithinQuietHours(currentDate);
}

/**
 * Tính toán mốc nhắc việc tự động dựa vào hạn chót và thời gian hiện tại
 */
export function getTriggeredNotificationKind(task: Task, currentTime: Date = new Date()): NotificationKind | null {
  if (!task.due_at) return null;
  if (task.status === 'hoan_thanh' || task.status === 'huy' || task.status === 'tam_dung') return null;

  const due = new Date(task.due_at).getTime();
  const now = currentTime.getTime();
  const diffHours = (due - now) / (1000 * 60 * 60);

  // Mốc leo thang: Quá hạn >= 72 giờ (3 ngày)
  if (diffHours <= -72) {
    return 'leo_thang';
  }

  // Mốc quá hạn 1 ngày: Quá hạn từ 23.5 giờ đến 25.5 giờ
  if (diffHours <= -23.5 && diffHours >= -25.5) {
    return 'qua_han';
  }

  // Mốc đúng hạn: Trong khoảng sai số 15 phút trước hoặc sau deadline
  if (Math.abs(diffHours) <= 0.25) {
    return 'den_han';
  }

  // Mốc trước hạn 2 giờ: Trong khoảng 1.8h đến 2.2h
  if (diffHours >= 1.8 && diffHours <= 2.2) {
    return 'truoc_2_gio';
  }

  // Mốc trước hạn 1 ngày (24 giờ): Trong khoảng 23.5h đến 24.5h
  if (diffHours >= 23.5 && diffHours <= 24.5) {
    return 'truoc_1_ngay';
  }

  return null;
}

/**
 * Kiểm tra quy định đôn đốc thủ công: Tối đa 1 lần / việc / người / 6 giờ
 */
export function checkCanManualRemind(
  lastRemindedAt?: string | null,
  now: Date = new Date()
): { allowed: boolean; waitMinutes?: number } {
  if (!lastRemindedAt) {
    return { allowed: true };
  }

  const lastTime = new Date(lastRemindedAt).getTime();
  const diffMs = now.getTime() - lastTime;

  if (diffMs < SIX_HOURS_MS) {
    const remainingMs = SIX_HOURS_MS - diffMs;
    const waitMinutes = Math.ceil(remainingMs / (1000 * 60));
    return { allowed: false, waitMinutes };
  }

  return { allowed: true };
}

/**
 * Cơ chế chống gửi trùng: Mô phỏng Unique Index (task_id, member_id, kind, channel)
 */
export class NotificationDeduplicator {
  private log = new Set<string>();

  /**
   * Thử đăng ký thông báo. Trả về true nếu gửi mới thành công, false nếu bị trùng (ON CONFLICT DO NOTHING)
   */
  public tryRegister(taskId: string, memberId: string, kind: NotificationKind, channel: 'push' | 'email'): boolean {
    // Với đôn đốc thủ công, cho phép gửi nhiều lần (nằm ngoài unique index)
    if (kind === 'don_doc') {
      return true;
    }

    const key = `${taskId}::${memberId}::${kind}::${channel}`;
    if (this.log.has(key)) {
      return false; // Đã gửi mốc này rồi, bỏ qua
    }

    this.log.add(key);
    return true;
  }

  public hasSent(taskId: string, memberId: string, kind: NotificationKind, channel: 'push' | 'email'): boolean {
    const key = `${taskId}::${memberId}::${kind}::${channel}`;
    return this.log.has(key);
  }
}
