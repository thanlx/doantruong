-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ CÔNG VIỆC BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
-- Migration: Kích hoạt Supabase Realtime & Cấu hình Phân quyền OAuth Google
-- ==============================================================================

-- 1. KÍCH HOẠT REPLICA IDENTITY FULL (Bắt buộc để Supabase Realtime gửi đủ dữ liệu cũ & mới)
alter table if exists tasks replica identity full;
alter table if exists chat_messages replica identity full;
alter table if exists incoming_documents replica identity full;
alter table if exists task_comments replica identity full;
alter table if exists activity_log replica identity full;
alter table if exists members replica identity full;
alter table if exists campaigns replica identity full;

-- 2. BỔ SUNG CÁC BẢNG VÀO PUBLICATION SUPABASE_REALTIME
-- Kiểm tra và thêm từng bảng an toàn
do $$
begin
  -- tasks
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table tasks;
  end if;

  -- chat_messages
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table chat_messages;
  end if;

  -- incoming_documents
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'incoming_documents'
  ) then
    alter publication supabase_realtime add table incoming_documents;
  end if;

  -- task_comments
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'task_comments'
  ) then
    alter publication supabase_realtime add table task_comments;
  end if;

  -- activity_log
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table activity_log;
  end if;

  -- members
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'members'
  ) then
    alter publication supabase_realtime add table members;
  end if;
end $$;

-- 3. BẢO ĐẢM ROW LEVEL SECURITY (RLS) MỞ CHO CẢ AUTHENTICATED & ANON (CHO PHÉP WEB APP HOẠT ĐỘNG THÔNG SUỐT)
-- Cho phép đọc / ghi đối với tài khoản đăng nhập Google (authenticated) và tài khoản anon client
drop policy if exists "Allow full access for authenticated and anon on tasks" on tasks;
create policy "Allow full access for authenticated and anon on tasks"
  on tasks for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow full access for authenticated and anon on chat_messages" on chat_messages;
create policy "Allow full access for authenticated and anon on chat_messages"
  on chat_messages for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow full access for authenticated and anon on incoming_documents" on incoming_documents;
create policy "Allow full access for authenticated and anon on incoming_documents"
  on incoming_documents for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow full access for authenticated and anon on task_comments" on task_comments;
create policy "Allow full access for authenticated and anon on task_comments"
  on task_comments for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow full access for authenticated and anon on activity_log" on activity_log;
create policy "Allow full access for authenticated and anon on activity_log"
  on activity_log for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow full access for authenticated and anon on members" on members;
create policy "Allow full access for authenticated and anon on members"
  on members for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow full access for authenticated and anon on campaigns" on campaigns;
create policy "Allow full access for authenticated and anon on campaigns"
  on campaigns for all
  to public
  using (true)
  with check (true);
