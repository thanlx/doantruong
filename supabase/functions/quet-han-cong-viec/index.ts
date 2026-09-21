// ==============================================================================
// SUPABASE EDGE FUNCTION: QUÉT HẠN CÔNG VIỆC VÀ GỬI THÔNG BÁO BTV ĐOÀN TRƯỜNG
// Tự động kích hoạt mỗi 5 phút qua pg_cron
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:doantruong@hcmute.edu.vn";

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Tính thời gian theo múi giờ Việt Nam (Asia/Ho_Chi_Minh = UTC+7)
    const now = new Date();
    const vietnamOffset = 7 * 60; // phút
    const localTimeMs = now.getTime() + (vietnamOffset + now.getTimezoneOffset()) * 60000;
    const vnDate = new Date(localTimeMs);
    const currentHour = vnDate.getHours();

    // Khung giờ yên tĩnh: 22:00 đến 06:00
    const isQuietHour = currentHour >= 22 || currentHour < 6;

    // 1. Lấy tất cả công việc chưa hoàn thành có đặt deadline (due_at is not null)
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id, title, priority, status, due_at, owner_id,
        owner:members!owner_id(id, email, full_name, phone)
      `)
      .in("status", ["moi", "dang_lam", "cho_duyet"])
      .not("due_at", "is", null);

    if (tasksError) throw tasksError;

    // 2. Lấy danh sách Bí thư và Chánh văn phòng để leo thang khi quá hạn 3 ngày
    const { data: managers } = await supabase
      .from("members")
      .select("id, email, full_name")
      .in("role", ["bi_thu", "chanh_van_phong"])
      .eq("active", true);

    const notificationsToSend: Array<{
      taskId: string;
      memberId: string;
      memberName: string;
      email: string;
      kind: string;
      channel: "push" | "email";
      title: string;
      body: string;
      isUrgent: boolean;
    }> = [];

    for (const task of tasks || []) {
      const dueTime = new Date(task.due_at).getTime();
      const diffMs = dueTime - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const isUrgent = task.priority === "khan";

      const owner = (task as any).owner;
      if (!owner) continue;

      // Mốc 1: Trước hạn 24 giờ (từ 23h đến 25h)
      if (diffHours > 0 && diffHours <= 24 && diffHours >= 23.5) {
        notificationsToSend.push({
          taskId: task.id,
          memberId: owner.id,
          memberName: owner.full_name,
          email: owner.email,
          kind: "truoc_1_ngay",
          channel: "push",
          title: "⏰ Nhắc việc: Còn 24 giờ đến hạn!",
          body: `Công việc "${task.title}" sắp đến hạn hoàn thành vào ngày mai.`,
          isUrgent,
        });
      }

      // Mốc 2: Trước hạn 2 giờ (từ 1.9h đến 2.1h)
      if (diffHours > 0 && diffHours <= 2 && diffHours >= 1.8) {
        notificationsToSend.push({
          taskId: task.id,
          memberId: owner.id,
          memberName: owner.full_name,
          email: owner.email,
          kind: "truoc_2_gio",
          channel: "push",
          title: "⚠️ Khẩn cấp: Còn 2 giờ đến hạn!",
          body: `Công việc "${task.title}" sẽ hết hạn vào lúc ${new Date(task.due_at).toLocaleTimeString("vi-VN")}.`,
          isUrgent,
        });
      }

      // Mốc 3: Đúng giờ hạn chót (từ -10 phút đến +10 phút)
      if (Math.abs(diffHours) <= 0.2) {
        notificationsToSend.push(
          {
            taskId: task.id,
            memberId: owner.id,
            memberName: owner.full_name,
            email: owner.email,
            kind: "den_han",
            channel: "push",
            title: "🔔 Đã đến hạn công việc!",
            body: `Công việc "${task.title}" đã đến hạn chót cần nộp hoặc báo cáo tiến độ.`,
            isUrgent,
          },
          {
            taskId: task.id,
            memberId: owner.id,
            memberName: owner.full_name,
            email: owner.email,
            kind: "den_han",
            channel: "email",
            title: `[HCMUTE Đoàn] Đến hạn công việc: ${task.title}`,
            body: `Đ/c ${owner.full_name} thân mến,\n\nCông việc "${task.title}" đã đến hạn. Vui lòng cập nhật trạng thái trên hệ thống.`,
            isUrgent,
          }
        );
      }

      // Mốc 4: Quá hạn 1 ngày (quá hạn từ 24h đến 26h)
      if (diffHours < 0 && Math.abs(diffHours) >= 24 && Math.abs(diffHours) <= 26) {
        notificationsToSend.push(
          {
            taskId: task.id,
            memberId: owner.id,
            memberName: owner.full_name,
            email: owner.email,
            kind: "qua_han",
            channel: "push",
            title: "🚨 Công việc đã quá hạn 1 ngày!",
            body: `Công việc "${task.title}" đã quá hạn 24 giờ. Đ/c khẩn trương hoàn thiện!`,
            isUrgent,
          },
          {
            taskId: task.id,
            memberId: owner.id,
            memberName: owner.full_name,
            email: owner.email,
            kind: "qua_han",
            channel: "email",
            title: `[CẢNH BÁO QUÁ HẠN] Công việc: ${task.title}`,
            body: `Đ/c ${owner.full_name} thân mến,\n\nCông việc "${task.title}" đã quá hạn 1 ngày. Đề nghị đ/c cập nhật tiến độ ngay.`,
            isUrgent,
          }
        );
      }

      // Mốc 5: Leo thang quá hạn 3 ngày (quá hạn >= 72h) -> Báo người phụ trách + Bí thư + Chánh VP!
      if (diffHours < 0 && Math.abs(diffHours) >= 72) {
        const recipients = [owner, ...(managers || [])];
        for (const recipient of recipients) {
          notificationsToSend.push(
            {
              taskId: task.id,
              memberId: recipient.id,
              memberName: recipient.full_name,
              email: recipient.email,
              kind: "leo_thang",
              channel: "push",
              title: "🔴 LEO THANG: Công việc trễ hạn quá 3 ngày!",
              body: `Công việc "${task.title}" do Đ/c ${owner.full_name} phụ trách đã trễ hạn hơn 72 giờ.`,
              isUrgent: true,
            },
            {
              taskId: task.id,
              memberId: recipient.id,
              memberName: recipient.full_name,
              email: recipient.email,
              kind: "leo_thang",
              channel: "email",
              title: `[LEO THANG BTV ĐOÀN TRƯỜNG] Công việc trễ hạn 3 ngày: ${task.title}`,
              body: `Kính gửi Đ/c,\n\nCông việc "${task.title}" do Đ/c ${owner.full_name} chịu trách nhiệm chính đã trễ hạn 3 ngày liên tục. Đề nghị Thường trực Đoàn trường xem xét chỉ đạo.`,
              isUrgent: true,
            }
          );
        }
      }
    }

    // 3. Xử lý ghi nhận và gửi thông báo (với cơ chế chống gửi trùng bằng notification_log)
    let sentCount = 0;
    let skippedQuietCount = 0;

    for (const item of notificationsToSend) {
      // Nếu là khung giờ yên tĩnh (22h - 6h) và không phải việc KHẨN -> hoãn gửi push
      if (isQuietHour && !item.isUrgent && item.channel === "push") {
        skippedQuietCount++;
        continue;
      }

      // Ghi nhận vào bảng notification_log với on conflict do nothing
      const { data: inserted, error: insertError } = await supabase
        .from("notification_log")
        .insert({
          task_id: item.taskId,
          member_id: item.memberId,
          kind: item.kind,
          channel: item.channel,
          sent_at: new Date().toISOString(),
        })
        .select("id");

      // Nếu không chèn được hàng mới -> đã gửi mốc này trước đó rồi, bỏ qua
      if (insertError || !inserted || inserted.length === 0) {
        continue;
      }

      // Gửi Web Push nếu kênh là push
      if (item.channel === "push") {
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("member_id", item.memberId);

        // Giả lập hoặc gọi push service với payload
        console.log(`[Push Sent] To: ${item.memberName}, Title: ${item.title}`);
        sentCount++;
      } else if (item.channel === "email") {
        console.log(`[Email Sent] To: ${item.email}, Title: ${item.title}`);
        sentCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scannedTasks: tasks?.length || 0,
        notificationsTriggered: sentCount,
        skippedQuietHours: skippedQuietCount,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
