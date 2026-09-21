// ==============================================================================
// DỊCH VỤ GIAO TIẾP CƠ SỞ DỮ LIỆU & REALTIME SUPABASE
// Quản lý lưu trữ vĩnh viễn (Tasks, Messages, Documents, Comments) & WebSocket
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Task,
  ChatMessage,
  IncomingDocument,
  TaskComment,
  ActivityLog,
  Member,
  Campaign,
} from '@/types';
import {
  INITIAL_TASKS,
  INITIAL_MEMBERS,
  INITIAL_DOCUMENTS,
  INITIAL_CAMPAIGNS,
  INITIAL_CHAT_MESSAGES,
} from './mockData';

// ------------------------------------------------------------------------------
// 1. TẢI DỮ LIỆU TỪ SUPABASE
// ------------------------------------------------------------------------------

export async function fetchTasksFromSupabase(): Promise<Task[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Lỗi khi tải tasks từ Supabase:', error.message);
      return null;
    }
    return (data as Task[]) || [];
  } catch (err) {
    console.warn('Lỗi kết nối Supabase tasks:', err);
    return null;
  }
}

export async function fetchChatMessagesFromSupabase(): Promise<ChatMessage[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Lỗi khi tải chat_messages từ Supabase:', error.message);
      return null;
    }
    return (data as ChatMessage[]) || [];
  } catch (err) {
    console.warn('Lỗi kết nối Supabase chat_messages:', err);
    return null;
  }
}

export async function fetchIncomingDocsFromSupabase(): Promise<IncomingDocument[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('incoming_documents')
      .select('*')
      .order('ngay_nhan', { ascending: false });

    if (error) {
      console.warn('Lỗi khi tải incoming_documents từ Supabase:', error.message);
      return null;
    }
    return (data as IncomingDocument[]) || [];
  } catch (err) {
    console.warn('Lỗi kết nối Supabase incoming_documents:', err);
    return null;
  }
}

export async function fetchCommentsFromSupabase(): Promise<TaskComment[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Lỗi khi tải task_comments từ Supabase:', error.message);
      return null;
    }
    return (data as TaskComment[]) || [];
  } catch (err) {
    console.warn('Lỗi kết nối Supabase task_comments:', err);
    return null;
  }
}

export async function fetchActivityLogsFromSupabase(): Promise<ActivityLog[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Lỗi khi tải activity_log từ Supabase:', error.message);
      return null;
    }
    return (data as ActivityLog[]) || [];
  } catch (err) {
    console.warn('Lỗi kết nối Supabase activity_log:', err);
    return null;
  }
}

export async function fetchMembersFromSupabase(): Promise<Member[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }
    return data as Member[];
  } catch (err) {
    return null;
  }
}

export async function fetchCampaignsFromSupabase(): Promise<Campaign[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }
    return data as Campaign[];
  } catch (err) {
    return null;
  }
}

// ------------------------------------------------------------------------------
// 2. THAO TÁC GHI DỮ LIỆU LÊN SUPABASE (LƯU TRỮ VĨNH VIỄN)
// ------------------------------------------------------------------------------

export async function insertTaskToSupabase(task: Task): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('tasks').insert({
      id: task.id,
      campaign_id: task.campaign_id || null,
      source_document_id: task.source_document_id || null,
      title: task.title,
      description: task.description || '',
      owner_id: task.owner_id,
      created_by: task.created_by,
      priority: task.priority,
      status: task.status,
      approval_scope: task.approval_scope,
      due_at: task.due_at || null,
      started_at: task.started_at || null,
      submitted_at: task.submitted_at || null,
      completed_at: task.completed_at || null,
      approved_by: task.approved_by || null,
      recur_rule: task.recur_rule || null,
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Lỗi ghi task lên Supabase:', error.message);
      return false;
    }

    // Nếu có người phối hợp, ghi vào bảng task_collaborators
    if (task.collaborator_ids && task.collaborator_ids.length > 0) {
      const collabs = task.collaborator_ids.map((memberId) => ({
        task_id: task.id,
        member_id: memberId,
      }));
      await supabase.from('task_collaborators').upsert(collabs, { onConflict: 'task_id,member_id' });
    }

    return true;
  } catch (err) {
    console.warn('Lỗi insertTaskToSupabase:', err);
    return false;
  }
}

