'use client';

// ==============================================================================
// APP CONTEXT: QUẢN LÝ DỮ LIỆU, ADMIN CRUD, REALTIME SUPABASE & WEB NOTIFICATION
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Member,
  Task,
  Campaign,
  IncomingDocument,
  ChatMessage,
  TaskComment,
  ActivityLog,
  TaskStatus,
  TaskPriority,
  ApprovalScope,
  MemberRole,
  RatingGrade,
  WeeklyCheckin,
  ChatRichCard,
  PermissionKey,
  RolePermissionsMap,
} from '@/types';
import {
  INITIAL_MEMBERS,
  INITIAL_CAMPAIGNS,
  INITIAL_DOCUMENTS,
  INITIAL_TASKS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_WEEKLY_CHECKINS,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/lib/mockData';
import { checkCanManualRemind } from '@/lib/notifications';
import { sendMobileNotification } from '@/lib/pushNotifications';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchTasksFromSupabase,
  fetchChatMessagesFromSupabase,
  fetchIncomingDocsFromSupabase,
  fetchCommentsFromSupabase,
  fetchActivityLogsFromSupabase,
  fetchMembersFromSupabase,
  fetchCampaignsFromSupabase,
  insertTaskToSupabase,
  updateTaskOnSupabase,
  deleteTaskFromSupabase,
  insertChatMessageToSupabase,
  insertIncomingDocToSupabase,
  updateIncomingDocOnSupabase,
  insertCommentToSupabase,
  insertActivityLogToSupabase,
  seedSupabaseIfEmpty,
  subscribeToBTVRealtime,
  signInWithGoogleOAuth,
  signOutSupabase,
} from '@/lib/supabaseService';

