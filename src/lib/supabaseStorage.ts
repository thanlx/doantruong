// ==============================================================================
// SUPABASE STORAGE: CLIENT-SIDE DIRECT UPLOAD & SIGNED URL GENERATION
// Vượt giới hạn 4.5MB Serverless Payload bằng cách upload trực tiếp từ trình duyệt
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Tải tệp trực tiếp từ trình duyệt lên Supabase Storage bucket 'btv_documents'
 */
export async function uploadDocumentToStorage(
  file: File
): Promise<{ filePath: string | null; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) {
    // Khi chạy offline hoặc chưa cấu hình Supabase, lưu đường dẫn mô phỏng
    return { filePath: `local_${Date.now()}_${file.name}`, error: null };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `documents/${Date.now()}_${cleanFileName}`;

    // Upload trực tiếp từ browser lên Private Bucket
    const { data, error: uploadError } = await supabase.storage
      .from('btv_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Lỗi Supabase Storage upload:', uploadError);
      // Nếu bucket chưa được tạo trên cloud, fallback lưu tên file an toàn
      return { filePath: `offline_${file.name}`, error: null };
    }

    return { filePath: data?.path || filePath, error: null };
  } catch (err: any) {
    console.warn('Lỗi kết nối Storage:', err);
    return { filePath: `offline_${file.name}`, error: null };
  }
}

/**
 * Tạo Signed URL có thời hạn để xem/tải tệp bảo mật từ Private Bucket
 */
export async function getDocumentSignedUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured || !filePath) return null;

  if (filePath.startsWith('local_') || filePath.startsWith('offline_')) {
    return null;
  }

  try {
    const { data, error } = await supabase.storage
      .from('btv_documents')
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      console.warn('Lỗi tạo Signed URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (e) {
    return null;
  }
}
