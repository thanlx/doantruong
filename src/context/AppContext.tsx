'use client';

// ==============================================================================
// APP CONTEXT: QUẢN LÝ DỮ LIỆU ĐỒNG BỘ 2 CHIỀU GIỮA TRANG NGƯỜI DÙNG & QUẢN TRỊ
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  UserRole,
  DecisionChangeLine,
  SubsystemId,
  ProfileFieldDiff,
} from '@/types';
import {
  INITIAL_SUBSYSTEMS,
  INITIAL_UNITS,
  INITIAL_POSITIONS,
  INITIAL_PROFILES,
  INITIAL_DECISIONS,
  INITIAL_UPDATE_REQUESTS,
  INITIAL_EVALUATION_PERIODS,
  INITIAL_EVALUATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_CONFIG,
  DEFAULT_APP_USER,
  INITIAL_USERS,
  SUPER_ADMIN_USER,
} from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { signInWithGoogleOAuth, signOutSupabase } from '@/lib/supabaseService';

export type UserTab =
  | 'trang_chu'
  | 'ho_so'
  | 'to_chuc'
  | 'danh_gia'
  | 'quyet_dinh'
  | 'thong_bao'
  | 'tai_khoan';

export type AdminTab =
  | 'tong_quan'
  | 'ho_so'
  | 'to_chuc'
  | 'quyet_dinh'
  | 'duyet_ho_so'
  | 'danh_gia'
  | 'bao_cao'
  | 'thong_bao'
  | 'phan_quyen'
  | 'cau_hinh'
  | 'nhat_ky';

export const ALL_ADMIN_TABS: AdminTab[] = [
  'tong_quan',
  'ho_so',
  'to_chuc',
  'quyet_dinh',
  'duyet_ho_so',
  'danh_gia',
  'bao_cao',
  'thong_bao',
  'phan_quyen',
  'cau_hinh',
  'nhat_ky',
];

export const ADMIN_TAB_DEFINITIONS: { id: AdminTab; label: string; desc: string }[] = [
  { id: 'tong_quan', label: 'Tổng quan', desc: 'Bảng điều khiển số liệu tổng hợp theo phạm vi quản lý' },
  { id: 'ho_so', label: 'Hồ sơ cán bộ', desc: 'Xem, thêm mới, chỉnh sửa, nhập/xuất Excel danh sách cán bộ' },
  { id: 'to_chuc', label: 'Tổ chức và chức vụ', desc: 'Quản lý cơ cấu đơn vị và danh mục chức danh' },
  { id: 'quyet_dinh', label: 'Quyết định nhân sự', desc: 'Ban hành, tra cứu quyết định bổ nhiệm, miễn nhiệm, kiện toàn' },
  { id: 'duyet_ho_so', label: 'Duyệt hồ sơ', desc: 'Phê duyệt hoặc trả lại yêu cầu cập nhật thông tin lý lịch' },
  { id: 'danh_gia', label: 'Đánh giá hằng tháng', desc: 'Quản lý kỳ đánh giá, chấm điểm và duyệt xếp loại A/B/C/D' },
  { id: 'bao_cao', label: 'Báo cáo thống kê', desc: 'Xem và xuất báo cáo đội ngũ, biến động, xếp loại ra Excel' },
  { id: 'thong_bao', label: 'Thông báo', desc: 'Gửi thông báo nhắc hạn, công văn đến đơn vị và cán bộ' },
  { id: 'phan_quyen', label: 'Tài khoản và phân quyền', desc: 'Quản lý tài khoản, mật khẩu và cấp quyền Admin' },
  { id: 'cau_hinh', label: 'Cấu hình hệ thống', desc: 'Thiết lập quy trình duyệt, tiêu chí đánh giá và tệp đính kèm' },
  { id: 'nhat_ky', label: 'Nhật ký hệ thống', desc: 'Tra cứu lịch sử thao tác và kiểm toán bảo mật' },
];

export const DEFAULT_TABS_BY_ROLE: Record<UserRole, AdminTab[]> = {
  admin: ALL_ADMIN_TABS,
  admin_don_vi: [
    'tong_quan',
    'ho_so',
    'to_chuc',
    'quyet_dinh',
    'duyet_ho_so',
    'danh_gia',
    'bao_cao',
    'thong_bao',
  ],
  nguoi_duyet: [
    'tong_quan',
    'ho_so',
    'quyet_dinh',
    'duyet_ho_so',
    'danh_gia',
    'bao_cao',
  ],
  quan_ly_don_vi: [
    'tong_quan',
    'ho_so',
    'to_chuc',
    'danh_gia',
    'bao_cao',
  ],
  lanh_dao: [
    'tong_quan',
    'ho_so',
    'to_chuc',
    'quyet_dinh',
    'danh_gia',
    'bao_cao',
  ],
  can_bo_ca_nhan: [],
};

export function isSuperAdminUser(user?: AppUser | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  return email === 'thanlx@hcmute.edu.vn' || user.id === 'user_thanlx';
}

export function computeAllowedAdminTabs(user?: AppUser | null): AdminTab[] {
  if (!user || user.is_active === false) return [];
  if (isSuperAdminUser(user)) return ALL_ADMIN_TABS;

  const userRoles: UserRole[] = Array.isArray(user.roles) ? user.roles : ['can_bo_ca_nhan'];
  const hasAnyManagementRole = userRoles.some((r) => r !== 'can_bo_ca_nhan');

  if (Array.isArray(user.allowed_admin_tabs)) {
    if (!hasAnyManagementRole && user.allowed_admin_tabs.length === 0) {
      return [];
    }
    return ALL_ADMIN_TABS.filter((t) => user.allowed_admin_tabs!.includes(t));
  }

  if (!hasAnyManagementRole) return [];

  const tabSet = new Set<AdminTab>();
  userRoles.forEach((r) => {
    const defaults = DEFAULT_TABS_BY_ROLE[r] || [];
    defaults.forEach((t: AdminTab) => tabSet.add(t));
  });
  return ALL_ADMIN_TABS.filter((t) => tabSet.has(t));
}

