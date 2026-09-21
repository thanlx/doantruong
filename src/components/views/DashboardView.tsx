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

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(22);
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
  const recentTasks = tasks.slice(0, 6);

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

  const getStatusBadge = (task: any) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
          Quá hạn
        </span>
      );
    }

    switch (task.status) {
      case 'cho_duyet':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Chờ duyệt
          </span>
        );
      case 'hoan_thanh':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Hoàn thành
          </span>
        );
      case 'dang_lam':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            Đang thực hiện
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
            Mới
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
    <div className="space-y-6 pb-12">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO GREETING BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-accent/20 to-secondary/15 p-6 sm:p-8 border border-border shadow-xs overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ban Thường vụ Đoàn trường HCMUTE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
            Xin chào, {currentMember.full_name}!
          </h1>
          <p className="text-sm text-muted-foreground font-normal mt-2 leading-relaxed">
            Cùng BTV Đoàn trường hoàn thành những mục tiêu và lan tỏa giá trị thanh niên HCMUTE!
          </p>
        </div>

        {/* Ảnh toà nhà campus HCMUTE bên phải banner */}
        <div className="relative md:w-72 lg:w-96 h-36 md:h-40 rounded-2xl overflow-hidden shadow-md ring-2 ring-card shrink-0">
          <img
            src="/images/hcmute-campus.jpg"
            alt="ĐH Sư phạm Kỹ thuật TP.HCM"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
            <span className="text-[11px] font-bold text-white tracking-wide drop-shadow-xs">
              Trụ sở Đoàn trường HCMUTE
            </span>
          </div>
        </div>
      </div>

      {/* 2. DẢI NÚT THAO TÁC NHANH (QUICK ACTIONS TOOLBAR) */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x -mx-1 px-1">
        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Giao việc mới</span>
        </button>

        <button
          onClick={() => setIsCreateDocModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-teal-700 transition-all active:scale-95 shrink-0"
        >
          <FilePlus className="w-4 h-4" />
          <span>+ Tiếp nhận văn bản</span>
        </button>

        <button
          onClick={() => setIsCreateCampaignModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-amber-600 transition-all active:scale-95 shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Tạo mảng việc</span>
        </button>

        <button
          onClick={handleEnableNotification}
          className="px-4 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Bell className="w-4 h-4 text-primary" />
          <span>{notifState === 'granted' ? 'Đã bật thông báo điện thoại' : 'Bật thông báo điện thoại'}</span>
        </button>

        {dummyTasksCount > 0 && (
          <button
            onClick={handleClearDummy}
            className="px-3.5 py-2.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            title="Xóa các công việc mẫu năm 2025"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa danh sách ảo ({dummyTasksCount})</span>
          </button>
        )}
      </div>

      {/* 3. BỐN THẺ CHỈ SỐ NHANH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 9 Thành viên */}
        <div
          onClick={() => setActiveTab('thanh_vien')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{members.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Thành viên BTV</div>
            </div>
          </div>
        </div>

        {/* Card 2: Công việc đang thực hiện */}
        <div
          onClick={() => setActiveTab('cong_viec')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{inProgressTasks.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">CV đang thực hiện</div>
            </div>
          </div>
        </div>

        {/* Card 3: Công việc quá hạn */}
        <div
          onClick={() => setActiveTab('dieu_phoi')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-destructive leading-none">{overdueTasks.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Công việc quá hạn</div>
            </div>
          </div>
        </div>

        {/* Card 4: Dự án / Chiến dịch */}
        <div
          onClick={() => setActiveTab('du_an')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{campaigns.length}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Dự án / Mảng việc</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. KHU VỰC BỐ CỤC 2 CỘT CHÍNH */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CỘT TRÁI (RỘNG): Bảng Công việc gần đây */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-5">
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

            {/* Bảng danh sách trên Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pl-2">Tên công việc</th>
                    <th className="pb-3">Người phụ trách</th>
                    <th className="pb-3">Hạn hoàn thành</th>
                    <th className="pb-3 text-right pr-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {recentTasks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Chưa có công việc nào. Hãy bấm <b>+ Giao việc mới</b> ở trên để tạo nhiệm vụ đầu tiên!
                      </td>
                    </tr>
                  ) : (
                    recentTasks.map((t) => {
                      const owner = members.find((m) => m.id === t.owner_id);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-2 font-medium text-foreground group-hover:text-primary transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${getPriorityDot(t.priority)}`} />
                              <span className="truncate max-w-xs">{t.title}</span>
                            </div>
                          </td>

                          <td className="py-3.5 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <img
                                src={owner?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={owner?.full_name || 'BTV'}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-border"
                              />
                              <span className="font-medium text-foreground truncate">{owner?.full_name || 'Chưa gán'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 text-muted-foreground font-mono text-[11px]">
                            {t.due_at ? format(new Date(t.due_at), 'dd/MM/yyyy') : 'Không hạn'}
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
                          <img
                            src={owner?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={owner?.full_name || 'BTV'}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-border"
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
          <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Nhiệm vụ trọng tâm trong tuần
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {tasks.filter((t) => t.status !== 'hoan_thanh').length} công việc
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border"
                >
                  <div className="flex items-center gap-3">
                    <button
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
                        {t.due_at ? format(new Date(t.due_at), 'HH:mm - dd/MM') : 'Linh hoạt'} • Phòng họp BTV
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
          {/* Widget Lịch tháng tương tác */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Lịch làm việc</h3>
              <div className="flex items-center gap-1 text-xs text-foreground font-semibold">
                <span>Tháng {now.getMonth() + 1}/{now.getFullYear()}</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground mb-2">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span className="text-destructive font-bold">CN</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const isSelected = selectedCalendarDay === d;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedCalendarDay(d)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

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
    </div>
  );
}
