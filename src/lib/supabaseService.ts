// ==============================================================================
// DỊCH VỤ GIAO TIẾP CƠ SỞ DỮ LIỆU & REALTIME SUPABASE (PHIÊN BẢN CHUẨN HÓA BẢO ĐẢM LƯU TRỮ VĨNH VIỄN)
// Tự động tương thích 100% Postgres Schema, Metadata Encoding & Realtime WebSocket
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
  RolePermissionsMap,
  PermissionKey,
} from '@/types';
import {
  INITIAL_MEMBERS,
  DEFAULT_ROLE_PERMISSIONS,
} from './mockData';

// ------------------------------------------------------------------------------
// WHITELIST CỘT HỢP LỆ THEO SCHEMA POSTGRES TRÊN SUPABASE (TRÁNH LỖI PGRST204)
// ------------------------------------------------------------------------------
const VALID_MEMBER_COLS = new Set([
  'id', 'email', 'full_name', 'role', 'mang_phu_trach', 'phone',
  'avatar_url', 'active', 'alias', 'busy_from', 'busy_to', 'busy_reason', 'created_at'
]);

const VALID_TASK_COLS = new Set([
  'id', 'campaign_id', 'source_document_id', 'title', 'description',
  'owner_id', 'created_by', 'priority', 'status', 'approval_scope',
  'due_at', 'started_at', 'submitted_at', 'completed_at', 'approved_by',
  'recur_rule', 'recur_parent_id', 'created_at', 'updated_at'
]);

const VALID_DOC_COLS = new Set([
  'id', 'don_vi_gui', 'noi_dung', 'so_ky_hieu', 'ngay_nhan',
  'ngay_chuyen_xu_ly', 'nguoi_nhan_xu_ly', 'thoi_han_xu_ly',
  'ghi_chu', 'file_path', 'created_by', 'created_at'
]);

const VALID_CAMPAIGN_COLS = new Set([
  'id', 'name', 'description', 'start_date', 'end_date', 'status', 'color', 'created_by', 'created_at'
]);

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
    if (!data) return [];

    // Giải mã Metadata đính kèm từ description
    return data.map((raw: any) => {
      let desc = raw.description || '';
      let meta: any = {};
      const metaMatch = desc.match(/\n<!--META:([\s\S]*)-->$/);
      if (metaMatch) {
        try {
          meta = JSON.parse(metaMatch[1]);
          desc = desc.replace(/\n<!--META:([\s\S]*)-->$/, '');
        } catch (e) {}
      }

      return {
        ...raw,
        description: desc,
        submission_note: meta.submission_note ?? raw.submission_note,
        submission_links: meta.submission_links ?? raw.submission_links,
        submission_files: meta.submission_files ?? raw.submission_files,
        review_feedback: meta.review_feedback ?? raw.review_feedback,
        rating_grade: meta.rating_grade ?? raw.rating_grade,
        rating_score: meta.rating_score ?? raw.rating_score,
        rated_by: meta.rated_by ?? raw.rated_by,
        rated_at: meta.rated_at ?? raw.rated_at,
        access_level: meta.access_level ?? raw.access_level ?? 'cong_khai',
        inherited_doc_file_url: meta.inherited_doc_file_url ?? raw.inherited_doc_file_url,
        inherited_doc_file_name: meta.inherited_doc_file_name ?? raw.inherited_doc_file_name,
        delegated_from_id: meta.delegated_from_id ?? raw.delegated_from_id,
        collaborator_ids: meta.collaborator_ids ?? raw.collaborator_ids ?? [],
      } as Task;
    });
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
    if (!data) return [];

    // Giải mã Metadata đính kèm từ ghi_chu và map file_path <-> file_url
    return data.map((raw: any) => {
      let ghiChu = raw.ghi_chu || '';
      let meta: any = {};
      const metaMatch = ghiChu.match(/\n<!--DOCMETA:([\s\S]*)-->$/);
      if (metaMatch) {
        try {
          meta = JSON.parse(metaMatch[1]);
          ghiChu = ghiChu.replace(/\n<!--DOCMETA:([\s\S]*)-->$/, '');
        } catch (e) {}
      }

      return {
        ...raw,
        ghi_chu: ghiChu,
        file_url: raw.file_path || meta.file_url || raw.file_url,
        file_name: meta.file_name ?? raw.file_name,
        file_size: meta.file_size ?? raw.file_size,
        access_level: meta.access_level ?? raw.access_level ?? 'cong_khai',
      } as IncomingDocument;
    });
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
      .limit(100);

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

    // Giải mã custom_permissions từ alias
    return data.map((raw: any) => {
      let custom_permissions: PermissionKey[] | undefined;
      const cleanAlias: string[] = [];

      if (Array.isArray(raw.alias)) {
        for (const item of raw.alias) {
          if (typeof item === 'string') {
            if (item.startsWith('__perms:')) {
              try {
                custom_permissions = JSON.parse(item.slice(8));
              } catch (e) {}
            } else if (item.startsWith('__role_perms:')) {
              // Bỏ qua thẻ role perms
            } else {
              cleanAlias.push(item);
            }
          }
        }
      }

      return {
        ...raw,
        alias: cleanAlias,
        custom_permissions: custom_permissions && custom_permissions.length > 0 ? custom_permissions : undefined,
      } as Member;
    });
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

