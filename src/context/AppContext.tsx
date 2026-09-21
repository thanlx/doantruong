'use client';

// ==============================================================================
// APP CONTEXT: QUẢN LÝ DỮ LIỆU, PHÂN QUYỀN 4 VAI TRÒ & ĐỒNG BỘ TRẠNG THÁI
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  Task,
  Campaign,
  IncomingDocument,
  ChatMessage,
  TaskComment,
  TaskAttachment,
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

interface AppContextType {
  // Thành viên & Người dùng hiện tại
  members: Member[];
  currentMember: Member;
  setCurrentMemberId: (id: string) => void;

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

  // Thao tác Công việc
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

  // Thao tác Thảo luận & Chat
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
  // Mặc định đăng nhập với vai trò Đ/c Lê Xuân Thân (Phó Bí thư) như trong thiết kế mẫu
  const [currentMemberId, setCurrentMemberId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [incomingDocs, setIncomingDocs] = useState<IncomingDocument[]>(INITIAL_DOCUMENTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);

  const [activeTab, setActiveTab] = useState<string>('trang_chu');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);

  // Lưu trữ LocalStorage để giữ dữ liệu khi F5
  useEffect(() => {
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
  }, []);

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

  // Thêm công việc mới
  const addTask = (taskData: Partial<Task> & { collaborator_ids?: string[] }): Task => {
    const newTask: Task = {
      id: 't-' + Date.now(),
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

    setTasks((prev) => [newTask, ...prev]);

    // Ghi nhật ký
    const log: ActivityLog = {
      id: 'log-' + Date.now(),
      task_id: newTask.id,
      member_id: currentMember.id,
      action: 'created',
      detail: { title: newTask.title, owner_id: newTask.owner_id },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);

    return newTask;
  };

  // Cập nhật công việc
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
  };

  // Xóa công việc
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // Chuyển trạng thái
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
      id: 'log-' + Date.now(),
      task_id: taskId,
      member_id: currentMember.id,
      action: 'status_changed',
      detail: { from: task.status, to: status },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  // Nộp duyệt hoàn thành
  const submitTaskForApproval = (taskId: string) => {
    updateTaskStatus(taskId, 'cho_duyet');
  };

  // Duyệt hoàn thành theo quy tắc approval_scope & role
  const approveTask = (taskId: string): { success: boolean; message?: string } => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, message: 'Không tìm thấy công việc' };

    const role = currentMember.role;

    // Kiểm tra quyền hạn theo đặc tả:
    // - Việc hành chính: Chánh VP, Phó Bí thư, Bí thư đều duyệt được
    // - Việc chuyên môn: CHỈ Bí thư / Phó Bí thư được duyệt
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

    updateTask(taskId, {
      status: 'hoan_thanh',
      completed_at: new Date().toISOString(),
      approved_by: currentMember.id,
    });

    const log: ActivityLog = {
      id: 'log-' + Date.now(),
      task_id: taskId,
      member_id: currentMember.id,
      action: 'approved',
      detail: { approved_by: currentMember.full_name, role: currentMember.role },
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true };
  };

  // Từ chối duyệt, yêu cầu làm lại
  const rejectTask = (taskId: string, reason: string) => {
    updateTask(taskId, {
      status: 'dang_lam',
      submitted_at: null,
    });

    // Thêm bình luận lý do
    addComment(taskId, `[YÊU CẦU LÀM LẠI] ${currentMember.full_name} đã yêu cầu bổ sung: "${reason}"`);
  };

  // Đôn đốc thủ công
  const manualRemind = (taskId: string, message: string): { success: boolean; message: string } => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, message: 'Không tìm thấy công việc' };

    // Kiểm tra vai trò: Chỉ Bí thư, Phó Bí thư, Chánh văn phòng được đôn đốc
    if (
      currentMember.role !== 'bi_thu' &&
      currentMember.role !== 'pho_bi_thu' &&
      currentMember.role !== 'chanh_van_phong'
    ) {
      return { success: false, message: 'Chỉ Thường trực hoặc Chánh văn phòng mới có quyền đôn đốc công việc!' };
    }

    // Tìm lần đôn đốc gần nhất của người này với công việc này
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

    // Ghi nhật ký công khai
    const log: ActivityLog = {
      id: 'log-' + Date.now(),
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

    // Thêm thông báo
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

  // Thêm văn bản đến mới
  const addIncomingDoc = (docData: Partial<IncomingDocument>): IncomingDocument => {
    const newDoc: IncomingDocument = {
      id: 'doc-' + Date.now(),
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
    return newDoc;
  };

  // Giao việc từ văn bản đến: 1 văn bản sinh nhiều task riêng lẻ cho từng người
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
      const assignee = members.find((m) => m.id === assigneeId);
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

    // Cập nhật người nhận xử lý trong sổ văn bản nếu trước đó ghi Xin ý kiến BTV
    const assigneeNames = assigneeIds
      .map((id) => members.find((m) => m.id === id)?.full_name || '')
      .filter(Boolean)
      .join(', ');

    setIncomingDocs((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            ngay_chuyen_xu_ly: new Date().toISOString().split('T')[0],
            nguoi_nhan_xu_ly: assigneeNames || d.nguoi_nhan_xu_ly,
          };
        }
        return d;
      })
    );

    return createdTasks;
  };

  // Thêm bình luận
  const addComment = (taskId: string, body: string) => {
    const newComment: TaskComment = {
      id: 'cmt-' + Date.now(),
      task_id: taskId,
      member_id: currentMember.id,
      body,
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setComments((prev) => [...prev, newComment]);

    // Tăng đếm bình luận
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments_count: (t.comments_count || 0) + 1 } : t))
    );
  };

  // Gửi tin nhắn chat chung
  const sendChatMessage = (body: string, replyTo?: string) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      member_id: currentMember.id,
      body,
      reply_to: replyTo || null,
      created_at: new Date().toISOString(),
      member: currentMember,
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Lấy danh sách Việc của tôi theo nhóm
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

  // Dữ liệu Bảng điều phối cho Chánh VP & Thường trực
  const getCoordinatorData = () => {
    const now = new Date();

    // Việc đang trễ
    const overdueTasks = tasks
      .filter((t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < now)
      .map((t) => {
        const diffMs = now.getTime() - new Date(t.due_at!).getTime();
        const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 3600 * 24)));
        return { ...t, daysOverdue };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    // Đến hạn trong 48 giờ
    const dueIn48Hours = tasks.filter((t) => {
      if (t.status === 'hoan_thanh' || t.status === 'huy' || !t.due_at) return false;
      const due = new Date(t.due_at);
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 3600);
      return diffHours > 0 && diffHours <= 48;
    });

    // Việc chờ duyệt
    const waitingApproval = tasks.filter((t) => t.status === 'cho_duyet');

    // Tải việc từng người
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

    // Ai đang bận
    const busyMembers = members.filter((m) => m.busy_from && m.busy_to);

    // Việc không có hạn
    const tasksWithoutDueDate = tasks.filter(
      (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && !t.due_at
    );

    // Việc chưa có ai phụ trách
    const tasksWithoutOwner = tasks.filter((t) => !t.owner_id);

    // Văn bản chờ phân công
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

  // Thống kê báo cáo
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
