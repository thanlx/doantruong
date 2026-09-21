-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ CÔNG VIỆC BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
-- Migration khởi tạo cơ sở dữ liệu: Schemas, RLS Policies, Indexes & Seed Data
-- ==============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- 1. BẢNG MEMBERS (Allowlist thành viên BTV)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('bi_thu', 'pho_bi_thu', 'chanh_van_phong', 'uy_vien')),
  mang_phu_trach text,        -- 'to_chuc' | 'tuyen_giao' | 'phong_trao' | 'kiem_tra' | 'van_phong'
  phone text,
  avatar_url text,
  active boolean default true,
  alias text[] default '{}',   -- VD: {"Đ/c Thân", "Thân", "Lê Xuân Thân"} dùng để khớp tên văn bản
  busy_from date,              -- Cảnh báo bận (thi cử, công tác)
  busy_to date,
  busy_reason text,
  created_at timestamptz default now()
);

-- 2. BẢNG CAMPAIGNS (Mảng việc / Chiến dịch / Sự kiện lớn)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  status text not null default 'dang_chay' check (status in ('du_kien', 'dang_chay', 'hoan_thanh', 'huy')),
  color text default '#0056b3',
  created_by uuid references members(id) on delete set null,
  created_at timestamptz default now()
);

-- 3. BẢNG INCOMING_DOCUMENTS (Sổ theo dõi văn bản đến - 8 cột chuẩn)
create table if not exists incoming_documents (
  id uuid primary key default gen_random_uuid(),
  don_vi_gui text not null,     -- Cột 2: ĐƠN VỊ GỬI ĐẾN (Thành Đoàn, Đảng ủy, Phòng ban...)
  noi_dung text not null,       -- Cột 3: NỘI DUNG (Trích yếu)
  so_ky_hieu text,              -- Cột 4: SỐ, KÝ HIỆU VB
  ngay_nhan date not null,      -- Cột 5: NGÀY NHẬN
  ngay_chuyen_xu_ly date,       -- Cột 6: NGÀY CHUYỂN XỬ LÝ
  nguoi_nhan_xu_ly text,        -- Cột 7: NGƯỜI NHẬN XỬ LÝ (Tên hiển thị hoặc 'Xin ý kiến BTV')
  thoi_han_xu_ly timestamptz,   -- Cột 8: THỜI HẠN XỬ LÝ
  ghi_chu text,                 -- Cột 9: GHI CHÚ
  file_path text,               -- Đường dẫn file văn bản scan đính kèm (Storage)
  created_by uuid references members(id) on delete set null,
  created_at timestamptz default now()
);

-- 4. BẢNG TASKS (Công việc BTV)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  source_document_id uuid references incoming_documents(id) on delete set null,
  title text not null,
  description text,
  owner_id uuid not null references members(id),            -- Đúng 1 người chịu trách nhiệm chính
  created_by uuid not null references members(id),
  priority text not null default 'binh_thuong' check (priority in ('thap', 'binh_thuong', 'cao', 'khan')),
  status text not null default 'moi' check (status in ('moi', 'dang_lam', 'cho_duyet', 'hoan_thanh', 'tam_dung', 'huy')),
  approval_scope text not null default 'chuyen_mon' check (approval_scope in ('hanh_chinh', 'chuyen_mon')),
  due_at timestamptz,          -- Hạn chót (ngày + giờ, Asia/Ho_Chi_Minh)
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  approved_by uuid references members(id) on delete set null,
  recur_rule text,             -- 'WEEKLY:MON' | 'MONTHLY:25' | null
  recur_parent_id uuid references tasks(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. BẢNG TASK_COLLABORATORS (Người phối hợp - nhiều người)
create table if not exists task_collaborators (
  task_id uuid not null references tasks(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  primary key (task_id, member_id)
);

-- 6. BẢNG TASK_COMMENTS (Bình luận trong từng công việc)
create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- 7. BẢNG TASK_ATTACHMENTS (Tệp đính kèm công việc)
create table if not exists task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size integer,
  mime text,
  created_at timestamptz default now()
);

-- 8. BẢNG CHAT_MESSAGES (Chat nhóm chung BTV)
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  reply_to uuid references chat_messages(id) on delete set null,
  created_at timestamptz default now()
);

-- 9. BẢNG PUSH_SUBSCRIPTIONS (Thiết bị nhận Web Push VAPID)
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);