export async function fetchRolePermissionsFromSupabase(): Promise<RolePermissionsMap | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('members')
      .select('alias')
      .eq('role', 'bi_thu')
      .limit(1);

    if (error || !data || data.length === 0) return null;
    const aliases = data[0].alias;
    if (Array.isArray(aliases)) {
      for (const item of aliases) {
        if (typeof item === 'string' && item.startsWith('__role_perms:')) {
          try {
            return JSON.parse(item.slice(13));
          } catch (e) {}
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function syncRolePermissionsToSupabase(
  rolePermissions: RolePermissionsMap,
  biThuMemberId?: string
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const query = biThuMemberId
      ? supabase.from('members').select('id, alias').eq('id', biThuMemberId).limit(1)
      : supabase.from('members').select('id, alias').eq('role', 'bi_thu').limit(1);
    const { data, error } = await query;
    if (error || !data || data.length === 0) return false;
    const current = data[0];
    const existingAlias = Array.isArray(current.alias) ? current.alias : [];
    const filtered = existingAlias.filter((a: any) => typeof a !== 'string' || !a.startsWith('__role_perms:'));
    filtered.push('__role_perms:' + JSON.stringify(rolePermissions));
    await supabase.from('members').update({ alias: filtered }).eq('id', current.id);
    return true;
  } catch (err) {
    return false;
  }
}

// ------------------------------------------------------------------------------
// 2. THAO TÁC GHI DỮ LIỆU LÊN SUPABASE (LƯU TRỮ VĨNH VIỄN)
// ------------------------------------------------------------------------------

export async function insertMemberToSupabase(member: Member): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    let aliases = Array.isArray(member.alias) ? [...member.alias] : [];
    if (member.custom_permissions && member.custom_permissions.length > 0) {
      aliases = aliases.filter((a) => !a.startsWith('__perms:'));
      aliases.push('__perms:' + JSON.stringify(member.custom_permissions));
    }

    const payload: any = {};
    for (const key of Object.keys(member)) {
      if (VALID_MEMBER_COLS.has(key)) {
        payload[key] = (member as any)[key];
      }
    }
    payload.alias = aliases;

    const { error } = await supabase.from('members').insert(payload);
    if (error) {
      console.warn('Lỗi insertMemberToSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi insertMemberToSupabase:', err);
    return false;
  }
}

export async function updateMemberOnSupabase(memberId: string, updates: Partial<Member>): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const payload: any = {};
    for (const key of Object.keys(updates)) {
      if (VALID_MEMBER_COLS.has(key)) {
        payload[key] = (updates as any)[key];
      }
    }

    // Nếu có custom_permissions, mã hóa vào alias
    if (updates.custom_permissions !== undefined) {
      let currentAlias = updates.alias;
      if (!currentAlias) {
        const { data } = await supabase.from('members').select('alias').eq('id', memberId).single();
        currentAlias = data?.alias || [];
      }
      const filtered = Array.isArray(currentAlias) ? currentAlias.filter((a: any) => typeof a !== 'string' || !a.startsWith('__perms:')) : [];
      if (updates.custom_permissions && updates.custom_permissions.length > 0) {
        filtered.push('__perms:' + JSON.stringify(updates.custom_permissions));
      }
      payload.alias = filtered;
    }

    const { error } = await supabase.from('members').update(payload).eq('id', memberId);
    if (error) {
      console.warn('Lỗi updateMemberOnSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi updateMemberOnSupabase:', err);
    return false;
  }
}

export async function deleteMemberFromSupabase(memberId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('members').delete().eq('id', memberId);
    if (error) {
      console.warn('Lỗi deleteMemberFromSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi deleteMemberFromSupabase:', err);
    return false;
  }
}

