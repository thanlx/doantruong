-- ==============================================================================
-- CẤU HÌNH PG_CRON CHO SUPABASE (CHẠY MỖI 5 PHÚT)
-- Gọi Edge Function quét hạn công việc và bắn thông báo Web Push / Email
-- ==============================================================================

-- Bật extension pg_cron và pg_net nếu chưa có
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- Xóa job cũ nếu tồn tại
select cron.unschedule('quet-han-cong-viec-btv-hcmute');

-- Lên lịch chạy mỗi 5 phút
select cron.schedule(
  'quet-han-cong-viec-btv-hcmute',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select coalesce(current_setting('app.settings.edge_function_url', true), 'https://<project-ref>.supabase.co/functions/v1/quet-han-cong-viec')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select coalesce(current_setting('app.settings.service_role_key', true), '<service-role-key>'))
    ),
    body := jsonb_build_object(
      'trigger_source', 'pg_cron',
      'scheduled_at', now()
    )
  );
  $$
);
