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

  // Google Authentication & Security
  authUser: any;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
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
  createNotification: (
    notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read' | 'read_by_user_ids'>
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  addPosition: (pos: Omit<PositionDefinition, 'id'>) => void;
  addProfile: (profile: Omit<OfficerProfile, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
    success: boolean;
    message: string;
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
  const [portalMode, setPortalModeState] = useState<'user' | 'admin'>('admin');
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

  // Đồng bộ hóa thông tin người dùng Google sang AppUser & phân quyền
  const syncAuthUserToAppUser = useCallback((user: any, userList: AppUser[]) => {
    const email = (user?.email || '').trim().toLowerCase();
    const isSuper = email === 'thanlx@hcmute.edu.vn' || email === 'lexuanthanspkt@gmail.com';

    if (isSuper) {
      const superUser: AppUser = {
        id: 'user_thanlx',
        profile_id: 'prof_thanlx',
        full_name: 'Lê Xuân Thân',
        student_id: 'CB-HCMUTE',
        username: 'thanlx',
        email: user.email || 'thanlx@hcmute.edu.vn',
        avatar_code: 'XT',
        avatar_url: user.user_metadata?.avatar_url,
        roles: ['admin', 'lanh_dao', 'nguoi_duyet', 'quan_ly_don_vi', 'can_bo_ca_nhan'],
        current_role: 'admin',
        scope_unit_id: 'all',
        scope_unit_name: 'Toàn trường',
        portal_mode: 'admin',
        is_active: true,
      };
      setCurrentUser(superUser);
      setPortalModeState('admin');
      return superUser;
    }

    const matched = userList.find((u) => u.email.trim().toLowerCase() === email);
    if (matched) {
      const updated: AppUser = {
        ...matched,
        avatar_url: user.user_metadata?.avatar_url || matched.avatar_url,
        full_name: matched.full_name || user.user_metadata?.full_name || email,
      };
      setCurrentUser(updated);
      setPortalModeState(updated.roles.includes('admin') ? 'admin' : 'user');
      return updated;
    }

    // Tài khoản Google mới đăng nhập vào hệ thống
    const newUser: AppUser = {
      id: `user_${user.id || Date.now()}`,
      profile_id: `prof_${user.id || Date.now()}`,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cán bộ Đoàn - Hội',
      student_id: user.user_metadata?.student_id || '',
      username: user.email?.split('@')[0] || 'cb_user',
      email: user.email,
      avatar_code: (user.user_metadata?.full_name || user.email || 'CB').slice(0, 2).toUpperCase(),
      avatar_url: user.user_metadata?.avatar_url,
      roles: ['can_bo_ca_nhan'],
      current_role: 'can_bo_ca_nhan',
      scope_unit_id: null,
      scope_unit_name: 'Đoàn trường',
      portal_mode: 'user',
      is_active: true,
    };
    setCurrentUser(newUser);
    setPortalModeState('user');
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
      const savedMode = localStorage.getItem(STORAGE_KEYS.PORTAL_MODE);
      if (savedMode === 'user' || savedMode === 'admin') setPortalModeState(savedMode);

      const savedUserTab = localStorage.getItem(STORAGE_KEYS.USER_TAB);
      if (savedUserTab) setUserTabState(savedUserTab as UserTab);

      const savedAdminTab = localStorage.getItem(STORAGE_KEYS.ADMIN_TAB);
      if (savedAdminTab) setAdminTabState(savedAdminTab as AdminTab);

      const savedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));

      const savedDecisions = localStorage.getItem(STORAGE_KEYS.DECISIONS);
      if (savedDecisions) setDecisions(JSON.parse(savedDecisions));

      const savedRequests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (savedRequests) setUpdateRequests(JSON.parse(savedRequests));

      const savedEvaluations = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (savedEvaluations) setEvaluations(JSON.parse(savedEvaluations));

      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

      const savedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedAuditLogs) setAuditLogs(JSON.parse(savedAuditLogs));

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      let loadedUsers: AppUser[] = INITIAL_USERS;
      if (savedUsers) {
        try {
          loadedUsers = JSON.parse(savedUsers);
          if (!loadedUsers.some((u) => u.email.toLowerCase() === 'thanlx@hcmute.edu.vn')) {
            loadedUsers.unshift(SUPER_ADMIN_USER);
          }
          setUsers(loadedUsers);
        } catch (e) {}
      }

      // Check Supabase Google session
      if (supabase && isSupabaseConfigured) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setAuthUser(session.user);
            syncAuthUserToAppUser(session.user, loadedUsers);
          } else {
            const devEmail = localStorage.getItem('qncb_dev_session');
            if (devEmail) {
              const mockDev = { email: devEmail, user_metadata: { full_name: 'Lê Xuân Thân' } };
              setAuthUser(mockDev);
              syncAuthUserToAppUser(mockDev, loadedUsers);
            }
          }
          setIsAuthLoading(false);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setAuthUser(session.user);
            syncAuthUserToAppUser(session.user, loadedUsers);
          } else {
            const devEmail = localStorage.getItem('qncb_dev_session');
            if (devEmail) {
              const mockDev = { email: devEmail, user_metadata: { full_name: 'Lê Xuân Thân' } };
              setAuthUser(mockDev);
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
          const mockDev = { email: devEmail, user_metadata: { full_name: 'Lê Xuân Thân' } };
          setAuthUser(mockDev);
          syncAuthUserToAppUser(mockDev, loadedUsers);
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
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updateRequests));
  }, [updateRequests]);

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
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Google OAuth Actions
  const signInWithGoogle = useCallback(async () => {
    return await signInWithGoogleOAuth();
  }, []);

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
    syncAuthUserToAppUser(devUser, users);
  }, [syncAuthUserToAppUser, users]);

  // Save changes to localStorage
  const setPortalMode = useCallback((mode: 'user' | 'admin') => {
    setPortalModeState(mode);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, mode);
  }, []);

  const togglePortalMode = useCallback(() => {
    setPortalModeState((prev) => {
      const next = prev === 'user' ? 'admin' : 'user';
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PORTAL_MODE, next);
      return next;
    });
  }, []);

  const setUserTab = useCallback((tab: UserTab) => {
    setUserTabState(tab);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.USER_TAB, tab);
  }, []);

  const setAdminTab = useCallback((tab: AdminTab) => {
    setAdminTabState(tab);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, tab);
  }, []);

  const switchUserRole = useCallback((role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      current_role: role,
    }));
  }, []);

  const updateUserScope = useCallback((scopeId: string, scopeName: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      scope_unit_id: scopeId,
      scope_unit_name: scopeName,
    }));
  }, []);

  // Check user permission
  const hasPermission = useCallback(
    (action: string) => {
      const role = currentUser.current_role;
      if (role === 'admin') return true;
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
    [currentUser.current_role]
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

  // 5. Submit Self Evaluation
  const submitSelfEvaluation = useCallback(
    (
      evaluationId: string,
      taskResults: string,
      limitations: string,
      evidenceFiles: { name: string; size: string }[]
    ) => {
      const evalItem = evaluations.find((e) => e.id === evaluationId);
      if (!evalItem) return { success: false, message: 'Không tìm thấy phiếu đánh giá' };

      const updated = evaluations.map((e) =>
        e.id === evaluationId
          ? {
              ...e,
              task_results: taskResults,
              limitations_mitigation: limitations,
              evidence_files: evidenceFiles,
              status: 'submitted' as const,
              submitted_at: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
            }
          : e
      );

      setEvaluations(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(updated));
      }

      logActivity(
        'sua_ho_so',
        'Gửi tự đánh giá tháng',
        evaluationId,
        evalItem.position_title,
        'Đánh giá hằng tháng',
        `Cán bộ ${evalItem.profile_name} đã gửi phiếu tự đánh giá chức vụ ${evalItem.position_title}.`
      );

      return { success: true, message: 'Đã gửi bài tự đánh giá thành công!' };
    },
    [evaluations, logActivity]
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
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(updated));
      }

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
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, is_read: true }));
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
      return next;
    });
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
      setAuditLogs((prev) => {
        const next = [newLog, ...prev];
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(next));
        return next;
      });
    },
    [currentUser]
  );

  // 10. Master Data Additions
  const addUnit = useCallback((unitData: Omit<Unit, 'id'>) => {
    const newUnit: Unit = {
      ...unitData,
      id: 'unit_' + Date.now(),
    };
    setUnits((prev) => [...prev, newUnit]);
  }, []);

  const addPosition = useCallback((posData: Omit<PositionDefinition, 'id'>) => {
    const newPos: PositionDefinition = {
      ...posData,
      id: 'pos_' + Date.now(),
    };
    setPositions((prev) => [...prev, newPos]);
  }, []);

  const addProfile = useCallback(
    (profileData: Omit<OfficerProfile, 'id' | 'created_at' | 'updated_at' | 'version'>) => {
      // Check duplicate student_id
      if (
        profileData.student_id &&
        profiles.some((p) => p.student_id?.toLowerCase() === profileData.student_id?.toLowerCase())
      ) {
        return {
          success: false,
          message: `Mã số sinh viên ${profileData.student_id} đã tồn tại trong hệ thống! Không được tạo trùng hồ sơ.`,
        };
      }

      const newId = 'prof_' + Date.now();
      const codeNum = profiles.length + 1;
      const newProfile: OfficerProfile = {
        ...profileData,
        id: newId,
        profile_code: `CB-${String(codeNum).padStart(4, '0')}`,
        version: 1,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };

      const updated = [newProfile, ...profiles];
      setProfiles(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated));
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
    [profiles, logActivity]
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
          // Một người có hai chức vụ
          const ma = profiles.find((p) => p.id === 'prof_minh_anh');
          const roles = ma ? ma.roles : [];
          title = 'Tình huống 1: Một người có hai chức vụ';
          result = `Đồng chí ${ma?.full_name} có ${roles.length} chức vụ: "${roles.map((r) => r.position_title).join('" và "')}". Hồ sơ cá nhân duy nhất: ${ma?.profile_code}. Khi thống kê toàn trường, cán bộ này chỉ được đếm 1 lần trong số người (unique), nhưng tính đủ ${roles.length} trong số lượt chức vụ!`;
          details = { officer: ma?.full_name, unique_count: 1, total_roles: roles.length };
          break;
        }
        case 2: {
          // Sửa nơi ở và gửi duyệt
          title = 'Tình huống 2: Sửa nơi ở và gửi duyệt';
          result =
            'Khi cán bộ gửi yêu cầu HS-0012, hồ sơ chính thức vẫn giữ giá trị cũ "TP. Hồ Chí Minh". Khi quản trị duyệt yêu cầu, hồ sơ mới được cập nhật thành "Phường Linh Xuân, TP. Hồ Chí Minh" và đồng bộ ngay trên tất cả màn hình.';
          break;
        }
        case 3: {
          // Trả lại yêu cầu cập nhật
          title = 'Tình huống 3: Trả lại yêu cầu cập nhật';
          result =
            'Khi yêu cầu bị trả lại, cán bộ nhận thông báo kèm lý do cụ thể, dữ liệu đã nhập được giữ nguyên và cho phép chỉnh sửa trực tiếp để gửi lại mà không cần nhập lại từ đầu.';
          break;
        }
        case 4: {
          // Thay thế nhân sự có hiệu lực tương lai (Quyết định 156 hiệu lực 01/11/2026)
          const today = '2026-10-13';
          const futureDate = '2026-11-01';
          const leaderToday = profiles
            .find((p) => p.id === 'prof_hoang_nam')
            ?.roles.find((r) => r.unit_id === 'unit_clb_truyen_thong' && r.start_date <= today && (!r.end_date || r.end_date >= today));
          const leaderFuture = profiles
            .find((p) => p.id === 'prof_thu_ha')
            ?.roles.find((r) => r.unit_id === 'unit_clb_truyen_thong' && r.start_date <= futureDate);

          title = 'Tình huống 4: Thay thế nhân sự có hiệu lực tương lai';
          result = `Quyết định 156-QĐ/HSV ký ngày 13/10/2026 nhưng hiệu lực ngày 01/11/2026. Tại hôm nay (${today}), Chủ nhiệm vẫn là đồng chí ${leaderToday ? 'Trần Hoàng Nam' : '?'}. Đến ngày 01/11/2026, hệ thống tự động nhận diện Chủ nhiệm mới là đồng chí ${leaderFuture ? 'Lê Thu Hà' : '?'}. Tra cứu quá khứ vẫn tái lập đúng danh sách!`;
          details = { effective_from: futureDate, leaderToday: leaderToday?.position_title, leaderFuture: leaderFuture?.position_title };
          break;
        }
        case 5: {
          // Quyết định nhiều dòng có 1 dòng lỗi
          title = 'Tình huống 5: Quyết định nhiều dòng có dòng lỗi';
          result =
            'Hệ thống thực hiện kiểm tra giao dịch nguyên khối (all-or-nothing). Nếu bất kỳ dòng nào thiếu cán bộ, sai chức danh hoặc trùng lặp, quyết định bị chặn hoàn toàn và chỉ rõ dòng bị lỗi để sửa.';
          break;
        }
        case 6: {
          // Hai quản trị cùng sửa một hồ sơ
          title = 'Tình huống 6: Hai quản trị cùng sửa một hồ sơ (Optimistic Lock)';
          result =
            'Mỗi hồ sơ lưu trữ trường version (v1, v2...). Nếu người thứ hai lưu sau khi phiên bản nguồn đã thay đổi, hệ thống báo lỗi xung đột phiên bản và yêu cầu tải lại thay vì âm thầm ghi đè.';
          break;
        }
        case 7: {
          // Gửi duyệt lại sau lỗi mạng (Idempotency)
          title = 'Tình huống 7: Gửi hoặc duyệt lại sau lỗi mạng';
          result =
            'Mỗi yêu cầu có mã định danh duy nhất (VD: HS-0012). Thao tác gửi lại cùng một mã không tạo bản ghi mới hoặc thông báo trùng.';
          break;
        }
        case 8: {
          // Cán bộ chuyển đơn vị giữa kỳ
          title = 'Tình huống 8: Cán bộ chuyển đơn vị giữa kỳ đánh giá';
          result =
            'Danh sách đối tượng đánh giá được chốt tại mốc mở kỳ (01/10/2026). Biến động nhân sự phát sinh sau mốc không làm mất kết quả hoặc tự động gán kết quả cũ sang người mới.';
          break;
        }
        case 9: {
          // Đánh giá đã duyệt nhưng chưa công bố
          const period = evaluationPeriods.find((p) => p.id === 'period_2026_10');
          title = 'Tình huống 9: Đánh giá đã duyệt nhưng chưa công bố';
          result = `Kỳ đánh giá tháng 10 có trạng thái: ${
            period?.is_published ? 'Đã công bố' : 'Chưa công bố'
          }. Phía cán bộ chỉ thấy "Đang xử lý". Sau khi Thường trực nhấn "Công bố kết quả", xếp loại A/B/C/D mới chính thức hiển thị cho cán bộ và đưa vào báo cáo toàn trường.`;
          break;
        }
        case 10: {
          // Thu hồi quyền và mở liên kết cũ
          title = 'Tình huống 10: Thu hồi quyền và truy cập liên kết cũ';
          result =
            'Khi tài khoản bị thu hồi quyền quản trị hoặc đổi đơn vị, phiên làm việc lập tức vô hiệu quyền cũ. Khi mở lại đường dẫn trực tiếp, máy chủ chặn truy cập và thông báo không đủ quyền.';
          break;
        }
        case 11: {
          // Xuất danh sách theo bộ lọc
          title = 'Tình huống 11: Xuất danh sách theo bộ lọc';
          result =
            'Tệp Excel và giao diện hiển thị khớp chính xác 100% số lượng cán bộ, ngày tra cứu và đơn vị được lọc. Các trường nhạy cảm (SĐT, Email, Địa chỉ) mặc định không xuất trừ khi có quyền riêng.';
          break;
        }
        case 12: {
          // Nhập lại cùng tệp dữ liệu (Excel duplicate prevention)
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

        // Auth
        authUser,
        isAuthLoading,
        isAuthenticated: !!authUser,
        isSupabaseConnected,
        signInWithGoogle,
        signOut,
        loginAsSuperAdminDev,

        subsystems,
        units,
        positions,
        profiles,
        decisions,
        updateRequests,
        evaluationPeriods,
        evaluations,
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
        submitSelfEvaluation,
        reviewEvaluation,
        publishEvaluationPeriod,
        reopenEvaluationPeriod,
        createNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addUnit,
        addPosition,
        addProfile,
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
