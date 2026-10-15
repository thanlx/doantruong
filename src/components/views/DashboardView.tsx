'use client';

// ==============================================================================
// TRANG CHỦ CÁ NHÂN (USER DASHBOARD - SCREEN 4 MOCKUP)
// ==============================================================================

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Calendar,
  Bell,
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  UserCheck,
  ChevronRight,
  Edit,
  ExternalLink,
} from 'lucide-react';

export default function DashboardView() {
  const {
    currentUser,
    profiles,
    updateRequests,
    evaluationPeriods,
    evaluations,
    notifications,
    setUserTab,
    setSelectedRequestId,
  } = useApp();

  // Find user's profile
  const profile = profiles.find((p) => p.id === currentUser.profile_id) || profiles[0];

  // Stats
  const pendingRequests = updateRequests.filter(
    (r) => r.profile_id === profile.id && r.status === 'pending'
  );
  const unreadNotifs = notifications.filter((n) => !n.is_read);

  // Pending evaluation
  const activePeriod = evaluationPeriods.find((p) => p.status === 'open');
  const userEval = evaluations.find(
    (e) => e.profile_id === profile.id && e.period_id === activePeriod?.id
  );
  const isEvalPending = userEval?.status === 'not_submitted' || !userEval;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. GREETING & TOP STATS BANNER */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Xin chào, {profile.full_name.split(' ').slice(-2).join(' ')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Theo dõi hồ sơ, chức vụ và công việc của bạn</p>
        </div>

        {/* Stat badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            onClick={() => setUserTab('ho_so')}
            className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-2.5 cursor-pointer hover:bg-rose-50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Yêu cầu chờ duyệt</p>
              <p className="text-lg font-black text-rose-600 leading-tight">{pendingRequests.length}</p>
            </div>
          </div>

          <div
            onClick={() => setUserTab('danh_gia')}
            className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Đánh giá đến hạn</p>
              <p className="text-lg font-black text-primary leading-tight">{isEvalPending ? 1 : 0}</p>
            </div>
          </div>

          <div
            onClick={() => setUserTab('thong_bao')}
            className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-2.5 cursor-pointer hover:bg-rose-50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Thông báo mới</p>
              <p className="text-lg font-black text-rose-600 leading-tight">{unreadNotifs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Profile summary + Tasks */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Hồ sơ của tôi */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Hồ sơ của tôi</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Hồ sơ đã xác thực
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-black shadow-xs">
                {currentUser.avatar_code}
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">{profile.full_name}</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  MSSV: {profile.student_id || profile.staff_id}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>
                    Đơn vị: <strong className="text-foreground">{profile.roles[0]?.unit_name || 'Đoàn cơ sở'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Ngành học: <strong className="text-foreground">{profile.major || 'Công nghệ thông tin'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Current roles list */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chức vụ hiện tại ({profile.roles.length})
              </p>
              <div className="space-y-2">
                {profile.roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{role.position_title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{role.unit_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setUserTab('ho_so')}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Xem hồ sơ</span>
              </button>
              <button
                onClick={() => setUserTab('ho_so')}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Cập nhật thông tin</span>
              </button>
            </div>
          </div>

          {/* Card: Việc cần làm */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Việc cần làm</h2>
              <button
                onClick={() => setUserTab('danh_gia')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Task 1: Self evaluation */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Tự đánh giá tháng 10 năm 2026</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Hạn gửi: <strong className="text-rose-600">25/10/2026</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUserTab('danh_gia')}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
                >
                  Thực hiện
                </button>
              </div>

              {/* Task 2: Pending request check */}
              {pendingRequests.length > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Yêu cầu cập nhật hồ sơ</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Đã gửi ngày {pendingRequests[0].created_at} •{' '}
                        <span className="text-amber-600 font-bold">Chờ duyệt</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRequestId(pendingRequests[0].id);
                      setUserTab('ho_so');
                    }}
                    className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
                  >
                    Xem yêu cầu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Notifications & History timeline */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Thông báo gần đây */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Thông báo gần đây</h2>
              <button
                onClick={() => setUserTab('thong_bao')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {notifications.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setUserTab('thong_bao')}
                  className="flex gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer"
                >
                  <div className="mt-1">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        idx === 0 ? 'bg-rose-500' : 'bg-primary'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.created_at}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Lịch sử chức vụ */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Lịch sử chức vụ</h2>
              <button
                onClick={() => setUserTab('quyet_dinh')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Xem toàn bộ lịch sử</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/30">
              {profile.roles.map((role) => (
                <div key={role.id} className="relative">
                  <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                  <p className="text-[11px] font-bold text-primary">
                    {role.start_date.substring(5, 7)}/{role.start_date.substring(0, 4)} –{' '}
                    {role.end_date ? `${role.end_date.substring(5, 7)}/${role.end_date.substring(0, 4)}` : 'Hiện tại'}
                  </p>
                  <h4 className="text-xs font-bold text-foreground mt-0.5">{role.position_title}</h4>
                  <p className="text-[11px] text-muted-foreground">{role.unit_name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM QUICK ACTION CARDS (4 CARDS MATCHING SCREEN 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div
          onClick={() => setUserTab('to_chuc')}
          className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-primary group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Tra cứu cán bộ</h4>
              <p className="text-[11px] text-muted-foreground">Thông tin tổ chức, cán bộ</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => setUserTab('danh_gia')}
          className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Xem đánh giá</h4>
              <p className="text-[11px] text-muted-foreground">Theo dõi kết quả xếp loại</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => setUserTab('quyet_dinh')}
          className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Quyết định</h4>
              <p className="text-[11px] text-muted-foreground">Các quyết định bổ nhiệm</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => setUserTab('thong_bao')}
          className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:scale-105 transition-transform">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Thông báo</h4>
              <p className="text-[11px] text-muted-foreground">Xem tất cả thông báo</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}