-- 10. BẢNG NOTIFICATION_LOG (Nhật ký thông báo & Chống spam trùng lặp)
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  kind text not null check (kind in ('giao_viec', 'truoc_1_ngay', 'truoc_2_gio', 'den_han', 'qua_han', 'leo_thang', 'don_doc')),
  channel text not null check (channel in ('push', 'email')),
  sent_at timestamptz default now()
);

-- Partial Unique Index: Chống gửi trùng cho các mốc TỰ ĐỘNG, cho phép đôn đốc thủ công nhiều lần
create unique index if not exists notification_log_tu_dong_unique
  on notification_log (task_id, member_id, kind, channel)
  where kind <> 'don_doc';

-- 11. BẢNG ACTIVITY_LOG (Nhật ký hoạt động & đôn đốc công khai)
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  action text not null,        -- 'created' | 'status_changed' | 'don_doc' | 'approved' | 'commented'
  detail jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- INDEXES TỐI ƯU HIỆU NĂNG
create index if not exists idx_tasks_owner on tasks(owner_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due_at on tasks(due_at);
create index if not exists idx_tasks_campaign on tasks(campaign_id);
create index if not exists idx_tasks_source_doc on tasks(source_document_id);
create index if not exists idx_activity_task on activity_log(task_id);
create index if not exists idx_comments_task on task_comments(task_id);
create index if not exists idx_incoming_docs_date on incoming_documents(ngay_nhan);

-- TRIGGER CẬP NHẬT UPDATED_AT
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_tasks_updated_at on tasks;
create trigger trigger_tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table members enable row level security;
alter table campaigns enable row level security;
alter table incoming_documents enable row level security;
alter table tasks enable row level security;
alter table task_collaborators enable row level security;
alter table task_comments enable row level security;
alter table task_attachments enable row level security;
alter table chat_messages enable row level security;
alter table push_subscriptions enable row level security;
alter table notification_log enable row level security;
alter table activity_log enable row level security;

-- Hàm trợ giúp kiểm tra thành viên active từ JWT Email
create or replace function current_member()
returns members as $$
  select * from members
  where email = auth.jwt() ->> 'email'
    and active = true
  limit 1;
$$ language sql stable security definer;

-- ==============================================================================
-- CHÍNH SÁCH BẢO MẬT ROW LEVEL SECURITY (RLS)
-- Cho phép hệ thống hoạt động thông suốt với anon key và tài khoản BTV
-- ==============================================================================

drop policy if exists "Allow all on members" on members;
create policy "Allow all on members" on members for all using (true) with check (true);

drop policy if exists "Allow all on campaigns" on campaigns;
create policy "Allow all on campaigns" on campaigns for all using (true) with check (true);

drop policy if exists "Allow all on incoming_documents" on incoming_documents;
create policy "Allow all on incoming_documents" on incoming_documents for all using (true) with check (true);

drop policy if exists "Allow all on tasks" on tasks;
create policy "Allow all on tasks" on tasks for all using (true) with check (true);

drop policy if exists "Allow all on task_collaborators" on task_collaborators;
create policy "Allow all on task_collaborators" on task_collaborators for all using (true) with check (true);

drop policy if exists "Allow all on task_comments" on task_comments;
create policy "Allow all on task_comments" on task_comments for all using (true) with check (true);

drop policy if exists "Allow all on task_attachments" on task_attachments;
create policy "Allow all on task_attachments" on task_attachments for all using (true) with check (true);

drop policy if exists "Allow all on chat_messages" on chat_messages;
create policy "Allow all on chat_messages" on chat_messages for all using (true) with check (true);

drop policy if exists "Allow all on push_subscriptions" on push_subscriptions;
create policy "Allow all on push_subscriptions" on push_subscriptions for all using (true) with check (true);

drop policy if exists "Allow all on notification_log" on notification_log;
create policy "Allow all on notification_log" on notification_log for all using (true) with check (true);

drop policy if exists "Allow all on activity_log" on activity_log;
create policy "Allow all on activity_log" on activity_log for all using (true) with check (true);

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO (SEED DATA)
-- 9 Thành viên BTV Đoàn trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)
-- ==============================================================================

