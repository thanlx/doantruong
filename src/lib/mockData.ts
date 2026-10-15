// ==============================================================================
// DỮ LIỆU KHỞI TẠO HỆ THỐNG - QUẢN LÝ CÁN BỘ ĐOÀN - HỘI HCMUTE
// Quản trị viên cao nhất: thanlx@hcmute.edu.vn (Super Admin)
// ==============================================================================

import {
  SubsystemInfo,
  Unit,
  PositionDefinition,
  OfficerProfile,
  PersonnelDecision,
  ProfileUpdateRequest,
  EvaluationPeriod,
  MonthlyEvaluation,
  NotificationItem,
  AuditLog,
  SystemConfig,
  AppUser,
} from '@/types';

// 1. 7 Phân hệ nhân sự theo Đặc tả Mục 1
export const INITIAL_SUBSYSTEMS: SubsystemInfo[] = [
  {
    id: 'P01',
    code: 'BCH_DT',
    name: 'BCH Đoàn trường',
    targetDescription: 'Thành viên Ban Chấp hành Đoàn trường',
    count: 25,
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconName: 'Users',
  },
  {
    id: 'P02',
    code: 'UBKT_DT',
    name: 'UBKT Đoàn trường',
    targetDescription: 'Thành viên Ủy ban Kiểm tra Đoàn trường',
    count: 10,
    colorClass: 'bg-red-50 text-red-700 border-red-200',
    iconName: 'Shield',
  },
  {
    id: 'P03',
    code: 'BCH_DCS',
    name: 'BCH Đoàn cơ sở',
    targetDescription: 'Thành viên Ban Chấp hành của từng Đoàn cơ sở',
    count: 80,
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconName: 'GitFork',
  },
  {
    id: 'P04',
    code: 'BCH_LCH',
    name: 'BCH Liên chi hội',
    targetDescription: 'Thành viên Ban Chấp hành của từng Liên chi hội',
    count: 60,
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    iconName: 'Users2',
  },
  {
    id: 'P05',
    code: 'DV_DOAN',
    name: 'Đơn vị trực thuộc Đoàn trường',
    targetDescription: 'Ban điều hành các đơn vị chức năng của Đoàn trường',
    count: 50,
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    iconName: 'Building2',
  },
  {
    id: 'P06',
    code: 'DV_HSV',
    name: 'Đơn vị trực thuộc Hội Sinh viên',
    targetDescription: 'Ban chủ nhiệm các Câu lạc bộ, Đội, Nhóm của Hội Sinh viên trường',
    count: 50,
    colorClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconName: 'Sparkles',
  },
  {
    id: 'P07',
    code: 'BT_CD',
    name: 'Bí thư chi đoàn',
    targetDescription: 'Bí thư của từng chi đoàn',
    count: 80,
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
    iconName: 'UserCheck',
  },
];

