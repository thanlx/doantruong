'use client';

// ==============================================================================
// DASHBOARD VIEW: TRANG CHỦ CHUẨN HCMUTE DESIGN SYSTEM (OKLCH TOKENS)
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
} from 'lucide-react';
import { format } from 'date-fns';

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
  } = useApp();

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(22); // Ngày 22/09 theo demo ảnh

  const now = new Date();

  // Tính các số liệu thống kê thực tế từ dữ liệu
  const inProgressTasks = tasks.filter((t) => t.status === 'dang_lam' || t.status === 'moi');
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < now
  );

  // Danh sách công việc gần đây
  const recentTasks = tasks.slice(0, 6);

  // Công việc của ngày hôm nay
  const todayTasks = tasks.filter((t) => {
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return due.getDate() === 22 && due.getMonth() === 8; // 22/09
  });

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
      {/* 1. HERO GREETING BANNER (Khớp bố cục ảnh mẫu với OKLCH tokens) */}
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

      {/* 2. BỐN THẺ CHỈ SỐ NHANH (Khớp 4 thẻ stat cards trong ảnh) */}
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
              <div className="text-2xl font-black text-foreground leading-none">9</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Thành viên BTV</div>
            </div>
          </div>
        </div>

        {/* Card 2: 12 Công việc đang thực hiện */}
        <div
          onClick={() => setActiveTab('cong_viec')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{inProgressTasks.length || 12}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">CV đang thực hiện</div>
            </div>
          </div>
        </div>

        {/* Card 3: 5 Công việc quá hạn */}
        <div
          onClick={() => setActiveTab('dieu_phoi')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-destructive leading-none">{overdueTasks.length || 5}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Công việc quá hạn</div>
            </div>
          </div>
        </div>

        {/* Card 4: 8 Dự án / Chiến dịch */}
        <div
          onClick={() => setActiveTab('du_an')}
          className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground leading-none">{campaigns.length || 4}</div>
              <div className="text-xs text-muted-foreground font-medium mt-1">Dự án / Chiến dịch</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KHU VỰC BỐ CỤC 2 CỘT CHÍNH (KHỚP 100% ẢNH DESKTOP) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CỘT TRÁI (RỘNG): Bảng Công việc gần đây */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-foreground tracking-tight">Công việc gần đây</h3>
                <p className="text-xs text-muted-foreground">Các nhiệm vụ trọng tâm đang được BTV triển khai</p>
              </div>
              <button
                onClick={() => setActiveTab('cong_viec')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bảng công việc trên Desktop */}
            <div className="overflow-x-auto">
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
                  {recentTasks.map((task) => {
                    const owner = members.find((m) => m.id === task.owner_id);
                    return (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 pl-2 font-medium text-foreground group-hover:text-primary transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${getPriorityDot(task.priority)}`}
                            />
                            <span className="truncate max-w-xs">{task.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <img
                              src={owner?.avatar_url}
                              alt={owner?.full_name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-border"
                            />
                            <span className="font-medium text-foreground truncate">{owner?.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-muted-foreground font-mono text-[11px]">
                          {task.due_at ? format(new Date(task.due_at), 'dd/MM/yyyy') : 'Chưa đặt hạn'}
                        </td>
                        <td className="py-3.5 text-right pr-2">{getStatusBadge(task)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phần "Công việc hôm nay" */}
          <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Lịch trình công việc hôm nay - 22/09/2025</h3>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                3 công việc
              </span>
            </div>

            <div className="space-y-2.5">
              {todayTasks.map((t) => {
                const isDone = t.status === 'hoan_thanh';
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(t.id, isDone ? 'dang_lam' : 'hoan_thanh');
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50 dark:fill-transparent" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <h4 className={`text-xs font-semibold ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {t.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground">
                          {t.due_at ? format(new Date(t.due_at), 'HH:mm') : '08:00'} - Phòng họp BTV
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
                );
              })}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Lịch làm việc + Thông báo mới + Thành viên BTV */}
        <div className="space-y-6">
          {/* Widget 1: Lịch làm việc mini */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Lịch làm việc</h3>
              <div className="flex items-center gap-1 text-xs text-foreground font-semibold">
                <span>Tháng 9/2025</span>
              </div>
            </div>

            {/* Grid ngày mini của Tháng 9/2025 */}
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
              {/* Tuần 1 */}
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">1</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">2</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">3</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">4</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">5</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">6</span>
              <span className="p-1.5 rounded-lg text-destructive hover:bg-muted font-semibold">7</span>

              {/* Tuần 2 */}
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">8</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">9</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">10</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">11</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">12</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">13</span>
              <span className="p-1.5 rounded-lg text-destructive hover:bg-muted font-semibold">14</span>

              {/* Tuần 3 */}
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">15</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">16</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">17</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">18</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">19</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">20</span>
              <span className="p-1.5 rounded-lg text-destructive hover:bg-muted font-semibold">21</span>

              {/* Tuần 4 (22 là hôm nay: khoanh tròn màu primary) */}
              <span className="p-1.5 rounded-full bg-primary text-primary-foreground font-bold shadow-xs">22</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">23</span>
              <span className="p-1.5 rounded-full bg-primary/10 text-primary font-semibold">24</span>
              <span className="p-1.5 rounded-full bg-primary/10 text-primary font-semibold">25</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">26</span>
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">27</span>
              <span className="p-1.5 rounded-lg text-destructive hover:bg-muted font-semibold">28</span>

              {/* Tuần 5 */}
              <span className="p-1.5 rounded-lg text-foreground hover:bg-muted">29</span>
              <span className="p-1.5 rounded-full bg-primary text-primary-foreground font-bold">30</span>
              <span className="p-1.5 rounded-lg text-muted-foreground/40">1</span>
              <span className="p-1.5 rounded-lg text-muted-foreground/40">2</span>
              <span className="p-1.5 rounded-lg text-muted-foreground/40">3</span>
              <span className="p-1.5 rounded-lg text-muted-foreground/40">4</span>
              <span className="p-1.5 rounded-lg text-muted-foreground/40">5</span>
            </div>

            {/* Chi tiết lịch trình hôm nay 22/09/2025 */}
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="text-[11px] font-bold text-foreground">Hôm nay - 22/09/2025</div>
              <div className="text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50">
                  <span className="font-mono font-semibold text-primary">08:00</span>
                  <span className="text-foreground truncate">Họp BTV Đoàn trường (Phòng A)</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50">
                  <span className="font-mono font-semibold text-primary">14:00</span>
                  <span className="text-foreground truncate">Làm việc với các đơn vị</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50">
                  <span className="font-mono font-semibold text-primary">16:00</span>
                  <span className="text-foreground truncate">Duyệt nội dung truyền thông</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Thông báo mới */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">Thông báo mới</h3>
              </div>
              <button
                onClick={() => setActiveTab('thong_bao')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Xem tất cả &rarr;
              </button>
            </div>

            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 first:pt-0 last:pb-0 hover:bg-muted/40 rounded-xl px-1 transition-colors">
                  <div className="text-xs font-semibold text-foreground leading-snug">{n.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{n.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Thành viên BTV (Lưới 9 người) */}
          <div className="bg-card rounded-3xl border border-border p-5 shadow-xs text-card-foreground">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Thành viên BTV (9 Đ/c)</h3>
              <button
                onClick={() => setActiveTab('thanh_vien')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Xem tất cả &rarr;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              {members.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveTab('thanh_vien')}
                  className="p-2 rounded-2xl hover:bg-muted/60 transition-all cursor-pointer group"
                >
                  <img
                    src={m.avatar_url}
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