export async function insertCampaignToSupabase(campaign: Campaign): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const payload: any = {};
    for (const key of Object.keys(campaign)) {
      if (VALID_CAMPAIGN_COLS.has(key)) {
        payload[key] = (campaign as any)[key];
      }
    }
    const { error } = await supabase.from('campaigns').insert(payload);
    if (error) {
      console.warn('Lỗi insertCampaignToSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi insertCampaignToSupabase:', err);
    return false;
  }
}

export async function updateCampaignOnSupabase(campId: string, updates: Partial<Campaign>): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const payload: any = {};
    for (const key of Object.keys(updates)) {
      if (VALID_CAMPAIGN_COLS.has(key)) {
        payload[key] = (updates as any)[key];
      }
    }
    const { error } = await supabase.from('campaigns').update(payload).eq('id', campId);
    if (error) {
      console.warn('Lỗi updateCampaignOnSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi updateCampaignOnSupabase:', err);
    return false;
  }
}

export async function deleteCampaignFromSupabase(campId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('campaigns').delete().eq('id', campId);
    if (error) {
      console.warn('Lỗi deleteCampaignFromSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi deleteCampaignFromSupabase:', err);
    return false;
  }
}

export async function insertTaskToSupabase(task: Task): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    // Thu gom metadata phong phú
    const meta: any = {};
    if (task.submission_note) meta.submission_note = task.submission_note;
    if (task.submission_links) meta.submission_links = task.submission_links;
    if (task.submission_files) meta.submission_files = task.submission_files;
    if (task.review_feedback) meta.review_feedback = task.review_feedback;
    if (task.rating_grade) meta.rating_grade = task.rating_grade;
    if (task.rating_score) meta.rating_score = task.rating_score;
    if (task.rated_by) meta.rated_by = task.rated_by;
    if (task.rated_at) meta.rated_at = task.rated_at;
    if (task.access_level) meta.access_level = task.access_level;
    if (task.inherited_doc_file_url) meta.inherited_doc_file_url = task.inherited_doc_file_url;
    if (task.inherited_doc_file_name) meta.inherited_doc_file_name = task.inherited_doc_file_name;
    if (task.delegated_from_id) meta.delegated_from_id = task.delegated_from_id;
    if (task.collaborator_ids && task.collaborator_ids.length > 0) meta.collaborator_ids = task.collaborator_ids;

    let desc = task.description || '';
    if (Object.keys(meta).length > 0) {
      desc = desc.replace(/\n<!--META:([\s\S]*)-->$/, '') + '\n<!--META:' + JSON.stringify(meta) + '-->';
    }

    const payload: any = {
      id: task.id,
      campaign_id: task.campaign_id || null,
      source_document_id: task.source_document_id || null,
      title: task.title,
      description: desc,
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
      recur_parent_id: task.recur_parent_id || null,
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || new Date().toISOString(),
    };

    const { error } = await supabase.from('tasks').insert(payload);
    if (error) {
      console.warn('Lỗi ghi task lên Supabase:', error.message);
      return false;
    }

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
      updated_at: new Date().toISOString(),
    };

    // Kiểm tra xem có trường meta nào trong updates không
    const metaFields = [
      'submission_note', 'submission_links', 'submission_files', 'review_feedback',
      'rating_grade', 'rating_score', 'rated_by', 'rated_at', 'access_level',
      'inherited_doc_file_url', 'inherited_doc_file_name', 'delegated_from_id', 'collaborator_ids'
    ];
    const hasMetaUpdates = metaFields.some((f) => (updates as any)[f] !== undefined);

    if (hasMetaUpdates || updates.description !== undefined) {
      // Lấy description hiện tại nếu không có sẵn
      let currentDesc = updates.description ?? '';
      let existingMeta: any = {};
      if (updates.description === undefined) {
        const { data } = await supabase.from('tasks').select('description').eq('id', taskId).single();
        currentDesc = data?.description || '';
      }
      const match = currentDesc ? currentDesc.match(/\n<!--META:([\s\S]*)-->$/) : null;
      if (match) {
        try {
          existingMeta = JSON.parse(match[1]);
          currentDesc = currentDesc.replace(/\n<!--META:([\s\S]*)-->$/, '');
        } catch (e) {}
      }

      metaFields.forEach((f) => {
        if ((updates as any)[f] !== undefined) {
          existingMeta[f] = (updates as any)[f];
        }
      });

      payload.description = currentDesc + '\n<!--META:' + JSON.stringify(existingMeta) + '-->';
    }

    for (const key of Object.keys(updates)) {
      if (VALID_TASK_COLS.has(key) && key !== 'description') {
        payload[key] = (updates as any)[key];
      }
    }

    const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);
    if (error) {
      console.warn('Lỗi cập nhật task trên Supabase:', error.message);
      return false;
    }

    if (updates.collaborator_ids) {
      await supabase.from('task_collaborators').delete().eq('task_id', taskId);
      if (updates.collaborator_ids.length > 0) {
        const collabs = updates.collaborator_ids.map((memberId) => ({
          task_id: taskId,
          member_id: memberId,
        }));
        await supabase.from('task_collaborators').upsert(collabs, { onConflict: 'task_id,member_id' });
      }
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
    await supabase.from('task_collaborators').delete().eq('task_id', taskId);
    await supabase.from('task_comments').delete().eq('task_id', taskId);
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
    const docMeta: any = {};
    if (doc.file_name) docMeta.file_name = doc.file_name;
    if (doc.file_size) docMeta.file_size = doc.file_size;
    if (doc.access_level) docMeta.access_level = doc.access_level;
    if (doc.file_url) docMeta.file_url = doc.file_url;

    let ghiChu = doc.ghi_chu || '';
    if (Object.keys(docMeta).length > 0) {
      ghiChu = ghiChu.replace(/\n<!--DOCMETA:([\s\S]*)-->$/, '') + '\n<!--DOCMETA:' + JSON.stringify(docMeta) + '-->';
    }

    const payload = {
      id: doc.id,
      don_vi_gui: doc.don_vi_gui,
      noi_dung: doc.noi_dung,
      so_ky_hieu: doc.so_ky_hieu || null,
      ngay_nhan: doc.ngay_nhan,
      ngay_chuyen_xu_ly: doc.ngay_chuyen_xu_ly || null,
      nguoi_nhan_xu_ly: doc.nguoi_nhan_xu_ly || 'Xin ý kiến BTV',
      thoi_han_xu_ly: doc.thoi_han_xu_ly || null,
      ghi_chu: ghiChu || null,
      file_path: doc.file_url || doc.file_path || null,
      created_by: doc.created_by || null,
      created_at: doc.created_at || new Date().toISOString(),
    };

    const { error } = await supabase.from('incoming_documents').insert(payload);
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
    const payload: any = {};
    for (const key of Object.keys(updates)) {
      if (VALID_DOC_COLS.has(key)) {
        payload[key] = (updates as any)[key];
      }
    }

    if (updates.file_url !== undefined) {
      payload.file_path = updates.file_url;
    }

    // Nếu có thay đổi metadata tài liệu
    if (updates.file_name !== undefined || updates.file_size !== undefined || updates.access_level !== undefined) {
      let currentGhiChu = updates.ghi_chu ?? '';
      let existingMeta: any = {};
      if (updates.ghi_chu === undefined) {
        const { data } = await supabase.from('incoming_documents').select('ghi_chu').eq('id', docId).single();
        currentGhiChu = data?.ghi_chu || '';
      }
      const match = currentGhiChu ? currentGhiChu.match(/\n<!--DOCMETA:([\s\S]*)-->$/) : null;
      if (match) {
        try {
          existingMeta = JSON.parse(match[1]);
          currentGhiChu = currentGhiChu.replace(/\n<!--DOCMETA:([\s\S]*)-->$/, '');
        } catch (e) {}
      }
      if (updates.file_name !== undefined) existingMeta.file_name = updates.file_name;
      if (updates.file_size !== undefined) existingMeta.file_size = updates.file_size;
      if (updates.access_level !== undefined) existingMeta.access_level = updates.access_level;
      if (updates.file_url !== undefined) existingMeta.file_url = updates.file_url;

      payload.ghi_chu = currentGhiChu + '\n<!--DOCMETA:' + JSON.stringify(existingMeta) + '-->';
    }

    const { error } = await supabase.from('incoming_documents').update(payload).eq('id', docId);
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

export async function deleteIncomingDocFromSupabase(docId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('incoming_documents').delete().eq('id', docId);
    if (error) {
      console.warn('Lỗi deleteIncomingDocFromSupabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Lỗi deleteIncomingDocFromSupabase:', err);
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
    const { count } = await supabase.from('members').select('*', { count: 'exact', head: true });
    if (count !== null && count > 0) {
      return false;
    }

    console.log('Cơ sở dữ liệu Supabase chưa có thành viên, tiến hành khởi tạo danh sách BTV chuẩn...');

    // Khởi tạo 6 thành viên Ban Thường vụ chuẩn
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
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (payload) => {
        handlers.onChatInsert?.(payload.new as ChatMessage);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'task_comments' },
      (payload) => {
        handlers.onCommentInsert?.(payload.new as TaskComment);
      }
    )
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
