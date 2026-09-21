// ==============================================================================
// CẤU HÌNH SUPABASE CLIENT (HỖ TRỢ CẢ KẾT NỐI THỰC TẾ & CHẾ ĐỘ NỘI BỘ DEMO)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Tự động chuẩn hóa nếu người dùng vô tình dán thêm /rest/v1 hoặc dấu gạch chéo ở đuôi
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