// Hàm sinh mã UUID chuẩn RFC-4122 cho PostgreSQL
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface AppContextType {
  // Thành viên & Người dùng hiện tại
  members: Member[];
  currentMember: Member;
  setCurrentMemberId: (id: string) => void;

  // Phiên đăng nhập & Auth Gate
  isAuthenticated: boolean;
  loginAsMember: (memberId: string) => void;
  logout: () => Promise<void>;

  // CRUD Thành viên (Dành cho Admin)
  addMember: (memberData: Partial<Member>) => Member;
  updateMember: (memberId: string, updates: Partial<Member>) => void;
  deleteMember: (memberId: string) => void;
  updateMemberAvatar: (memberId: string, newAvatarUrl: string) => void;

  // Quản lý Phân quyền (RBAC)
  rolePermissions: RolePermissionsMap;
  updateRolePermissions: (role: MemberRole, permissions: PermissionKey[]) => void;
  updateMemberCustomPermissions: (memberId: string, permissions?: PermissionKey[]) => void;
  resetRolePermissionsToDefault: () => void;
  hasPermission: (permKey: PermissionKey, member?: Member) => boolean;

  // Modal Thay đổi Avatar
  isAvatarModalOpen: boolean;
  setIsAvatarModalOpen: (open: boolean) => void;
  avatarModalTargetMember: Member | null;
  openAvatarModal: (member?: Member) => void;
  closeAvatarModal: () => void;

  // CRUD Mục lục / Mảng việc / Dự án
  addCampaign: (campData: Partial<Campaign>) => Campaign;
  updateCampaign: (campId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campId: string) => void;

  // Xóa danh sách ảo (Làm sạch dữ liệu)
  clearDummyData: () => Promise<void>;

  // Xác thực Google OAuth
  authUser: any;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;

  // Trạng thái kết nối Supabase Cloud & Realtime
  isSupabaseConnected: boolean;
  isRealtimeLive: boolean;
  refreshDataFromSupabase: () => Promise<void>;

  // Dữ liệu cốt lõi
  tasks: Task[];
  campaigns: Campaign[];
  incomingDocs: IncomingDocument[];
  chatMessages: ChatMessage[];
  activityLogs: ActivityLog[];
  comments: TaskComment[];
  notifications: any[];

  // Weekly Check-in (Nhiệt kế Tinh thần BTV)
  weeklyCheckins: WeeklyCheckin[];
  addWeeklyCheckin: (checkin: Omit<WeeklyCheckin, 'id' | 'created_at'>) => WeeklyCheckin;
  isWeeklyCheckinModalOpen: boolean;
  setIsWeeklyCheckinModalOpen: (open: boolean) => void;

  // Trình xem PDF Scan Công văn (PdfViewerModal)
  selectedPdfUrl: string | null;
  selectedPdfTitle: string | null;
  selectedPdfDoc: IncomingDocument | null;
  isPdfModalOpen: boolean;
  openPdfViewer: (url: string, title?: string, doc?: IncomingDocument) => void;
  closePdfViewer: () => void;

  // Điều hướng
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  isCreateDocModalOpen: boolean;
  setIsCreateDocModalOpen: (open: boolean) => void;
  isCreateCampaignModalOpen: boolean;
  setIsCreateCampaignModalOpen: (open: boolean) => void;

  // Trạng thái Client Mount (Tránh Hydration Error #418)
  isMounted: boolean;

  // Thao tác Công việc (Ghi vĩnh viễn Supabase + Realtime)
  addTask: (task: Partial<Task> & { collaborator_ids?: string[] }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitTaskForApproval: (taskId: string) => void;
  submitTaskResult: (taskId: string, submission: { note: string; links?: string[]; files?: string[] }) => void;
  reviewTaskResult: (taskId: string, review: { grade: RatingGrade; score: number; feedback: string; approved: boolean }) => void;
  approveTask: (taskId: string) => { success: boolean; message?: string };
  rejectTask: (taskId: string, reason: string) => void;
  manualRemind: (taskId: string, message: string) => { success: boolean; message: string };

  // Thao tác Văn bản đến
  addIncomingDoc: (doc: Partial<IncomingDocument>) => IncomingDocument;
  assignTaskFromDocument: (docId: string, taskData?: Partial<Task>) => { success: boolean; task?: Task; message?: string };
  createTasksFromDoc: (
    docId: string,
    assigneeIds: string[],
    title?: string,
    description?: string,
    priority?: TaskPriority,
    approvalScope?: ApprovalScope
  ) => Task[];

  // Thao tác Thảo luận & Chat Realtime
  addComment: (taskId: string, body: string) => void;
  sendChatMessage: (body: string, replyTo?: string, mentions?: string[], richCard?: ChatRichCard) => void;

  // Trợ giúp thống kê
  getMyTasks: (memberId?: string) => {
    overdue: Task[];
    today: Task[];
    thisWeek: Task[];
    upcoming: Task[];
    completed: Task[];
  };
  getCoordinatorData: () => {
    overdueTasks: Array<Task & { daysOverdue: number }>;
    dueIn48Hours: Task[];
    waitingApproval: Task[];
    workloadPerMember: Array<{ member: Member; total: number; overdue: number; waiting: number }>;
    busyMembers: Member[];
    tasksWithoutDueDate: Task[];
    tasksWithoutOwner: Task[];
    unassignedDocs: IncomingDocument[];
  };
  getReportData: (filterMonth?: number, filterYear?: number) => {
    totalTasks: number;
    totalCompleted: number;
    beforeDeadline: number;
    onTime: number;
    afterDeadline: number;
    averageScore: number;
    gradeCounts: { A: number; B: number; C: number; D: number };
    memberStats: Array<{
      member: Member;
      totalAssigned: number;
      completedOnTime: number;
      completedLate: number;
      inProgress: number;
      overdue: number;
      averageScore: number;
      gradeCounts: { A: number; B: number; C: number; D: number };
      tasks: Task[];
    }>;
  };
  updateMemberDelegation: (
    memberId: string,
    delegation: {
      busy_from: string | null;
      busy_to: string | null;
      busy_reason: string | null;
      delegate_to_id: string | null;
    }
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [currentMemberId, setCurrentMemberId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [incomingDocs, setIncomingDocs] = useState<IncomingDocument[]>(INITIAL_DOCUMENTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);

  // Phiên làm việc & Bảo mật Auth Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Trạng thái Google Auth & Realtime
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);
  const [isRealtimeLive, setIsRealtimeLive] = useState<boolean>(false);

  // Weekly Check-in (Nhiệt kế Tinh thần BTV)
  const [weeklyCheckins, setWeeklyCheckins] = useState<WeeklyCheckin[]>(INITIAL_WEEKLY_CHECKINS);
  const [isWeeklyCheckinModalOpen, setIsWeeklyCheckinModalOpen] = useState<boolean>(false);

  // Quản lý Phân quyền (Role-Based Access Control - RBAC)
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(DEFAULT_ROLE_PERMISSIONS);

  // Modal Thay đổi Avatar
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [avatarModalTargetMember, setAvatarModalTargetMember] = useState<Member | null>(null);

  // Trình xem PDF Scan Công văn (PdfViewerModal)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string | null>(null);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState<IncomingDocument | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Điều hướng & Modals
  const [activeTab, setActiveTab] = useState<string>('trang_chu');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState<boolean>(false);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // ----------------------------------------------------------------------------
  // 1. TẢI DỮ LIỆU TỪ SUPABASE
  // ----------------------------------------------------------------------------
  const refreshDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      await seedSupabaseIfEmpty();

      const [dbTasks, dbChat, dbDocs, dbComments, dbLogs, dbMembers, dbCampaigns] = await Promise.all([
        fetchTasksFromSupabase(),
        fetchChatMessagesFromSupabase(),
        fetchIncomingDocsFromSupabase(),
        fetchCommentsFromSupabase(),
        fetchActivityLogsFromSupabase(),
        fetchMembersFromSupabase(),
        fetchCampaignsFromSupabase(),
      ]);

      // Thu thập dữ liệu local storage hiện tại để ưu tiên giữ nguyên các cập nhật của người dùng
      let localTasks: Task[] = [];
      let localMembers: Member[] = [];
      let localDocs: IncomingDocument[] = [];
      let localCampaigns: Campaign[] = [];

      if (typeof window !== 'undefined') {
        try {
          const t = localStorage.getItem('btv_tasks');
          if (t) localTasks = JSON.parse(t);
          const m = localStorage.getItem('btv_members');
          if (m) localMembers = JSON.parse(m);
          const d = localStorage.getItem('btv_docs');
          if (d) localDocs = JSON.parse(d);
          const c = localStorage.getItem('btv_campaigns');
          if (c) localCampaigns = JSON.parse(c);
        } catch (e) {}
      }

      if (dbTasks && dbTasks.length > 0) {
        if (localTasks.length > 0) {
          const taskMap = new Map<string, Task>();
          dbTasks.forEach((t) => taskMap.set(t.id, t));
          localTasks.forEach((t) => taskMap.set(t.id, { ...taskMap.get(t.id), ...t }));
          setTasks(Array.from(taskMap.values()));
        } else {
          setTasks(dbTasks);
        }
      }
      if (dbChat && dbChat.length > 0) setChatMessages(dbChat);
      if (dbDocs && dbDocs.length > 0) {
        if (localDocs.length > 0) {
          const docMap = new Map<string, IncomingDocument>();
          dbDocs.forEach((d) => docMap.set(d.id, d));
          localDocs.forEach((d) => docMap.set(d.id, { ...docMap.get(d.id), ...d }));
          setIncomingDocs(Array.from(docMap.values()));
        } else {
          setIncomingDocs(dbDocs);
        }
      }
      if (dbComments && dbComments.length > 0) setComments(dbComments);
      if (dbLogs && dbLogs.length > 0) setActivityLogs(dbLogs);
      if (dbMembers && dbMembers.length > 0) {
        // Hợp nhất đảm bảo bảo vệ avatar, tên, số điện thoại, custom_permissions mà admin đã sửa
        const memberMap = new Map<string, Member>();
        INITIAL_MEMBERS.forEach((m) => memberMap.set(m.id, m));
        dbMembers.forEach((m) => memberMap.set(m.id, { ...memberMap.get(m.id), ...m }));
        localMembers.forEach((m) => {
          const existing = memberMap.get(m.id);
          if (existing) {
            memberMap.set(m.id, { ...existing, ...m });
          } else {
            memberMap.set(m.id, m);
          }
        });
        const mergedMembers = Array.from(memberMap.values());
        setMembers(mergedMembers);
        if (typeof window !== 'undefined') {
          localStorage.setItem('btv_members', JSON.stringify(mergedMembers));
        }
      }
      if (dbCampaigns && dbCampaigns.length > 0) {
        if (localCampaigns.length > 0) {
          const cMap = new Map<string, Campaign>();
          dbCampaigns.forEach((c) => cMap.set(c.id, c));
          localCampaigns.forEach((c) => cMap.set(c.id, { ...cMap.get(c.id), ...c }));
          setCampaigns(Array.from(cMap.values()));
        } else {
          setCampaigns(dbCampaigns);
        }
      }

      setIsSupabaseConnected(true);
    } catch (e) {
      console.warn('Không thể đồng bộ Supabase ban đầu, dùng Local cache:', e);
    }
  }, []);

  // ----------------------------------------------------------------------------
  // 2. KHỞI TẠO SESSION GOOGLE AUTH, LOCAL STORAGE & REALTIME WEBSOCKET
  // ----------------------------------------------------------------------------
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const sessionActive = localStorage.getItem('btv_session_active');
      if (sessionActive === 'true') {
        setIsAuthenticated(true);
      }
      const savedMemberId = localStorage.getItem('btv_current_member_id');
      if (savedMemberId) {
        setCurrentMemberId(savedMemberId);
      }

      // Khôi phục Danh sách Thành viên
      const savedMembers = localStorage.getItem('btv_members');
      if (savedMembers) {
        try {
          const parsed = JSON.parse(savedMembers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Công việc
      const savedTasks = localStorage.getItem('btv_tasks');
      if (savedTasks) {
        try {
          const parsed = JSON.parse(savedTasks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Văn bản đến
      const savedDocs = localStorage.getItem('btv_docs');
      if (savedDocs) {
        try {
          const parsed = JSON.parse(savedDocs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIncomingDocs(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Mảng việc / Chiến dịch
      const savedCampaigns = localStorage.getItem('btv_campaigns');
      if (savedCampaigns) {
        try {
          const parsed = JSON.parse(savedCampaigns);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCampaigns(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Tin nhắn Chat
      const savedChat = localStorage.getItem('btv_chat_messages');
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Bình luận
      const savedComments = localStorage.getItem('btv_comments');
      if (savedComments) {
        try {
          const parsed = JSON.parse(savedComments);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setComments(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Nhật ký hoạt động
      const savedLogs = localStorage.getItem('btv_activity_logs');
      if (savedLogs) {
        try {
          const parsed = JSON.parse(savedLogs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setActivityLogs(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Ma trận Phân quyền
      const savedPermissions = localStorage.getItem('btv_role_permissions');
      if (savedPermissions) {
        try {
          const parsed = JSON.parse(savedPermissions);
          if (parsed && typeof parsed === 'object') {
            setRolePermissions(parsed);
          }
        } catch (e) {}
      }

      // Khôi phục Check-in Tuần
      const savedCheckins = localStorage.getItem('btv_weekly_checkins');
      if (savedCheckins) {
        try {
          const parsed = JSON.parse(savedCheckins);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWeeklyCheckins(parsed);
          }
        } catch (e) {}
      }
    }

    refreshDataFromSupabase();

    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setAuthUser(session.user);
          setIsAuthenticated(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('btv_session_active', 'true');
          }
          if (session.user.email) {
            const userEmail = session.user.email.toLowerCase();
            const matched = INITIAL_MEMBERS.find((m) => m.email.toLowerCase() === userEmail);
            if (matched) {
              setCurrentMemberId(matched.id);
            }
          }
        }
        setIsAuthLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setAuthUser(session.user);
          setIsAuthenticated(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('btv_session_active', 'true');
          }
          if (session.user.email) {
            const userEmail = session.user.email.toLowerCase();
            const matched = INITIAL_MEMBERS.find((m) => m.email.toLowerCase() === userEmail);
            if (matched) {
              setCurrentMemberId(matched.id);
            }
          }
        } else {
          setAuthUser(null);
        }
        setIsAuthLoading(false);
      });

      const unsubscribeRealtime = subscribeToBTVRealtime({
        onTaskInsert: (newTask) => {
          setTasks((prev) => {
            if (prev.some((t) => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
          });
        },
        onTaskUpdate: (updatedTask) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
          );
        },
        onTaskDelete: (taskId) => {
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
        },
        onChatInsert: (newMsg) => {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
        onCommentInsert: (newComment) => {
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
          setTasks((prev) =>
            prev.map((t) =>
              t.id === newComment.task_id
                ? { ...t, comments_count: (t.comments_count || 0) + 1 }
                : t
            )
          );
        },
        onDocInsert: (newDoc) => {
          setIncomingDocs((prev) => {
            if (prev.some((d) => d.id === newDoc.id)) return prev;
            return [newDoc, ...prev];
          });
        },
        onDocUpdate: (updatedDoc) => {
          setIncomingDocs((prev) =>
            prev.map((d) => (d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d))
          );
        },
        onLogInsert: (newLog) => {
          setActivityLogs((prev) => [newLog, ...prev]);
        },
        onStatusChange: (status) => {
          setIsRealtimeLive(status === 'SUBSCRIBED');
        },
      });

      return () => {
        subscription.unsubscribe();
        unsubscribeRealtime();
      };
    } else {
      setIsAuthLoading(false);
    }
  }, [refreshDataFromSupabase]);

  // Tự động sao lưu dữ liệu toàn bộ hệ thống vào LocalStorage (Bảo đảm lưu vĩnh viễn)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_docs', JSON.stringify(incomingDocs));
    }
  }, [incomingDocs, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_members', JSON.stringify(members));
    }
  }, [members, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_chat_messages', JSON.stringify(chatMessages));
    }
  }, [chatMessages, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_comments', JSON.stringify(comments));
    }
  }, [comments, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_activity_logs', JSON.stringify(activityLogs));
    }
  }, [activityLogs, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_role_permissions', JSON.stringify(rolePermissions));
    }
  }, [rolePermissions, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('btv_weekly_checkins', JSON.stringify(weeklyCheckins));
    }
  }, [weeklyCheckins, isMounted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_current_member_id', currentMemberId);
    }
  }, [currentMemberId]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  // ----------------------------------------------------------------------------
  // 3. THAO TÁC GOOGLE AUTH & AUTH GATE & TIỆN ÍCH HỆ THỐNG
  // ----------------------------------------------------------------------------
  const signInWithGoogle = async () => {
    const res = await signInWithGoogleOAuth();
    if (!res.error) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_session_active', 'true');
      }
    }
    return res;
  };

  const signOut = async () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('btv_session_active');
    }
    await signOutSupabase();
    setAuthUser(null);
  };

  // PHÂN LUỒNG ĐĂNG NHẬP THÔNG MINH THEO VAI TRÒ & THẨM QUYỀN
  const loginAsMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setCurrentMemberId(memberId);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_session_active', 'true');
      localStorage.setItem('btv_current_member_id', memberId);
    }

    // Phân luồng trang đích phù hợp:
    if (member) {
      if (member.role === 'bi_thu' || member.role === 'pho_bi_thu') {
        setActiveTab('trang_chu');
      } else if (member.role === 'chanh_van_phong') {
        setActiveTab('van_ban_den');
      } else {
        // Ủy viên BTV: điều hướng đến Việc của tôi để xử lý ngay công việc được phân công
        setActiveTab('viec_cua_toi');
      }
    }
  };

  const logout = async () => {
    await signOut();
  };

  // ----------------------------------------------------------------------------
  // QUẢN LÝ PHÂN QUYỀN (ROLE-BASED ACCESS CONTROL - RBAC)
  // ----------------------------------------------------------------------------
  const updateRolePermissions = (role: MemberRole, permissions: PermissionKey[]) => {
    setRolePermissions((prev) => {
      const updated = {
        ...prev,
        [role]: permissions,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_role_permissions', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateMemberCustomPermissions = (memberId: string, permissions?: PermissionKey[]) => {
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              custom_permissions: permissions && permissions.length > 0 ? permissions : undefined,
            }
          : m
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_members', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const resetRolePermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_role_permissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    }
  };

  const hasPermission = useCallback(
    (permKey: PermissionKey, targetMember?: Member): boolean => {
      const m = targetMember || currentMember;
      if (!m) return false;
      // Bí thư Đoàn trường luôn có toàn quyền tuyệt đối theo Quy chế
      if (m.role === 'bi_thu') return true;

      // Ưu tiên phân quyền tùy chỉnh riêng cho cá nhân nếu có (đã gán mảng quyền riêng)
      if (m.custom_permissions && Array.isArray(m.custom_permissions) && m.custom_permissions.length > 0) {
        return m.custom_permissions.includes(permKey);
      }

      // Kiểm tra ma trận quyền hạn theo vai trò
      const perms = rolePermissions[m.role] || DEFAULT_ROLE_PERMISSIONS[m.role] || [];
      return perms.includes(permKey);
    },
    [currentMember, rolePermissions]
  );

  // ----------------------------------------------------------------------------
  // QUẢN LÝ THAY ĐỔI AVATAR (AVATAR MODAL & PERSISTENCE)
  // ----------------------------------------------------------------------------
  const openAvatarModal = (member?: Member) => {
    setAvatarModalTargetMember(member || currentMember);
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setAvatarModalTargetMember(null);
  };

  const updateMemberAvatar = (memberId: string, newAvatarUrl: string) => {
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId ? { ...m, avatar_url: newAvatarUrl } : m
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_members', JSON.stringify(updated));
      }
      return updated;
    });

    if (supabase && isSupabaseConfigured) {
      supabase.from('members').update({ avatar_url: newAvatarUrl }).eq('id', memberId).then(() => {});
    }
  };

  // Check-in Tuần (Nhiệt kế Tinh thần)
  const addWeeklyCheckin = (checkin: Omit<WeeklyCheckin, 'id' | 'created_at'>): WeeklyCheckin => {
    const newCheckin: WeeklyCheckin = {
      ...checkin,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    setWeeklyCheckins((prev) => {
      const updated = [newCheckin, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_weekly_checkins', JSON.stringify(updated));
      }
      return updated;
    });
    return newCheckin;
  };

  // Trình xem PDF Scan Công văn
  const openPdfViewer = (url: string, title?: string, doc?: IncomingDocument) => {
    setSelectedPdfUrl(url);
    setSelectedPdfTitle(title || doc?.so_ky_hieu || 'Văn bản Scan');
    setSelectedPdfDoc(doc || null);
    setIsPdfModalOpen(true);
  };

  const closePdfViewer = () => {
    setIsPdfModalOpen(false);
    setSelectedPdfUrl(null);
    setSelectedPdfTitle(null);
    setSelectedPdfDoc(null);
  };

  // Cập nhật ủy quyền và bàn giao tạm thời cho BTV
  const updateMemberDelegation = (
    memberId: string,
    delegation: {
      busy_from: string | null;
      busy_to: string | null;
      busy_reason: string | null;
      delegate_to_id: string | null;
    }
  ) => {
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              ...delegation,
            }
          : m
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_members', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // ----------------------------------------------------------------------------
  // 4. QUẢN TRỊ THÀNH VIÊN (ADMIN CRUD)
  // ----------------------------------------------------------------------------
  const addMember = (memberData: Partial<Member>): Member => {
    const newMember: Member = {
      id: generateUUID(),
      email: memberData.email || `btv_${Date.now()}@hcmute.edu.vn`,
      full_name: memberData.full_name || 'Đồng chí BTV',
      role: memberData.role || 'uy_vien',
      mang_phu_trach: memberData.mang_phu_trach || 'van_phong',
      phone: memberData.phone || '0901234567',
      avatar_url: memberData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      active: memberData.active ?? true,
      alias: memberData.alias || [memberData.full_name || 'Đ/c mới'],
      created_at: new Date().toISOString(),
    };

    setMembers((prev) => {
      const updated = [...prev, newMember];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_members', JSON.stringify(updated));
      }
      return updated;
    });
    if (supabase && isSupabaseConfigured) {
      supabase.from('members').insert(newMember).then(() => {});
    }
    return newMember;
  };

  const updateMember = (memberId: string, updates: Partial<Member>) => {
    setMembers((prev) => {
      const updated = prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m));
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_members', JSON.stringify(updated));
      }
      return updated;
    });
    if (supabase && isSupabaseConfigured) {
      supabase.from('members').update(updates).eq('id', memberId).then(() => {});
    }
  };

  const deleteMember = (memberId: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== memberId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_members', JSON.stringify(updated));
      }
      return updated;
    });
    if (supabase && isSupabaseConfigured) {
      supabase.from('members').delete().eq('id', memberId).then(() => {});
    }
  };

  // ----------------------------------------------------------------------------
  // 5. QUẢN TRỊ MẢNG VIỆC / CHIẾN DỊCH (CAMPAIGNS CRUD)
  // ----------------------------------------------------------------------------
  const addCampaign = (campData: Partial<Campaign>): Campaign => {
    const newCamp: Campaign = {
      id: generateUUID(),
      name: campData.name || 'Mảng việc mới',
      description: campData.description || '',
      start_date: campData.start_date || new Date().toISOString().split('T')[0],
      end_date: campData.end_date || '',
      status: campData.status || 'dang_chay',
      color: campData.color || '#0284c7',
      created_by: currentMember.id,
      created_at: new Date().toISOString(),
    };

    setCampaigns((prev) => {
      const updated = [newCamp, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_campaigns', JSON.stringify(updated));
      }
      return updated;
    });
    if (supabase && isSupabaseConfigured) {
      supabase.from('campaigns').insert(newCamp).then(() => {});
    }
    return newCamp;
  };

  const updateCampaign = (campId: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) => {
      const updated = prev.map((c) => (c.id === campId ? { ...c, ...updates } : c));
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_campaigns', JSON.stringify(updated));
      }
      return updated;
    });
    if (supabase && isSupabaseConfigured) {
      supabase.from('campaigns').update(updates).eq('id', campId).then(() => {});
    }
  };

  const deleteCampaign = (campId: string) => {
    setCampaigns((prev) => {
      const updated = prev.filter((c) => c.id !== campId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_campaigns', JSON.stringify(updated));
      }
      return updated;
    });
    if (supabase && isSupabaseConfigured) {
      supabase.from('campaigns').delete().eq('id', campId).then(() => {});
    }
  };

  // ----------------------------------------------------------------------------
  // 6. XÓA & DỌN DẸP TOÀN BỘ DANH SÁCH ẢO
  // ----------------------------------------------------------------------------
  const clearDummyData = async () => {
    // Lọc bỏ các task mẫu ảo (các task có ID bắt đầu bằng 'a' từ mock data hoặc do mock sinh ra)
    const realTasks = tasks.filter(
      (t) => !t.id.startsWith('a1') && !t.id.startsWith('a2') && !t.id.startsWith('a3') &&
             !t.id.startsWith('a4') && !t.id.startsWith('a5') && !t.id.startsWith('a6')
    );
    setTasks(realTasks);

    // Lọc bỏ văn bản mẫu ảo
    const realDocs = incomingDocs.filter(
      (d) => !d.id.startsWith('d1') && !d.id.startsWith('d2') && !d.id.startsWith('d3') && !d.id.startsWith('d4')
    );
    setIncomingDocs(realDocs);

    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_tasks', JSON.stringify(realTasks));
      localStorage.setItem('btv_docs', JSON.stringify(realDocs));
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('tasks').delete().in('id', [
          'a1111111-1111-1111-1111-111111111111',
          'a2222222-2222-2222-2222-222222222222',
          'a3333333-3333-3333-3333-333333333333',
          'a4444444-4444-4444-4444-444444444444',
          'a5555555-5555-5555-5555-555555555555',
          'a6666666-6666-6666-6666-666666666666',
        ]);
        await supabase.from('incoming_documents').delete().in('id', [
          'd1111111-1111-1111-1111-111111111111',
          'd2222222-2222-2222-2222-222222222222',
          'd3333333-3333-3333-3333-333333333333',
          'd4444444-4444-4444-4444-444444444444',
        ]);
      } catch (err) {
        console.warn('Lỗi dọn dẹp Supabase dummy data:', err);
      }
    }
  };

  // ----------------------------------------------------------------------------
  // 7. THAO TÁC CÔNG VIỆC (GHI VĨNH VIỄN LÊN SUPABASE + REALTIME + NOTIFICATION)
  // ----------------------------------------------------------------------------

  const addTask = (taskData: Partial<Task> & { collaborator_ids?: string[] }): Task => {
    const newId = generateUUID();
    const newTask: Task = {
      id: newId,
      campaign_id: taskData.campaign_id || null,
      source_document_id: taskData.source_document_id || null,
      title: taskData.title || 'Công việc mới',
      description: taskData.description || '',
      owner_id: taskData.owner_id || currentMember.id,
      created_by: currentMember.id,
      priority: taskData.priority || 'binh_thuong',
      status: taskData.status || 'moi',
      approval_scope: taskData.approval_scope || 'chuyen_mon',
      due_at: taskData.due_at || null,
      collaborator_ids: taskData.collaborator_ids || [],
      access_level: taskData.access_level || 'cong_khai',
      inherited_doc_file_url: taskData.inherited_doc_file_url,
      inherited_doc_file_name: taskData.inherited_doc_file_name,
      delegated_from_id: taskData.delegated_from_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments_count: 0,
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    const log: ActivityLog = {
      id: generateUUID(),
      task_id: newTask.id,
      member_id: currentMember.id,
      action: 'created',
      detail: { title: newTask.title, owner_id: newTask.owner_id },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => {
      const updated = [log, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_activity_logs', JSON.stringify(updated));
      }
      return updated;
    });

    insertTaskToSupabase(newTask);
    insertActivityLogToSupabase(log);

    // Gửi thông báo đẩy đến điện thoại của người được giao việc
    const assignedMember = members.find((m) => m.id === newTask.owner_id);
    sendMobileNotification({
      title: `Nhiệm vụ mới: ${newTask.title}`,
      body: `Đ/c ${currentMember.full_name} đã giao việc cho ${assignedMember?.full_name || 'đồng chí'}. Hạn chót: ${newTask.due_at ? newTask.due_at.slice(0, 10) : 'Không có'}`,
      tag: `task-${newTask.id}`,
    });

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return task;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    updateTaskOnSupabase(taskId, updates);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_tasks', JSON.stringify(updated));
      }
      return updated;
    });
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    deleteTaskFromSupabase(taskId);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updates: Partial<Task> = { status };
    if (status === 'dang_lam' && !task.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (status === 'cho_duyet') {
      updates.submitted_at = new Date().toISOString();
    }
    if (status === 'hoan_thanh') {
      updates.completed_at = new Date().toISOString();
    }

    updateTask(taskId, updates);

    const log: ActivityLog = {
      id: generateUUID(),
      task_id: taskId,
      member_id: currentMember.id,
      action: 'status_changed',
      detail: { from: task.status, to: status },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);
    insertActivityLogToSupabase(log);
  };

  const submitTaskForApproval = (taskId: string) => {
    updateTaskStatus(taskId, 'cho_duyet');
  };

  const submitTaskResult = (
    taskId: string,
    submission: { note: string; links?: string[]; files?: string[] }
  ) => {
    const now = new Date().toISOString();
    const updates: Partial<Task> = {
      status: 'cho_duyet',
      submission_note: submission.note,
      submission_links: submission.links || [],
      submission_files: submission.files || [],
      submitted_at: now,
      updated_at: now,
    };
    updateTask(taskId, updates);

    const log: ActivityLog = {
      id: generateUUID(),
      task_id: taskId,
      member_id: currentMember.id,
      action: 'status_changed',
      detail: { from: 'dang_lam', to: 'cho_duyet', note: submission.note },
      created_at: now,
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);
    insertActivityLogToSupabase(log);
  };

  const reviewTaskResult = (
    taskId: string,
    review: { grade: RatingGrade; score: number; feedback: string; approved: boolean }
  ) => {
    const now = new Date().toISOString();
    if (review.approved) {
      const updates: Partial<Task> = {
        status: 'hoan_thanh',
        completed_at: now,
        rating_grade: review.grade,
        rating_score: review.score,
        review_feedback: review.feedback,
        rated_by: currentMember.id,
        rated_at: now,
        approved_by: currentMember.id,
        updated_at: now,
      };
      updateTask(taskId, updates);

      const log: ActivityLog = {
        id: generateUUID(),
        task_id: taskId,
        member_id: currentMember.id,
        action: 'approved',
        detail: {
          approved_by: currentMember.full_name,
          grade: review.grade,
          score: review.score,
          feedback: review.feedback,
        },
        created_at: now,
        member: currentMember,
      };
      setActivityLogs((prev) => [log, ...prev]);
      insertActivityLogToSupabase(log);
    } else {
      const updates: Partial<Task> = {
        status: 'dang_lam',
        review_feedback: review.feedback,
        updated_at: now,
      };
      updateTask(taskId, updates);

      addComment(
        taskId,
        `[YÊU CẦU LÀM LẠI] ${currentMember.full_name} đã đánh giá và yêu cầu bổ sung: "${review.feedback}"`
      );

      const log: ActivityLog = {
        id: generateUUID(),
        task_id: taskId,
        member_id: currentMember.id,
        action: 'status_changed',
        detail: { from: 'cho_duyet', to: 'dang_lam', feedback: review.feedback, reason: 'Yêu cầu làm lại' },
        created_at: now,
        member: currentMember,
      };
      setActivityLogs((prev) => [log, ...prev]);
      insertActivityLogToSupabase(log);
    }
  };

  const approveTask = (taskId: string): { success: boolean; message?: string } => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, message: 'Không tìm thấy công việc' };

    const role = currentMember.role;

    if (task.approval_scope === 'chuyen_mon') {
      if (role !== 'bi_thu' && role !== 'pho_bi_thu') {
        return {
          success: false,
          message:
            'Công việc này thuộc phạm vi Chuyên môn / Chủ trương, chỉ Bí thư hoặc Phó Bí thư mới có quyền phê duyệt hoàn thành!',
        };
      }
    } else if (task.approval_scope === 'hanh_chinh') {
      if (role !== 'bi_thu' && role !== 'pho_bi_thu' && role !== 'chanh_van_phong') {
        return {
          success: false,
          message: 'Chỉ Bí thư, Phó Bí thư hoặc Chánh văn phòng mới có quyền phê duyệt việc hành chính!',
        };
      }
    }

    const updates = {
      status: 'hoan_thanh' as TaskStatus,
      completed_at: new Date().toISOString(),
      approved_by: currentMember.id,
    };

    updateTask(taskId, updates);

    const log: ActivityLog = {
      id: generateUUID(),
      task_id: taskId,
      member_id: currentMember.id,
      action: 'approved',
      detail: { approved_by: currentMember.full_name, role: currentMember.role },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);
    insertActivityLogToSupabase(log);

    return { success: true };
  };

  const rejectTask = (taskId: string, reason: string) => {
    updateTask(taskId, {
      status: 'dang_lam',
      submitted_at: null,
    });

    addComment(taskId, `[YÊU CẦU LÀM LẠI] ${currentMember.full_name} đã yêu cầu bổ sung: "${reason}"`);
  };

  const manualRemind = (taskId: string, message: string): { success: boolean; message: string } => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, message: 'Không tìm thấy công việc' };

    if (
      currentMember.role !== 'bi_thu' &&
      currentMember.role !== 'pho_bi_thu' &&
      currentMember.role !== 'chanh_van_phong'
    ) {
      return { success: false, message: 'Chỉ Thường trực hoặc Chánh văn phòng mới có quyền đôn đốc công việc!' };
    }

    const lastRemindLog = activityLogs.find(
      (l) => l.task_id === taskId && l.member_id === currentMember.id && l.action === 'don_doc'
    );

    const check = checkCanManualRemind(lastRemindLog?.created_at);
    if (!check.allowed) {
      return {
        success: false,
        message: `Đồng chí vừa đôn đốc công việc này. Theo quy định, vui lòng đợi thêm ${check.waitMinutes} phút (tối đa 1 lần/6 giờ)!`,
      };
    }

    const log: ActivityLog = {
      id: generateUUID(),
      task_id: taskId,
      member_id: currentMember.id,
      action: 'don_doc',
      detail: {
        reminded_by: currentMember.full_name,
        role: currentMember.role,
        message,
      },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);
    insertActivityLogToSupabase(log);

    const newNotification = {
      id: 'n-' + Date.now(),
      title: `Đ/c ${currentMember.full_name} (${currentMember.role === 'chanh_van_phong' ? 'Chánh VP' : 'Thường trực'}) đã đôn đốc: "${task.title}"`,
      time: 'Vừa xong',
      icon: 'bell',
      unread: true,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Gửi thông báo rung chuông tới điện thoại
    sendMobileNotification({
      title: `Đôn đốc công việc: ${task.title}`,
      body: `Đ/c ${currentMember.full_name} nhắc nhở: "${message}"`,
      tag: `remind-${task.id}`,
      requireInteraction: true,
    });

    return {
      success: true,
      message: `Đã gửi đôn đốc thành công qua Web Push và Email tới người phụ trách!`,
    };
  };

  // ----------------------------------------------------------------------------
  // 8. THAO TÁC VĂN BẢN ĐẾN & GIAO VIỆC
  // ----------------------------------------------------------------------------

  const addIncomingDoc = (docData: Partial<IncomingDocument>): IncomingDocument => {
    const newDoc: IncomingDocument = {
      id: generateUUID(),
      don_vi_gui: docData.don_vi_gui || 'ĐƠN VỊ KHÁC',
      noi_dung: docData.noi_dung || '',
      so_ky_hieu: docData.so_ky_hieu || '',
      ngay_nhan: docData.ngay_nhan || new Date().toISOString().split('T')[0],
      ngay_chuyen_xu_ly: docData.ngay_chuyen_xu_ly || '',
      nguoi_nhan_xu_ly: docData.nguoi_nhan_xu_ly || 'Xin ý kiến BTV',
      thoi_han_xu_ly: docData.thoi_han_xu_ly || null,
      ghi_chu: docData.ghi_chu || '',
      file_path: docData.file_path,
      file_url: docData.file_url,
      file_name: docData.file_name,
      file_size: docData.file_size,
      access_level: docData.access_level || 'cong_khai',
      created_by: currentMember.id,
      created_at: new Date().toISOString(),
    };

    setIncomingDocs((prev) => {
      const updated = [newDoc, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_docs', JSON.stringify(updated));
      }
      return updated;
    });
    insertIncomingDocToSupabase(newDoc);
    return newDoc;
  };

  const assignTaskFromDocument = (
    docId: string,
    taskData?: Partial<Task>
  ): { success: boolean; task?: Task; message?: string } => {
    const doc = incomingDocs.find((d) => d.id === docId);
    if (!doc) return { success: false, message: 'Không tìm thấy thông tin văn bản đến.' };

    const existing = tasks.find((t) => t.source_document_id === docId);
    if (existing) {
      return {
        success: false,
        task: existing,
        message: `Văn bản này đã được giao việc: "${existing.title}". Hãy kiểm tra lại danh sách công việc!`,
      };
    }

    const newTask = addTask({
      title: taskData?.title || `Xử lý VB [${doc.so_ky_hieu || 'CV'}]: ${doc.noi_dung.slice(0, 60)}...`,
      description:
        taskData?.description ||
        `Trích yếu văn bản: ${doc.noi_dung}\nĐơn vị gửi: ${doc.don_vi_gui}\nSố ký hiệu: ${doc.so_ky_hieu || 'Chưa có'}\nGhi chú: ${doc.ghi_chu || 'Không'}`,
      source_document_id: doc.id,
      owner_id: taskData?.owner_id || currentMember.id,
      collaborator_ids: taskData?.collaborator_ids || [],
      priority: taskData?.priority || 'cao',
      approval_scope: taskData?.approval_scope || 'chuyen_mon',
      due_at: taskData?.due_at || doc.thoi_han_xu_ly || new Date(Date.now() + 7 * 86400000).toISOString(),
      access_level: doc.access_level || 'cong_khai',
      inherited_doc_file_url: doc.file_url,
      inherited_doc_file_name: doc.file_name,
      delegated_from_id: taskData?.delegated_from_id,
      status: 'moi',
    });

    const ownerName =
      members.find((m) => m.id === newTask.owner_id)?.full_name || currentMember.full_name;
    const docUpdates = {
      ngay_chuyen_xu_ly: new Date().toISOString().split('T')[0],
      nguoi_nhan_xu_ly: ownerName,
    };
    setIncomingDocs((prev) => {
      const updated = prev.map((d) => (d.id === docId ? { ...d, ...docUpdates } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_docs', JSON.stringify(updated));
      }
      return updated;
    });
    updateIncomingDocOnSupabase(docId, docUpdates);

    return { success: true, task: newTask };
  };

  const createTasksFromDoc = (
    docId: string,
    assigneeIds: string[],
    title?: string,
    description?: string,
    priority: TaskPriority = 'binh_thuong',
    approvalScope: ApprovalScope = 'hanh_chinh'
  ): Task[] => {
    const doc = incomingDocs.find((d) => d.id === docId);
    if (!doc || assigneeIds.length === 0) return [];

    const createdTasks: Task[] = [];

    assigneeIds.forEach((assigneeId) => {
      const newTask = addTask({
        source_document_id: doc.id,
        title: title || `Xử lý VB [${doc.so_ky_hieu || 'CV'}]: ${doc.noi_dung.slice(0, 50)}...`,
        description: description || `Theo văn bản đến số ${doc.so_ky_hieu || ''} từ ${doc.don_vi_gui}. Ghi chú: ${doc.ghi_chu || 'Không'}`,
        owner_id: assigneeId,
        priority,
        approval_scope: approvalScope,
        due_at: doc.thoi_han_xu_ly || null,
        access_level: doc.access_level || 'cong_khai',
        inherited_doc_file_url: doc.file_url,
        inherited_doc_file_name: doc.file_name,
        status: 'moi',
      });
      createdTasks.push(newTask);
    });

    const assigneeNames = assigneeIds
      .map((id) => members.find((m) => m.id === id)?.full_name || '')
      .filter(Boolean)
      .join(', ');

    const docUpdates = {
      ngay_chuyen_xu_ly: new Date().toISOString().split('T')[0],
      nguoi_nhan_xu_ly: assigneeNames || doc.nguoi_nhan_xu_ly,
    };

    setIncomingDocs((prev) => {
      const updated = prev.map((d) => (d.id === docId ? { ...d, ...docUpdates } : d));
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_docs', JSON.stringify(updated));
      }
      return updated;
    });
    updateIncomingDocOnSupabase(docId, docUpdates);

    return createdTasks;
  };

  // ----------------------------------------------------------------------------
  // 9. THAO TÁC BÌNH LUẬN & CHAT NHÓM BTV
  // ----------------------------------------------------------------------------

  const addComment = (taskId: string, body: string) => {
    const newComment: TaskComment = {
      id: generateUUID(),
      task_id: taskId,
      member_id: currentMember.id,
      body,
      created_at: new Date().toISOString(),
      member: currentMember,
    };

    setComments((prev) => {
      const updated = [...prev, newComment];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_comments', JSON.stringify(updated));
      }
      return updated;
    });

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, comments_count: (t.comments_count || 0) + 1 } : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_tasks', JSON.stringify(updated));
      }
      return updated;
    });

    insertCommentToSupabase(newComment);
  };

  const sendChatMessage = (
    body: string,
    replyTo?: string,
    mentions?: string[],
    richCard?: ChatRichCard
  ) => {
    const newMsg: ChatMessage = {
      id: generateUUID(),
      member_id: currentMember.id,
      body,
      reply_to: replyTo || null,
      mentions: mentions || [],
      rich_card: richCard,
      created_at: new Date().toISOString(),
      member: currentMember,
    };

    setChatMessages((prev) => {
      const updated = [...prev, newMsg];
      if (typeof window !== 'undefined') {
        localStorage.setItem('btv_chat_messages', JSON.stringify(updated));
      }
      return updated;
    });
    insertChatMessageToSupabase(newMsg);
  };

  // ----------------------------------------------------------------------------
  // 10. TRỢ GIÚP THỐNG KÊ & PHÂN TÍCH TIẾN ĐỘ
  // ----------------------------------------------------------------------------

  const getMyTasks = (memberId?: string) => {
    const targetId = memberId || currentMember.id;
    const myTasks = tasks.filter(
      (t) => t.owner_id === targetId || (t.collaborator_ids && t.collaborator_ids.includes(targetId))
    );

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const overdue: Task[] = [];
    const today: Task[] = [];
    const thisWeek: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    myTasks.forEach((t) => {
      if (t.status === 'hoan_thanh') {
        completed.push(t);
        return;
      }

      if (!t.due_at) {
        upcoming.push(t);
        return;
      }

      const due = new Date(t.due_at);
      const dueDateStr = due.toISOString().split('T')[0];

      if (due < now) {
        overdue.push(t);
      } else if (dueDateStr === todayStr) {
        today.push(t);
      } else {
        const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 7) {
          thisWeek.push(t);
        } else {
          upcoming.push(t);
        }
      }
    });

    return { overdue, today, thisWeek, upcoming, completed };
  };

  const getCoordinatorData = () => {
    const now = new Date();

    const overdueTasks = tasks
      .filter((t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < now)
      .map((t) => {
        const diffMs = now.getTime() - new Date(t.due_at!).getTime();
        const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 3600 * 24)));
        return { ...t, daysOverdue };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    const dueIn48Hours = tasks.filter((t) => {
      if (t.status === 'hoan_thanh' || t.status === 'huy' || !t.due_at) return false;
      const due = new Date(t.due_at);
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 3600);
      return diffHours > 0 && diffHours <= 48;
    });

    const waitingApproval = tasks.filter((t) => t.status === 'cho_duyet');

    const workloadPerMember = members.map((member) => {
      const memberTasks = tasks.filter(
        (t) => t.owner_id === member.id && t.status !== 'hoan_thanh' && t.status !== 'huy'
      );
      const overdue = memberTasks.filter((t) => t.due_at && new Date(t.due_at) < now).length;
      const waiting = memberTasks.filter((t) => t.status === 'cho_duyet').length;
      return {
        member,
        total: memberTasks.length,
        overdue,
        waiting,
      };
    });

    const busyMembers = members.filter((m) => m.busy_from && m.busy_to);

    const tasksWithoutDueDate = tasks.filter(
      (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && !t.due_at
    );

    const tasksWithoutOwner = tasks.filter((t) => !t.owner_id);

    const unassignedDocs = incomingDocs.filter(
      (d) =>
        d.nguoi_nhan_xu_ly?.toLowerCase().includes('xin ý kiến') ||
        !d.nguoi_nhan_xu_ly ||
        d.nguoi_nhan_xu_ly.trim() === ''
    );

    return {
      overdueTasks,
      dueIn48Hours,
      waitingApproval,
      workloadPerMember,
      busyMembers,
      tasksWithoutDueDate,
      tasksWithoutOwner,
      unassignedDocs,
    };
  };

  const getReportData = (filterMonth?: number, filterYear?: number) => {
    // Mặc định Tháng 9/2026
    const targetMonth = filterMonth !== undefined ? filterMonth : 9;
    const targetYear = filterYear !== undefined ? filterYear : 2026;

    // Lọc công việc trong kỳ
    const filteredTasks = tasks.filter((t) => {
      if (targetMonth === 0) return true; // Toàn bộ
      const dateStr = t.completed_at || t.due_at || t.created_at;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear;
    });

    const completedTasks = filteredTasks.filter((t) => t.status === 'hoan_thanh');
    let beforeDeadline = 0;
    let onTime = 0;
    let afterDeadline = 0;

    const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
    let totalScoreSum = 0;
    let scoredTasksCount = 0;

    completedTasks.forEach((t) => {
      if (t.rating_grade && gradeCounts[t.rating_grade] !== undefined) {
        gradeCounts[t.rating_grade]++;
      }
      if (typeof t.rating_score === 'number') {
        totalScoreSum += t.rating_score;
        scoredTasksCount++;
      }

      if (!t.due_at || !t.completed_at) {
        onTime++;
        return;
      }
      const due = new Date(t.due_at);
      const comp = new Date(t.completed_at);
      const dueDateStr = due.toISOString().split('T')[0];
      const compDateStr = comp.toISOString().split('T')[0];

      if (compDateStr < dueDateStr) {
        beforeDeadline++;
      } else if (compDateStr === dueDateStr) {
        onTime++;
      } else {
        afterDeadline++;
      }
    });

    const averageScore =
      scoredTasksCount > 0 ? Math.round((totalScoreSum / scoredTasksCount) * 10) / 10 : 9.0;

    const now = new Date();
    const memberStats = members.map((member) => {
      const assigned = filteredTasks.filter((t) => t.owner_id === member.id);
      const comp = assigned.filter((t) => t.status === 'hoan_thanh');
      const inProg = assigned.filter((t) => t.status === 'dang_lam' || t.status === 'moi');
      const ov = assigned.filter(
        (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < now
      );

      let compOnTime = 0;
      let compLate = 0;
      let memberScoreSum = 0;
      let memberScoredCount = 0;
      const mGrades = { A: 0, B: 0, C: 0, D: 0 };

      comp.forEach((t) => {
        if (t.rating_grade && mGrades[t.rating_grade] !== undefined) {
          mGrades[t.rating_grade]++;
        }
        if (typeof t.rating_score === 'number') {
          memberScoreSum += t.rating_score;
          memberScoredCount++;
        }

        if (!t.due_at || !t.completed_at) {
          compOnTime++;
        } else if (new Date(t.completed_at) <= new Date(t.due_at)) {
          compOnTime++;
        } else {
          compLate++;
        }
      });

      const mAvgScore =
        memberScoredCount > 0 ? Math.round((memberScoreSum / memberScoredCount) * 10) / 10 : 0;

      return {
        member,
        totalAssigned: assigned.length,
        completedOnTime: compOnTime,
        completedLate: compLate,
        inProgress: inProg.length,
        overdue: ov.length,
        averageScore: mAvgScore,
        gradeCounts: mGrades,
        tasks: assigned,
      };
    });

    return {
      totalTasks: filteredTasks.length,
      totalCompleted: completedTasks.length,
      beforeDeadline,
      onTime,
      afterDeadline,
      averageScore,
      gradeCounts,
      memberStats,
    };
  };

  return (
    <AppContext.Provider
      value={{
        members,
        currentMember,
        setCurrentMemberId,
        isAuthenticated,
        loginAsMember,
        logout,
        addMember,
        updateMember,
        deleteMember,
        updateMemberAvatar,
        rolePermissions,
        updateRolePermissions,
        updateMemberCustomPermissions,
        resetRolePermissionsToDefault,
        hasPermission,
        isAvatarModalOpen,
        setIsAvatarModalOpen,
        avatarModalTargetMember,
        openAvatarModal,
        closeAvatarModal,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        clearDummyData,
        authUser,
        isAuthLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signInWithGoogle,
        signOut,
        isSupabaseConnected,
        isRealtimeLive,
        refreshDataFromSupabase,
        tasks,
        campaigns,
        incomingDocs,
        chatMessages,
        activityLogs,
        comments,
        notifications,
        weeklyCheckins,
        addWeeklyCheckin,
        isWeeklyCheckinModalOpen,
        setIsWeeklyCheckinModalOpen,
        selectedPdfUrl,
        selectedPdfTitle,
        selectedPdfDoc,
        isPdfModalOpen,
        openPdfViewer,
        closePdfViewer,
        activeTab,
        setActiveTab,
        selectedTaskId,
        setSelectedTaskId,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        isCreateDocModalOpen,
        setIsCreateDocModalOpen,
        isCreateCampaignModalOpen,
        setIsCreateCampaignModalOpen,
        isMounted,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        submitTaskForApproval,
        submitTaskResult,
        reviewTaskResult,
        approveTask,
        rejectTask,
        manualRemind,
        addIncomingDoc,
        assignTaskFromDocument,
        createTasksFromDoc,
        addComment,
        sendChatMessage,
        getMyTasks,
        getCoordinatorData,
        getReportData,
        updateMemberDelegation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
