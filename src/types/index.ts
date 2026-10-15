// ==============================================================================
// ĐẶC TẢ DỮ LIỆU TYPE CHUẨN - HỆ THỐNG QUẢN LÝ CÁC BỘ ĐOÀN - HỘI (PHIÊN BẢN 1.0)
// ==============================================================================

// 7 Phân hệ nhân sự theo Mục 1 Đặc tả
export type SubsystemId =
  | 'P01' // Ban Chấp hành Đoàn trường
  | 'P02' // Ủy ban Kiểm tra Đoàn trường
  | 'P03' // Ban Chấp hành Đoàn cơ sở
  | 'P04' // Ban Chấp hành Liên chi hội
  | 'P05' // Đơn vị trực thuộc Đoàn trường (Ban điều hành các đơn vị chức năng)
  | 'P06' // Đơn vị trực thuộc Hội Sinh viên (Ban chủ nhiệm CLB, Đội, Nhóm)
  | 'P07'; // Bí thư chi đoàn

export interface SubsystemInfo {
  id: SubsystemId;
  code: string;
  name: string;
  targetDescription: string;
  count: number;
  colorClass: string;
  iconName: string;
}

// Đơn vị trong cây tổ chức
export type UnitType =
  | 'doan_truong'
  | 'hoi_sinh_vien'
  | 'doan_co_so'
  | 'lien_chi_hoi'
  | 'don_vi_chuc_nang'
  | 'clb_doi_nhom'
  | 'chi_doan';

export interface Unit {
  id: string;
  code: string; // VD: CLB-TT, DKS-CNTT, LCH-KT...
  name: string;
  type: UnitType;
  parent_id?: string | null;
  status: 'active' | 'inactive';
  subsystem_id: SubsystemId;
  established_date?: string;
  description?: string;
  member_count?: number;
}

// Chức danh
export type PositionGroup =
  | 'ban_chap_hanh'
  | 'uy_ban_kiem_tra'
  | 'ban_dieu_hanh' // Dành cho đơn vị chức năng Đoàn trường
  | 'ban_chu_nhiem' // Dành cho CLB/Đội/Nhóm Hội Sinh viên
  | 'chi_doan';

export interface PositionDefinition {
  id: string;
  name: string; // Chủ nhiệm, Phó chủ nhiệm, Bí thư, Phó Bí thư, UV BCH, Thành viên...
  group: PositionGroup;
  expected_count: number | 'Nhieu_nguoi';
  status: 'active' | 'inactive';
  subsystem_id?: SubsystemId;
  unit_id?: string;
}

// Hồ sơ cán bộ (Thực thể dùng chung - Mục 2)
export type OfficerType = 'sinh_vien' | 'can_bo_giang_vien';
export type VerificationStatus = 'verified' | 'pending_update' | 'incomplete';

export interface OfficerProfile {
  id: string;
  profile_code: string; // CB-0001
  full_name: string;
  officer_type: OfficerType;
  student_id?: string; // Bắt buộc với SV
  staff_id?: string; // Với cán bộ - giảng viên
  date_of_birth: string; // YYYY-MM-DD
  gender: 'Nam' | 'Nữ';
  hometown: string; // Quê quán
  current_residence: string; // Nơi ở hiện nay
  current_address?: string; // Tên viết khác của current_residence
  ethnicity: string; // Dân tộc (nhạy cảm)
  religion: string; // Tôn giáo (nhạy cảm)
  qualification?: string; // Trình độ chuyên môn
  major?: string; // Ngành học
  political_theory?: string; // Trình độ LLCT
  is_union_member: boolean; // Tình trạng đoàn viên
  union_join_date?: string; // Ngày vào Đoàn
  is_party_member: boolean; // Tình trạng đảng viên
  party_join_date?: string; // Ngày vào Đảng dự bị
  party_official_date?: string; // Ngày vào Đảng chính thức
  avatar_url?: string;
  email: string;
  phone: string;
  verification_status: VerificationStatus;
  primary_subsystem_id: SubsystemId;
  primary_unit_id: string;
  roles: RoleAssignment[]; // Một người có thể giữ nhiều chức vụ (kiêm nhiệm)
  version: number; // Chống xung đột phiên bản khi nhiều quản trị cùng sửa
  created_at: string;
  updated_at: string;
}

// Bản ghi chức vụ đảm nhiệm (Gắn với khoảng thời gian và quyết định)
export type RoleStatus = 'active' | 'future' | 'ended';

export interface RoleAssignment {
  id: string;
  profile_id: string;
  officer_id?: string; // alias
  unit_id: string;
  unit_name: string;
  subsystem_id: SubsystemId;
  position_title: string;
  term: string; // VD: "2025 - 2026", "2026 - 2027"
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD hoặc null nếu đến nay
  decision_id?: string;
  decision_number?: string;
  status: RoleStatus;
  is_active?: boolean; // alias
}