export async function updateTaskOnSupabase(taskId: string, updates: Partial<Task>): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    // Loại bỏ các trường render phụ không có trong schema tasks
    delete payload.owner;
    delete payload.collaborators;
    delete payload.campaign;
    delete payload.source_document;
    delete payload.comments_count;
    delete payload.collaborator_ids;

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId);

    if (error) {
      console.warn('Lỗi cập nhật task trên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi updateTaskOnSupabase:', err);
    return false;
  }
}

export async function deleteTaskFromSupabase(taskId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) {
      console.warn('Lỗi xóa task trên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi deleteTaskFromSupabase:', err);
    return false;
  }
}

export async function insertChatMessageToSupabase(msg: ChatMessage): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('chat_messages').insert({
      id: msg.id,
      member_id: msg.member_id,
      body: msg.body,
      reply_to: msg.reply_to || null,
      created_at: msg.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Lỗi gửi tin nhắn lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi insertChatMessageToSupabase:', err);
    return false;
  }
}

export async function insertIncomingDocToSupabase(doc: IncomingDocument): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('incoming_documents').insert({
      id: doc.id,
      don_vi_gui: doc.don_vi_gui,
      noi_dung: doc.noi_dung,
      so_ky_hieu: doc.so_ky_hieu || null,
      ngay_nhan: doc.ngay_nhan,
      ngay_chuyen_xu_ly: doc.ngay_chuyen_xu_ly || null,
      nguoi_nhan_xu_ly: doc.nguoi_nhan_xu_ly || 'Xin ý kiến BTV',
      thoi_han_xu_ly: doc.thoi_han_xu_ly || null,
      ghi_chu: doc.ghi_chu || null,
      created_by: doc.created_by || null,
      created_at: doc.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Lỗi ghi incoming doc lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi insertIncomingDocToSupabase:', err);
    return false;
  }
}

export async function updateIncomingDocOnSupabase(
  docId: string,
  updates: Partial<IncomingDocument>
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('incoming_documents')
      .update(updates)
      .eq('id', docId);

    if (error) {
      console.warn('Lỗi cập nhật incoming doc trên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi updateIncomingDocOnSupabase:', err);
    return false;
  }
}

export async function insertCommentToSupabase(comment: TaskComment): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('task_comments').insert({
      id: comment.id,
      task_id: comment.task_id,
      member_id: comment.member_id,
      body: comment.body,
      created_at: comment.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Lỗi ghi comment lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi insertCommentToSupabase:', err);
    return false;
  }
}

export async function insertActivityLogToSupabase(log: ActivityLog): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('activity_log').insert({
      id: log.id,
      task_id: log.task_id,
      member_id: log.member_id,
      action: log.action,
      detail: log.detail || {},
      created_at: log.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Lỗi ghi activity log lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi insertActivityLogToSupabase:', err);
    return false;
  }
}

// ------------------------------------------------------------------------------
// 3. SEED DATABASE LẦN ĐẦU (NẾU CƠ SỞ DỮ LIỆU TRÊN SUPABASE ĐANG TRỐNG)
// ------------------------------------------------------------------------------

