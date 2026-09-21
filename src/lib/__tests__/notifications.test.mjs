// ==============================================================================
// UNIT TESTS: KIỂM THỬ LOGIC 6 MỐC THÔNG BÁO VÀ CHỐNG TRÙNG LẶP
// Chạy bằng Node test runner: node --test src/lib/__tests__/notifications.test.mjs
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTriggeredNotificationKind,
  isWithinQuietHours,
  shouldDeliverPushNow,
  checkCanManualRemind,
  NotificationDeduplicator,
  SIX_HOURS_MS,
} from '../notifications.ts';

test('Mốc 1: Nhắc trước 24 giờ (truoc_1_ngay)', () => {
  const now = new Date('2025-09-21T10:00:00+07:00');
  const dueAt = new Date('2025-09-22T10:00:00+07:00').toISOString(); // Đúng 24 giờ sau
  const task = { id: 'task-1', title: 'Test 24h', due_at: dueAt, status: 'dang_lam', priority: 'binh_thuong' };

  const kind = getTriggeredNotificationKind(task, now);
  assert.equal(kind, 'truoc_1_ngay', 'Phải kích hoạt mốc truoc_1_ngay');
});

test('Mốc 2: Nhắc trước 2 giờ (truoc_2_gio)', () => {
  const now = new Date('2025-09-21T10:00:00+07:00');
  const dueAt = new Date('2025-09-21T12:00:00+07:00').toISOString(); // Đúng 2 giờ sau
  const task = { id: 'task-2', title: 'Test 2h', due_at: dueAt, status: 'dang_lam', priority: 'cao' };

  const kind = getTriggeredNotificationKind(task, now);
  assert.equal(kind, 'truoc_2_gio', 'Phải kích hoạt mốc truoc_2_gio');
});

test('Mốc 3: Đúng hạn (den_han)', () => {
  const now = new Date('2025-09-21T10:00:00+07:00');
  const dueAt = new Date('2025-09-21T10:05:00+07:00').toISOString(); // Sai số 5 phút
  const task = { id: 'task-3', title: 'Test đến hạn', due_at: dueAt, status: 'dang_lam', priority: 'binh_thuong' };

  const kind = getTriggeredNotificationKind(task, now);
  assert.equal(kind, 'den_han', 'Phải kích hoạt mốc den_han');
});

test('Mốc 4: Quá hạn 1 ngày (qua_han)', () => {
  const now = new Date('2025-09-22T10:00:00+07:00');
  const dueAt = new Date('2025-09-21T10:00:00+07:00').toISOString(); // Đã quá hạn 24 giờ
  const task = { id: 'task-4', title: 'Test quá hạn 24h', due_at: dueAt, status: 'dang_lam', priority: 'binh_thuong' };

  const kind = getTriggeredNotificationKind(task, now);
  assert.equal(kind, 'qua_han', 'Phải kích hoạt mốc qua_han');
});

test('Mốc 5: Leo thang quá hạn 3 ngày (leo_thang)', () => {
  const now = new Date('2025-09-24T10:00:00+07:00');
  const dueAt = new Date('2025-09-21T10:00:00+07:00').toISOString(); // Quá hạn 72 giờ (3 ngày)
  const task = { id: 'task-5', title: 'Test leo thang', due_at: dueAt, status: 'dang_lam', priority: 'cao' };

  const kind = getTriggeredNotificationKind(task, now);
  assert.equal(kind, 'leo_thang', 'Phải kích hoạt mốc leo_thang để báo Bí thư và Chánh VP');
});

test('Khung giờ yên tĩnh (22:00 - 06:00)', () => {
  const nightTime = new Date('2025-09-21T23:30:00+07:00');
  assert.equal(isWithinQuietHours(nightTime), true, '23:30 phải là giờ yên tĩnh');

  const morningQuiet = new Date('2025-09-21T05:15:00+07:00');
  assert.equal(isWithinQuietHours(morningQuiet), true, '05:15 phải là giờ yên tĩnh');

  const workHour = new Date('2025-09-21T09:00:00+07:00');
  assert.equal(isWithinQuietHours(workHour), false, '09:00 không phải giờ yên tĩnh');

  // Ưu tiên khẩn cấp: được phép gửi dù ban đêm
  assert.equal(shouldDeliverPushNow('khan', nightTime), true, 'Việc khẩn phải cho phép gửi ban đêm');
  assert.equal(shouldDeliverPushNow('binh_thuong', nightTime), false, 'Việc thường phải hoãn gửi');
});

test('Chống gửi trùng thông báo (NotificationDeduplicator)', () => {
  const deduplicator = new NotificationDeduplicator();
  const taskId = 'task-100';
  const memberId = 'member-01';

  // Lần đầu: cho phép gửi
  const firstPush = deduplicator.tryRegister(taskId, memberId, 'den_han', 'push');
  assert.equal(firstPush, true, 'Lần đầu gửi den_han push phải thành công');

  // Lần 2 gửi lại cùng mốc: bị từ chối
  const secondPush = deduplicator.tryRegister(taskId, memberId, 'den_han', 'push');
  assert.equal(secondPush, false, 'Lần 2 gửi trùng lặp phải trả về false (bị chặn)');

  // Kênh email vẫn được gửi 1 lần:
  const emailChannel = deduplicator.tryRegister(taskId, memberId, 'den_han', 'email');
  assert.equal(emailChannel, true, 'Kênh email lần đầu phải thành công');

  // Đôn đốc thủ công: không bị chặn bởi unique constraint
  assert.equal(deduplicator.tryRegister(taskId, memberId, 'don_doc', 'push'), true);
  assert.equal(deduplicator.tryRegister(taskId, memberId, 'don_doc', 'push'), true);
});

test('Quy tắc đôn đốc thủ công: Giới hạn 1 lần / 6 giờ', () => {
  const now = new Date('2025-09-21T14:00:00+07:00');
  const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const sevenHoursAgo = new Date(now.getTime() - 7 * 3600 * 1000).toISOString();

  // Đã đôn đốc cách đây 2 tiếng -> Chưa được đôn đốc tiếp
  const checkRecent = checkCanManualRemind(twoHoursAgo, now);
  assert.equal(checkRecent.allowed, false, 'Chưa đủ 6 tiếng thì không được đôn đốc tiếp');
  assert.equal(checkRecent.waitMinutes, 240, 'Còn phải chờ 240 phút (4 giờ)');

  // Đã đôn đốc cách đây 7 tiếng -> Được đôn đốc
  const checkOld = checkCanManualRemind(sevenHoursAgo, now);
  assert.equal(checkOld.allowed, true, 'Đã qua 6 tiếng thì được đôn đốc lần tiếp theo');

  // Chưa từng đôn đốc -> Cho phép
  const checkNever = checkCanManualRemind(null, now);
  assert.equal(checkNever.allowed, true);
});
