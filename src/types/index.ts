// ==============================================================================
// ĐỊNH NGHĨA DỮ LIỆU TYPE CHUẨN - HỆ THỐNG QUẢN LÝ BTV ĐOÀN TRƯỜNG HCMUTE
// ==============================================================================

export type MemberRole = 'bi_thu' | 'pho_bi_thu' | 'chanh_van_phong' | 'uy_vien';

export type TaskPriority = 'thap' | 'binh_thuong' | 'cao' | 'khan';

export type TaskStatus = 'moi' | 'dang_lam' | 'cho_duyet' | 'pending_review' | 'hoan_thanh' | 'tam_dung' | 'huy';

export type RatingGrade = 'A' | 'B' | 'C' | 'D';

export type ApprovalScope = 'hanh_chinh' | 'chuyen_mon';

export type NotificationKind =
  | 'giao_viec'
  | 'truoc_1_ngay'
  | 'truoc_2_gio'
  | 'den_han'
  | 'qua_han'
  | 'leo_thang'
  | 'don_doc';

export type PermissionKey =
  | 'view_all_tasks'            // Xem toàn bộ công việc BTV
  | 'create_assign_tasks'       // Giao việc & Phân công nhiệm vụ
  | 'approve_specialized_tasks' // Phê duyệt nhiệm vụ Chuyên môn
  | 'approve_admin_tasks'       // Phê duyệt nhiệm vụ Hành chính
  | 'manage_incoming_docs'      // Quản lý Sổ văn bản đến (Tiếp nhận & Chuyển giao)
  | 'view_confidential_docs'    // Xem công văn & nhiệm vụ Mật - Thường trực
  | 'send_urgent_remind'        // Phát lệnh Đôn đốc công việc khẩn
  | 'view_reports_kpi'          // Xem Báo cáo Đánh giá & Xếp loại KPI BTV
  | 'access_coordinator'        // Truy cập Bảng điều phối BTV
  | 'access_admin_portal';      // Truy cập Khu vực Quản trị Hệ thống

export type RolePermissionsMap = Record<MemberRole, PermissionKey[]>;

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'cong_viec' | 'van_ban' | 'dieu_hanh' | 'he_thong';
}

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
  delegate_to_id?: string | null;
  delegate_to?: Member;
  custom_permissions?: PermissionKey[];
  telegram_chat_id?: string;
  zalo_user_id?: string;
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
  file_url?: string;      // Đường dẫn file PDF scan (Local Blob hoặc Supabase URL)
  file_name?: string;     // Tên file gốc (VD: 262-TB-TDTN.pdf)
  file_size?: number;     // Dung lượng byte
  access_level?: 'cong_khai' | 'thuong_truc'; // Phân loại độ mật
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

  // Workflow nộp & duyệt 2 bước + KPI
  submission_note?: string;
  submission_links?: string[];
  submission_files?: string[];
  review_feedback?: string;
  rating_grade?: RatingGrade;
  rating_score?: number; // 1.0 - 10.0
  rated_by?: string;
  rated_at?: string;

  created_at: string;
  updated_at: string;

  // Thuộc tính mở rộng để render
  owner?: Member;
  collaborator_ids?: string[];
  collaborators?: Member[];
  campaign?: Campaign;
  source_document?: IncomingDocument;
  comments_count?: number;

  // Phân loại độ mật & Liên kết văn bản & Bàn giao
  access_level?: 'cong_khai' | 'thuong_truc';
  inherited_doc_file_url?: string;
  inherited_doc_file_name?: string;
  delegated_from_id?: string;
  delegated_from?: Member;
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

export type CheckinMood =
  | 'energetic'
  | 'happy'
  | 'neutral'
  | 'stressed'
  | 'overloaded'
  | 'rocket'
  | 'tired'
  | 'overload'
  | 'hao_hung'
  | 'on_dinh'
  | 'binh_thuong'
  | 'ap_luc'
  | 'qua_tai';

export interface WeeklyCheckin {
  id: string;
  member_id: string;
  week_number: number;
  year: number;
  mood: CheckinMood;
  workload_rating: number; // 1 to 5
  workload_score?: number; // alias
  message?: string;
  note?: string; // alias
  is_anonymous: boolean;
  created_at: string;
  member?: Member;
}

export interface ChatRichCard {
  type:
    | 'baocao'
    | 'giaoviec'
    | 'tiendo'
    | 'vanban'
    | 'dondoc'
    | 'progress_report'
    | 'task_assign'
    | 'doc_alert'
    | 'urgent_ping';
  title: string;
  summary?: string;
  description?: string;
  badge?: string;
  status_badge?: string;
  task_id?: string;
  doc_id?: string;
  assignee_id?: string;
  assignee_name?: string;
  deadline?: string;
  progress_percent?: number;
  doc_number?: string;
  action_label?: string;
  action_type?: string;
  primary_action_label?: string;
  primary_action_route?: string;
  meta?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  member_id: string;
  body: string;
  reply_to?: string | null;
  mentions?: string[]; // Danh sách member_id được tag @
  rich_card?: ChatRichCard;
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