// 2. Cây tổ chức các đơn vị Đoàn - Hội
export const INITIAL_UNITS: Unit[] = [
  // Cấp Đoàn trường
  {
    id: 'unit_doan_truong',
    code: 'DOAN-TRUONG',
    name: 'Đoàn trường',
    type: 'doan_truong',
    parent_id: null,
    status: 'active',
    subsystem_id: 'P01',
    established_date: '1976-03-26',
    description: 'Đoàn Thanh niên Cộng sản Hồ Chí Minh trường',
    member_count: 25,
  },
  {
    id: 'unit_doan_co_so',
    code: 'DCS-KHOA',
    name: 'Đoàn cơ sở',
    type: 'doan_co_so',
    parent_id: 'unit_doan_truong',
    status: 'active',
    subsystem_id: 'P03',
    established_date: '2000-01-01',
    description: 'Đoàn cơ sở các Khoa/Viện trực thuộc',
    member_count: 80,
  },
  {
    id: 'unit_chi_doan',
    code: 'CHI-DOAN',
    name: 'Chi đoàn',
    type: 'chi_doan',
    parent_id: 'unit_doan_co_so',
    status: 'active',
    subsystem_id: 'P07',
    established_date: '2020-09-01',
    description: 'Hệ thống Chi đoàn trực thuộc Đoàn cơ sở',
    member_count: 80,
  },
  {
    id: 'unit_chuc_nang_doan',
    code: 'DVCN-DOAN',
    name: 'Đơn vị chức năng',
    type: 'don_vi_chuc_nang',
    parent_id: 'unit_doan_truong',
    status: 'active',
    subsystem_id: 'P05',
    established_date: '2015-05-19',
    description: 'Ban điều hành các đơn vị chức năng trực thuộc Đoàn trường (Ban Phong trào, Ban Tuyên giáo...)',
    member_count: 50,
  },

  // Cấp Hội Sinh viên
  {
    id: 'unit_hoi_sinh_vien',
    code: 'HSV-TRUONG',
    name: 'Hội Sinh viên trường',
    type: 'hoi_sinh_vien',
    parent_id: null,
    status: 'active',
    subsystem_id: 'P06',
    established_date: '1995-01-09',
    description: 'Hội Sinh viên Việt Nam trường',
    member_count: 35,
  },
  {
    id: 'unit_lien_chi_hoi',
    code: 'LCH-KHOA',
    name: 'Liên chi hội',
    type: 'lien_chi_hoi',
    parent_id: 'unit_hoi_sinh_vien',
    status: 'active',
    subsystem_id: 'P04',
    established_date: '2005-09-01',
    description: 'Liên chi hội sinh viên các Khoa',
    member_count: 60,
  },
  {
    id: 'unit_clb_truyen_thong',
    code: 'CLB-TT',
    name: 'CLB Truyền thông',
    type: 'clb_doi_nhom',
    parent_id: 'unit_hoi_sinh_vien',
    status: 'active',
    subsystem_id: 'P06',
    established_date: '2018-10-15',
    description: 'Câu lạc bộ Truyền thông sinh viên trực thuộc Hội Sinh viên trường',
    member_count: 22,
  },
  {
    id: 'unit_doi_tinh_nguyen',
    code: 'DOI-TN',
    name: 'Đội Tình nguyện',
    type: 'clb_doi_nhom',
    parent_id: 'unit_hoi_sinh_vien',
    status: 'active',
    subsystem_id: 'P06',
    established_date: '2016-03-26',
    description: 'Đội Sinh viên Tình nguyện xung kích',
    member_count: 28,
  },
];

// 3. Danh mục chức danh
export const INITIAL_POSITIONS: PositionDefinition[] = [
  // Ban chủ nhiệm (CLB / Đội / Nhóm Hội Sinh viên)
  {
    id: 'pos_bcn_chu_nhiem',
    name: 'Chủ nhiệm',
    group: 'ban_chu_nhiem',
    expected_count: 1,
    status: 'active',
    subsystem_id: 'P06',
  },
  {
    id: 'pos_bcn_pho_chu_nhiem',
    name: 'Phó chủ nhiệm',
    group: 'ban_chu_nhiem',
    expected_count: 2,
    status: 'active',
    subsystem_id: 'P06',
  },
  {
    id: 'pos_bcn_thanh_vien',
    name: 'Thành viên',
    group: 'ban_chu_nhiem',
    expected_count: 'Nhieu_nguoi',
    status: 'active',
    subsystem_id: 'P06',
  },

  // Ban điều hành (Đơn vị chức năng Đoàn trường)
  {
    id: 'pos_bdh_truong_ban',
    name: 'Trưởng ban',
    group: 'ban_dieu_hanh',
    expected_count: 1,
    status: 'active',
    subsystem_id: 'P05',
  },
  {
    id: 'pos_bdh_pho_ban',
    name: 'Phó trưởng ban',
    group: 'ban_dieu_hanh',
    expected_count: 2,
    status: 'active',
    subsystem_id: 'P05',
  },
  {
    id: 'pos_bdh_thanh_vien',
    name: 'Thành viên Ban điều hành',
    group: 'ban_dieu_hanh',
    expected_count: 'Nhieu_nguoi',
    status: 'active',
    subsystem_id: 'P05',
  },

  // Ban Chấp hành Đoàn cơ sở / Đoàn trường
  {
    id: 'pos_bch_bi_thu',
    name: 'Bí thư',
    group: 'ban_chap_hanh',
    expected_count: 1,
    status: 'active',
    subsystem_id: 'P03',
  },
  {
    id: 'pos_bch_pho_bi_thu',
    name: 'Phó Bí thư',
    group: 'ban_chap_hanh',
    expected_count: 2,
    status: 'active',
    subsystem_id: 'P03',
  },
  {
    id: 'pos_bch_uy_vien_btv',
    name: 'Ủy viên Ban Thường vụ',
    group: 'ban_chap_hanh',
    expected_count: 5,
    status: 'active',
    subsystem_id: 'P01',
  },
  {
    id: 'pos_bch_uy_vien',
    name: 'Ủy viên BCH',
    group: 'ban_chap_hanh',
    expected_count: 'Nhieu_nguoi',
    status: 'active',
    subsystem_id: 'P03',
  },

  // Chi đoàn
  {
    id: 'pos_cd_bi_thu',
    name: 'Bí thư chi đoàn',
    group: 'chi_doan',
    expected_count: 1,
    status: 'active',
    subsystem_id: 'P07',
  },
];

