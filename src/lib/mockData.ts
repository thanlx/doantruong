// ==============================================================================
// DỮ LIỆU MẪU CHUẨN - 9 THÀNH VIÊN BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE (THÁNG 09/2026)
// ==============================================================================

import {
  Member,
  Campaign,
  IncomingDocument,
  Task,
  ChatMessage,
  WeeklyCheckin,
  PermissionKey,
  RolePermissionsMap,
  PermissionDefinition,
} from '@/types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'thanlx@hcmute.edu.vn',
    full_name: 'Lê Xuân Thân',
    role: 'bi_thu',
    mang_phu_trach: 'to_chuc',
    phone: '0901234567',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    alias: ['Đ/c Thân', 'Thân', 'Lê Xuân Thân'],
    telegram_chat_id: '123456789',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f6903ccb-f5a4-4cbf-90d6-b6e8bfee5655',
    email: 'truongndx@hcmute.edu.vn',
    full_name: 'Nguyễn Đoàn Xuân Trường',
    role: 'pho_bi_thu',
    mang_phu_trach: 'tuyen_giao',
    phone: '0902345678',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    active: true,
    alias: ['Đ/c Xuân Trường', 'Xuân Trường', 'Nguyễn Đoàn Xuân Trường'],
    telegram_chat_id: '987654321',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '9f860961-8a33-49ed-ab11-4b9508f282ec',
    email: 'ducpc@hcmute.edu.vn',
    full_name: 'Phan Công Đức',
    role: 'pho_bi_thu',
    mang_phu_trach: 'phong_trao',
    phone: '0904567890',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true,
    alias: ['Đ/c Công Đức', 'Công Đức', 'Phan Công Đức'],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'f509a380-42a7-4fc5-879c-9f918177b03b',
    email: 'thanhtan@hcmute.edu.vn',
    full_name: 'Nguyễn Thanh Tân',
    role: 'pho_bi_thu',
    mang_phu_trach: 'kiem_tra',
    phone: '0906789012',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    active: true,
    alias: ['Đ/c Thanh Tân', 'Thanh Tân', 'Nguyễn Thanh Tân'],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'a57840e7-3592-4951-aeba-46181b257ddd',
    email: 'quynhptn@hcmute.edu.vn',
    full_name: 'Phạm Thị Như Quỳnh',
    role: 'chanh_van_phong',
    mang_phu_trach: 'van_phong',
    phone: '0903456789',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    alias: ['Đ/c Như Quỳnh', 'Như Quỳnh', 'Phạm Thị Như Quỳnh'],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '3d976399-586d-406f-a646-eb528518470d',
    email: 'hoavm@hcmute.edu.vn',
    full_name: 'Võ Minh Hòa',
    role: 'uy_vien',
    mang_phu_trach: 'phong_trao',
    phone: '0905678901',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    active: true,
    alias: ['Đ/c Minh Hòa', 'Minh Hòa', 'Võ Minh Hòa'],
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_DOCUMENTS: IncomingDocument[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_NOTIFICATIONS: {
  id: string;
  title: string;
  time: string;
  icon: string;
  unread: boolean;
}[] = [];

export const INITIAL_WEEKLY_CHECKINS: WeeklyCheckin[] = [];

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'view_all_tasks',
    label: 'Xem toàn bộ công việc BTV',
    description: 'Truy cập và theo dõi tiến độ tất cả nhiệm vụ trong toàn Ban Thường vụ.',
    category: 'cong_viec',
  },
  {
    key: 'create_assign_tasks',
    label: 'Giao việc & Phân công nhiệm vụ',
    description: 'Khởi tạo công việc mới và chỉ định thành viên BTV chịu trách nhiệm thực hiện.',
    category: 'cong_viec',
  },
  {
    key: 'approve_specialized_tasks',
    label: 'Phê duyệt nhiệm vụ Chuyên môn',
    description: 'Thẩm quyền chấm điểm KPI, xếp loại và duyệt hoàn thành công việc chuyên môn/chủ trương.',
    category: 'cong_viec',
  },
  {
    key: 'approve_admin_tasks',
    label: 'Phê duyệt nhiệm vụ Hành chính',
    description: 'Thẩm quyền duyệt các công việc hành chính, hậu cần, văn phòng và rà soát thủ tục.',
    category: 'cong_viec',
  },
  {
    key: 'manage_incoming_docs',
    label: 'Quản lý Sổ văn bản đến',
    description: 'Nhập thông tin văn bản đến, tải file PDF scan và phân phối xử lý cho BTV.',
    category: 'van_ban',
  },
  {
    key: 'view_confidential_docs',
    label: 'Xem văn bản & việc Mật - Thường trực',
    description: 'Quyền xem toàn văn các văn bản và công việc thuộc diện bảo mật Thường trực Đoàn trường.',
    category: 'van_ban',
  },
  {
    key: 'send_urgent_remind',
    label: 'Phát lệnh Đôn đốc công việc khẩn',
    description: 'Gửi thông báo hỏa tốc yêu cầu báo cáo tiến độ tức thì đến thành viên BTV.',
    category: 'dieu_hanh',
  },
  {
    key: 'view_reports_kpi',
    label: 'Xem Báo cáo Đánh giá & Xếp loại KPI',
    description: 'Xem bảng tổng kết KPI, xếp loại chất lượng A/B/C/D và xuất file Excel Đảng ủy.',
    category: 'dieu_hanh',
  },
  {
    key: 'access_coordinator',
    label: 'Truy cập Bảng điều phối BTV',
    description: 'Xem dashboard điều phối, ma trận tải việc, phân bổ nguồn lực và xung lực tuần.',
    category: 'dieu_hanh',
  },
  {
    key: 'access_admin_portal',
    label: 'Quản trị Thành viên & Hệ thống',
    description: 'Thêm/sửa/xóa thành viên, phân quyền hạn, quản lý mảng việc và bảo trì dữ liệu.',
    category: 'he_thong',
  },
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  bi_thu: [
    'view_all_tasks',
    'create_assign_tasks',
    'approve_specialized_tasks',
    'approve_admin_tasks',
    'manage_incoming_docs',
    'view_confidential_docs',
    'send_urgent_remind',
    'view_reports_kpi',
    'access_coordinator',
    'access_admin_portal',
  ],
  pho_bi_thu: [
    'view_all_tasks',
    'create_assign_tasks',
    'approve_specialized_tasks',
    'approve_admin_tasks',
    'manage_incoming_docs',
    'view_confidential_docs',
    'send_urgent_remind',
    'view_reports_kpi',
    'access_coordinator',
    'access_admin_portal',
  ],
  chanh_van_phong: [
    'view_all_tasks',
    'create_assign_tasks',
    'approve_admin_tasks',
    'manage_incoming_docs',
    'send_urgent_remind',
    'view_reports_kpi',
    'access_coordinator',
    'access_admin_portal',
  ],
  uy_vien: [
    'view_all_tasks',
    'create_assign_tasks',
  ],
};
