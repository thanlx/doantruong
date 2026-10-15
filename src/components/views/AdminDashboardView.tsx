'use client';

// ==============================================================================
// TRANG QUẢN TRỊ - TỔNG QUAN QUẢN LÝ CÁN BỘ (ADMIN DASHBOARD - SCREEN 5)
// Hiển thị toàn bộ số liệu trực tuyến từ Hồ sơ, Quyết định, Yêu cầu duyệt và Đánh giá
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
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminDashboardView() {
  const {
    subsystems,
    units,
    profiles,
    decisions,
    updateRequests,
    evaluations,
    evaluationPeriods,
    setAdminTab,
    setSelectedRequestId,
    setSelectedDecisionId,
    getUniqueOfficerCount,
    getTotalRoleCount,
  } = useApp();

  const [activeRequestTab, setActiveRequestTab] = useState<'ho_so' | 'quyet_dinh' | 'danh_gia'>('ho_so');
  const [selectedMonth, setSelectedMonth] = useState(
    evaluationPeriods[0]?.month_year || '10/2026'
  );
  const [unitFilter, setUnitFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 4 key metrics
  const uniqueCount = getUniqueOfficerCount();
  const totalRoles = getTotalRoleCount();
  const pendingRequestsCount = updateRequests.filter((r) => r.status === 'pending').length;

  const evalCompletionPct =
    evaluations.length > 0
      ? Math.round(
          (evaluations.filter((e) => e.status !== 'not_submitted').length / evaluations.length) *
            100
        )
      : 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP TITLE & ACTION CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-semibold">Trang quản trị</span>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Tổng quan quản lý cán bộ
          </h1>
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
              {evaluationPeriods.map((p) => (
                <option key={p.id} value={p.month_year}>
                  Tháng {p.month_year.replace('/', ' năm ')}
                </option>
              ))}
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
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 px-4 py-2 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Nhập từ Excel</span>
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

      {/* 2. 4 STAT CARDS (SEPARATION OF UNIQUE OFFICERS VS TOTAL ROLES) */}
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
              Đang hoạt động
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Cán bộ hiện tại (Unique)</p>
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
              Tính cả kiêm nhiệm
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Tổng lượt chức vụ</p>
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
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Cần xử lý
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Yêu cầu chờ duyệt</p>
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
              Kỳ {selectedMonth}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Tiến độ gửi đánh giá</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">
              {evalCompletionPct}%
            </p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: YÊU CẦU CẦN XỬ LÝ (LIVE) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-base font-black text-foreground">Hạng mục nghiệp vụ trực tuyến</h2>
              </div>
            </div>

            {/* Filter tabs with live counts */}
            <div className="flex items-center gap-4 border-b border-border pb-2">
              <button
                onClick={() => setActiveRequestTab('ho_so')}
                className={`text-xs font-bold pb-2 relative flex items-center gap-1.5 cursor-pointer ${
                  activeRequestTab === 'ho_so'
                    ? 'text-primary border-b-2 border-primary -mb-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Yêu cầu cập nhật hồ sơ</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                  {updateRequests.length}
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
                <span>Quyết định nhân sự</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-muted text-muted-foreground">
                  {decisions.length}
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
                <span>Phiếu đánh giá</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-muted text-muted-foreground">
                  {evaluations.length}
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

            {/* Live Table based on activeRequestTab */}
            <div className="overflow-x-auto">
              {activeRequestTab === 'ho_so' && (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold">
                      <th className="py-2.5 px-2">Cán bộ</th>
                      <th className="py-2.5 px-2">Mã yêu cầu</th>
                      <th className="py-2.5 px-2">Lý do đề xuất</th>
                      <th className="py-2.5 px-2">Trạng thái</th>
                      <th className="py-2.5 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {updateRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Hiện không có yêu cầu cập nhật hồ sơ nào đang chờ duyệt.
                        </td>
                      </tr>
                    ) : (
                      updateRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-2">
                            <strong className="text-foreground block">{req.profile_name}</strong>
                            <span className="text-[10px] text-muted-foreground">
                              MSSV: {req.student_id}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono font-bold text-primary">{req.id}</td>
                          <td className="py-3 px-2 text-foreground max-w-xs truncate">
                            {req.reason}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : req.status === 'returned'
                                  ? 'bg-rose-500/10 text-rose-700'
                                  : 'bg-amber-500/10 text-amber-700'
                              }`}
                            >
                              {req.status === 'approved'
                                ? 'Đã duyệt'
                                : req.status === 'returned'
                                ? 'Trả lại'
                                : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                setSelectedRequestId(req.id);
                                setAdminTab('duyet_ho_so');
                              }}
                              className="px-3 py-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer transition-all"
                            >
                              Xem xét
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeRequestTab === 'quyet_dinh' && (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold">
                      <th className="py-2.5 px-2">Số Quyết định</th>
                      <th className="py-2.5 px-2">Nội dung</th>
                      <th className="py-2.5 px-2">Đơn vị</th>
                      <th className="py-2.5 px-2">Ngày hiệu lực</th>
                      <th className="py-2.5 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {decisions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Chưa có quyết định nhân sự nào.
                        </td>
                      </tr>
                    ) : (
                      decisions.slice(0, 6).map((dec) => (
                        <tr key={dec.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-2 font-mono font-bold text-primary">
                            {dec.decision_number}
                          </td>
                          <td className="py-3 px-2 font-semibold text-foreground">{dec.title}</td>
                          <td className="py-3 px-2 text-muted-foreground">{dec.unit_name}</td>
                          <td className="py-3 px-2 text-muted-foreground">{dec.effective_date}</td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                setSelectedDecisionId(dec.id);
                                setAdminTab('quyet_dinh');
                              }}
                              className="px-3 py-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeRequestTab === 'danh_gia' && (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold">
                      <th className="py-2.5 px-2">Cán bộ</th>
                      <th className="py-2.5 px-2">Đơn vị</th>
                      <th className="py-2.5 px-2">Kỳ</th>
                      <th className="py-2.5 px-2">Xếp loại</th>
                      <th className="py-2.5 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {evaluations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Chưa có phiếu đánh giá nào.
                        </td>
                      </tr>
                    ) : (
                      evaluations.slice(0, 6).map((ev) => (
                        <tr key={ev.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-2">
                            <strong className="text-foreground block">{ev.profile_name}</strong>
                            <span className="text-[10px] text-muted-foreground">
                              {ev.position_title}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">{ev.unit_name}</td>
                          <td className="py-3 px-2 font-mono">{ev.month_year}</td>
                          <td className="py-3 px-2 font-black text-primary">
                            {ev.approved_grade || ev.proposed_grade || 'Chưa chấm'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => setAdminTab('danh_gia')}
                              className="px-3 py-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer"
                            >
                              Chấm duyệt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROGRESS BY SUBSYSTEM & RECENT DECISIONS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Phân bổ nhân sự theo phân hệ */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Cơ cấu nhân sự theo 7 phân hệ
              </h3>
              <button
                onClick={() => setAdminTab('to_chuc')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Xem chi tiết &gt;
              </button>
            </div>

            <div className="space-y-3">
              {subsystems.map((sub) => {
                const countInSub = profiles.filter((p) =>
                  p.roles.some((r) => r.subsystem_id === sub.id)
                ).length;
                const pct =
                  profiles.length > 0 ? Math.round((countInSub / profiles.length) * 100) : 0;
                return (
                  <div key={sub.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground text-[11px]">{sub.name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        <strong>{countInSub}</strong> cán bộ ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.max(pct, countInSub > 0 ? 10 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Quyết định nhân sự gần đây */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>Quyết định nhân sự ({decisions.length})</span>
              </h3>
              <button
                onClick={() => setAdminTab('quyet_dinh')}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Quản lý quyết định &gt;
              </button>
            </div>

            {decisions.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                Chưa có quyết định nhân sự nào được ban hành.
              </div>
            ) : (
              decisions.slice(0, 3).map((dec) => (
                <div
                  key={dec.id}
                  onClick={() => {
                    setSelectedDecisionId(dec.id);
                    setAdminTab('quyet_dinh');
                  }}
                  className="p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div>
                    <strong className="text-foreground block">{dec.title}</strong>
                    <span className="text-[11px] text-muted-foreground">
                      Số: {dec.decision_number} • {dec.unit_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-bold block">{dec.effective_date}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {dec.status === 'approved' ? 'Đã ban hành' : 'Bản nháp'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM 7 SUBSYSTEM CARDS */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Phân hệ nhân sự
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {subsystems.map((sub) => {
            const countInSub = profiles.filter((p) =>
              p.roles.some((r) => r.subsystem_id === sub.id)
            ).length;
            return (
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
                  <p className="text-[10px] text-muted-foreground mt-0.5">{countInSub} cán bộ</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
