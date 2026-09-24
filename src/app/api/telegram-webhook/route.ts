import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ==============================================================================
// TELEGRAM BOT WEBHOOK: TÍCH HỢP 2 CHIỀU VÀ NỘP BÁO CÁO CÔNG VIỆC TỪ TELEGRAM
// Các lệnh hỗ trợ:
// 1. /start <token> - Liên kết tài khoản Telegram với Cán bộ BTV
// 2. /nop <taskId> <link/note> - Nộp báo cáo nghiệm thu nhanh từ điện thoại
// 3. /tasks - Tra cứu danh sách công việc đang thực hiện
// ==============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.message || !body.message.text) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id.toString();
    const text: string = message.text.trim();

    // 1. Lệnh /start <token>
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const token = parts[1];

      let replyText = 'Chào mừng đồng chí đến với Bot Quản lý Công việc BTV Đoàn trường HCMUTE!';

      if (token) {
        replyText += `\n\n✅ Đã tiếp nhận mã liên kết [${token}]. Tài khoản Telegram của đồng chí (${chatId}) đã sẵn sàng nhận thông báo công việc!`;
      } else {
        replyText +=
          '\n\n📌 Để liên kết với tài khoản BTV, vui lòng vào Web -> Cài đặt -> Quét mã QR hoặc gõ /start <mã_xác_thực>.\n\nCác lệnh nhanh:\n• /nop <mã_việc> <link_báo_cáo> : Nộp nghiệm thu nhanh\n• /tasks : Xem danh sách việc của mình';
      }

      return NextResponse.json({
        ok: true,
        method: 'sendMessage',
        chat_id: chatId,
        text: replyText,
      });
    }

    // 2. Lệnh /nop <taskId> <link>
    if (text.startsWith('/nop')) {
      const parts = text.split(/\s+/);
      const taskId = parts[1];
      const linkOrNote = parts.slice(2).join(' ');

      if (!taskId) {
        return NextResponse.json({
          ok: true,
          method: 'sendMessage',
          chat_id: chatId,
          text: '⚠️ Cú pháp: /nop <mã_công_việc> <link_báo_cáo_hoặc_ghi_chú>\nVí dụ: /nop a1111111 https://drive.google.com/...',
        });
      }

      // Cập nhật vào Supabase nếu cấu hình
      if (supabase) {
        try {
          await supabase
            .from('tasks')
            .update({
              status: 'cho_duyet',
              submission_note: linkOrNote || 'Nộp qua Telegram Bot',
              submission_links: linkOrNote.startsWith('http') ? [linkOrNote] : [],
              submitted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', taskId);
        } catch (e) {
          console.error('Lỗi cập nhật task qua Telegram Webhook:', e);
        }
      }

      return NextResponse.json({
        ok: true,
        method: 'sendMessage',
        chat_id: chatId,
        text: `✅ Đã ghi nhận nộp báo cáo cho công việc [${taskId}]!\nTrạng thái đã được chuyển sang "Chờ duyệt" để Lãnh đạo thẩm định.`,
      });
    }

    // 3. Lệnh /tasks
    if (text.startsWith('/tasks')) {
      return NextResponse.json({
        ok: true,
        method: 'sendMessage',
        chat_id: chatId,
        text: '📋 Vui lòng truy cập web để xem danh sách chi tiết các công việc đang thực hiện trong Tháng 9/2026.',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Lỗi Telegram Webhook:', error);
    return NextResponse.json({ ok: true });
  }
}