insert into members (id, email, full_name, role, mang_phu_trach, phone, avatar_url, alias)
values
  ('11111111-1111-1111-1111-111111111111', 'thanlx@hcmute.edu.vn', 'Lê Xuân Thân', 'pho_bi_thu', 'tuyen_giao', '0901234567', '/avatars/thanlx.png', array['Đ/c Thân', 'Thân', 'Lê Xuân Thân']),
  ('22222222-2222-2222-2222-222222222222', 'maint@hcmute.edu.vn', 'Nguyễn Thị Mai', 'bi_thu', 'to_chuc', '0902345678', '/avatars/maint.png', array['Đ/c Mai', 'Mai', 'Nguyễn Thị Mai']),
  ('33333333-3333-3333-3333-333333333333', 'quantm@hcmute.edu.vn', 'Trần Minh Quân', 'chanh_van_phong', 'van_phong', '0903456789', '/avatars/quantm.png', array['Đ/c Quân', 'Quân', 'Trần Minh Quân']),
  ('44444444-4444-4444-4444-444444444444', 'anhph@hcmute.edu.vn', 'Phạm Hoàng Anh', 'uy_vien', 'tuyen_giao', '0904567890', '/avatars/anhph.png', array['Đ/c Hoàng Anh', 'Hoàng Anh']),
  ('55555555-5555-5555-5555-555555555555', 'honglt@hcmute.edu.vn', 'Lê Thị Hồng', 'uy_vien', 'phong_trao', '0905678901', '/avatars/honglt.png', array['Đ/c Hồng', 'Hồng']),
  ('66666666-6666-6666-6666-666666666666', 'namvd@hcmute.edu.vn', 'Võ Đức Nam', 'uy_vien', 'kiem_tra', '0906789012', '/avatars/namvd.png', array['Đ/c Đức Nam', 'Đức Nam']),
  ('77777777-7777-7777-7777-777777777777', 'namth@hcmute.edu.vn', 'Trần Hoài Nam', 'uy_vien', 'phong_trao', '0907890123', '/avatars/namth.png', array['Đ/c Hoài Nam', 'Hoài Nam']),
  ('88888888-8888-8888-8888-888888888888', 'tamnm@hcmute.edu.vn', 'Ngô Minh Tâm', 'uy_vien', 'to_chuc', '0908901234', '/avatars/tamnm.png', array['Đ/c Tâm', 'Tâm']),
  ('99999999-9999-9999-9999-999999999999', 'hadt@hcmute.edu.vn', 'Đỗ Thanh Hà', 'uy_vien', 'phong_trao', '0909012345', '/avatars/hadt.png', array['Đ/c Hà', 'Hà'])
on conflict (id) do nothing;

-- 4 Mảng việc / Dự án mẫu
insert into campaigns (id, name, description, start_date, end_date, status, color, created_by)
values
  ('c1111111-1111-1111-1111-111111111111', 'Chiến dịch Tình nguyện hè 2025', 'Chuỗi hoạt động Mùa hè xanh và Tiếp sức mùa thi HCMUTE 2025', '2025-06-01', '2025-08-15', 'dang_chay', '#0284c7', '22222222-2222-2222-2222-222222222222'),
  ('c2222222-2222-2222-2222-222222222222', 'Chào đón Tân sinh viên khóa 2025', 'Chương trình Ngày hội chào đón khóa mới và hỗ trợ nhập học', '2025-09-01', '2025-10-15', 'dang_chay', '#10b981', '11111111-1111-1111-1111-111111111111'),
  ('c3333333-3333-3333-3333-333333333333', 'Tháng Thanh niên 2025', 'Chuỗi hoạt động kỷ niệm Ngày thành lập Đoàn TNCS Hồ Chí Minh 26/3', '2025-03-01', '2025-03-31', 'hoan_thanh', '#f59e0b', '33333333-3333-3333-3333-333333333333'),
  ('c4444444-4444-4444-4444-444444444444', 'Hội thao Sinh viên HCMUTE', 'Đại hội thể dục thể thao truyền thống sinh viên trường', '2025-10-20', '2025-11-20', 'du_kien', '#ef4444', '99999999-9999-9999-9999-999999999999')
on conflict (id) do nothing;