// 4. Danh sách cán bộ khởi tạo (Chỉ giữ hồ sơ chính thức của Quản trị viên Tối cao thanlx@hcmute.edu.vn)
export const INITIAL_PROFILES: OfficerProfile[] = [
  {
    id: 'prof_thanlx',
    profile_code: 'CB-0001',
    full_name: 'Lê Xuân Thân',
    officer_type: 'can_bo_giang_vien',
    student_id: 'CB-HCMUTE',
    date_of_birth: '1985-01-01',
    gender: 'Nam',
    hometown: 'TP. Hồ Chí Minh',
    current_residence: 'TP. Hồ Chí Minh',
    ethnicity: 'Kinh',
    religion: 'Không',
    qualification: 'Thạc sĩ',
    major: 'Kỹ thuật',
    political_theory: 'Trung cấp',
    is_union_member: true,
    union_join_date: '2000-03-26',
    is_party_member: true,
    party_join_date: '2010-05-19',
    party_official_date: '2011-05-19',
    email: 'thanlx@hcmute.edu.vn',
    phone: '0900000000',
    verification_status: 'verified',
    primary_subsystem_id: 'P01',
    primary_unit_id: 'unit_doan_truong',
    version: 1,
    created_at: '2024-01-01',
    updated_at: '2026-10-15',
    roles: [
      {
        id: 'role_thanlx_1',
        profile_id: 'prof_thanlx',
        unit_id: 'unit_doan_truong',
        unit_name: 'Đoàn trường',
        subsystem_id: 'P01',
        position_title: 'Bí thư Đoàn trường',
        term: '2024 - 2027',
        start_date: '2024-01-01',
        end_date: null,
        decision_id: 'dec_01',
        decision_number: '01-QĐ/ĐTN',
        status: 'active',
      },
    ],
  },
];

// 5. Quyết định nhân sự khởi tạo (Làm sạch toàn bộ mẫu)
export const INITIAL_DECISIONS: PersonnelDecision[] = [];

// 6. Yêu cầu cập nhật hồ sơ chờ duyệt (Làm sạch toàn bộ mẫu)
export const INITIAL_UPDATE_REQUESTS: ProfileUpdateRequest[] = [];

// 7. Kỳ đánh giá hằng tháng (Chuẩn bị kỳ hiện tại sạch)
export const INITIAL_EVALUATION_PERIODS: EvaluationPeriod[] = [
  {
    id: 'period_2026_10',
    month_year: '10/2026',
    month_number: 10,
    year_number: 2026,
    title: 'Kỳ đánh giá tháng 10 năm 2026',
    subsystem_ids: ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07'],
    unit_ids: ['unit_doan_truong', 'unit_hoi_sinh_vien'],
    self_evaluation_deadline: '2026-10-25',
    review_deadline: '2026-10-28',
    status: 'open',
    is_published: false,
    total_targets: 1,
    submitted_count: 0,
    approved_count: 0,
    criteria_version: 'v1.0 (10/2026)',
    created_at: '2026-10-01 08:00',
  },
];