// Quyết định nhân sự (Mục 7)
export type DecisionType = 'bo_nhiem' | 'thay_the' | 'mien_nhiem' | 'kien_toan';
export type DecisionStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface DecisionChangeLine {
  id: string;
  change_type: 'bo_nhiem' | 'thay_the' | 'ket_thuc' | 'mien_nhiem' | 'kien_toan';
  profile_id: string;
  profile_name: string;
  student_id?: string;
  unit_id: string;
  unit_name: string;
  position_title: string;
  start_date: string;
  end_date?: string;
  replaces_profile_id?: string; // Người cũ bị thay thế nếu có
  replaces_profile_name?: string;
  replaces_student_id?: string;
}

export interface PersonnelDecision {
  id: string;
  decision_number: string; // VD: "145-QĐ/HSV", "156-QĐ/HSV"
  decision_type: DecisionType;
  title: string;
  issue_date: string; // Ngày ban hành
  effective_date: string; // Ngày hiệu lực
  issuing_authority: string; // Hội Sinh viên trường, Đoàn trường...
  signer_name: string;
  signer_title: string;
  unit_id?: string;
  unit_name?: string;
  term?: string;
  file_name?: string;
  file_size?: string;
  file_url?: string;
  notes?: string;
  status: DecisionStatus;
  changes: DecisionChangeLine[];
  created_by: string;
  created_at: string;
}

// Yêu cầu cập nhật hồ sơ (Dữ liệu chờ duyệt - Mục 2)
export type UpdateRequestStatus = 'draft' | 'pending' | 'approved' | 'returned';

export interface ProfileFieldDiff {
  label: string;
  field_key: string;
  current_value: string;
  proposed_value: string;
  is_changed: boolean;
}

export interface ProfileUpdateRequest {
  id: string; // HS-0012
  profile_id: string;
  profile_name: string;
  student_id: string;
  avatar_url?: string;
  unit_name: string;
  reason: string;
  diffs: ProfileFieldDiff[];
  status: UpdateRequestStatus;
  created_at: string;
  reviewed_at?: string;
  reviewer_name?: string;
  reviewer_comment?: string;
  version: string; // VD: "v1.2 (12/10/2026)"
}

// Đánh giá và xếp loại hằng tháng (Mục 8)
export type EvaluationGrade = 'A' | 'B' | 'C' | 'D';
export type EvaluationPeriodStatus = 'draft' | 'open' | 'closed' | 'published';
export type CandidateEvaluationStatus = 'not_submitted' | 'submitted' | 'approved' | 'returned';

export interface EvaluationPeriod {
  id: string;
  month_year: string; // "10/2026"
  month_number: number;
  year_number: number;
  title: string;
  subsystem_ids: SubsystemId[];
  unit_ids: string[];
  self_evaluation_deadline: string; // 25/10/2026
  review_deadline: string;
  status: EvaluationPeriodStatus;
  is_published: boolean; // Chỉ khi công bố cán bộ mới thấy mức A, B, C, D
  total_targets: number;
  submitted_count: number;
  approved_count: number;
  criteria_version: string;
  created_at: string;
}

export interface MonthlyEvaluation {
  id: string;
  period_id: string;
  month_year: string;
  profile_id: string;
  profile_name: string;
  student_id: string;
  role_assignment_id: string;
  unit_id: string;
  unit_name: string;
  position_title: string;
  task_results: string; // Kết quả thực hiện nhiệm vụ
  limitations_mitigation: string; // Hạn chế và hướng khắc phục
  evidence_files: { name: string; size: string; url?: string }[];
  proposed_grade?: EvaluationGrade | null; // Mức đề xuất từ đơn vị
  approved_grade?: EvaluationGrade | null; // Mức đã duyệt
  candidate_comment?: string;
  unit_comment?: string;
  admin_comment?: string;
  status: CandidateEvaluationStatus;
  submitted_at?: string;
  reviewed_at?: string;
}

// Thông báo hệ thống & nghiệp vụ (Mục 10)
export type NotificationTargetType = 'all' | 'unit' | 'subsystem' | 'individual';

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  sender_name: string; // Đoàn trường, Hội Sinh viên...
  target_type: NotificationTargetType;
  target_unit_id?: string;
  target_subsystem_id?: SubsystemId;
  target_profile_id?: string;
  role_filter?: string;
  link_type?: 'danh_gia' | 'ho_so' | 'quyet_dinh' | 'to_chuc';
  link_id?: string;
  link_label?: string;
  category: 'danh_gia' | 'ho_so' | 'quyet_dinh' | 'chung';
  channel: 'in_app' | 'email';
  send_time_type: 'immediate' | 'scheduled';
  scheduled_time?: string;
  created_at: string;
  is_read: boolean;
  read_by_user_ids: string[];
}