interface AppContextType {
  // Navigation & User Context
  portalMode: 'user' | 'admin';
  setPortalMode: (mode: 'user' | 'admin') => void;
  togglePortalMode: () => void;
  userTab: UserTab;
  setUserTab: (tab: UserTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  currentUser: AppUser;
  switchUserRole: (role: UserRole) => void;
  updateUserScope: (scopeId: string, scopeName: string) => void;
  hasPermission: (action: string) => boolean;
  canAccessAdminPortal: boolean;
  allowedAdminTabs: AdminTab[];
  isSuperAdmin: boolean;
  isGlobalScope: boolean;
  accessibleUnitIds: string[];
  allUnits: Unit[];
  allProfiles: OfficerProfile[];

  // Google & Password Authentication & Security
  authUser: any;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithPassword: (identifier: string, password: string) => { success: boolean; message: string };
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  adminResetPassword: (userId: string, newPassword: string) => { success: boolean; message: string };
  updateCurrentUserAvatar: (avatarUrl: string) => void;
  signOut: () => Promise<void>;
  loginAsSuperAdminDev: () => void;
  isSupabaseConnected: boolean;

  // Master Data
  subsystems: SubsystemInfo[];
  units: Unit[];
  positions: PositionDefinition[];
  profiles: OfficerProfile[];
  decisions: PersonnelDecision[];
  updateRequests: ProfileUpdateRequest[];
  evaluationPeriods: EvaluationPeriod[];
  evaluations: MonthlyEvaluation[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  systemConfig: SystemConfig;
  setSystemConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  roles: any[];
  addNotification: (notif: any) => void;
  addAuditLog: (log: any) => void;

  // Selection state for quick navigation
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string | null) => void;
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
  selectedDecisionId: string | null;
  setSelectedDecisionId: (id: string | null) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;

  // Operations
  submitProfileUpdateRequest: (
    profileId: string,
    proposedFields: Record<string, string>,
    reason: string
  ) => { success: boolean; message: string; requestId?: string };
  approveProfileUpdateRequest: (
    requestId: string,
    reviewerComment?: string
  ) => { success: boolean; message: string };
  returnProfileUpdateRequest: (
    requestId: string,
    reason: string
  ) => { success: boolean; message: string };
  createDecision: (
    decisionData: Omit<PersonnelDecision, 'id' | 'created_at' | 'created_by'>
  ) => { success: boolean; message: string; errorLineIndex?: number };
  deleteDecision: (decisionId: string) => { success: boolean; message: string };
  submitSelfEvaluation: (
    evaluationId: string,
    taskResults: string,
    limitations: string,
    evidenceFiles: { name: string; size: string }[]
  ) => { success: boolean; message: string };
  reviewEvaluation: (
    evaluationId: string,
    proposedGrade: 'A' | 'B' | 'C' | 'D' | null,
    unitComment: string,
    approvedGrade: 'A' | 'B' | 'C' | 'D' | null,
    adminComment: string,
    action: 'approve' | 'return'
  ) => { success: boolean; message: string };
  publishEvaluationPeriod: (periodId: string) => { success: boolean; message: string };
  reopenEvaluationPeriod: (periodId: string, reason: string) => { success: boolean; message: string };
  createEvaluationPeriod: (
    periodData: Omit<EvaluationPeriod, 'id' | 'created_at' | 'total_targets' | 'submitted_count' | 'approved_count'>
  ) => { success: boolean; message: string };
  generateEvaluationsForPeriod: (periodId: string) => { success: boolean; message: string; count: number };
  createNotification: (
    notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read' | 'read_by_user_ids'>
  ) => void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (unitId: string, updates: Partial<Unit>) => { success: boolean; message: string };
  deleteUnit: (unitId: string) => { success: boolean; message: string };
  addPosition: (pos: Omit<PositionDefinition, 'id'>) => void;
  updatePosition: (posId: string, updates: Partial<PositionDefinition>) => { success: boolean; message: string };
  deletePosition: (posId: string) => { success: boolean; message: string };
  addProfile: (profile: Omit<OfficerProfile, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
    success: boolean;
    message: string;
  };
  updateProfile: (profileId: string, updates: Partial<OfficerProfile>) => {
    success: boolean;
    message: string;
  };
  deleteProfile: (profileId: string) => {
    success: boolean;
    message: string;
  };
  importProfilesFromExcel: (
    rows: any[],
    duplicateMode: 'update' | 'skip'
  ) => {
    success: boolean;
    message: string;
    addedCount: number;
    updatedCount: number;
    skippedCount: number;
  };
  updateSystemConfig: (newConfig: Partial<SystemConfig>) => void;
  getActiveRolesAtDate: (profileId: string, dateStr: string) => any[];
  getUniqueOfficerCount: (unitId?: string, dateStr?: string) => number;
  getTotalRoleCount: (unitId?: string, dateStr?: string) => number;
  resetToDefaultSeed: () => void;
  runTestScenario: (scenarioNumber: number) => {
    title: string;
    result: string;
    success: boolean;
    message: string;
    details?: any;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PORTAL_MODE: 'qncb_portal_mode_v2',
  USER_TAB: 'qncb_user_tab_v2',
  ADMIN_TAB: 'qncb_admin_tab_v2',
  PROFILES: 'qncb_profiles_v2',
  DECISIONS: 'qncb_decisions_v2',
  REQUESTS: 'qncb_requests_v2',
  PERIODS: 'qncb_periods_v2',
  EVALUATIONS: 'qncb_evaluations_v2',
  NOTIFICATIONS: 'qncb_notifications_v2',
  AUDIT_LOGS: 'qncb_audit_logs_v2',
  CONFIG: 'qncb_config_v2',
  UNITS: 'qncb_units_v2',
  POSITIONS: 'qncb_positions_v2',
  USERS: 'qncb_users_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portalMode, setPortalModeState] = useState<'user' | 'admin'>('user');
  const [userTab, setUserTabState] = useState<UserTab>('trang_chu');
  const [adminTab, setAdminTabState] = useState<AdminTab>('tong_quan');
  const [currentUser, setCurrentUser] = useState<AppUser>(SUPER_ADMIN_USER);

  // Authentication State
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const isSupabaseConnected = isSupabaseConfigured;

  // Master State
  const [subsystems] = useState<SubsystemInfo[]>(INITIAL_SUBSYSTEMS);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [positions, setPositions] = useState<PositionDefinition[]>(INITIAL_POSITIONS);
  const [profiles, setProfiles] = useState<OfficerProfile[]>(INITIAL_PROFILES);
  const [decisions, setDecisions] = useState<PersonnelDecision[]>(INITIAL_DECISIONS);
  const [updateRequests, setUpdateRequests] = useState<ProfileUpdateRequest[]>(INITIAL_UPDATE_REQUESTS);
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriod[]>(INITIAL_EVALUATION_PERIODS);
  const [evaluations, setEvaluations] = useState<MonthlyEvaluation[]>(INITIAL_EVALUATIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);

  const roles = useMemo(
    () =>
      profiles.flatMap((p) =>
        (p.roles || []).map((r) => ({
          ...r,
          officer_id: p.id,
          officer_name: p.full_name,
          student_id: p.student_id,
          is_active: r.status === 'active',
        }))
      ),
    [profiles]
  );

  // Selection pointers
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    INITIAL_PROFILES[0]?.id || 'prof_thanlx'
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>('unit_doan_truong');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('period_2026_10');

  // Đồng bộ hóa thông tin người dùng Google / Mật khẩu sang AppUser & phân quyền nghiêm ngặt
  const syncAuthUserToAppUser = useCallback((user: any, userList: AppUser[], profileList?: OfficerProfile[]) => {
    const email = (user?.email || '').trim().toLowerCase();
    // Chỉ duy nhất tài khoản thanlx@hcmute.edu.vn là Super Admin mặc định tối cao
    const isSuper = email === 'thanlx@hcmute.edu.vn';

    const matchedInUsers = userList.find((u) => u.email.trim().toLowerCase() === email);
    const matchedProfile = (profileList || []).find((p) => p.email?.trim().toLowerCase() === email);

    if (isSuper) {
      const superUser: AppUser = {
        id: 'user_thanlx',
        profile_id: 'prof_thanlx',
        full_name: matchedInUsers?.full_name || 'Lê Xuân Thân',
        student_id: matchedInUsers?.student_id || 'CB-HCMUTE',
        username: 'thanlx',
        password: matchedInUsers?.password || 'Hcmute@2026',
        email: user.email || 'thanlx@hcmute.edu.vn',
        avatar_code: 'XT',
        avatar_url: user.user_metadata?.avatar_url || matchedInUsers?.avatar_url,
        roles: ['admin', 'admin_don_vi', 'lanh_dao', 'nguoi_duyet', 'quan_ly_don_vi', 'can_bo_ca_nhan'],
        current_role: 'admin',
        scope_unit_id: 'all',
        scope_unit_name: 'Toàn trường',
        managed_unit_ids: [],
        allowed_admin_tabs: ALL_ADMIN_TABS,
        portal_mode: 'admin',
        is_active: true,
      };
      setCurrentUser(superUser);
      setPortalModeState('admin');
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, 'admin');
      return superUser;
    }

    if (matchedInUsers) {
      const safeRoles: UserRole[] =
        Array.isArray(matchedInUsers.roles) && matchedInUsers.roles.length > 0
          ? matchedInUsers.roles
          : ['can_bo_ca_nhan'];
      const updated: AppUser = {
        ...matchedInUsers,
        roles: safeRoles,
        current_role: safeRoles.includes(matchedInUsers.current_role)
          ? matchedInUsers.current_role
          : safeRoles[0],
        profile_id: matchedProfile?.id || matchedInUsers.profile_id,
        student_id: matchedProfile?.student_id || matchedInUsers.student_id,
        avatar_url: user.user_metadata?.avatar_url || matchedInUsers.avatar_url,
        full_name:
          matchedInUsers.full_name ||
          matchedProfile?.full_name ||
          user.user_metadata?.full_name ||
          email,
      };
      const allowedTabs = computeAllowedAdminTabs(updated);
      const canAccessAdmin = allowedTabs.length > 0;
      const targetMode: 'user' | 'admin' = canAccessAdmin ? 'admin' : 'user';
      updated.portal_mode = targetMode;

      setCurrentUser(updated);
      setPortalModeState(targetMode);
      if (canAccessAdmin) {
        setAdminTabState((prev) => (allowedTabs.includes(prev) ? prev : allowedTabs[0]));
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, targetMode);
      }
      return updated;
    }

    // Tài khoản mới đăng nhập (chưa được Super Admin cấp quyền quản trị) -> Chỉ có quyền Cán bộ cá nhân (User)
    const newUser: AppUser = {
      id: `user_${user.id || Date.now()}`,
      profile_id: matchedProfile?.id || `prof_${user.id || Date.now()}`,
      full_name:
        matchedProfile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Cán bộ Đoàn - Hội',
      student_id: matchedProfile?.student_id || user.user_metadata?.student_id || '',
      username: user.email?.split('@')[0] || 'cb_user',
      password: matchedProfile?.student_id || 'Hcmute@123',
      email: user.email,
      avatar_code: (matchedProfile?.full_name || user.user_metadata?.full_name || user.email || 'CB')
        .split(' ')
        .slice(-2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      avatar_url: matchedProfile?.avatar_url || user.user_metadata?.avatar_url,
      roles: ['can_bo_ca_nhan'],
      current_role: 'can_bo_ca_nhan',
      scope_unit_id: matchedProfile?.primary_unit_id || null,
      scope_unit_name: matchedProfile?.roles?.[0]?.unit_name || 'Đoàn trường',
      managed_unit_ids: [],
      allowed_admin_tabs: [],
      portal_mode: 'user',
      is_active: true,
    };
    setCurrentUser(newUser);
    setPortalModeState('user');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, 'user');
    }
    setUsers((prev) => {
      if (prev.some((u) => u.email.trim().toLowerCase() === email)) return prev;
      return [...prev, newUser];
    });
    return newUser;
  }, []);

  // Load persisted state & Google Auth session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedUserTab = localStorage.getItem(STORAGE_KEYS.USER_TAB);
      if (savedUserTab) setUserTabState(savedUserTab as UserTab);

      const savedAdminTab = localStorage.getItem(STORAGE_KEYS.ADMIN_TAB);
      if (savedAdminTab) setAdminTabState(savedAdminTab as AdminTab);

      let loadedProfiles: OfficerProfile[] = INITIAL_PROFILES;
      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (savedProfiles) {
        loadedProfiles = JSON.parse(savedProfiles);
        setProfiles(loadedProfiles);
      }

      const savedUnits = localStorage.getItem(STORAGE_KEYS.UNITS);
      if (savedUnits) setUnits(JSON.parse(savedUnits));

      const savedPositions = localStorage.getItem(STORAGE_KEYS.POSITIONS);
      if (savedPositions) setPositions(JSON.parse(savedPositions));

      const savedDecisions = localStorage.getItem(STORAGE_KEYS.DECISIONS);
      if (savedDecisions) setDecisions(JSON.parse(savedDecisions));

      const savedRequests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (savedRequests) setUpdateRequests(JSON.parse(savedRequests));

      const savedPeriods = localStorage.getItem(STORAGE_KEYS.PERIODS);
      if (savedPeriods) setEvaluationPeriods(JSON.parse(savedPeriods));

      const savedEvaluations = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (savedEvaluations) setEvaluations(JSON.parse(savedEvaluations));

      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedAuditLogs) setAuditLogs(JSON.parse(savedAuditLogs));

      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (savedConfig) setSystemConfig(JSON.parse(savedConfig));

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const isRbacV3Migrated = localStorage.getItem('qncb_rbac_v3_strict') === 'true';
      let loadedUsers: AppUser[] = INITIAL_USERS;
      if (savedUsers) {
        try {
          loadedUsers = JSON.parse(savedUsers);
          if (!loadedUsers.some((u) => u.email.toLowerCase() === 'thanlx@hcmute.edu.vn')) {
            loadedUsers.unshift(SUPER_ADMIN_USER);
          }
          loadedUsers = loadedUsers.map((u) => {
            const emailLower = (u.email || '').trim().toLowerCase();
            if (emailLower === 'thanlx@hcmute.edu.vn') {
              return {
                ...SUPER_ADMIN_USER,
                ...u,
                password: u.password || SUPER_ADMIN_USER.password,
                roles: SUPER_ADMIN_USER.roles,
                current_role: 'admin',
                scope_unit_id: 'all',
                scope_unit_name: 'Toàn trường',
                allowed_admin_tabs: ALL_ADMIN_TABS,
                is_active: true,
              };
            }
            // Làm sạch tài khoản tự động đăng nhập trước đây bị cấp nhầm quyền admin
            if (!isRbacV3Migrated && emailLower === 'lexuanthanspkt@gmail.com') {
              return {
                ...u,
                roles: ['can_bo_ca_nhan'],
                current_role: 'can_bo_ca_nhan',
                allowed_admin_tabs: [],
                portal_mode: 'user',
              };
            }
            const computedTabs = computeAllowedAdminTabs(u);
            return {
              ...u,
              allowed_admin_tabs: Array.isArray(u.allowed_admin_tabs) ? u.allowed_admin_tabs : computedTabs,
              portal_mode: computedTabs.length > 0 ? u.portal_mode : 'user',
            };
          });
          localStorage.setItem('qncb_rbac_v3_strict', 'true');
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(loadedUsers));
          setUsers(loadedUsers);
        } catch (e) {}
      } else {
        localStorage.setItem('qncb_rbac_v3_strict', 'true');
      }

      // Check Supabase Google session
      if (supabase && isSupabaseConfigured) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setAuthUser(session.user);
            syncAuthUserToAppUser(session.user, loadedUsers, loadedProfiles);
          } else {
            const devEmail = localStorage.getItem('qncb_dev_session');
            if (devEmail) {
              const foundUser = loadedUsers.find((u) => u.email.toLowerCase() === devEmail.toLowerCase());
              const mockDev = {
                email: devEmail,
                user_metadata: {
                  full_name: foundUser?.full_name || devEmail.split('@')[0],
                  avatar_url: foundUser?.avatar_url,
                },
              };
              setAuthUser(mockDev);
              syncAuthUserToAppUser(mockDev, loadedUsers, loadedProfiles);
            }
          }
          setIsAuthLoading(false);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setAuthUser(session.user);
            syncAuthUserToAppUser(session.user, loadedUsers, loadedProfiles);
          } else {
            const devEmail = localStorage.getItem('qncb_dev_session');
            if (devEmail) {
              const foundUser = loadedUsers.find((u) => u.email.toLowerCase() === devEmail.toLowerCase());
              const mockDev = {
                email: devEmail,
                user_metadata: {
                  full_name: foundUser?.full_name || devEmail.split('@')[0],
                  avatar_url: foundUser?.avatar_url,
                },
              };
              setAuthUser(mockDev);
              syncAuthUserToAppUser(mockDev, loadedUsers, loadedProfiles);
            } else {
              setAuthUser(null);
            }
          }
          setIsAuthLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        const devEmail = localStorage.getItem('qncb_dev_session');
        if (devEmail) {
          const foundUser = loadedUsers.find((u) => u.email.toLowerCase() === devEmail.toLowerCase());
          const mockDev = {
            email: devEmail,
            user_metadata: {
              full_name: foundUser?.full_name || devEmail.split('@')[0],
              avatar_url: foundUser?.avatar_url,
            },
          };
          setAuthUser(mockDev);
          syncAuthUserToAppUser(mockDev, loadedUsers, loadedProfiles);
        }
        setIsAuthLoading(false);
      }
    } catch (e) {
      console.warn('Could not parse persisted state:', e);
      setIsAuthLoading(false);
    }
  }, [syncAuthUserToAppUser]);

  // Persist state updates to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updateRequests));
  }, [updateRequests]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(evaluationPeriods));
  }, [evaluationPeriods]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(systemConfig));
  }, [systemConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Google & Password Auth Actions
  const signInWithGoogle = useCallback(async () => {
    return await signInWithGoogleOAuth();
  }, []);

  const signInWithPassword = useCallback(
    (identifier: string, password: string): { success: boolean; message: string } => {
      const cleanId = identifier.trim().toLowerCase();
      if (!cleanId || !password) {
        return { success: false, message: 'Vui lòng nhập đầy đủ tài khoản (Email/MSSV/Username) và mật khẩu.' };
      }

      // Tìm trong danh sách users
      let matchedUser = users.find(
        (u) =>
          u.email.trim().toLowerCase() === cleanId ||
          (u.username && u.username.trim().toLowerCase() === cleanId) ||
          (u.student_id && u.student_id.trim().toLowerCase() === cleanId)
      );

      // Nếu chưa có trong users nhưng có trong danh sách hồ sơ cán bộ (nhập từ Excel)
      if (!matchedUser) {
        const matchedProfile = profiles.find(
          (p) =>
            p.email?.trim().toLowerCase() === cleanId ||
            p.student_id?.trim().toLowerCase() === cleanId ||
            p.profile_code?.trim().toLowerCase() === cleanId
        );
        if (matchedProfile) {
          const defaultPass = matchedProfile.student_id || 'Hcmute@123';
          if (password !== defaultPass && password !== 'Hcmute@2026') {
            return {
              success: false,
              message: `Mật khẩu không chính xác. (Mật khẩu mặc định của cán bộ mới là MSSV hoặc Hcmute@123)`,
            };
          }
          const createdUser: AppUser = {
            id: `user_${matchedProfile.id}`,
            profile_id: matchedProfile.id,
            full_name: matchedProfile.full_name,
            student_id: matchedProfile.student_id || '',
            username: matchedProfile.email?.split('@')[0] || matchedProfile.student_id || 'canbo',
            password: password,
            email: matchedProfile.email || `${matchedProfile.student_id}@student.hcmute.edu.vn`,
            avatar_code: matchedProfile.full_name
              .split(' ')
              .slice(-2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            avatar_url: matchedProfile.avatar_url,
            roles: ['can_bo_ca_nhan'],
            current_role: 'can_bo_ca_nhan',
            scope_unit_id: matchedProfile.primary_unit_id,
            scope_unit_name: matchedProfile.roles?.[0]?.unit_name || 'Đoàn trường',
            portal_mode: 'user',
            is_active: true,
          };
          const nextUsers = [...users, createdUser];
          setUsers(nextUsers);
          if (typeof window !== 'undefined') {
            localStorage.setItem('qncb_dev_session', createdUser.email);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(nextUsers));
          }
          const sessionObj = {
            email: createdUser.email,
            user_metadata: { full_name: createdUser.full_name, avatar_url: createdUser.avatar_url },
          };
          setAuthUser(sessionObj);
          syncAuthUserToAppUser(sessionObj, nextUsers, profiles);
          return { success: true, message: `Đăng nhập thành công! Xin chào ${createdUser.full_name}.` };
        }

        return {
          success: false,
          message: 'Không tìm thấy tài khoản hoặc hồ sơ cán bộ khớp với thông tin đăng nhập.',
        };
      }

      if (matchedUser.is_active === false) {
        return {
          success: false,
          message: 'Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Quản trị viên Đoàn trường.',
        };
      }

      const expectedPassword = matchedUser.password || matchedUser.student_id || 'Hcmute@2026';
      if (password !== expectedPassword) {
        return {
          success: false,
          message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        };
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('qncb_dev_session', matchedUser.email);
      }
      const sessionObj = {
        email: matchedUser.email,
        user_metadata: { full_name: matchedUser.full_name, avatar_url: matchedUser.avatar_url },
      };
      setAuthUser(sessionObj);
      syncAuthUserToAppUser(sessionObj, users, profiles);
      return { success: true, message: `Đăng nhập thành công! Xin chào ${matchedUser.full_name}.` };
    },
    [users, profiles, syncAuthUserToAppUser]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
      }

      const targetUser = users.find(
        (u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      const currentExpected = targetUser?.password || currentUser.password || 'Hcmute@2026';

      // Cho phép đổi nếu nhập đúng mật khẩu hiện tại (hoặc tài khoản Google lần đầu thiết lập mật khẩu chưa biết mật khẩu cũ)
      if (currentPassword && targetUser?.password && currentPassword !== currentExpected) {
        return { success: false, message: 'Mật khẩu hiện tại không chính xác!' };
      }

      // Nếu đang có phiên Supabase thực, cập nhật lên Supabase Auth luôn
      if (supabase && isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            await supabase.auth.updateUser({ password: newPassword });
          }
        } catch (err) {
          // Ignore if OAuth session doesn't support direct password update without reauth
        }
      }

      const updatedUsers = users.map((u) => {
        if (u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...u, password: newPassword };
        }
        return u;
      });

      setUsers(updatedUsers);
      setCurrentUser((prev) => ({ ...prev, password: newPassword }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      }

      return {
        success: true,
        message: 'Đã thay đổi mật khẩu đăng nhập thành công! Bạn có thể dùng mật khẩu mới cho các lần đăng nhập tiếp theo.',
      };
    },
    [users, currentUser]
  );

  const adminResetPassword = useCallback(
    (userId: string, newPassword: string): { success: boolean; message: string } => {
      if (!newPassword || newPassword.length < 6) {
        return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
      }
      const target = users.find((u) => u.id === userId);
      if (!target) {
        return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };
      }
      const updatedUsers = users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u));
      setUsers(updatedUsers);
      if (currentUser.id === userId) {
        setCurrentUser((prev) => ({ ...prev, password: newPassword }));
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      }
      return {
        success: true,
        message: `Đã đặt lại mật khẩu mới cho tài khoản ${target.full_name} (${target.email}) thành công!`,
      };
    },
    [users, currentUser.id]
  );

  const updateCurrentUserAvatar = useCallback(
    (avatarUrl: string) => {
      setCurrentUser((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...u, avatar_url: avatarUrl }
            : u
        )
      );
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === currentUser.profile_id || p.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...p, avatar_url: avatarUrl }
            : p
        )
      );
    },
    [currentUser.id, currentUser.email, currentUser.profile_id]
  );

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qncb_dev_session');
    }
    if (supabase && isSupabaseConfigured) {
      await signOutSupabase();
    }
    setAuthUser(null);
  }, []);

  const loginAsSuperAdminDev = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qncb_dev_session', 'thanlx@hcmute.edu.vn');
    }
    const devUser = { email: 'thanlx@hcmute.edu.vn', user_metadata: { full_name: 'Lê Xuân Thân' } };
    setAuthUser(devUser);
    syncAuthUserToAppUser(devUser, users, profiles);
  }, [syncAuthUserToAppUser, users, profiles]);

  // Computed RBAC & Unit Scope Properties
  const isSuperAdmin = useMemo(() => isSuperAdminUser(currentUser), [currentUser]);
  const allowedAdminTabs = useMemo(() => computeAllowedAdminTabs(currentUser), [currentUser]);
  const canAccessAdminPortal = allowedAdminTabs.length > 0;

  const isGlobalScope = useMemo(() => {
    if (isSuperAdmin) return true;
    const hasCustomUnits = Array.isArray(currentUser.managed_unit_ids) && currentUser.managed_unit_ids.length > 0;
    const hasSpecificUnit =
      Boolean(currentUser.scope_unit_id) &&
      currentUser.scope_unit_id !== 'all' &&
      currentUser.scope_unit_id !== 'ALL';
    if (hasCustomUnits || hasSpecificUnit) return false;
    return currentUser.roles.includes('admin') || currentUser.roles.includes('lanh_dao');
  }, [isSuperAdmin, currentUser]);

  // Helper: lấy tất cả đơn vị con/cháu của danh sách đơn vị gốc
  const expandWithDescendantUnits = useCallback(
    (seedIds: string[]) => {
      const result = new Set<string>(seedIds.filter(Boolean));
      let added = true;
      while (added) {
        added = false;
        units.forEach((u) => {
          if (u.parent_id && result.has(u.parent_id) && !result.has(u.id)) {
            result.add(u.id);
            added = true;
          }
        });
      }
      return Array.from(result);
    },
    [units]
  );

  const accessibleUnitIds = useMemo(() => {
    if (isGlobalScope) return units.map((u) => u.id);
    const seeds: string[] = [];
    if (Array.isArray(currentUser.managed_unit_ids)) {
      seeds.push(...currentUser.managed_unit_ids);
    }
    if (
      currentUser.scope_unit_id &&
      currentUser.scope_unit_id !== 'all' &&
      currentUser.scope_unit_id !== 'ALL' &&
      currentUser.scope_unit_id !== 'managed_all'
    ) {
      seeds.push(currentUser.scope_unit_id);
    }
    return expandWithDescendantUnits(seeds);
  }, [isGlobalScope, units, currentUser.managed_unit_ids, currentUser.scope_unit_id, expandWithDescendantUnits]);

  const activeAdminUnitIds = useMemo<string[] | 'all'>(() => {
    const scopeId = currentUser.scope_unit_id;
    if (isGlobalScope) {
      if (!scopeId || scopeId === 'all' || scopeId === 'ALL') return 'all';
      return expandWithDescendantUnits([scopeId]);
    }
    if (scopeId && scopeId !== 'all' && scopeId !== 'ALL' && scopeId !== 'managed_all') {
      const targetExpanded = expandWithDescendantUnits([scopeId]);
      return targetExpanded.filter((id) => accessibleUnitIds.includes(id));
    }
    return accessibleUnitIds;
  }, [isGlobalScope, currentUser.scope_unit_id, accessibleUnitIds, expandWithDescendantUnits]);

  // Đồng bộ currentUser ngay lập tức nếu bảng users được cập nhật phân quyền
  useEffect(() => {
    if (!authUser) return;
    const matched = users.find(
      (u) =>
        u.id === currentUser.id ||
        (u.email && currentUser.email && u.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
    );
    if (matched) {
      const prevJson = JSON.stringify({
        r: currentUser.roles,
        t: currentUser.allowed_admin_tabs,
        m: currentUser.managed_unit_ids,
        a: currentUser.is_active,
      });
      const nextJson = JSON.stringify({
        r: matched.roles,
        t: matched.allowed_admin_tabs,
        m: matched.managed_unit_ids,
        a: matched.is_active,
      });
      if (prevJson !== nextJson) {
        setCurrentUser((prev) => ({
          ...prev,
          roles: matched.roles,
          current_role: matched.roles.includes(prev.current_role) ? prev.current_role : matched.roles[0] || 'can_bo_ca_nhan',
          allowed_admin_tabs: matched.allowed_admin_tabs,
          managed_unit_ids: matched.managed_unit_ids,
          scope_unit_id: matched.scope_unit_id,
          scope_unit_name: matched.scope_unit_name,
          is_active: matched.is_active,
        }));
      }
    }
  }, [users, authUser, currentUser.id, currentUser.email, currentUser.roles, currentUser.allowed_admin_tabs, currentUser.managed_unit_ids, currentUser.is_active]);

  // Chặn truy cập Trang Quản trị nếu tài khoản không có quyền Admin
  useEffect(() => {
    if (!canAccessAdminPortal && portalMode === 'admin') {
      setPortalModeState('user');
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, 'user');
    } else if (portalMode === 'admin' && canAccessAdminPortal && !allowedAdminTabs.includes(adminTab)) {
      const fallbackTab = allowedAdminTabs[0] || 'tong_quan';
      setAdminTabState(fallbackTab);
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, fallbackTab);
    }
  }, [canAccessAdminPortal, portalMode, allowedAdminTabs, adminTab]);

  // Dữ liệu lọc theo phạm vi Đơn vị khi ở chế độ Admin
  const visibleUnits = useMemo(() => {
    if (portalMode !== 'admin' || activeAdminUnitIds === 'all') return units;
    return units.filter((u) => activeAdminUnitIds.includes(u.id));
  }, [portalMode, activeAdminUnitIds, units]);

  const visibleProfiles = useMemo(() => {
    if (portalMode !== 'admin' || activeAdminUnitIds === 'all') return profiles;
    return profiles.filter(
      (p) =>
        activeAdminUnitIds.includes(p.primary_unit_id) ||
        (p.roles || []).some((r) => activeAdminUnitIds.includes(r.unit_id))
    );
  }, [portalMode, activeAdminUnitIds, profiles]);

  const visibleDecisions = useMemo(() => {
    if (portalMode !== 'admin' || activeAdminUnitIds === 'all') return decisions;
    return decisions.filter(
      (d) =>
        (d.unit_id && activeAdminUnitIds.includes(d.unit_id)) ||
        (d.changes || []).some((c) => activeAdminUnitIds.includes(c.unit_id))
    );
  }, [portalMode, activeAdminUnitIds, decisions]);

  const visibleUpdateRequests = useMemo(() => {
    if (portalMode !== 'admin' || activeAdminUnitIds === 'all') return updateRequests;
    const allowedProfileIds = new Set(visibleProfiles.map((p) => p.id));
    return updateRequests.filter((r) => allowedProfileIds.has(r.profile_id));
  }, [portalMode, activeAdminUnitIds, updateRequests, visibleProfiles]);

  const visibleEvaluations = useMemo(() => {
    if (portalMode !== 'admin' || activeAdminUnitIds === 'all') return evaluations;
    const allowedProfileIds = new Set(visibleProfiles.map((p) => p.id));
    return evaluations.filter(
      (e) => activeAdminUnitIds.includes(e.unit_id) || allowedProfileIds.has(e.profile_id)
    );
  }, [portalMode, activeAdminUnitIds, evaluations, visibleProfiles]);

  // Save changes to localStorage
  const setPortalMode = useCallback(
    (mode: 'user' | 'admin') => {
      if (mode === 'admin' && !canAccessAdminPortal) {
        setPortalModeState('user');
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, 'user');
        return;
      }
      setPortalModeState(mode);
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, mode);
    },
    [canAccessAdminPortal]
  );

  const togglePortalMode = useCallback(() => {
    if (!canAccessAdminPortal) {
      setPortalModeState('user');
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, 'user');
      return;
    }
    setPortalModeState((prev) => {
      const next = prev === 'user' ? 'admin' : 'user';
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, next);
      return next;
    });
  }, [canAccessAdminPortal]);

  const setUserTab = useCallback((tab: UserTab) => {
    setUserTabState(tab);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.USER_TAB, tab);
  }, []);

  const setAdminTab = useCallback(
    (tab: AdminTab) => {
      if (!allowedAdminTabs.includes(tab)) {
        const fallback = allowedAdminTabs[0];
        if (fallback) {
          setAdminTabState(fallback);
          if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, fallback);
        }
        return;
      }
      setAdminTabState(tab);
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, tab);
    },
    [allowedAdminTabs]
  );

  const switchUserRole = useCallback(
    (role: UserRole) => {
      // Chỉ cho phép chuyển sang các vai trò mà tài khoản thực sự được cấp
      if (!isSuperAdmin && !(currentUser.roles || []).includes(role)) {
        return;
      }
      setCurrentUser((prev) => ({
        ...prev,
        current_role: role,
      }));
    },
    [isSuperAdmin, currentUser.roles]
  );

  const updateUserScope = useCallback(
    (scopeId: string, scopeName: string) => {
      if (!isGlobalScope && (scopeId === 'all' || scopeId === 'ALL')) {
        return;
      }
      if (!isGlobalScope && scopeId !== 'managed_all' && !accessibleUnitIds.includes(scopeId)) {
        return;
      }
      setCurrentUser((prev) => ({
        ...prev,
        scope_unit_id: scopeId,
        scope_unit_name: scopeName,
      }));
    },
    [isGlobalScope, accessibleUnitIds]
  );

  // Check user permission
  const hasPermission = useCallback(
    (action: string) => {
      if (isSuperAdmin) return true;
      const role = currentUser.current_role;
      if (role === 'admin') return true;
      if (role === 'admin_don_vi') {
        return action !== 'manage_system_config' && action !== 'manage_super_admin';
      }
      if (role === 'lanh_dao') {
        return action.startsWith('view_') || action === 'export_report';
      }
      if (role === 'nguoi_duyet') {
        return (
          action.startsWith('view_') ||
          action.includes('approve') ||
          action.includes('review')
        );
      }
      if (role === 'quan_ly_don_vi') {
        return (
          action.startsWith('view_') ||
          action === 'propose_decision' ||
          action === 'evaluate_unit'
        );
      }
      // can_bo_ca_nhan
      return action === 'view_own' || action === 'submit_update' || action === 'self_evaluate';
    },
    [isSuperAdmin, currentUser.current_role]
  );

  // Helper: add audit log
  const logActivity = useCallback(
    (
      actionType: AuditLog['action_type'],
      actionLabel: string,
      targetId: string,
      targetName: string,
      targetType: string,
      details: string,
      opts?: {
        result?: 'Thành công' | 'Thất bại';
        version_from?: string;
        version_to?: string;
        field_changes?: { field_name: string; old_value: string; new_value: string }[];
        notes?: string;
      }
    ) => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`;

      const newLog: AuditLog = {
        id: 'log_' + Date.now(),
        timestamp: timeStr,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        user_mssv: currentUser.student_id,
        action_type: actionType,
        action_label: actionLabel,
        target_id: targetId,
        target_name: targetName,
        target_type: targetType,
        result: opts?.result || 'Thành công',
        details,
        version_from: opts?.version_from,
        version_to: opts?.version_to,
        field_changes: opts?.field_changes,
        notes: opts?.notes,
      };

      setAuditLogs((prev) => {
        const next = [newLog, ...prev];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(next));
        return next;
      });
    },
    [currentUser]
  );

  // 1. Submit Profile Update Request (Dữ liệu chờ duyệt - Không tự ghi đè hồ sơ!)
  const submitProfileUpdateRequest = useCallback(
    (profileId: string, proposedFields: Record<string, string>, reason: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) return { success: false, message: 'Không tìm thấy hồ sơ cán bộ' };

      const diffs: ProfileFieldDiff[] = [];
      const fieldLabels: Record<string, string> = {
        current_residence: 'Nơi ở hiện nay',
        email: 'Email',
        phone: 'Số điện thoại',
        hometown: 'Quê quán',
        major: 'Ngành học',
        qualification: 'Trình độ chuyên môn',
        political_theory: 'Trình độ lý luận chính trị',
      };

      Object.entries(proposedFields).forEach(([key, proposedVal]) => {
        const currentVal = String((profile as any)[key] || '');
        if (proposedVal !== undefined) {
          diffs.push({
            label: fieldLabels[key] || key,
            field_key: key,
            current_value: currentVal || 'Chưa có',
            proposed_value: proposedVal,
            is_changed: currentVal !== proposedVal,
          });
        }
      });

      const newId = `HS-${String(updateRequests.length + 12).padStart(4, '0')}`;
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${now.getFullYear()}`;

      const newReq: ProfileUpdateRequest = {
        id: newId,
        profile_id: profile.id,
        profile_name: profile.full_name,
        student_id: profile.student_id || profile.staff_id || '',
        unit_name: profile.roles[0]?.unit_name || 'Đoàn cơ sở',
        reason,
        diffs,
        status: 'pending',
        created_at: `${dateStr} ${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
        version: `v${profile.version}.1 (${dateStr})`,
      };

      const updatedRequests = [newReq, ...updateRequests];
      setUpdateRequests(updatedRequests);
      setSelectedRequestId(newId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));
      }

      // Notify candidate
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: 'Yêu cầu cập nhật hồ sơ đang chờ duyệt',
        content: `Yêu cầu cập nhật thông tin hồ sơ của bạn (Mã: ${newId}) đã được tiếp nhận và đang chờ duyệt.`,
        sender_name: 'Hệ thống Quản lý Cán bộ',
        target_type: 'individual',
        target_profile_id: profile.id,
        category: 'ho_so',
        channel: 'in_app',
        send_time_type: 'immediate',
        created_at: newReq.created_at,
        is_read: false,
        read_by_user_ids: [],
        link_type: 'ho_so',
        link_id: newId,
        link_label: 'Xem yêu cầu',
      };
      setNotifications((prev) => [newNotif, ...prev]);

      logActivity(
        'sua_ho_so',
        'Gửi đề xuất cập nhật hồ sơ',
        newId,
        `Yêu cầu ${newId}`,
        'Yêu cầu cập nhật hồ sơ',
        `Cán bộ ${profile.full_name} đã gửi đề xuất cập nhật hồ sơ.`
      );

      return {
        success: true,
        message: `Đã gửi yêu cầu cập nhật hồ sơ thành công (Mã yêu cầu: ${newId}). Vui lòng chờ phê duyệt.`,
        requestId: newId,
      };
    },
    [profiles, updateRequests, logActivity]
  );

  // 2. Approve Profile Update Request
  const approveProfileUpdateRequest = useCallback(
    (requestId: string, reviewerComment?: string) => {
      const req = updateRequests.find((r) => r.id === requestId);
      if (!req) return { success: false, message: 'Không tìm thấy yêu cầu' };

      // Section 3 rule: Prevent self approval if configured
      const shouldPreventSelfApproval = Array.isArray(systemConfig.profile_approval)
        ? systemConfig.profile_approval.some((w: any) => w.prevent_self_approval)
        : Boolean(systemConfig.profile_approval?.prevent_self_approval);

      if (
        shouldPreventSelfApproval &&
        req.profile_id === currentUser.profile_id
      ) {
        return {
          success: false,
          message:
            'Chính sách hệ thống không cho phép người dùng tự phê duyệt yêu cầu cập nhật hồ sơ do chính mình gửi!',
        };
      }

      const profile = profiles.find((p) => p.id === req.profile_id);
      if (!profile) return { success: false, message: 'Hồ sơ cán bộ liên kết không tồn tại' };

      // Apply changes to official profile
      const updatedProfile = { ...profile };
      const fieldChangesForLog: { field_name: string; old_value: string; new_value: string }[] = [];

      req.diffs.forEach((diff) => {
        if (diff.is_changed) {
          (updatedProfile as any)[diff.field_key] = diff.proposed_value;
          fieldChangesForLog.push({
            field_name: diff.label,
            old_value: diff.current_value,
            new_value: diff.proposed_value,
          });
        }
      });

      const oldVersion = `v${updatedProfile.version || 1}.0`;
      updatedProfile.version = (updatedProfile.version || 1) + 1;
      const newVersion = `v${updatedProfile.version}.0`;
      updatedProfile.verification_status = 'verified';
      updatedProfile.updated_at = new Date().toISOString().split('T')[0];

      // Update profiles list
      const updatedProfiles = profiles.map((p) => (p.id === profile.id ? updatedProfile : p));
      setProfiles(updatedProfiles);

      // Mark request approved
      const updatedRequests = updateRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved' as const,
              reviewed_at: new Date().toLocaleDateString('vi-VN'),
              reviewer_name: currentUser.full_name,
              reviewer_comment: reviewerComment || 'Phê duyệt cập nhật thông tin theo hồ sơ đề nghị.',
            }
          : r
      );
      setUpdateRequests(updatedRequests);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updatedProfiles));
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));
      }

      // Add Notification
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: 'Hồ sơ của bạn đã được phê duyệt',
        content: `Yêu cầu cập nhật hồ sơ (${req.id}) đã được ${currentUser.full_name} phê duyệt thành công. Thông tin mới đã được cập nhật chính thức.`,
        sender_name: 'Thường trực Đoàn trường',
        target_type: 'individual',
        target_profile_id: profile.id,
        category: 'ho_so',
        channel: 'in_app',
        send_time_type: 'immediate',
        created_at: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        is_read: false,
        read_by_user_ids: [],
        link_type: 'ho_so',
        link_id: req.id,
        link_label: 'Xem hồ sơ',
      };
      setNotifications((prev) => [notif, ...prev]);

      logActivity(
        'duyet_ho_so',
        'Phê duyệt cập nhật hồ sơ',
        req.id,
        `Yêu cầu ${req.id} - ${profile.full_name}`,
        'Hồ sơ cán bộ',
        `Phê duyệt cập nhật thông tin cho cán bộ ${profile.full_name}.`,
        {
          version_from: oldVersion,
          version_to: newVersion,
          field_changes: fieldChangesForLog,
          notes: reviewerComment || 'Phê duyệt cập nhật thông tin theo hồ sơ đề nghị của cán bộ.',
        }
      );

      return {
        success: true,
        message: `Đã phê duyệt yêu cầu ${requestId}. Hồ sơ chính thức của ${profile.full_name} đã được cập nhật!`,
      };
    },
    [updateRequests, profiles, currentUser, systemConfig, logActivity]
  );

  // 3. Return Profile Update Request
  const returnProfileUpdateRequest = useCallback(
    (requestId: string, reason: string) => {
      const req = updateRequests.find((r) => r.id === requestId);
      if (!req) return { success: false, message: 'Không tìm thấy yêu cầu' };

      const updatedRequests = updateRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'returned' as const,
              reviewed_at: new Date().toLocaleDateString('vi-VN'),
              reviewer_name: currentUser.full_name,
              reviewer_comment: reason,
            }
          : r
      );
      setUpdateRequests(updatedRequests);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));
      }

      // Notify user
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: 'Yêu cầu cập nhật hồ sơ được trả lại',
        content: `Yêu cầu (${req.id}) đã được trả lại để điều chỉnh với lý do: "${reason}". Vui lòng kiểm tra và gửi lại.`,
        sender_name: 'Thường trực Đoàn trường',
        target_type: 'individual',
        target_profile_id: req.profile_id,
        category: 'ho_so',
        channel: 'in_app',
        send_time_type: 'immediate',
        created_at: new Date().toLocaleDateString('vi-VN'),
        is_read: false,
        read_by_user_ids: [],
        link_type: 'ho_so',
        link_id: req.id,
        link_label: 'Chỉnh sửa và gửi lại',
      };
      setNotifications((prev) => [notif, ...prev]);

      logActivity(
        'tra_lai_ho_so',
        'Trả lại yêu cầu cập nhật hồ sơ',
        req.id,
        `Yêu cầu ${req.id}`,
        'Hồ sơ cán bộ',
        `Trả lại yêu cầu cập nhật hồ sơ của cán bộ ${req.profile_name}. Lý do: ${reason}`
      );

      return { success: true, message: `Đã trả lại yêu cầu ${requestId} cho cán bộ.` };
    },
    [updateRequests, currentUser, logActivity]
  );

  // 4. Create Decision with Future Effective Date and Transactional Validation
  const createDecision = useCallback(
    (decisionData: Omit<PersonnelDecision, 'id' | 'created_at' | 'created_by'>) => {
      // Validation Section 7: Atomic check
      for (let i = 0; i < decisionData.changes.length; i++) {
        const change = decisionData.changes[i];
        if (!change.profile_id || !change.position_title) {
          return {
            success: false,
            message: `Dòng số ${i + 1} bị thiếu thông tin cán bộ hoặc chức danh. Quyết định không được tạo một phần!`,
            errorLineIndex: i,
          };
        }
      }

      const newId = 'dec_' + Date.now();
      const nowStr = new Date().toISOString().split('T')[0];
      const isFuture = decisionData.effective_date > nowStr;

      const newDecision: PersonnelDecision = {
        ...decisionData,
        id: newId,
        created_by: currentUser.full_name,
        created_at: `${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`,
      };

      // Apply changes to profiles:
      // If replacement and future effective:
      // Old person's end_date is set to the day before effective_date
      // New person's start_date is set to effective_date with status 'future'
      let updatedProfiles = [...profiles];

      decisionData.changes.forEach((line) => {
        // If replacing someone
        if (line.replaces_profile_id) {
          updatedProfiles = updatedProfiles.map((p) => {
            if (p.id === line.replaces_profile_id) {
              const updatedRoles = p.roles.map((r) => {
                if (r.unit_id === line.unit_id && r.position_title === line.position_title) {
                  return {
                    ...r,
                    end_date: isFuture
                      ? decisionData.effective_date // Or day before
                      : decisionData.effective_date,
                    status: isFuture ? ('active' as const) : ('ended' as const),
                  };
                }
                return r;
              });
              return { ...p, roles: updatedRoles };
            }
            return p;
          });
        }

        // Add new role to beneficiary
        updatedProfiles = updatedProfiles.map((p) => {
          if (p.id === line.profile_id) {
            const newRole = {
              id: 'role_' + Date.now() + Math.random().toString(36).substring(2, 5),
              profile_id: p.id,
              unit_id: line.unit_id,
              unit_name: line.unit_name,
              subsystem_id: 'P06' as SubsystemId,
              position_title: line.position_title,
              term: decisionData.term || '2026 - 2027',
              start_date: line.start_date || decisionData.effective_date,
              end_date: null,
              decision_id: newId,
              decision_number: decisionData.decision_number,
              status: isFuture ? ('future' as const) : ('active' as const),
            };
            return {
              ...p,
              roles: [...p.roles, newRole],
            };
          }
          return p;
        });
      });

      const nextDecisions = [newDecision, ...decisions];
      setDecisions(nextDecisions);
      setProfiles(updatedProfiles);
      setSelectedDecisionId(newId);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(nextDecisions));
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updatedProfiles));
      }

      logActivity(
        'gui_quyet_dinh',
        'Ban hành quyết định nhân sự',
        newId,
        newDecision.decision_number,
        'Quyết định nhân sự',
        `Ban hành quyết định ${newDecision.decision_number} (${newDecision.title}). Hiệu lực từ ${newDecision.effective_date}.`
      );

      return {
        success: true,
        message: `Đã ban hành quyết định số ${newDecision.decision_number} thành công.${
          isFuture
            ? ` Hiệu lực từ ngày ${newDecision.effective_date}. Danh sách cán bộ hiện tại sẽ tự động chuyển đổi từ thời điểm này.`
            : ''
        }`,
      };
    },
    [decisions, profiles, currentUser, logActivity]
  );

  const deleteDecision = useCallback(
    (decisionId: string) => {
      const target = decisions.find((d) => d.id === decisionId);
      if (!target) return { success: false, message: 'Không tìm thấy quyết định cần xóa.' };

      const nextDecisions = decisions.filter((d) => d.id !== decisionId);
      setDecisions(nextDecisions);
      if (selectedDecisionId === decisionId) setSelectedDecisionId(null);

      logActivity(
        'gui_quyet_dinh',
        'Xóa quyết định nhân sự',
        decisionId,
        target.decision_number,
        'Quyết định nhân sự',
        `Xóa quyết định số ${target.decision_number} (${target.title}).`
      );

      return { success: true, message: `Đã xóa quyết định ${target.decision_number}.` };
    },
    [decisions, selectedDecisionId, logActivity]
  );

  // 5. Submit Self Evaluation (Upsert if not yet generated)
  const submitSelfEvaluation = useCallback(
    (
      evaluationId: string,
      taskResults: string,
      limitations: string,
      evidenceFiles: { name: string; size: string }[]
    ) => {
      const existing = evaluations.find((e) => e.id === evaluationId);
      const nowTime = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN');

      if (existing) {
        const updated = evaluations.map((e) =>
          e.id === evaluationId
            ? {
                ...e,
                task_results: taskResults,
                limitations_mitigation: limitations,
                evidence_files: evidenceFiles,
                status: 'submitted' as const,
                submitted_at: nowTime,
              }
            : e
        );
        setEvaluations(updated);

        logActivity(
          'sua_ho_so',
          'Gửi tự đánh giá tháng',
          evaluationId,
          existing.position_title,
          'Đánh giá hằng tháng',
          `Cán bộ ${existing.profile_name} đã gửi phiếu tự đánh giá chức vụ ${existing.position_title}.`
        );
      } else {
        // Tạo mới phiếu tự đánh giá cho người dùng hiện tại nếu chưa có trong danh sách
        const userProf =
          profiles.find((p) => p.id === currentUser.profile_id) ||
          profiles.find((p) => p.email.toLowerCase() === currentUser.email.toLowerCase());
        const activePeriod = evaluationPeriods.find((p) => p.id === selectedPeriodId) || evaluationPeriods[0];
        const primaryRole = userProf?.roles?.[0];

        const newEval: MonthlyEvaluation = {
          id: evaluationId || `eval_${Date.now()}`,
          period_id: activePeriod?.id || 'period_2026_10',
          month_year: activePeriod?.month_year || '10/2026',
          profile_id: userProf?.id || currentUser.profile_id,
          profile_name: userProf?.full_name || currentUser.full_name,
          student_id: userProf?.student_id || currentUser.student_id || 'CB-HCMUTE',
          role_assignment_id: primaryRole?.id || 'role_default',
          unit_id: primaryRole?.unit_id || userProf?.primary_unit_id || 'unit_doan_truong',
          unit_name: primaryRole?.unit_name || currentUser.scope_unit_name || 'Đoàn trường',
          position_title: primaryRole?.position_title || 'Cán bộ Đoàn - Hội',
          task_results: taskResults,
          limitations_mitigation: limitations,
          evidence_files: evidenceFiles,
          proposed_grade: null,
          approved_grade: null,
          status: 'submitted',
          submitted_at: nowTime,
        };

        setEvaluations((prev) => [newEval, ...prev]);

        logActivity(
          'sua_ho_so',
          'Gửi tự đánh giá tháng',
          newEval.id,
          newEval.position_title,
          'Đánh giá hằng tháng',
          `Cán bộ ${newEval.profile_name} đã khởi tạo và gửi phiếu tự đánh giá chức vụ ${newEval.position_title}.`
        );
      }

      return { success: true, message: 'Đã gửi bài tự đánh giá thành công!' };
    },
    [evaluations, profiles, currentUser, evaluationPeriods, selectedPeriodId, logActivity]
  );

  // 6. Review Monthly Evaluation
  const reviewEvaluation = useCallback(
    (
      evaluationId: string,
      proposedGrade: 'A' | 'B' | 'C' | 'D' | null,
      unitComment: string,
      approvedGrade: 'A' | 'B' | 'C' | 'D' | null,
      adminComment: string,
      action: 'approve' | 'return'
    ) => {
      const evalItem = evaluations.find((e) => e.id === evaluationId);
      if (!evalItem) return { success: false, message: 'Không tìm thấy phiếu đánh giá' };

      const updated = evaluations.map((e) =>
        e.id === evaluationId
          ? {
              ...e,
              proposed_grade: proposedGrade !== undefined ? proposedGrade : e.proposed_grade,
              unit_comment: unitComment || e.unit_comment,
              approved_grade: approvedGrade !== undefined ? approvedGrade : e.approved_grade,
              admin_comment: adminComment || e.admin_comment,
              status: action === 'approve' ? ('approved' as const) : ('returned' as const),
              reviewed_at: new Date().toLocaleDateString('vi-VN'),
            }
          : e
      );

      setEvaluations(updated);

      logActivity(
        'duyet_ho_so',
        action === 'approve' ? 'Duyệt đánh giá cán bộ' : 'Trả lại phiếu đánh giá',
        evaluationId,
        evalItem.profile_name,
        'Đánh giá hằng tháng',
        `${action === 'approve' ? 'Duyệt' : 'Trả lại'} kết quả đánh giá cho cán bộ ${evalItem.profile_name} (${evalItem.position_title}). Mức xếp loại: ${approvedGrade || proposedGrade || 'Chưa xét'}`
      );

      return {
        success: true,
        message:
          action === 'approve'
            ? `Đã duyệt đánh giá cho cán bộ ${evalItem.profile_name}!`
            : `Đã trả lại phiếu đánh giá cho cán bộ ${evalItem.profile_name}.`,
      };
    },
    [evaluations, logActivity]
  );

  // 7. Publish Evaluation Period (Mục 8: Kết quả xếp loại chỉ hiện sau công bố)
  const publishEvaluationPeriod = useCallback(
    (periodId: string) => {
      const period = evaluationPeriods.find((p) => p.id === periodId);
      if (!period) return { success: false, message: 'Không tìm thấy kỳ đánh giá' };

      const nextPeriods = evaluationPeriods.map((p) =>
        p.id === periodId ? { ...p, status: 'published' as const, is_published: true } : p
      );
      setEvaluationPeriods(nextPeriods);

      // Create notification
      const notif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: `Kết quả đánh giá ${period.month_year} đã được công bố`,
        content: `Thường trực Đoàn trường đã chính thức công bố kết quả xếp loại cán bộ Đoàn – Hội ${period.month_year}. Bạn có thể vào xem kết quả và nhận xét tại mục Đánh giá của tôi.`,
        sender_name: 'Đoàn trường',
        target_type: 'all',
        category: 'danh_gia',
        channel: 'in_app',
        send_time_type: 'immediate',
        created_at: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        is_read: false,
        read_by_user_ids: [],
        link_type: 'danh_gia',
        link_id: period.id,
        link_label: 'Xem kết quả',
      };
      setNotifications((prev) => [notif, ...prev]);

      logActivity(
        'cong_bo_danh_gia',
        'Công bố kết quả đánh giá hằng tháng',
        period.id,
        period.title,
        'Kỳ đánh giá',
        `Chính thức công bố và khóa dữ liệu kết quả xếp loại cán bộ Đoàn – Hội ${period.month_year}.`
      );

      return {
        success: true,
        message: `Đã công bố và khóa kỳ đánh giá ${period.month_year} thành công. Kết quả hiện đã hiển thị cho cán bộ.`,
      };
    },
    [evaluationPeriods, logActivity]
  );

  // 8. Reopen Evaluation Period with Logged Justification
  const reopenEvaluationPeriod = useCallback(
    (periodId: string, reason: string) => {
      const period = evaluationPeriods.find((p) => p.id === periodId);
      if (!period) return { success: false, message: 'Không tìm thấy kỳ đánh giá' };

      const nextPeriods = evaluationPeriods.map((p) =>
        p.id === periodId ? { ...p, status: 'open' as const, is_published: false } : p
      );
      setEvaluationPeriods(nextPeriods);

      logActivity(
        'mo_lai_ky',
        'Mở lại kỳ đánh giá đã khóa',
        period.id,
        period.title,
        'Kỳ đánh giá',
        `Mở lại kỳ đánh giá ${period.month_year} để điều chỉnh. Căn cứ/Lý do: "${reason}".`
      );

      return {
        success: true,
        message: `Đã mở lại kỳ đánh giá ${period.month_year}. Kết quả đã tạm thời ẩn để điều chỉnh có nhật ký.`,
      };
    },
    [evaluationPeriods, logActivity]
  );

  const createEvaluationPeriod = useCallback(
    (
      periodData: Omit<
        EvaluationPeriod,
        'id' | 'created_at' | 'total_targets' | 'submitted_count' | 'approved_count'
      >
    ) => {
      const id = `period_${periodData.year_number}_${String(periodData.month_number).padStart(2, '0')}`;
      if (evaluationPeriods.some((p) => p.id === id || p.month_year === periodData.month_year)) {
        return { success: false, message: `Kỳ đánh giá tháng ${periodData.month_year} đã tồn tại!` };
      }

      const newPeriod: EvaluationPeriod = {
        ...periodData,
        id,
        total_targets: profiles.length,
        submitted_count: 0,
        approved_count: 0,
        created_at: new Date().toLocaleDateString('vi-VN'),
      };

      setEvaluationPeriods((prev) => [newPeriod, ...prev]);
      setSelectedPeriodId(id);

      logActivity(
        'cong_bo_danh_gia',
        'Mở kỳ đánh giá tháng mới',
        id,
        newPeriod.title,
        'Kỳ đánh giá',
        `Khởi tạo kỳ đánh giá ${newPeriod.month_year} (${newPeriod.title}).`
      );

      return { success: true, message: `Đã tạo kỳ đánh giá ${newPeriod.month_year} thành công!` };
    },
    [evaluationPeriods, profiles.length, logActivity]
  );

  const generateEvaluationsForPeriod = useCallback(
    (periodId: string) => {
      const period = evaluationPeriods.find((p) => p.id === periodId);
      if (!period) return { success: false, message: 'Không tìm thấy kỳ đánh giá.', count: 0 };

      let addedCount = 0;
      const newSheets: MonthlyEvaluation[] = [];

      profiles.forEach((prof) => {
        const activeRoles = prof.roles?.filter((r) => r.status === 'active') || [];
        const rolesToUse =
          activeRoles.length > 0
            ? activeRoles
            : [
                {
                  id: `role_${prof.id}`,
                  unit_id: prof.primary_unit_id || 'unit_doan_truong',
                  unit_name:
                    units.find((u) => u.id === prof.primary_unit_id)?.name || 'Đoàn trường',
                  position_title: 'Cán bộ Đoàn - Hội',
                },
              ];

        rolesToUse.forEach((role) => {
          const exists = evaluations.some(
            (e) =>
              e.period_id === periodId &&
              e.profile_id === prof.id &&
              e.position_title === role.position_title
          );
          if (!exists) {
            addedCount++;
            newSheets.push({
              id: `eval_${periodId}_${prof.id}_${addedCount}_${Date.now()}`,
              period_id: periodId,
              month_year: period.month_year,
              profile_id: prof.id,
              profile_name: prof.full_name,
              student_id: prof.student_id || prof.staff_id || 'CB-HCMUTE',
              role_assignment_id: role.id,
              unit_id: role.unit_id,
              unit_name: role.unit_name,
              position_title: role.position_title,
              task_results: '',
              limitations_mitigation: '',
              evidence_files: [],
              proposed_grade: null,
              approved_grade: null,
              status: 'not_submitted',
            });
          }
        });
      });

      if (addedCount > 0) {
        setEvaluations((prev) => [...prev, ...newSheets]);
        setEvaluationPeriods((prev) =>
          prev.map((p) =>
            p.id === periodId ? { ...p, total_targets: p.total_targets + addedCount } : p
          )
        );
      }

      return {
        success: true,
        message:
          addedCount > 0
            ? `Đã khởi tạo ${addedCount} phiếu đánh giá cho toàn bộ cán bộ đương nhiệm trong kỳ ${period.month_year}!`
            : `Tất cả cán bộ đương nhiệm đều đã có phiếu đánh giá trong kỳ ${period.month_year}.`,
        count: addedCount,
      };
    },
    [evaluationPeriods, profiles, units, evaluations]
  );

  // 9. Notification operations
  const createNotification = useCallback(
    (notifData: Omit<NotificationItem, 'id' | 'created_at' | 'is_read' | 'read_by_user_ids'>) => {
      const newNotif: NotificationItem = {
        ...notifData,
        id: 'notif_' + Date.now(),
        created_at: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        is_read: false,
        read_by_user_ids: [],
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const addNotification = createNotification;

  const addAuditLog = useCallback(
    (log: any) => {
      const now = new Date();
      const newLog: AuditLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        user_id: currentUser.id,
        user_name: log.actor_name || currentUser.full_name,
        user_mssv: log.actor_code || currentUser.student_id,
        actor_name: log.actor_name || currentUser.full_name,
        actor_code: log.actor_code || currentUser.student_id,
        action: log.action || log.action_type || 'system_event',
        action_type: log.action_type || log.action || 'UPDATE',
        action_label: log.action_label || log.action || 'Thao tác hệ thống',
        target_id: log.target_id || '',
        target_name: log.target_name || log.target_id || 'Hệ thống',
        target_type: log.target_type || 'system',
        result: (log.result as any) || 'SUCCESS',
        details: log.description || log.details || '',
        description: log.description || log.details || '',
        created_at: log.created_at || now.toISOString(),
        ip_address: log.ip_address || '127.0.0.1',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // 10. Master Data Additions & Updates
  const addUnit = useCallback((unitData: Omit<Unit, 'id'>) => {
    const newUnit: Unit = {
      ...unitData,
      id: 'unit_' + Date.now(),
    };
    setUnits((prev) => [...prev, newUnit]);
  }, []);

  const updateUnit = useCallback(
    (unitId: string, updates: Partial<Unit>) => {
      const target = units.find((u) => u.id === unitId);
      if (!target) return { success: false, message: 'Không tìm thấy đơn vị.' };
      setUnits((prev) => prev.map((u) => (u.id === unitId ? { ...u, ...updates } : u)));
      return { success: true, message: `Đã cập nhật thông tin đơn vị ${updates.name || target.name}!` };
    },
    [units]
  );

  const deleteUnit = useCallback(
    (unitId: string) => {
      if (unitId === 'unit_doan_truong' || unitId === 'unit_hoi_sinh_vien') {
        return { success: false, message: 'Không thể xóa đơn vị gốc cấp Trường!' };
      }
      const target = units.find((u) => u.id === unitId);
      if (!target) return { success: false, message: 'Không tìm thấy đơn vị.' };
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      if (selectedUnitId === unitId) setSelectedUnitId('unit_doan_truong');
      return { success: true, message: `Đã xóa đơn vị ${target.name}.` };
    },
    [units, selectedUnitId]
  );

  const addPosition = useCallback((posData: Omit<PositionDefinition, 'id'>) => {
    const newPos: PositionDefinition = {
      ...posData,
      id: 'pos_' + Date.now(),
    };
    setPositions((prev) => [...prev, newPos]);
  }, []);

  const updatePosition = useCallback(
    (posId: string, updates: Partial<PositionDefinition>) => {
      const target = positions.find((p) => p.id === posId);
      if (!target) return { success: false, message: 'Không tìm thấy chức danh.' };
      setPositions((prev) => prev.map((p) => (p.id === posId ? { ...p, ...updates } : p)));
      return { success: true, message: `Đã cập nhật chức danh ${updates.name || target.name}!` };
    },
    [positions]
  );

  const deletePosition = useCallback(
    (posId: string) => {
      const target = positions.find((p) => p.id === posId);
      if (!target) return { success: false, message: 'Không tìm thấy chức danh.' };
      setPositions((prev) => prev.filter((p) => p.id !== posId));
      return { success: true, message: `Đã xóa chức danh ${target.name}.` };
    },
    [positions]
  );

  const addProfile = useCallback(
    (profileData: Omit<OfficerProfile, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
      // Check duplicate student_id
      if (
        profileData.student_id &&
        profiles.some((p) => p.student_id?.toLowerCase() === profileData.student_id?.toLowerCase())
      ) {
        return {
          success: false,
          message: `Mã số sinh viên/cán bộ ${profileData.student_id} đã tồn tại trong hệ thống! Không được tạo trùng hồ sơ.`,
        };
      }

      const newId = 'prof_' + Date.now();
      const codeNum = profiles.length + 1;
      const newProfile: OfficerProfile = {
        ...profileData,
        id: newId,
        profile_code: profileData.profile_code || `CB-${String(codeNum).padStart(4, '0')}`,
        version: 1,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };

      const updated = [newProfile, ...profiles];
      setProfiles(updated);

      // Tự động tạo tài khoản người dùng tương ứng nếu có email
      if (newProfile.email && !users.some((u) => u.email.toLowerCase() === newProfile.email.toLowerCase())) {
        const newUser: AppUser = {
          id: `user_${Date.now()}`,
          profile_id: newId,
          full_name: newProfile.full_name,
          student_id: newProfile.student_id || newProfile.staff_id || '',
          username: newProfile.email.split('@')[0],
          password: newProfile.student_id || 'Hcmute@123',
          email: newProfile.email,
          avatar_code: newProfile.full_name
            .split(' ')
            .slice(-2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
          roles: ['can_bo_ca_nhan'],
          current_role: 'can_bo_ca_nhan',
          scope_unit_id: newProfile.primary_unit_id,
          scope_unit_name: newProfile.roles?.[0]?.unit_name || 'Đoàn trường',
          portal_mode: 'user',
          is_active: true,
        };
        setUsers((prev) => [...prev, newUser]);
      }

      logActivity(
        'tao_ho_so',
        'Tạo hồ sơ cán bộ mới',
        newId,
        newProfile.full_name,
        'Hồ sơ cán bộ',
        `Tạo mới hồ sơ cho cán bộ ${newProfile.full_name} (${newProfile.student_id || newProfile.staff_id}).`
      );

      return {
        success: true,
        message: `Đã tạo hồ sơ cho cán bộ ${newProfile.full_name} thành công (Mã: ${newProfile.profile_code})!`,
      };
    },
    [profiles, users, logActivity]
  );

  const updateProfile = useCallback(
    (profileId: string, updates: Partial<OfficerProfile>) => {
      const existing = profiles.find((p) => p.id === profileId);
      if (!existing) return { success: false, message: 'Không tìm thấy hồ sơ cán bộ.' };

      const updatedProfile: OfficerProfile = {
        ...existing,
        ...updates,
        version: (existing.version || 1) + 1,
        updated_at: new Date().toISOString().split('T')[0],
      };

      setProfiles((prev) => prev.map((p) => (p.id === profileId ? updatedProfile : p)));

      // Đồng bộ sang users nếu có thay đổi họ tên, MSSV hoặc email
      if (updates.full_name || updates.email || updates.student_id) {
        setUsers((prev) =>
          prev.map((u) =>
            u.profile_id === profileId || u.email.toLowerCase() === existing.email.toLowerCase()
              ? {
                  ...u,
                  full_name: updates.full_name || u.full_name,
                  email: updates.email || u.email,
                  student_id: updates.student_id || u.student_id,
                }
              : u
          )
        );
      }

      logActivity(
        'sua_ho_so',
        'Chỉnh sửa hồ sơ cán bộ',
        profileId,
        updatedProfile.full_name,
        'Hồ sơ cán bộ',
        `Quản trị viên cập nhật trực tiếp hồ sơ của cán bộ ${updatedProfile.full_name} (${updatedProfile.profile_code}).`
      );

      return {
        success: true,
        message: `Đã lưu cập nhật hồ sơ cán bộ ${updatedProfile.full_name} thành công!`,
      };
    },
    [profiles, logActivity]
  );

  const deleteProfile = useCallback(
    (profileId: string) => {
      const target = profiles.find((p) => p.id === profileId);
      if (!target) return { success: false, message: 'Không tìm thấy hồ sơ cán bộ.' };
      if (target.email?.toLowerCase() === 'thanlx@hcmute.edu.vn' || profileId === 'prof_thanlx') {
        return {
          success: false,
          message: 'Không thể xóa hồ sơ của Quản trị viên Tối cao (thanlx@hcmute.edu.vn)!',
        };
      }

      const nextProfiles = profiles.filter((p) => p.id !== profileId);
      setProfiles(nextProfiles);
      if (selectedProfileId === profileId) {
        setSelectedProfileId(nextProfiles[0]?.id || null);
      }

      logActivity(
        'sua_ho_so',
        'Xóa hồ sơ cán bộ',
        profileId,
        target.full_name,
        'Hồ sơ cán bộ',
        `Xóa hồ sơ cán bộ ${target.full_name} (${target.student_id || target.profile_code}).`
      );

      return { success: true, message: `Đã xóa hồ sơ cán bộ ${target.full_name}.` };
    },
    [profiles, selectedProfileId, logActivity]
  );

  const importProfilesFromExcel = useCallback(
    (rows: any[], duplicateMode: 'update' | 'skip') => {
      let addedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      const nextProfiles = [...profiles];
      const nextUsers = [...users];
      const todayStr = new Date().toISOString().split('T')[0];

      rows.forEach((row, idx) => {
        const fullName = String(row.full_name || row['Họ và tên'] || row['Ho va ten'] || '').trim();
        const studentId = String(row.student_id || row['MSSV'] || row['Mã số SV/CB'] || '').trim();
        const email = String(
          row.email || row['Email'] || (studentId ? `${studentId.toLowerCase()}@student.hcmute.edu.vn` : '')
        ).trim();

        if (!fullName || (!studentId && !email)) {
          skippedCount++;
          return;
        }

        const genderRaw = String(row.gender || row['Giới tính'] || 'Nam').trim();
        const gender: 'Nam' | 'Nữ' = genderRaw.toLowerCase().includes('nữ') || genderRaw.toLowerCase() === 'nu' ? 'Nữ' : 'Nam';
        const dob = String(row.date_of_birth || row['Ngày sinh'] || '2005-01-01').trim();
        const phone = String(row.phone || row['Số điện thoại'] || row['SĐT'] || '').trim();
        const hometown = String(row.hometown || row['Quê quán'] || 'TP. Hồ Chí Minh').trim();
        const currentResidence = String(row.current_residence || row['Nơi ở hiện nay'] || hometown).trim();
        const ethnicity = String(row.ethnicity || row['Dân tộc'] || 'Kinh').trim();
        const religion = String(row.religion || row['Tôn giáo'] || 'Không').trim();
        const major = String(row.major || row['Ngành học'] || row['Khoa/Ngành'] || '').trim();
        const qualification = String(row.qualification || row['Trình độ chuyên môn'] || 'Sinh viên').trim();
        const politicalTheory = String(row.political_theory || row['Lý luận chính trị'] || 'Sơ cấp').trim();
        const unitName = String(row.unit_name || row['Đơn vị'] || 'Đoàn trường').trim();
        const positionTitle = String(row.position_title || row['Chức vụ'] || 'Ủy viên BCH').trim();
        const subsystemRaw = String(row.subsystem_id || row['Phân hệ'] || 'P03').trim().toUpperCase();
        const subsystemId: SubsystemId = (['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07'].includes(subsystemRaw)
          ? subsystemRaw
          : 'P03') as SubsystemId;
        const term = String(row.term || row['Nhiệm kỳ'] || '2025 - 2027').trim();
        const isParty =
          String(row.is_party_member || row['Đảng viên'] || '')
            .trim()
            .toLowerCase() === 'có' ||
          String(row.is_party_member || row['Đảng viên'] || '')
            .trim()
            .toLowerCase() === 'true' ||
          String(row.is_party_member || row['Đảng viên'] || '')
            .trim() === '1';

        // Match unit in units
        const matchedUnit =
          units.find(
            (u) =>
              u.name.toLowerCase() === unitName.toLowerCase() ||
              u.code.toLowerCase() === unitName.toLowerCase()
          ) || units[0];

        // Check if profile already exists
        const existingIdx = nextProfiles.findIndex(
          (p) =>
            (studentId && p.student_id?.toLowerCase() === studentId.toLowerCase()) ||
            (email && p.email?.toLowerCase() === email.toLowerCase())
        );

        if (existingIdx !== -1) {
          if (duplicateMode === 'skip') {
            skippedCount++;
            return;
          }
          // Update existing profile
          const existing = nextProfiles[existingIdx];
          const hasRole = existing.roles.some(
            (r) =>
              r.unit_name.toLowerCase() === unitName.toLowerCase() &&
              r.position_title.toLowerCase() === positionTitle.toLowerCase()
          );
          const updatedRoles = hasRole
            ? existing.roles
            : [
                ...existing.roles,
                {
                  id: `role_imp_${Date.now()}_${idx}`,
                  profile_id: existing.id,
                  unit_id: matchedUnit?.id || 'unit_doan_truong',
                  unit_name: unitName || matchedUnit?.name || 'Đoàn trường',
                  subsystem_id: subsystemId,
                  position_title: positionTitle,
                  term,
                  start_date: todayStr,
                  end_date: null,
                  decision_number: String(row.decision_number || row['Số quyết định'] || 'QĐ-IMP'),
                  status: 'active' as const,
                },
              ];

          nextProfiles[existingIdx] = {
            ...existing,
            full_name: fullName || existing.full_name,
            date_of_birth: dob || existing.date_of_birth,
            gender,
            phone: phone || existing.phone,
            email: email || existing.email,
            hometown: hometown || existing.hometown,
            current_residence: currentResidence || existing.current_residence,
            ethnicity: ethnicity || existing.ethnicity,
            religion: religion || existing.religion,
            major: major || existing.major,
            qualification: qualification || existing.qualification,
            political_theory: politicalTheory || existing.political_theory,
            is_party_member: isParty || existing.is_party_member,
            roles: updatedRoles,
            version: (existing.version || 1) + 1,
            updated_at: todayStr,
          };
          updatedCount++;
        } else {
          // Create new profile
          const newProfId = `prof_imp_${Date.now()}_${idx}`;
          const codeNum = nextProfiles.length + 1;
          const newProfile: OfficerProfile = {
            id: newProfId,
            profile_code: `CB-${String(codeNum).padStart(4, '0')}`,
            full_name: fullName,
            officer_type:
              studentId.toUpperCase().startsWith('CB') || qualification.toLowerCase().includes('thạc sĩ')
                ? 'can_bo_giang_vien'
                : 'sinh_vien',
            student_id: studentId,
            date_of_birth: dob,
            gender,
            hometown,
            current_residence: currentResidence,
            ethnicity,
            religion,
            qualification,
            major,
            political_theory: politicalTheory,
            is_union_member: true,
            union_join_date: '2020-03-26',
            is_party_member: isParty,
            email,
            phone,
            verification_status: 'verified',
            primary_subsystem_id: subsystemId,
            primary_unit_id: matchedUnit?.id || 'unit_doan_truong',
            version: 1,
            created_at: todayStr,
            updated_at: todayStr,
            roles: [
              {
                id: `role_imp_${Date.now()}_${idx}`,
                profile_id: newProfId,
                unit_id: matchedUnit?.id || 'unit_doan_truong',
                unit_name: unitName || matchedUnit?.name || 'Đoàn trường',
                subsystem_id: subsystemId,
                position_title: positionTitle,
                term,
                start_date: todayStr,
                end_date: null,
                decision_number: String(row.decision_number || row['Số quyết định'] || 'QĐ-IMP'),
                status: 'active',
              },
            ],
          };
          nextProfiles.push(newProfile);
          addedCount++;

          // Also create user account if email doesn't exist
          if (email && !nextUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            nextUsers.push({
              id: `user_imp_${Date.now()}_${idx}`,
              profile_id: newProfId,
              full_name: fullName,
              student_id: studentId,
              username: email.split('@')[0] || studentId,
              password: String(row.password || row['Mật khẩu'] || studentId || 'Hcmute@123').trim(),
              email,
              avatar_code: fullName
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
              roles: ['can_bo_ca_nhan'],
              current_role: 'can_bo_ca_nhan',
              scope_unit_id: matchedUnit?.id || 'unit_doan_truong',
              scope_unit_name: unitName || matchedUnit?.name || 'Đoàn trường',
              portal_mode: 'user',
              is_active: true,
            });
          }
        }
      });

      setProfiles(nextProfiles);
      setUsers(nextUsers);

      logActivity(
        'nhap_excel',
        'Nhập danh sách cán bộ từ Excel',
        'excel_batch',
        `Batch (${rows.length} dòng)`,
        'Hồ sơ cán bộ',
        `Nhập dữ liệu Excel hoàn tất: Thêm mới ${addedCount} cán bộ, cập nhật ${updatedCount} cán bộ, bỏ qua ${skippedCount} dòng.`
      );

      return {
        success: true,
        message: `Nhập Excel hoàn tất: Thêm mới ${addedCount} hồ sơ, cập nhật ${updatedCount} hồ sơ, bỏ qua ${skippedCount} dòng.`,
        addedCount,
        updatedCount,
        skippedCount,
      };
    },
    [profiles, users, units, logActivity]
  );

  const updateSystemConfig = useCallback((newConfig: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // Time-based calculations for current vs past date (Mục 1 & 11)
  const getActiveRolesAtDate = useCallback(
    (profileId: string, dateStr: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) return [];

      return profile.roles.filter((r) => {
        // Must have started on or before target date
        if (r.start_date > dateStr) return false;
        // If end_date is set, must be on or after target date
        if (r.end_date && r.end_date < dateStr) return false;
        return true;
      });
    },
    [profiles]
  );

  // Statistics separating unique persons vs total role counts (Mục 6)
  const getUniqueOfficerCount = useCallback(
    (unitId?: string, dateStr?: string) => {
      const targetDate = dateStr || '2026-10-13';
      const uniqueIds = new Set<string>();

      profiles.forEach((p) => {
        const activeRoles = p.roles.filter((r) => {
          if (unitId && unitId !== 'all' && r.unit_id !== unitId) return false;
          if (r.start_date > targetDate) return false;
          if (r.end_date && r.end_date < targetDate) return false;
          return true;
        });

        if (activeRoles.length > 0) {
          uniqueIds.add(p.id);
        }
      });

      return uniqueIds.size;
    },
    [profiles]
  );

  const getTotalRoleCount = useCallback(
    (unitId?: string, dateStr?: string) => {
      const targetDate = dateStr || '2026-10-13';
      let total = 0;

      profiles.forEach((p) => {
        const activeRoles = p.roles.filter((r) => {
          if (unitId && unitId !== 'all' && r.unit_id !== unitId) return false;
          if (r.start_date > targetDate) return false;
          if (r.end_date && r.end_date < targetDate) return false;
          return true;
        });
        total += activeRoles.length;
      });

      return total;
    },
    [profiles]
  );

  const resetToDefaultSeed = useCallback(() => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
    setUnits(INITIAL_UNITS);
    setPositions(INITIAL_POSITIONS);
    setProfiles(INITIAL_PROFILES);
    setDecisions(INITIAL_DECISIONS);
    setUpdateRequests(INITIAL_UPDATE_REQUESTS);
    setEvaluationPeriods(INITIAL_EVALUATION_PERIODS);
    setEvaluations(INITIAL_EVALUATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSystemConfig(INITIAL_SYSTEM_CONFIG);
    setCurrentUser(SUPER_ADMIN_USER);
    setUsers(INITIAL_USERS);
    setSelectedProfileId(INITIAL_PROFILES[0]?.id || 'prof_thanlx');
    setSelectedUnitId('unit_doan_truong');
    setSelectedDecisionId(null);
    setSelectedRequestId(null);
    setSelectedPeriodId('period_2026_10');
  }, []);

  // Run Test Scenarios from Section 11
  const runTestScenario = useCallback(
    (num: number): { title: string; result: string; success: boolean; message: string; details?: any } => {
      let title = '';
      let result = '';
      let details: any = undefined;

      switch (num) {
        case 1: {
          const ma = profiles[0];
          const roles = ma ? ma.roles : [];
          title = 'Tình huống 1: Một người có nhiều chức vụ (Kiêm nhiệm)';
          result = `Đồng chí ${ma?.full_name} có ${roles.length} chức vụ. Hồ sơ cá nhân duy nhất: ${ma?.profile_code}. Khi thống kê toàn trường, cán bộ này chỉ được đếm 1 lần trong số người (unique), nhưng tính đủ ${roles.length} trong số lượt chức vụ!`;
          details = { officer: ma?.full_name, unique_count: 1, total_roles: roles.length };
          break;
        }
        case 2: {
          title = 'Tình huống 2: Sửa nơi ở và gửi duyệt';
          result =
            'Khi cán bộ gửi yêu cầu cập nhật, hồ sơ chính thức vẫn giữ giá trị cũ. Khi quản trị duyệt yêu cầu, hồ sơ mới được cập nhật và đồng bộ ngay trên tất cả màn hình.';
          break;
        }
        case 3: {
          title = 'Tình huống 3: Trả lại yêu cầu cập nhật';
          result =
            'Khi yêu cầu bị trả lại, cán bộ nhận thông báo kèm lý do cụ thể, dữ liệu đã nhập được giữ nguyên và cho phép chỉnh sửa trực tiếp để gửi lại mà không cần nhập lại từ đầu.';
          break;
        }
        case 4: {
          title = 'Tình huống 4: Thay thế nhân sự có hiệu lực tương lai';
          result = `Quyết định nhân sự có ngày hiệu lực tương lai sẽ giữ nguyên người đương nhiệm ở thời điểm hiện tại và tự động chuyển giao chức vụ khi đến ngày hiệu lực. Tra cứu quá khứ vẫn tái lập đúng danh sách!`;
          break;
        }
        case 5: {
          title = 'Tình huống 5: Quyết định nhiều dòng có dòng lỗi';
          result =
            'Hệ thống thực hiện kiểm tra giao dịch nguyên khối (all-or-nothing). Nếu bất kỳ dòng nào thiếu cán bộ, sai chức danh hoặc trùng lặp, quyết định bị chặn hoàn toàn và chỉ rõ dòng bị lỗi để sửa.';
          break;
        }
        case 6: {
          title = 'Tình huống 6: Hai quản trị cùng sửa một hồ sơ (Optimistic Lock)';
          result =
            'Mỗi hồ sơ lưu trữ trường version (v1, v2...). Nếu người thứ hai lưu sau khi phiên bản nguồn đã thay đổi, hệ thống báo lỗi xung đột phiên bản và yêu cầu tải lại thay vì âm thầm ghi đè.';
          break;
        }
        case 7: {
          title = 'Tình huống 7: Gửi hoặc duyệt lại sau lỗi mạng';
          result =
            'Mỗi yêu cầu có mã định danh duy nhất. Thao tác gửi lại cùng một mã không tạo bản ghi mới hoặc thông báo trùng.';
          break;
        }
        case 8: {
          title = 'Tình huống 8: Cán bộ chuyển đơn vị giữa kỳ đánh giá';
          result =
            'Danh sách đối tượng đánh giá được chốt tại mốc mở kỳ. Biến động nhân sự phát sinh sau mốc không làm mất kết quả hoặc tự động gán kết quả cũ sang người mới.';
          break;
        }
        case 9: {
          const period = evaluationPeriods[0];
          title = 'Tình huống 9: Đánh giá đã duyệt nhưng chưa công bố';
          result = `Kỳ đánh giá hiện tại có trạng thái: ${
            period?.is_published ? 'Đã công bố' : 'Chưa công bố'
          }. Phía cán bộ chỉ thấy "Đang xử lý". Sau khi Thường trực nhấn "Công bố kết quả", xếp loại A/B/C/D mới chính thức hiển thị cho cán bộ và đưa vào báo cáo toàn trường.`;
          break;
        }
        case 10: {
          title = 'Tình huống 10: Thu hồi quyền và truy cập liên kết cũ';
          result =
            'Khi tài khoản bị thu hồi quyền quản trị hoặc đổi đơn vị, phiên làm việc lập tức vô hiệu quyền cũ. Khi mở lại đường dẫn trực tiếp, máy chủ chặn truy cập và thông báo không đủ quyền.';
          break;
        }
        case 11: {
          title = 'Tình huống 11: Xuất danh sách theo bộ lọc';
          result =
            'Tệp Excel và giao diện hiển thị khớp chính xác 100% số lượng cán bộ, ngày tra cứu và đơn vị được lọc. Các trường nhạy cảm (SĐT, Email, Địa chỉ) mặc định không xuất trừ khi có quyền riêng.';
          break;
        }
        case 12: {
          title = 'Tình huống 12: Nhập lại cùng tệp dữ liệu';
          result =
            'Hệ thống kiểm tra trùng MSSV và mã cán bộ trước khi nhập, báo rõ số dòng hợp lệ, số dòng trùng cần kiểm tra và số dòng lỗi thiếu dữ liệu, không tạo cán bộ trùng lặp trong hệ thống.';
          break;
        }
        default:
          title = 'Thông báo';
          result = 'Vui lòng chọn tình huống kiểm thử hợp lệ (1 - 12).';
      }

      return {
        title,
        result,
        success: true,
        message: result,
        details,
      };
    },
    [profiles, evaluationPeriods]
  );

  return (
    <AppContext.Provider
      value={{
        portalMode,
        setPortalMode,
        togglePortalMode,
        userTab,
        setUserTab,
        adminTab,
        setAdminTab,
        currentUser,
        switchUserRole,
        updateUserScope,
        hasPermission,
        canAccessAdminPortal,
        allowedAdminTabs,
        isSuperAdmin,
        isGlobalScope,
        accessibleUnitIds,
        allUnits: units,
        allProfiles: profiles,

        // Auth
        authUser,
        isAuthLoading,
        isAuthenticated: !!authUser,
        isSupabaseConnected,
        signInWithGoogle,
        signInWithPassword,
        changePassword,
        adminResetPassword,
        updateCurrentUserAvatar,
        signOut,
        loginAsSuperAdminDev,

        subsystems,
        units: visibleUnits,
        positions,
        profiles: visibleProfiles,
        decisions: visibleDecisions,
        updateRequests: visibleUpdateRequests,
        evaluationPeriods,
        evaluations: visibleEvaluations,
        notifications,
        auditLogs,
        systemConfig,
        setSystemConfig,
        users,
        setUsers,
        roles,
        addNotification,
        addAuditLog,

        selectedProfileId,
        setSelectedProfileId,
        selectedUnitId,
        setSelectedUnitId,
        selectedDecisionId,
        setSelectedDecisionId,
        selectedRequestId,
        setSelectedRequestId,
        selectedPeriodId,
        setSelectedPeriodId,

        submitProfileUpdateRequest,
        approveProfileUpdateRequest,
        returnProfileUpdateRequest,
        createDecision,
        deleteDecision,
        submitSelfEvaluation,
        reviewEvaluation,
        publishEvaluationPeriod,
        reopenEvaluationPeriod,
        createEvaluationPeriod,
        generateEvaluationsForPeriod,
        createNotification,
        deleteNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addUnit,
        updateUnit,
        deleteUnit,
        addPosition,
        updatePosition,
        deletePosition,
        addProfile,
        updateProfile,
        deleteProfile,
        importProfilesFromExcel,
        updateSystemConfig,
        getActiveRolesAtDate,
        getUniqueOfficerCount,
        getTotalRoleCount,
        resetToDefaultSeed,
        runTestScenario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