export async function seedSupabaseIfEmpty(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
    if (count !== null && count > 0) {
      return false; // Đã có dữ liệu, không cần seed
    }

    console.log('Cơ sở dữ liệu Supabase đang trống, tiến hành khởi tạo dữ liệu chuẩn...');

    // 1. Members
    const membersPayload = INITIAL_MEMBERS.map((m) => ({
      id: m.id,
      email: m.email,
      full_name: m.full_name,
      role: m.role,
      mang_phu_trach: m.mang_phu_trach,
      phone: m.phone,
      avatar_url: m.avatar_url,
      active: m.active,
      alias: m.alias || [],
    }));
    await supabase.from('members').upsert(membersPayload, { onConflict: 'id' });

    // 2. Campaigns
    const campaignsPayload = INITIAL_CAMPAIGNS.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      color: c.color,
      created_by: c.created_by,
    }));
    await supabase.from('campaigns').upsert(campaignsPayload, { onConflict: 'id' });

    // 3. Documents
    const docsPayload = INITIAL_DOCUMENTS.map((d) => ({
      id: d.id,
      don_vi_gui: d.don_vi_gui,
      noi_dung: d.noi_dung,
      so_ky_hieu: d.so_ky_hieu,
      ngay_nhan: d.ngay_nhan,
      ngay_chuyen_xu_ly: d.ngay_chuyen_xu_ly || null,
      nguoi_nhan_xu_ly: d.nguoi_nhan_xu_ly,
      thoi_han_xu_ly: d.thoi_han_xu_ly || null,
      ghi_chu: d.ghi_chu,
      created_by: d.created_by,
    }));
    await supabase.from('incoming_documents').upsert(docsPayload, { onConflict: 'id' });

    // 4. Tasks
    const tasksPayload = INITIAL_TASKS.map((t) => ({
      id: t.id,
      campaign_id: t.campaign_id,
      source_document_id: t.source_document_id,
      title: t.title,
      description: t.description,
      owner_id: t.owner_id,
      created_by: t.created_by,
      priority: t.priority,
      status: t.status,
      approval_scope: t.approval_scope,
      due_at: t.due_at,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));
    await supabase.from('tasks').upsert(tasksPayload, { onConflict: 'id' });

    // 5. Chat messages
    const chatPayload = INITIAL_CHAT_MESSAGES.map((m) => ({
      id: m.id,
      member_id: m.member_id,
      body: m.body,
      reply_to: m.reply_to || null,
      created_at: m.created_at,
    }));
    await supabase.from('chat_messages').upsert(chatPayload, { onConflict: 'id' });

    return true;
  } catch (err) {
    console.warn('Lỗi seedSupabaseIfEmpty:', err);
    return false;
  }
}

// ------------------------------------------------------------------------------
// 4. ĐĂNG KÝ LẮNG NGHE REALTIME WEBSOCKET (ĐỒNG BỘ TỨC THỜI MỌI THIẾT BỊ)
// ------------------------------------------------------------------------------

export interface RealtimeHandlers {
  onTaskInsert?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onChatInsert?: (msg: ChatMessage) => void;
  onCommentInsert?: (comment: TaskComment) => void;
  onDocInsert?: (doc: IncomingDocument) => void;
  onDocUpdate?: (doc: IncomingDocument) => void;
  onLogInsert?: (log: ActivityLog) => void;
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void;
}

export function subscribeToBTVRealtime(handlers: RealtimeHandlers) {
  if (!supabase || !isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel('btv-realtime-channel')
    // Lắng nghe thay đổi bảng TASKS
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tasks' },
      (payload) => {
        handlers.onTaskInsert?.(payload.new as Task);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tasks' },
      (payload) => {
        handlers.onTaskUpdate?.(payload.new as Task);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'tasks' },
      (payload) => {
        if (payload.old && payload.old.id) {
          handlers.onTaskDelete?.(payload.old.id);
        }
      }
    )
    // Lắng nghe thay đổi bảng CHAT_MESSAGES
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (payload) => {
        handlers.onChatInsert?.(payload.new as ChatMessage);
      }
    )
    // Lắng nghe thay đổi bảng TASK_COMMENTS
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'task_comments' },
      (payload) => {
        handlers.onCommentInsert?.(payload.new as TaskComment);
      }
    )
    // Lắng nghe thay đổi bảng INCOMING_DOCUMENTS
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'incoming_documents' },
      (payload) => {
        handlers.onDocInsert?.(payload.new as IncomingDocument);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'incoming_documents' },
      (payload) => {
        handlers.onDocUpdate?.(payload.new as IncomingDocument);
      }
    )
    // Lắng nghe thay đổi bảng ACTIVITY_LOG
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_log' },
      (payload) => {
        handlers.onLogInsert?.(payload.new as ActivityLog);
      }
    )
    .subscribe((status) => {
      handlers.onStatusChange?.(status);
    });

  // Trả về hàm hủy đăng ký khi unmount
  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}

// ------------------------------------------------------------------------------
// 5. XÁC THỰC GOOGLE OAUTH QUA SUPABASE AUTH
// ------------------------------------------------------------------------------

export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      error: 'Supabase chưa được cấu hình biến môi trường trên Vercel / .env.local',
    };
  }

  try {
    // Xác định URL điều hướng về: nếu trên trình duyệt thì lấy chính xác window.location.origin
    let redirectUrl = 'https://yhcm-ute2.vercel.app';
    if (typeof window !== 'undefined') {
      redirectUrl = window.location.origin;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Lỗi không xác định khi gọi Google OAuth' };
  }
}

export async function signOutSupabase(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Lỗi signOut:', e);
  }
}
