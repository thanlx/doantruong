'use client';

// ==============================================================================
// APP CONTEXT: QUẢN LÝ DỮ LIỆU, XÁC THỰC GOOGLE OAUTH & REALTIME SUPABASE
// Hỗ trợ lưu trữ vĩnh viễn trên Supabase, đồng bộ tức thời và chế độ Offline
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
} from '@/types';
import {
  INITIAL_MEMBERS,
  INITIAL_CAMPAIGNS,
  INITIAL_DOCUMENTS,
  INITIAL_TASKS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '@/lib/mockData';
import { checkCanManualRemind } from '@/lib/notifications';
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

  // Điều hướng
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;

  // Thao tác Công việc (Ghi vĩnh viễn Supabase + Realtime)
  addTask: (task: Partial<Task> & { collaborator_ids?: string[] }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitTaskForApproval: (taskId: string) => void;
  approveTask: (taskId: string) => { success: boolean; message?: string };
  rejectTask: (taskId: string, reason: string) => void;
  manualRemind: (taskId: string, message: string) => { success: boolean; message: string };

  // Thao tác Văn bản đến
  addIncomingDoc: (doc: Partial<IncomingDocument>) => IncomingDocument;
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
  sendChatMessage: (body: string, replyTo?: string) => void;

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
  getReportData: () => {
    totalCompleted: number;
    beforeDeadline: number;
    onTime: number;
    afterDeadline: number;
    memberStats: Array<{
      member: Member;
      totalAssigned: number;
      completedOnTime: number;
      completedLate: number;
      inProgress: number;
      overdue: number;
    }>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo state với dữ liệu mẫu từ mockData
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [currentMemberId, setCurrentMemberId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [incomingDocs, setIncomingDocs] = useState<IncomingDocument[]>(INITIAL_DOCUMENTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);

  // Trạng thái Google Auth & Realtime
  const [authUser, setAuthUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);
  const [isRealtimeLive, setIsRealtimeLive] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('trang_chu');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);

  // ----------------------------------------------------------------------------
  // 1. TẢI DỮ LIỆU TỪ SUPABASE (HOẶC LOCALSTORAGE NẾU OFFLINE)
  // ----------------------------------------------------------------------------
  const refreshDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      // Tự động kiểm tra và seed nếu database trên Supabase đang trống
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

      if (dbTasks && dbTasks.length > 0) setTasks(dbTasks);
      if (dbChat && dbChat.length > 0) setChatMessages(dbChat);
      if (dbDocs && dbDocs.length > 0) setIncomingDocs(dbDocs);
      if (dbComments && dbComments.length > 0) setComments(dbComments);
      if (dbLogs && dbLogs.length > 0) setActivityLogs(dbLogs);
      if (dbMembers && dbMembers.length > 0) setMembers(dbMembers);
      if (dbCampaigns && dbCampaigns.length > 0) setCampaigns(dbCampaigns);

      setIsSupabaseConnected(true);
    } catch (e) {
      console.warn('Không thể đồng bộ Supabase ban đầu, dùng Local cache:', e);
    }
  }, []);

  // ----------------------------------------------------------------------------
  // 2. KHỞI TẠO SESSION GOOGLE AUTH & REALTIME WEBSOCKET
  // ----------------------------------------------------------------------------
  useEffect(() => {
    // Khởi tạo từ LocalStorage trước để hiển thị ngay tức thì
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('btv_tasks');
      if (savedTasks) {
        try { setTasks(JSON.parse(savedTasks)); } catch (e) {}
      }
      const savedDocs = localStorage.getItem('btv_docs');
      if (savedDocs) {
        try { setIncomingDocs(JSON.parse(savedDocs)); } catch (e) {}
      }
      const savedMemberId = localStorage.getItem('btv_current_member_id');
      if (savedMemberId) {
        setCurrentMemberId(savedMemberId);
      }
    }

    // Tải dữ liệu cloud từ Supabase
    refreshDataFromSupabase();

    // Lắng nghe phiên đăng nhập Google Auth từ Supabase
    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setAuthUser(session.user);
          // Tự động khớp email Google với 9 thành viên BTV
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

      // Đăng ký nhận sự kiện Realtime đa thiết bị
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
          // Tăng biến đếm comment
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

  // Lưu trữ LocalStorage dự phòng offline
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_docs', JSON.stringify(incomingDocs));
    }
  }, [incomingDocs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_current_member_id', currentMemberId);
    }
  }, [currentMemberId]);

  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  // ----------------------------------------------------------------------------
  // 3. THAO TÁC GOOGLE AUTH (ĐĂNG NHẬP / ĐĂNG XUẤT)
  // ----------------------------------------------------------------------------
  const signInWithGoogle = async () => {
    return await signInWithGoogleOAuth();
  };

  const signOut = async () => {
    await signOutSupabase();
    setAuthUser(null);
  };

  // ----------------------------------------------------------------------------
  // 4. THAO TÁC CÔNG VIỆC (GHI VĨNH VIỄN LÊN SUPABASE + REALTIME)
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments_count: 0,
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);

    // Ghi nhật ký
    const log: ActivityLog = {
      id: generateUUID(),
      task_id: newTask.id,
      member_id: currentMember.id,
      action: 'created',
      detail: { title: newTask.title, owner_id: newTask.owner_id },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);

    // Ghi vĩnh viễn lên Supabase
    insertTaskToSupabase(newTask);
    insertActivityLogToSupabase(log);

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        }
        return task;
      })
    );

    // Ghi lên Supabase
    updateTaskOnSupabase(taskId, updates);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    // Xóa trên Supabase
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

  const approveTask = (taskId: string): { success: boolean; message?: string } => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, message: 'Không tìm thấy công việc' };

    const role = currentMember.role;

    // Kiểm tra thẩm quyền phê duyệt
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

    return {
      success: true,
      message: `Đã gửi đôn đốc thành công qua Web Push và Email tới người phụ trách!`,
    };
  };

  // ----------------------------------------------------------------------------
  // 5. THAO TÁC VĂN BẢN ĐẾN & CHUYỂN XỬ LÝ
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
      created_by: currentMember.id,
      created_at: new Date().toISOString(),
    };

    setIncomingDocs((prev) => [newDoc, ...prev]);
    insertIncomingDocToSupabase(newDoc);
    return newDoc;
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

    setIncomingDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, ...docUpdates } : d))
    );
    updateIncomingDocOnSupabase(docId, docUpdates);

    return createdTasks;
  };

  // ----------------------------------------------------------------------------
  // 6. THAO TÁC BÌNH LUẬN & CHAT NHÓM BTV
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

    setComments((prev) => [...prev, newComment]);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments_count: (t.comments_count || 0) + 1 } : t))
    );

    insertCommentToSupabase(newComment);
  };

  const sendChatMessage = (body: string, replyTo?: string) => {
    const newMsg: ChatMessage = {
      id: generateUUID(),
      member_id: currentMember.id,
      body,
      reply_to: replyTo || null,
      created_at: new Date().toISOString(),
      member: currentMember,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    insertChatMessageToSupabase(newMsg);
  };

  // ----------------------------------------------------------------------------
  // 7. TRỢ GIÚP THỐNG KÊ & PHÂN TÍCH TIẾN ĐỘ
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

  const getReportData = () => {
    const completedTasks = tasks.filter((t) => t.status === 'hoan_thanh');
    let beforeDeadline = 0;
    let onTime = 0;
    let afterDeadline = 0;

    completedTasks.forEach((t) => {
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

    const now = new Date();
    const memberStats = members.map((member) => {
      const assigned = tasks.filter((t) => t.owner_id === member.id);
      const comp = assigned.filter((t) => t.status === 'hoan_thanh');
      const inProg = assigned.filter((t) => t.status === 'dang_lam' || t.status === 'moi');
      const ov = assigned.filter(
        (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < now
      );

      let compOnTime = 0;
      let compLate = 0;
      comp.forEach((t) => {
        if (!t.due_at || !t.completed_at) {
          compOnTime++;
        } else if (new Date(t.completed_at) <= new Date(t.due_at)) {
          compOnTime++;
        } else {
          compLate++;
        }
      });

      return {
        member,
        totalAssigned: assigned.length,
        completedOnTime: compOnTime,
        completedLate: compLate,
        inProgress: inProg.length,
        overdue: ov.length,
      };
    });

    return {
      totalCompleted: completedTasks.length,
      beforeDeadline,
      onTime,
      afterDeadline,
      memberStats,
    };
  };

  return (
    <AppContext.Provider
      value={{
        members,
        currentMember,
        setCurrentMemberId,
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
        activeTab,
        setActiveTab,
        selectedTaskId,
        setSelectedTaskId,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        submitTaskForApproval,
        approveTask,
        rejectTask,
        manualRemind,
        addIncomingDoc,
        createTasksFromDoc,
        addComment,
        sendChatMessage,
        getMyTasks,
        getCoordinatorData,
        getReportData,
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
