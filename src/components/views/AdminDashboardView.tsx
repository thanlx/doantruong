'use client';

// ==============================================================================
// TRANG QUẢN TRỊ - TỔNG QUAN QUẢN LÝ CÁN BỘ (ADMIN DASHBOARD - SCREEN 5 MOCKUP)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Network,
  FileText,
  CheckCircle2,
  Calendar,
  Download,
  Plus,
  Search,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Building2,
  Shield,
  GitFork,
  Users2,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboardView() {
  const {
    subsystems,
    units,
    profiles,
    decisions,
    updateRequests,
    evaluations,
    setAdminTab,
    setSelectedRequestId,
    setSelectedDecisionId,
    getUniqueOfficerCount,
    getTotalRoleCount,
  } = useApp();

  const [activeRequestTab, setActiveRequestTab] = useState<'ho_so' | 'quyet_dinh' | 'danh_gia'>('ho_so');
  const [selectedMonth, setSelectedMonth] = useState('10/2026');
  const [unitFilter, setUnitFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 4 key metrics
  const uniqueCount = getUniqueOfficerCount();
  const totalRoles = getTotalRoleCount();
  const pendingRequestsCount = updateRequests.filter((r) => r.status === 'pending').length;

  // Upcoming decisions (e.g. 156-QĐ/HSV effective 01/11/2026)
  const todayStr = '2026-10-13';
  const upcomingDecisions = decisions.filter((d) => d.effective_date > todayStr);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP TITLE & ACTION CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-semibold">Trang quản trị</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Tổng quan quản lý cán bộ</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month selector dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs">
            <Calendar className="h-4 w-4 text-primary" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="10/2026">Tháng 10 năm 2026</option>
              <option value="09/2026">Tháng 09 năm 2026</option>
            </select>
          </div>

          <button
            onClick={() => setAdminTab('bao_cao')}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Xuất báo cáo</span>
          </button>

          <button
            onClick={() => setAdminTab('ho_so')}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm cán bộ</span>
          </button>
        </div>
      </div>

      {/* 2. 4 STAT CARDS (SEPARATION OF UNIQUE OFFICERS VS TOTAL ROLES - MỤC 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cán bộ hiện tại */}
        <div
          onClick={() => setAdminTab('ho_so')}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
              ↑ 6 so với tháng trước
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Cán bộ hiện tại</p>
            <p className="text-2xl font-black text-primary tracking-tight mt-0.5">{uniqueCount}</p>
          </div>
        </div>

        {/* Card 2: Lượt chức vụ (Tách riêng do kiêm nhiệm) */}
        <div
          onClick={() => setAdminTab('to_chuc')}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <Network className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
              ↑ 18 so với tháng trước
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Lượt chức vụ</p>
            <p className="text-2xl font-black text-rose-600 tracking-tight mt-0.5">{totalRoles}</p>
          </div>
        </div>

        {/* Card 3: Hồ sơ chờ duyệt */}
        <div
          onClick={() => setAdminTab('duyet_ho_so')}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md">
              ↑ 4 so với tháng trước
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Hồ sơ chờ duyệt</p>
            <p className="text-2xl font-black text-amber-600 tracking-tight mt-0.5">
              {pendingRequestsCount}
            </p>
          </div>
        </div>

        {/* Card 4: Đánh giá hoàn thành */}
        <div
          onClick={() => setAdminTab('danh_gia')}
          className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
              ↑ 6% so với tháng trước
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đánh giá hoàn thành</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">86%</p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION (YÊU CẦU CẦN XỬ LÝ 60% + TIẾN ĐỘ ĐÁNH GIÁ & QUYẾT ĐỊNH 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: YÊU CẦU CẦN XỬ LÝ */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-base font-black text-foreground">Yêu cầu cần xử lý</h2>
            </div>

            {/* Filter tabs with counts */}
            <div className="flex items-center gap-4 border-b border-border pb-2">
              <button
                onClick={() => setActiveRequestTab('ho_so')}
                className={`text-xs font-bold pb-2 relative flex items-center gap-1.5 cursor-pointer ${
                  activeRequestTab === 'ho_so'
                    ? 'text-primary border-b-2 border-primary -mb-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Hồ sơ</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                  12
                </span>
              </button>

              <button
                onClick={() => setActiveRequestTab('quyet_dinh')}
                className={`text-xs font-bold pb-2 relative flex items-center gap-1.5 cursor-pointer ${
                  activeRequestTab === 'quyet_dinh'
                    ? 'text-primary border-b-2 border-primary -mb-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Quyết định</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-muted text-muted-foreground">
                  3
                </span>
              </button>

              <button
                onClick={() => setActiveRequestTab('danh_gia')}
                className={`text-xs font-bold pb-2 relative flex items-center gap-1.5 cursor-pointer ${
                  activeRequestTab === 'danh_gia'
                    ? 'text-primary border-b-2 border-primary -mb-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Đánh giá</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-muted text-muted-foreground">
                  8
                </span>
              </button>
            </div>

            {/* Search and Unit filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên cán bộ, nội dung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="all">Tất cả đơn vị</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table of pending requests */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 px-2">Cán bộ</th>
                    <th className="py-2.5 px-2">Đơn vị</th>
                    <th className="py-2.5 px-2">Nội dung</th>
                    <th className="py-2.5 px-2">Trạng thái</th>
                    <th className="py-2.5 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          NA
                        </div>
                        <div>
                          <strong className="text-foreground block">Nguyễn Minh Anh</strong>
                          <span className="text-[10px] text-muted-foreground">MSSV: 20001234</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">Đoàn cơ sở</td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-foreground block">Cập nhật hồ sơ</span>
                      <span className="text-[10px] text-muted-foreground">Cập nhật thông tin cá nhân</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700">
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequestId('HS-0012');
                          setAdminTab('duyet_ho_so');
                        }}
                        className="px-3 py-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer transition-all"
                      >
                        Xem xét
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold">
                          TN
                        </div>
                        <div>
                          <strong className="text-foreground block">Trần Hoàng Nam</strong>
                          <span className="text-[10px] text-muted-foreground">MSSV: 21004567</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">CLB Truyền thông</td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-foreground block">Bổ nhiệm chủ nhiệm</span>
                      <span className="text-[10px] text-muted-foreground">Quyết định nhân sự</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700">
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => setAdminTab('quyet_dinh')}
                        className="px-3 py-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer transition-all"
                      >
                        Xem xét
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                          LH
                        </div>
                        <div>
                          <strong className="text-foreground block">Lê Thu Hà</strong>
                          <span className="text-[10px] text-muted-foreground">MSSV: 22007890</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">Liên chi hội</td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-foreground block">Đánh giá tháng 10</span>
                      <span className="text-[10px] text-muted-foreground">Phiếu đánh giá từ đơn vị</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700">
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => setAdminTab('danh_gia')}
                        className="px-3 py-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer transition-all"
                      >
                        Xem xét
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROGRESS BY SUBSYSTEM & UPCOMING DECISIONS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Tiến độ đánh giá */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Tiến độ đánh giá</h3>
              <button
                onClick={() => setAdminTab('danh_gia')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Xem chi tiết &gt;
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'BCH Đoàn trường', pct: 92, count: '23/25' },
                { name: 'UBKT Đoàn trường', pct: 80, count: '8/10' },
                { name: 'BCH Đoàn cơ sở', pct: 85, count: '68/80' },
                { name: 'BCH Liên chi hội', pct: 78, count: '47/60' },
                { name: 'Đơn vị trực thuộc Đoàn trường', pct: 88, count: '44/50' },
                { name: 'Đơn vị trực thuộc Hội Sinh viên', pct: 82, count: '41/50' },
                { name: 'Bí thư chi đoàn', pct: 90, count: '72/80' },
              ].map((sub, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground text-[11px]">{sub.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      <strong>{sub.pct}%</strong> ({sub.count})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${sub.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Quyết định sắp hiệu lực */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>Quyết định sắp hiệu lực</span>
              </h3>
              <button
                onClick={() => setAdminTab('quyet_dinh')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Xem tất cả &gt;
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
              <div>
                <strong className="text-foreground block">Bổ nhiệm Ban chủ nhiệm</strong>
                <span className="text-[11px] text-muted-foreground">Số: 156-QĐ/HSV • CLB Truyền thông</span>
              </div>
              <div className="text-right">
                <span className="text-rose-600 font-bold block">01/11/2026</span>
                <span className="text-[10px] text-muted-foreground">Còn 2 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM 7 SUBSYSTEM CARDS (MỤC 1 & SCREEN 5 MOCKUP) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Phân hệ nhân sự</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {subsystems.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setAdminTab('to_chuc')}
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center ${sub.colorClass}`}
                >
                  <Users className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight">
                  {sub.name}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{sub.count} cán bộ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
