// ==============================================================================
// CẤU HÌNH SUPABASE CLIENT (KẾT NỐI TRỰC TIẾP DỰ ÁN BTV ĐOÀN TRƯỜNG HCMUTE)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bejwlwyminqdhvriukfm.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlandsd3ltaW5xZGh2cml1a2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5OTQ3OTYsImV4cCI6MjEwNTU3MDc5Nn0.nMaDNwL-HsYuHtXQTWWIbDAAJkGNAcTsRrSAeLPqGbc';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
// Tự động chuẩn hóa nếu người dùng vô tình dán thêm /rest/v1 hoặc dấu gạch chéo ở đuôi
const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
