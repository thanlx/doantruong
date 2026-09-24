// ==============================================================================
// PDF STORAGE UTILITY: CLIENT-SIDE DIRECT UPLOAD, INDEXEDDB CACHE & OBJECT URL
// Hỗ trợ lưu trữ Supabase bucket 'official-documents' và Offline IndexedDB Demo
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const DB_NAME = 'BTV_PDF_STORE';
const STORE_NAME = 'pdf_files';

export interface PdfUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

// Kiểm tra tính hợp lệ của file PDF (định dạng .pdf và dung lượng <= 15MB)
export function validatePdfFile(file: File): { isValid: boolean; error?: string } {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return {
      isValid: false,
      error: 'Tệp không đúng định dạng. Vui lòng chỉ tải lên tệp văn bản scan định dạng PDF (.pdf).',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Dung lượng tệp (${sizeInMb}MB) vượt quá giới hạn tối đa 15MB. Vui lòng nén hoặc chọn tệp nhỏ hơn.`,
    };
  }

  return { isValid: true };
}

// Khởi tạo và kết nối IndexedDB lưu trữ PDF khi ở chế độ Demo/Offline
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB không được hỗ trợ trong môi trường này.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Lưu PDF vào IndexedDB
export async function savePdfToIndexedDb(id: string, file: File): Promise<string> {
  try {
    const db = await openIndexedDB();
    const arrayBuffer = await file.arrayBuffer();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        id,
        fileName: file.name,
        fileSize: file.size,
        type: file.type || 'application/pdf',
        data: arrayBuffer,
        savedAt: new Date().toISOString(),
      };

      const putReq = store.put(record);
      putReq.onsuccess = () => {
        // Tạo blob url truy cập ngay lập tức
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.warn('Lỗi lưu IndexedDB, fallback tạo Object URL tạm thời:', err);
    return URL.createObjectURL(file);
  }
}

// Lấy PDF từ IndexedDB tạo Blob URL
export async function getPdfFromIndexedDb(id: string): Promise<string | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.data) {
          const blob = new Blob([result.data], { type: result.type || 'application/pdf' });
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

// Lưu trữ tệp PDF (ưu tiên Supabase Storage, fallback IndexedDB / Blob)
export async function uploadPdfDocument(file: File, docId?: string): Promise<PdfUploadResult> {
  const validation = validatePdfFile(file);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const generatedId = docId || `doc_${Date.now()}`;

  // 1. Thử upload lên Supabase Storage nếu đã cấu hình
  if (supabase && isSupabaseConfigured) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `official-documents/${Date.now()}_${cleanFileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('official-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError && data?.path) {
        const { data: publicData } = supabase.storage
          .from('official-documents')
          .getPublicUrl(data.path);

        return {
          success: true,
          fileUrl: publicData?.publicUrl || filePath,
          fileName: file.name,
          fileSize: file.size,
        };
      }
    } catch (err) {
      console.warn('Supabase upload thất bại, lưu trữ cục bộ:', err);
    }
  }

  // 2. Chế độ Demo / Offline: Lưu vào IndexedDB
  try {
    const blobUrl = await savePdfToIndexedDb(generatedId, file);
    return {
      success: true,
      fileUrl: blobUrl,
      fileName: file.name,
      fileSize: file.size,
    };
  } catch (err: any) {
    // Fallback URL.createObjectURL
    const fallbackUrl = URL.createObjectURL(file);
    return {
      success: true,
      fileUrl: fallbackUrl,
      fileName: file.name,
      fileSize: file.size,
    };
  }
}

// Định dạng kích thước tệp hiển thị thân thiện (KB, MB)
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