// Nhật ký hoạt động (Audit Logs - Mục 10)
export type AuditActionType =
  | 'duyet_ho_so'
  | 'tra_lai_ho_so'
  | 'gui_quyet_dinh'
  | 'duyet_quyet_dinh'
  | 'xuat_bao_cao'
  | 'tao_ho_so'
  | 'sua_ho_so'
  | 'cong_bo_danh_gia'
  | 'mo_lai_ky'
  | 'nhap_excel'
  | 'doi_mat_khau';

export interface AuditLog {
  id: string;
  timestamp: string; // "13/10/2026 09:20"
  user_id: string;
  user_name: string;
  user_mssv?: string;
  action_type: AuditActionType | string;
  action?: string;
  action_label: string;
  target_id: string;
  target_name: string;
  target_type: string;
  result: 'Thành công' | 'Thất bại' | 'SUCCESS' | 'FAILED';
  details: string;
  version_from?: string;
  version_to?: string;
  field_changes?: { field_name: string; old_value: string; new_value: string }[];
  notes?: string;
  actor_name?: string;
  actor_code?: string;
  created_at?: string;
  description?: string;
  ip_address?: string;
}

// Cấu hình hệ thống (Mục 10 & Màn hình 19)
export interface ApprovalWorkflowConfig {
  scope_unit_id: string;
  scope_name: string;
  approver_title: string;
  prevent_self_approval: boolean; // Không tự duyệt yêu cầu của mình
}

export interface EvaluationCriteriaConfig {
  version: string;
  status: 'approved' | 'pending';
  created_date: string;
  author_name: string;
  author_mssv: string;
  rules_a: string;
  rules_b: string;
  rules_c: string;
  rules_d: string;
}

export interface SystemConfig {
  profile_approval: ApprovalWorkflowConfig[] | any;
  decision_approval: ApprovalWorkflowConfig[] | any;
  evaluation_criteria: EvaluationCriteriaConfig;
  max_file_size_mb: number;
  allowed_file_formats: string[];
  email_notifications_enabled: boolean;
  prevent_self_approval?: boolean;
  attachments?: {
    max_size_mb: number;
    allowed_extensions: string[];
  };
}

// Vai trò người dùng & Phân quyền (Mục 3)
export type UserRole =
  | 'can_bo_ca_nhan'
  | 'quan_ly_don_vi'
  | 'admin_don_vi'
  | 'nguoi_duyet'
  | 'lanh_dao'
  | 'admin';

export interface AppUser {
  id: string;
  profile_id: string;
  full_name: string;
  student_id: string;
  email: string;
  avatar_code: string;
  avatar_url?: string;
  roles: UserRole[];
  current_role: UserRole;
  scope_unit_id?: string | null;
  scope_unit_name: string;
  managed_unit_ids?: string[];
  allowed_admin_tabs?: string[];
  portal_mode: 'user' | 'admin';
  username?: string;
  password?: string;
  is_active?: boolean;
}

// ==============================================================================
// LEGACY TYPES - HỆ THỐNG CÔNG VIỆC BTV (GIỮ LẠI ĐỂ TƯƠNG THÍCH TIẾP TỤC DỰ ÁN)
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
  | 'view_all_tasks'
  | 'create_assign_tasks'
  | 'approve_specialized_tasks'
  | 'approve_admin_tasks'
  | 'manage_incoming_docs'
  | 'view_confidential_docs'
  | 'send_urgent_remind'
  | 'view_reports_kpi'
  | 'access_coordinator'
  | 'access_admin_portal';

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
  mang_phu_trach?: string;
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
  don_vi_gui: string;
  noi_dung: string;
  so_ky_hieu?: string;
  ngay_nhan: string;
  ngay_chuyen_xu_ly?: string;
  nguoi_nhan_xu_ly?: string;
  thoi_han_xu_ly?: string | null;
  ghi_chu?: string;
  file_path?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  access_level?: 'cong_khai' | 'thuong_truc';
  created_by?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  campaign_id?: string | null;
  source_document_id?: string | null;
  title: string;
  description?: string;
  owner_id: string;
  created_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  approval_scope: ApprovalScope;
  due_at?: string | null;
  started_at?: string | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  approved_by?: string | null;
  recur_rule?: string | null;
  recur_parent_id?: string | null;
  submission_note?: string;
  submission_links?: string[];
  submission_files?: string[];
  review_feedback?: string;
  rating_grade?: RatingGrade;
  rating_score?: number;
  rated_by?: string;
  rated_at?: string;
  created_at: string;
  updated_at: string;
  owner?: Member;
  collaborator_ids?: string[];
  collaborators?: Member[];
  campaign?: Campaign;
  source_document?: IncomingDocument;
  comments_count?: number;
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
  workload_rating: number;
  workload_score?: number;
  message?: string;
  note?: string;
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
  mentions?: string[];
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

