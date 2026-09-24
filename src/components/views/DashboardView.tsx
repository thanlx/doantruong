'use client';

// ==============================================================================
// DASHBOARD VIEW: TRANG CHỦ CHUẨN HCMUTE DESIGN SYSTEM (QUICK ACTIONS & PUSH NOTIF)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  ClipboardList,
  AlertCircle,
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  Plus,
  PlusCircle,
  FilePlus,
  FolderPlus,
  Bell,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { requestNotificationPermission, getNotificationPermissionState, sendMobileNotification } from '@/lib/pushNotifications';
import EventCountdown from '@/components/EventCountdown';
import DashboardCalendar from '@/components/DashboardCalendar';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import type { Task } from '@/types';

export default function DashboardView() {
  const {
    currentMember,
    members,
    tasks,
    campaigns,
    notifications,
    setActiveTab,
    setSelectedTaskId,
    updateTaskStatus,
    setIsCreateTaskModalOpen,
    setIsCreateDocModalOpen,
    setIsCreateCampaignModalOpen,
    clearDummyData,
  } = useApp();

  const [notifState, setNotifState] = useState<string>(getNotificationPermissionState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const now = new Date();

  // Đếm các số liệu thống kê thực tế từ dữ liệu
  const inProgressTasks = tasks.filter((t) => t.status === 'dang_lam' || t.status === 'moi');
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < now
  );

  // Đếm số lượng task ảo
  const dummyTasksCount = tasks.filter(
    (t) => t.id.startsWith('a1') || t.id.startsWith('a2') || t.id.startsWith('a3') ||
           t.id.startsWith('a4') || t.id.startsWith('a5') || t.id.startsWith('a6')
  ).length;

  // Danh sách công việc gần đây
  const recentTasks = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
  const upcomingTasks = tasks.filter(task => task.status !== 'hoan_thanh' && task.status !== 'huy')
    .sort((a, b) => (a.due_at ? new Date(a.due_at).getTime() : Infinity) - (b.due_at ? new Date(b.due_at).getTime() : Infinity));

  // Xử lý bật thông báo điện thoại
  const handleEnableNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifState('granted');
      showToast('Đã bật thông báo rung chuông thành công trên thiết bị!');
    } else {
      showToast('Vui lòng cấp quyền thông báo trong cài đặt trình duyệt.');
    }
  };

  // Xử lý xóa danh sách ảo nhanh
  const handleClearDummy = async () => {
    if (confirm('Đồng chí có chắc muốn xóa sạch toàn bộ công việc và văn bản ảo năm 2025 không?')) {
      await clearDummyData();
      showToast('Đã dọn dẹp sạch danh sách ảo!');
    }
  };

  const getStatusBadge = (task: Task) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh' && task.status !== 'huy';

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
          Quá hạn
        </span>
      );
    }

    switch (task.status) {
      case 'pending_review':
      case 'cho_duyet':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Chờ duyệt
          </span>
        );
      case 'hoan_thanh':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            Hoàn thành
          </span>
        );
      case 'dang_lam':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            Đang thực hiện
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Chưa bắt đầu
          </span>
        );
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'khan':
        return 'bg-destructive';
      case 'cao':
        return 'bg-amber-500';
      case 'thap':
        return 'bg-muted-foreground';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <section className="dashboard-hero" aria-label="Lời chào">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[.16em] font-semibold text-primary">Không gian làm việc BTV</span>
          <h1>Xin chào, {currentMember.full_name}! 👋</h1>
          <p className="text-muted-foreground">Cùng nhau xây dựng môi trường học tập năng động.<br className="hidden xl:block" /> Sáng tạo và giàu bản sắc thanh niên.</p>
        </div>
        <img src="/images/hcmute-campus.webp" alt="Khuôn viên trường HCMUTE" className="dashboard-campus" />
        <blockquote className="dashboard-quote">“Đâu cần thanh niên có,<br />đâu khó có thanh niên”<cite>— Chủ tịch Hồ Chí Minh</cite></blockquote>
      </section>

      {/* 2. DẢI NÚT THAO TÁC NHANH (QUICK ACTIONS TOOLBAR) */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x -mx-1 px-1">
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#0B5CFF] text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-blue-600 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Giao việc mới</span>
        </button>

        <button
          onClick={() => setIsCreateDocModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-teal-700 transition-all active:scale-95 shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>+ Tiếp nhận văn bản</span>
        </button>

        <button
          onClick={() => setIsCreateCampaignModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-amber-600 transition-all active:scale-95 shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Tạo mảng việc</span>
        </button>

        <button
          onClick={handleEnableNotification}
          className="px-4 py-2 rounded-xl border border-border bg-white dark:bg-card hover:bg-muted text-foreground font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0 shadow-2xs"
        >
          <Bell className="w-4 h-4 text-primary" />
          <span>{notifState === 'granted' ? 'Đã bật thông báo' : 'Bật thông báo điện thoại'}</span>
        </button>

        {dummyTasksCount > 0 && (
          <button
            onClick={handleClearDummy}
            className="px-3.5 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            title="Xóa các công việc mẫu năm 2025"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa danh sách ảo ({dummyTasksCount})</span>
          </button>
        )}
      </div>

      {/* 3. BỐN THẺ CHỈ SỐ NHANH (Khớp 100% hình 02-dashboard-overview.png) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 9 Thành viên BTV */}
        <button type="button"
          onClick={() => setActiveTab('thanh_vien')}
          className="bg-white dark:bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0B5CFF] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{members.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Thành viên BTV</div>
            </div>
          </div>
        </button>

        {/* Card 2: Công việc đang thực hiện */}
        <button type="button"
          onClick={() => setActiveTab('cong_viec')}
          className="bg-white dark:bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{inProgressTasks.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Công việc đang thực hiện</div>
            </div>
          </div>
        </button>

        {/* Card 3: Công việc quá hạn */}
        <button type="button"
          onClick={() => setActiveTab('dieu_phoi')}
          className="bg-white dark:bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 leading-none">{overdueTasks.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Công việc quá hạn</div>
            </div>
          </div>
        </button>

        {/* Card 4: Dự án / Chiến dịch */}
        <button type="button"
          onClick={() => setActiveTab('du_an')}
          className="bg-white dark:bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{campaigns.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Dự án / Chiến dịch</div>
            </div>
          </div>
        </button>
      </div>

      {/* 4. KHU VỰC BỐ CỤC 2 CỘT CHÍNH */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CỘT TRÁI (RỘNG): Bảng Công việc gần đây */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs text-card-foreground">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Công việc gần đây</h3>
                <p className="text-xs text-muted-foreground">Các nhiệm vụ trọng tâm đang được BTV triển khai</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateTaskModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo việc</span>
                </button>
                <button
                  onClick={() => setActiveTab('cong_viec')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bảng danh sách trên Desktop (Khớp 100% hình 02-dashboard-overview.png) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pl-2 w-8">#</th>
                    <th className="pb-3">Tên công việc</th>
                    <th className="pb-3">Người phụ trách</th>
                    <th className="pb-3">Hạn hoàn thành</th>
                    <th className="pb-3 text-right pr-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {recentTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Chưa có công việc nào. Hãy bấm <b>+ Giao việc mới</b> ở trên để tạo nhiệm vụ đầu tiên!
                      </td>
                    </tr>
                  ) : (
                    recentTasks.map((t, index) => {
                      const owner = members.find((m) => m.id === t.owner_id);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-2 font-bold text-muted-foreground w-8">
                            {index + 1}
                          </td>

                          <td className="py-3.5 font-semibold text-foreground group-hover:text-primary transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${getPriorityDot(t.priority)}`} />
                              <span className="truncate max-w-xs">{t.title}</span>
                            </div>
                          </td>

                          <td className="py-3.5 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <AvatarWithFallback
                                name={owner?.full_name || 'BTV'}
                                src={owner?.avatar_url}
                                size={26}
                                className="ring-1 ring-border"
                              />
                              <span className="font-medium text-foreground truncate">{owner?.full_name || 'Chưa gán'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 text-muted-foreground font-mono text-[11px]">
                            {t.due_at ? format(new Date(t.due_at), 'dd/MM/yyyy') : 'Linh hoạt'}
                          </td>

                          <td className="py-3.5 text-right pr-2">{getStatusBadge(t)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Danh sách thẻ dạng Card tối ưu riêng cho điện thoại di động */}
            <div className="sm:hidden divide-y divide-border -mx-1">
              {recentTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Chưa có công việc nào. Bấm <b>+ Giao việc mới</b> ở trên!
                </div>
              ) : (
                recentTasks.map((t) => {
                  const owner = members.find((m) => m.id === t.owner_id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="py-3 px-2 active:bg-muted/50 rounded-xl transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getPriorityDot(t.priority)}`} />
                          <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                            {t.title}
                          </h4>
                        </div>
                        <div className="shrink-0">{getStatusBadge(t)}</div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <AvatarWithFallback
                            name={owner?.full_name || 'BTV'}
                            src={owner?.avatar_url}
                            size={22}
                            className="ring-1 ring-border"
                          />
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {owner?.full_name || 'Chưa gán'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px]">
                          {t.due_at ? format(new Date(t.due_at), 'dd/MM/yyyy') : 'Linh hoạt'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Lịch trình công việc */}
          <div className="bg-white dark:bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Nhiệm vụ cần theo dõi
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {upcomingTasks.length} công việc
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.length === 0 && <p className="py-4 text-xs text-muted-foreground">Không có công việc đang chờ xử lý.</p>}
              {upcomingTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 hover:bg-muted/70 transition-colors border border-border"
                >
                  <div className="flex items-center gap-3">
                    <button
                      aria-label={`Cập nhật trạng thái: ${t.title}`}
                      onClick={() => updateTaskStatus(t.id, t.status === 'hoan_thanh' ? 'dang_lam' : 'hoan_thanh')}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {t.status === 'hoan_thanh' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">{t.title}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {t.due_at ? format(new Date(t.due_at), 'HH:mm - dd/MM') : 'Linh hoạt'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTaskId(t.id)}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (HẸP): Lịch tháng + Thông báo + Thành viên */}
        <div className="space-y-6">
          <DashboardCalendar />

          {/* Widget Thông báo */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">Thông báo mới</h3>
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Kênh BTV →
              </button>
            </div>

            <div className="divide-y divide-border">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="py-2.5 first:pt-0 last:pb-0 hover:bg-muted/40 rounded-xl px-1 transition-colors">
                  <div className="text-xs font-semibold text-foreground leading-snug">{n.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{n.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget Thành viên */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Ban Thường vụ ({members.length} Đ/c)</h3>
              <button
                onClick={() => setActiveTab('thanh_vien')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Xem tất cả →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              {members.slice(0, 6).map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveTab('thanh_vien')}
                  className="p-2 rounded-2xl hover:bg-muted/60 transition-all cursor-pointer group"
                >
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={m.full_name}
                    className="w-11 h-11 rounded-full mx-auto object-cover ring-2 ring-border group-hover:ring-primary/40 transition-all"
                  />
                  <div className="text-[11px] font-bold text-foreground truncate mt-1.5 leading-tight">
                    {m.full_name}
                  </div>
                  <div className="text-[9px] text-muted-foreground truncate">
                    {m.role === 'bi_thu'
                      ? 'Bí thư'
                      : m.role === 'pho_bi_thu'
                      ? 'Phó Bí thư'
                      : m.role === 'chanh_van_phong'
                      ? 'Chánh VP'
                      : 'Ủy viên'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <EventCountdown />
    </div>
  );
}