-- 4 Văn bản đến mẫu (Mô phỏng file Excel 8 cột)
insert into incoming_documents (id, don_vi_gui, noi_dung, so_ky_hieu, ngay_nhan, ngay_chuyen_xu_ly, nguoi_nhan_xu_ly, thoi_han_xu_ly, ghi_chu, created_by)
values
  ('d1111111-1111-1111-1111-111111111111', 'THANH ĐOÀN', 'Thông báo về việc triển khai bình chọn Giải thưởng Sao Tháng Giêng năm 2025', '262-TB/TDTN', '2025-09-10', '2025-09-11', 'Đ/c Mai, Đ/c Thân', '2025-09-25 17:00:00+07', 'Triển khai cho tất cả các Đoàn khoa rà soát', '33333333-3333-3333-3333-333333333333'),
  ('d2222222-2222-2222-2222-222222222222', 'ĐẢNG ỦY TRƯỜNG', 'Công văn phối hợp tổ chức Đại hội Đoàn các cấp tiến tới Đại hội Đoàn trường', '743-CV/ĐU', '2025-09-12', '2025-09-12', 'Đ/c Quân', '2025-09-22 17:00:00+07', 'Lên dự thảo kế hoạch làm việc với các cơ sở Đoàn', '33333333-3333-3333-3333-333333333333'),
  ('d3333333-3333-3333-3333-333333333333', 'HỘI CHỮ THẬP ĐỎ TP', 'Kế hoạch phát động hiến máu tình nguyện đợt 3 năm 2025', '115-KH/CTĐ', '2025-09-15', '2025-09-16', 'Đ/c Hồng', '2025-09-30 11:30:00+07', 'Chỉ tiêu vận động ít nhất 500 đơn vị máu', '33333333-3333-3333-3333-333333333333'),
  ('d4444444-4444-4444-4444-444444444444', 'BAN DÂN VẬN THÀNH ỦY', 'Xin ý kiến BTV về việc phối hợp xây dựng Không gian văn hóa Hồ Chí Minh', '89-TB/BDV', '2025-09-18', null, 'Xin ý kiến BTV', null, 'Cần đưa ra phiên họp BTV tuần này để thảo luận', '33333333-3333-3333-3333-333333333333')
on conflict (id) do nothing;

-- Công việc mẫu (Khớp giao diện hình ảnh tham khảo)
insert into tasks (id, campaign_id, source_document_id, title, description, owner_id, created_by, priority, status, approval_scope, due_at)
values
  ('a1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', null, 'Chuẩn bị chương trình Tân sinh viên', 'Lên kịch bản chi tiết lễ chào đón tân sinh viên và bố trí gian hàng Đoàn - Hội', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'cao', 'dang_lam', 'chuyen_mon', '2025-09-25 17:00:00+07'),
  ('a2222222-2222-2222-2222-222222222222', null, 'd2222222-2222-2222-2222-222222222222', 'Làm việc với Đoàn cơ sở Khoa', 'Làm việc với 12 cơ sở Đoàn trực thuộc về công tác chuẩn bị nhân sự đại hội', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'khan', 'dang_lam', 'hanh_chinh', '2025-09-22 17:00:00+07'),
  ('a3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', null, 'Thiết kế truyền thông Tháng Thanh niên', 'Hoàn thiện bộ nhận diện, backdrop, avatar frame và ấn phẩm số tuyên truyền', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'binh_thuong', 'dang_lam', 'chuyen_mon', '2025-09-28 17:00:00+07'),
  ('a4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'Tổ chức hiến máu tình nguyện', 'Phối hợp cùng Bệnh viện Truyền máu Huyết học chuẩn bị địa điểm và tiếp nhận sinh viên', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'cao', 'cho_duyet', 'chuyen_mon', '2025-09-30 11:30:00+07'),
  ('a5555555-5555-5555-5555-555555555555', null, null, 'Tổng hợp báo cáo tháng', 'Tổng hợp kết quả công tác Đoàn và phong trào thanh niên tháng 9 nộp Thành Đoàn', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'binh_thuong', 'cho_duyet', 'hanh_chinh', '2025-09-30 17:00:00+07'),
  ('a6666666-6666-6666-6666-666666666666', null, null, 'Họp BTV Đoàn trường', 'Phiên họp định kỳ rà soát các công tác chuẩn bị năm học mới và đánh giá chiến dịch hè', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'cao', 'dang_lam', 'chuyen_mon', '2025-09-22 09:00:00+07')
on conflict (id) do nothing;