// 8. Bản ghi đánh giá chi tiết (Làm sạch toàn bộ mẫu)
export const INITIAL_EVALUATIONS: MonthlyEvaluation[] = [];

// 9. Thông báo hệ thống khởi tạo (Làm sạch mẫu)
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_welcome',
    title: 'Hệ thống Quản lý Điều hành Cán bộ Đoàn - Hội HCMUTE',
    content:
      'Chào mừng đồng chí đến với Hệ thống Quản lý Cán bộ Đoàn – Hội Trường ĐH Sư phạm Kỹ thuật TP.HCM. Tài khoản thanlx@hcmute.edu.vn giữ quyền Quản trị viên Tối cao (Super Admin).',
    sender_name: 'Đoàn trường',
    target_type: 'all',
    category: 'chung',
    channel: 'in_app',
    send_time_type: 'immediate',
    created_at: '2026-10-15 08:00',
    is_read: false,
    read_by_user_ids: [],
    link_type: 'ho_so',
    link_id: 'prof_thanlx',
    link_label: 'Xem hồ sơ',
  },
];

// 10. Nhật ký hoạt động (Làm sạch mẫu)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// 11. Cấu hình hệ thống (Mục 10 & Màn hình 19)
export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  profile_approval: [
    {
      scope_unit_id: 'unit_doan_co_so',
      scope_name: 'Đoàn cơ sở',
      approver_title: 'Bí thư Đoàn cơ sở',
      prevent_self_approval: true,
    },
    {
      scope_unit_id: 'unit_doan_truong',
      scope_name: 'Toàn trường',
      approver_title: 'Bí thư Đoàn trường',
      prevent_self_approval: true,
    },
  ],
  decision_approval: [
    {
      scope_unit_id: 'unit_hoi_sinh_vien',
      scope_name: 'Hội Sinh viên trường',
      approver_title: 'Chủ tịch Hội Sinh viên trường',
      prevent_self_approval: true,
    },
  ],
  evaluation_criteria: {
    version: '1.0',
    status: 'approved',
    created_date: '01/10/2026',
    author_name: 'Lê Xuân Thân',
    author_mssv: 'CB-HCMUTE',
    rules_a: 'Hoàn thành xuất sắc nhiệm vụ (Đạt >= 90% chỉ tiêu, không vi phạm)',
    rules_b: 'Hoàn thành tốt nhiệm vụ (Đạt >= 75% chỉ tiêu)',
    rules_c: 'Hoàn thành nhiệm vụ (Đạt >= 50% chỉ tiêu)',
    rules_d: 'Chưa hoàn thành nhiệm vụ (< 50% chỉ tiêu hoặc vi phạm kỷ luật)',
  },
  max_file_size_mb: 10,
  allowed_file_formats: ['PDF', 'XLSX', 'DOCX'],
  email_notifications_enabled: false,
};

// 12. Tài khoản quản trị viên cao nhất & Người dùng hệ thống
export const SUPER_ADMIN_USER: AppUser = {
  id: 'user_thanlx',
  profile_id: 'prof_thanlx',
  full_name: 'Lê Xuân Thân',
  student_id: 'CB-HCMUTE',
  username: 'thanlx',
  password: 'Hcmute@2026',
  email: 'thanlx@hcmute.edu.vn',
  avatar_code: 'XT',
  roles: ['admin', 'lanh_dao', 'nguoi_duyet', 'quan_ly_don_vi', 'can_bo_ca_nhan'],
  current_role: 'admin',
  scope_unit_id: 'all',
  scope_unit_name: 'Toàn trường',
  portal_mode: 'admin',
  is_active: true,
};

export const DEFAULT_APP_USER: AppUser = SUPER_ADMIN_USER;

export const INITIAL_USERS: AppUser[] = [SUPER_ADMIN_USER];

// Khả năng tương thích ngược (Legacy fallback)
export const INITIAL_MEMBERS: any[] = [];
export const DEFAULT_ROLE_PERMISSIONS: Record<string, any> = {};
