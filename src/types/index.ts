// ==============================================================================
// ĐỊNH NGHĨA DỮ LIỆU TYPE CHUẨN - HỆ THỐNG QUẢN LÝ BTV ĐOÀN TRƯỜNG HCMUTE
// ==============================================================================

export type MemberRole = 'bi_thu' | 'pho_bi_thu' | 'chanh_van_phong' | 'uy_vien';

export type TaskPriority = 'thap' | 'binh_thuong' | 'cao' | 'khan';

export type TaskStatus = 'moi' | 'dang_lam' | 'cho_duyet' | 'hoan_thanh' | 'tam_dung' | 'huy';

export type ApprovalScope = 'hanh_chinh' | 'chuyen_mon';

export type NotificationKind =
  | 'giao_viec'
  | 'truoc_1_ngay'
  | 'truoc_2_gio'
  | 'den_han'
  | 'qua_han'
  | 'leo_thang'
  | 'don_doc';

export interface Member {
  id: string;
  email: string;
  full_name: string;
  role: MemberRole;
  mang_phu_trach?: string; // 'to_chuc' | 'tuyen_giao' | 'phong_trao' | 'kiem_tra' | 'van_phong'
  phone?: string;
  avatar_url?: string;
  active: boolean;
  alias?: string[];
  busy_from?: string | null;
  busy_to?: string | null;
  busy_reason?: string | null;
  created_at?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'du_kien' | 'dang_chay' | 'hoan_thanh' | 'huy';
  color?: string;
  created_by?: string;
  created_at?: string;
}

export interface IncomingDocument {
  id: string;
  don_vi_gui: string;     // ĐƠN VỊ GỬI ĐẾN (Thành Đoàn, Đảng ủy, Phòng ban...)
  noi_dung: string;       // NỘI DUNG (Trích yếu)
  so_ky_hieu?: string;    // SỐ, KÝ HIỆU VB
  ngay_nhan: string;      // NGÀY NHẬN (YYYY-MM-DD)
  ngay_chuyen_xu_ly?: string; // NGÀY CHUYỂN XỬ LÝ
  nguoi_nhan_xu_ly?: string;  // NGƯỜI NHẬN XỬ LÝ (hoặc 'Xin ý kiến BTV')
  thoi_han_xu_ly?: string | null; // THỜI HẠN XỬ LÝ
  ghi_chu?: string;       // GHI CHÚ
  file_path?: string;
  created_by?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  campaign_id?: string | null;
  source_document_id?: string | null;
  title: string;
  description?: string;
  owner_id: string;       // Đúng 1 người chịu trách nhiệm chính
  created_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  approval_scope: ApprovalScope; // 'hanh_chinh' (Chánh VP duyệt được) | 'chuyen_mon' (chỉ Bí thư/Phó BT duyệt)
  due_at?: string | null;
  started_at?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  approved_by?: string | null;
  recur_rule?: string | null;
  recur_parent_id?: string | null;
  created_at: string;
  updated_at: string;

  // Thuộc tính mở rộng để render
  owner?: Member;
  collaborator_ids?: string[];
  collaborators?: Member[];
  campaign?: Campaign;
  source_document?: IncomingDocument;
  comments_count?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  member_id: string;
  body: string;
  created_at: string;
  member?: Member;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  member_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime?: string;
  created_at: string;
  member?: Member;
}

export interface ChatMessage {
  id: string;
  member_id: string;
  body: string;
  reply_to?: string | null;
  created_at: string;
  member?: Member;
}

export interface NotificationLog {
  id: string;
  task_id: string;
  member_id: string;
  kind: NotificationKind;
  channel: 'push' | 'email';
  sent_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  member_id: string;
  action: 'created' | 'status_changed' | 'don_doc' | 'approved' | 'commented';
  detail: Record<string, any>;
  created_at: string;
  member?: Member;
}
