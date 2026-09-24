-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ CÔNG VIỆC BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
-- Migration 20260922000002: Whitelist BTV, Đánh giá xếp loại A/B/C/D, 
-- Lưu trữ Storage btv_documents & Tích hợp Telegram/Zalo
-- ==============================================================================

-- 1. BẢNG BTV_WHITELIST (Danh sách 9 tài khoản email BTV được phép đăng nhập)
create table if not exists btv_whitelist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('bi_thu', 'pho_bi_thu', 'chanh_van_phong', 'uy_vien')),
  mang_phu_trach text,
  created_at timestamptz default now()
);

alter table btv_whitelist enable row level security;

drop policy if exists "Allow public read on btv_whitelist" on btv_whitelist;
create policy "Allow public read on btv_whitelist"
  on btv_whitelist for select
  to public
  using (true);

-- Khởi tạo danh sách 9 đồng chí Ban Thường vụ Đoàn trường HCMUTE
insert into btv_whitelist (email, full_name, role, mang_phu_trach)
values
  ('thanlx@hcmute.edu.vn', 'Lê Xuân Thân', 'pho_bi_thu', 'tuyen_giao'),
  ('maint@hcmute.edu.vn', 'Nguyễn Thị Mai', 'bi_thu', 'to_chuc'),
  ('quantm@hcmute.edu.vn', 'Trần Minh Quân', 'chanh_van_phong', 'van_phong'),
  ('anhph@hcmute.edu.vn', 'Phạm Hoàng Anh', 'uy_vien', 'tuyen_giao'),
  ('honglt@hcmute.edu.vn', 'Lê Thị Hồng', 'uy_vien', 'phong_trao'),
  ('namvd@hcmute.edu.vn', 'Võ Đức Nam', 'uy_vien', 'kiem_tra'),
  ('namth@hcmute.edu.vn', 'Trần Hoài Nam', 'uy_vien', 'phong_trao'),
  ('tamnm@hcmute.edu.vn', 'Ngô Minh Tâm', 'uy_vien', 'to_chuc'),
  ('hadt@hcmute.edu.vn', 'Đỗ Thanh Hà', 'uy_vien', 'phong_trao')
on conflict (email) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  mang_phu_trach = excluded.mang_phu_trach;

-- 2. BỔ SUNG CỘT CHO BẢNG MEMBERS (Chat ID Telegram & Zalo)
alter table members add column if not exists telegram_chat_id text;
alter table members add column if not exists zalo_user_id text;

-- 3. BỔ SUNG CÁC TRƯỜNG NỘP BÁO CÁO VÀ ĐÁNH GIÁ XẾP LOẠI TRÊN BẢNG TASKS
alter table tasks add column if not exists submission_note text;
alter table tasks add column if not exists submission_links text[] default '{}';
alter table tasks add column if not exists submission_files text[] default '{}';
alter table tasks add column if not exists review_feedback text;
alter table tasks add column if not exists rating_grade text check (rating_grade in ('A', 'B', 'C', 'D'));
alter table tasks add column if not exists rating_score numeric(3,1) check (rating_score >= 1.0 and rating_score <= 10.0);
alter table tasks add column if not exists rated_by uuid references members(id) on delete set null;
alter table tasks add column if not exists rated_at timestamptz;

-- Thêm index tối ưu hóa truy vấn đánh giá KPI & báo cáo
create index if not exists idx_tasks_rating on tasks(rating_grade, rating_score);
create index if not exists idx_tasks_submitted_at on tasks(submitted_at);
create index if not exists idx_members_telegram on members(telegram_chat_id);
create index if not exists idx_members_zalo on members(zalo_user_id);

-- 4. TẠO BUCKET BTV_DOCUMENTS CHO SUPABASE STORAGE (Lưu văn bản, tài liệu, file scan)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'btv_documents',
  'btv_documents',
  false,
  20971520, -- Giới hạn 20MB / file
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 20971520;

-- 5. PHÂN QUYỀN RLS CHO STORAGE BUCKET BTV_DOCUMENTS
drop policy if exists "BTV upload access on btv_documents" on storage.objects;
create policy "BTV upload access on btv_documents"
  on storage.objects for insert
  to public
  with check (bucket_id = 'btv_documents');

drop policy if exists "BTV select access on btv_documents" on storage.objects;
create policy "BTV select access on btv_documents"
  on storage.objects for select
  to public
  using (bucket_id = 'btv_documents');

drop policy if exists "BTV update access on btv_documents" on storage.objects;
create policy "BTV update access on btv_documents"
  on storage.objects for update
  to public
  using (bucket_id = 'btv_documents');

drop policy if exists "BTV delete access on btv_documents" on storage.objects;
create policy "BTV delete access on btv_documents"
  on storage.objects for delete
  to public
  using (bucket_id = 'btv_documents');
