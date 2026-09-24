'use client';

// ==============================================================================
// REPORTS VIEW: DASHBOARD ĐÁNH GIÁ & XẾP LOẠI BTV ĐOÀN TRƯỜNG HCMUTE (THÁNG 9/2026)
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Search,
  ListFilter,
  BarChart3,
  Calendar,
  ExternalLink,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole, formatRatingGrade, formatStatus } from '@/lib/formatters';
import { matchesVietnameseSearch } from '@/lib/searchUtils';
import { Task } from '@/types';

export default function ReportsView() {
  const {
    getReportData,
    currentMember,
    setSelectedTaskId,
    weeklyCheckins,
    setIsWeeklyCheckinModalOpen,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<number>(9); // Tháng 9
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [quickFilter, setQuickFilter] = useState<'month' | 'quarter' | 'academic_year' | 'all'>('month');
  const [activeViewMode, setActiveViewMode] = useState<'ranking' | 'tasks'>('ranking');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Lấy dữ liệu báo cáo
  const monthArg = quickFilter === 'all' || quickFilter === 'academic_year' ? 0 : selectedMonth;
  const reportData = getReportData(monthArg, selectedYear);
  const {
    totalTasks,
    totalCompleted,
    beforeDeadline,
    onTime,
    afterDeadline,
    averageScore,
    gradeCounts,
    memberStats,
  } = reportData;

  const onTimePercentage = totalCompleted > 0
    ? Math.round(((beforeDeadline + onTime) / totalCompleted) * 100)
    : 100;

  // Thống kê Nhiệt kế Tinh thần & Xung lực Tuần này
  const totalCheckins = weeklyCheckins.length;
  const avgWorkload = totalCheckins > 0
    ? (weeklyCheckins.reduce((acc, c) => acc + (c.workload_rating ?? c.workload_score ?? 3), 0) / totalCheckins).toFixed(1)
    : '0';
  const moodCounts = {
    rocket: weeklyCheckins.filter(c => c.mood === 'rocket' || c.mood === 'energetic' || c.mood === 'hao_hung').length,
    happy: weeklyCheckins.filter(c => c.mood === 'happy' || c.mood === 'on_dinh').length,
    neutral: weeklyCheckins.filter(c => c.mood === 'neutral' || c.mood === 'binh_thuong').length,
    tired: weeklyCheckins.filter(c => c.mood === 'tired' || c.mood === 'stressed' || c.mood === 'ap_luc').length,
    overload: weeklyCheckins.filter(c => c.mood === 'overload' || c.mood === 'overloaded' || c.mood === 'qua_tai').length,
  };

  // Sắp xếp bảng xếp hạng thành viên: Điểm TB giảm dần -> Số việc hoàn thành giảm dần
  const sortedMembers = useMemo(() => {
    return [...memberStats].sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return b.completedOnTime - a.completedOnTime;
    });
  }, [memberStats]);

  // Danh sách công việc đã hoàn thành hoặc có đánh giá
  const allPeriodTasks = useMemo(() => {
    const list: Array<Task & { ownerName?: string; ownerRole?: string }> = [];
    memberStats.forEach((ms) => {
      ms.tasks.forEach((t) => {
        list.push({
          ...t,
          ownerName: ms.member.full_name,
          ownerRole: formatRole(ms.member.role),
        });
      });
    });

    if (!searchKeyword.trim()) return list;

    return list.filter((t) =>
      matchesVietnameseSearch(t.title, searchKeyword) ||
      matchesVietnameseSearch(t.ownerName || '', searchKeyword) ||
      matchesVietnameseSearch(t.review_feedback || '', searchKeyword)
    );
  }, [memberStats, searchKeyword]);

  // Xuất file Excel chuyên nghiệp
  const handleExportStatsExcel = () => {
    const periodLabel =
      quickFilter === 'all'
        ? 'Toàn bộ thời gian'
        : quickFilter === 'academic_year'
        ? `Năm học ${selectedYear}-${selectedYear + 1}`
        : `Tháng ${selectedMonth}/${selectedYear}`;

    // Sheet 1: TỔNG QUAN
    const summaryData = [
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Kỳ đánh giá', 'GIÁ TRỊ': periodLabel, 'GHI CHÚ': 'Ban Thường vụ Đoàn trường HCMUTE' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Tổng số công việc trong kỳ', 'GIÁ TRỊ': totalTasks, 'GHI CHÚ': 'Đã giao' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Số việc đã hoàn thành', 'GIÁ TRỊ': totalCompleted, 'GHI CHÚ': `${Math.round((totalCompleted / (totalTasks || 1)) * 100)}% tổng số việc` },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Tỷ lệ đúng hạn', 'GIÁ TRỊ': `${onTimePercentage}%`, 'GHI CHÚ': 'Trước hạn + Đúng hạn' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Điểm KPI trung bình toàn BTV', 'GIÁ TRỊ': `${averageScore.toFixed(1)} / 10.0`, 'GHI CHÚ': 'Thang điểm 10' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Số lượng xếp loại A (Xuất sắc)', 'GIÁ TRỊ': gradeCounts.A, 'GHI CHÚ': '' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Số lượng xếp loại B (Tốt)', 'GIÁ TRỊ': gradeCounts.B, 'GHI CHÚ': '' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Số lượng xếp loại C (Hoàn thành)', 'GIÁ TRỊ': gradeCounts.C, 'GHI CHÚ': '' },
      { 'CHỈ SỐ TIẾN ĐỘ & KPI': 'Số lượng xếp loại D (Cần cải thiện)', 'GIÁ TRỊ': gradeCounts.D, 'GHI CHÚ': '' },
    ];

    // Sheet 2: BẢNG XẾP HẠNG 9 THÀNH VIÊN BTV
    const memberRankingData = sortedMembers.map((ms, idx) => {
      const generalGrade =
        ms.averageScore >= 9.0 ? 'A (Xuất sắc)' :
        ms.averageScore >= 7.5 ? 'B (Tốt)' :
        ms.averageScore >= 6.0 ? 'C (Hoàn thành)' : 'D (Cần cố gắng)';

      return {
        'HẠNG': idx + 1,
        'HỌ VÀ TÊN': ms.member.full_name,
        'CHỨC VỤ': formatRole(ms.member.role),
        'MẢNG PHỤ TRÁCH': ms.member.mang_phu_trach || 'BTV',
        'TỔNG VIỆC GIAO': ms.totalAssigned,
        'HOÀN THÀNH': ms.completedOnTime + ms.completedLate,
        'ĐÚNG HẠN': ms.completedOnTime,
        'TRỄ HẠN': ms.completedLate,
        'ĐANG LÀM': ms.inProgress,
        'QUÁ HẠN': ms.overdue,
        'ĐIỂM KPI TB': ms.averageScore.toFixed(1),
        'XẾP LOẠI CHUNG': generalGrade,
      };
    });

    // Sheet 3: CHI TIẾT TỪNG CÔNG VIỆC
    const taskDetailsData = allPeriodTasks.map((t, idx) => ({
      'STT': idx + 1,
      'TÊN CÔNG VIỆC': t.title,
      'NGƯỜI PHỤ TRÁCH': t.ownerName,
      'CHỨC VỤ': t.ownerRole,
      'TRẠNG THÁI': formatStatus(t.status),
      'HẠN CHÓT': t.due_at ? format(new Date(t.due_at), 'dd/MM/yyyy HH:mm') : '',
      'NGÀY HOÀN THÀNH': t.completed_at ? format(new Date(t.completed_at), 'dd/MM/yyyy HH:mm') : '',
      'ĐIỂM KPI': t.rating_score ? t.rating_score.toFixed(1) : '',
      'XẾP LOẠI': t.rating_grade ? `Loại ${t.rating_grade}` : '',
      'ĐÁNH GIÁ CỦA LÃNH ĐẠO': t.review_feedback || '',
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'TONG_QUAN_KPI');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(memberRankingData), 'XEP_HANG_BTV');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskDetailsData), 'DANH_SACH_VIEC_CHI_TIET');
    XLSX.writeFile(wb, `BAO_CAO_DANH_GIA_BTV_HCMUTE_${selectedYear}_T${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header & Bộ lọc thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <span>Đánh giá & Xếp loại BTV</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Bảng theo dõi KPI, xếp loại chất lượng công việc và báo cáo định kỳ Đảng ủy trường
          </p>
        </div>

        <button
          onClick={handleExportStatsExcel}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Báo cáo Excel (.xlsx)</span>
        </button>
      </div>

      {/* Bộ điều khiển lọc thời gian */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Quick filters */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setQuickFilter('month'); setSelectedMonth(9); }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              quickFilter === 'month' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setQuickFilter('quarter')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              quickFilter === 'quarter' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Quý 3/2026
          </button>
          <button
            onClick={() => setQuickFilter('academic_year')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              quickFilter === 'academic_year' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Năm học 2026-2027
          </button>
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              quickFilter === 'all' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* Dropdown Tháng / Năm */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Chọn kỳ:</span>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(parseInt(e.target.value, 10));
              setQuickFilter('month');
            }}
            className="p-2 rounded-xl border border-border bg-card text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="p-2 rounded-xl border border-border bg-card text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={2026}>Năm 2026</option>
            <option value={2025}>Năm 2025</option>
          </select>
        </div>
      </div>

      {/* 4 THẺ KPI TỔNG QUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng việc hoàn thành */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Việc đã hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalCompleted}</div>
          <p className="text-[11px] text-muted-foreground">
            Đạt {Math.round((totalCompleted / (totalTasks || 1)) * 100)}% tổng số việc trong kỳ ({totalTasks} việc)
          </p>
        </div>

        {/* 2. Điểm KPI trung bình BTV */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Điểm KPI Trung bình BTV</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-primary flex items-baseline gap-1">
            <span>{averageScore.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-normal">/ 10.0</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Xếp hạng chung toàn Ban Thường vụ: Loại A (Xuất sắc)
          </p>
        </div>

        {/* 3. Tỷ lệ hoàn thành đúng hạn */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Tỷ lệ Đúng hạn</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{onTimePercentage}%</div>
          <p className="text-[11px] text-muted-foreground">
            {beforeDeadline} trước hạn • {onTime} đúng hạn • {afterDeadline} trễ hạn
          </p>
        </div>

        {/* 4. Cơ cấu xếp loại A/B/C/D */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Cơ cấu Xếp loại KPI</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="px-2 py-0.5 text-xs font-black rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              A: {gradeCounts.A}
            </span>
            <span className="px-2 py-0.5 text-xs font-black rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              B: {gradeCounts.B}
            </span>
            <span className="px-2 py-0.5 text-xs font-black rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              C: {gradeCounts.C}
            </span>
            <span className="px-2 py-0.5 text-xs font-black rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              D: {gradeCounts.D}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {gradeCounts.A + gradeCounts.B} công việc đạt kết quả Tốt trở lên
          </p>
        </div>
      </div>

      {/* NHIỆT KẾ TINH THẦN & XUNG LỰC BTV TUẦN NÀY (MINI WIDGET) */}
      <div className="bg-gradient-to-r from-rose-500/5 via-primary/5 to-amber-500/5 rounded-3xl border border-rose-200/60 dark:border-rose-900/40 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Nhiệt kế Tinh thần & Xung lực Tuần này</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {totalCheckins}/9 Đ/c BTV đã gửi
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Áp lực công việc TB: <span className="font-bold text-foreground">{avgWorkload} / 5.0 ⭐</span> • Trạng thái chung: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Tích cực & Sẵn sàng</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold shadow-2xs">
            <span>🚀</span> Bứt phá: <b className="text-foreground">{moodCounts.rocket}</b>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold shadow-2xs">
            <span>😊</span> Thoải mái: <b className="text-foreground">{moodCounts.happy}</b>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border border-border text-xs font-semibold shadow-2xs">
            <span>😐</span> Bình thường: <b className="text-foreground">{moodCounts.neutral}</b>
          </span>
          {(moodCounts.tired > 0 || moodCounts.overload > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 shadow-2xs">
              <span>🆘</span> Cần san sẻ: {moodCounts.tired + moodCounts.overload}
            </span>
          )}
          <button
            onClick={() => setIsWeeklyCheckinModalOpen(true)}
            className="text-xs font-bold text-primary hover:underline px-2 py-1 ml-auto"
          >
            Gửi Check-in →
          </button>
        </div>
      </div>

      {/* THANH CHUYỂN ĐỔI VIEW & TÌM KIẾM */}
      <div className="bg-card rounded-3xl border border-border p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl text-xs font-semibold self-start">
            <button
              onClick={() => setActiveViewMode('ranking')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeViewMode === 'ranking' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Bảng xếp hạng 9 Đ/c BTV</span>
            </button>
            <button
              onClick={() => setActiveViewMode('tasks')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeViewMode === 'tasks' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Chi tiết công việc trong kỳ ({allPeriodTasks.length})</span>
            </button>
          </div>

          {/* Tìm kiếm không dấu tiếng Việt */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên cán bộ, việc, đánh giá..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: BẢNG XẾP HẠNG 9 THÀNH VIÊN BAN THƯỜNG VỤ */}
        {/* ------------------------------------------------------------------ */}
        {activeViewMode === 'ranking' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-12">Hạng</th>
                  <th className="py-3 px-3">Cán bộ BTV</th>
                  <th className="py-3 px-3">Mảng phụ trách</th>
                  <th className="py-3 px-3 text-center">Tổng việc</th>
                  <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">Đã xong</th>
                  <th className="py-3 px-3 text-center text-blue-600 dark:text-blue-400">Đúng hạn</th>
                  <th className="py-3 px-3 text-center text-primary">Điểm KPI TB</th>
                  <th className="py-3 px-3 text-center">Xếp loại</th>
                  <th className="py-3 px-3 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedMembers.map((ms, idx) => {
                  const isMe = ms.member.id === currentMember.id;
                  const isExpanded = expandedMemberId === ms.member.id;
                  const generalGrade =
                    ms.averageScore >= 9.0 ? 'A' :
                    ms.averageScore >= 7.5 ? 'B' :
                    ms.averageScore >= 6.0 ? 'C' : 'D';

                  return (
                    <React.Fragment key={ms.member.id}>
                      <tr
                        className={`hover:bg-muted/40 transition-colors ${
                          isMe ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        {/* Hạng */}
                        <td className="py-3 px-3 text-center font-black">
                          {idx === 0 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 inline-flex items-center justify-center text-xs shadow-2xs font-black">
                              1
                            </span>
                          ) : idx === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 inline-flex items-center justify-center text-xs shadow-2xs font-black">
                              2
                            </span>
                          ) : idx === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700 text-white inline-flex items-center justify-center text-xs shadow-2xs font-black">
                              3
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{idx + 1}</span>
                          )}
                        </td>

                        {/* Tên & Avatar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <AvatarWithFallback
                              src={ms.member.avatar_url}
                              name={ms.member.full_name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1">
                                <span>{ms.member.full_name}</span>
                                {isMe && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground">
                                    Tôi
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {formatRole(ms.member.role)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Mảng phụ trách */}
                        <td className="py-3 px-3 text-muted-foreground capitalize">
                          {ms.member.mang_phu_trach || 'BTV'}
                        </td>

                        {/* Chỉ số */}
                        <td className="py-3 px-3 text-center font-bold text-foreground">
                          {ms.totalAssigned}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {ms.completedOnTime + ms.completedLate}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-blue-600 dark:text-blue-400">
                          {ms.completedOnTime}
                        </td>

                        {/* Điểm KPI TB */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-black text-sm text-primary">
                            {ms.averageScore > 0 ? `${ms.averageScore.toFixed(1)} đ` : '-'}
                          </span>
                        </td>

                        {/* Xếp loại */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${formatRatingGrade(generalGrade).bg} ${formatRatingGrade(generalGrade).color}`}>
                            Loại {generalGrade}
                          </span>
                        </td>

                        {/* Nút xem Accordion chi tiết */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setExpandedMemberId(isExpanded ? null : ms.member.id)}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Xem chi tiết các việc đã làm"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Accordion Chi tiết công việc */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="p-4 bg-muted/20 border-b border-border">
                            <div className="space-y-2.5 max-w-4xl">
                              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span>Danh sách công việc của {ms.member.full_name}:</span>
                                <span className="text-muted-foreground font-normal">({ms.tasks.length} việc)</span>
                              </h4>

                              {ms.tasks.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">
                                  Chưa có công việc nào trong kỳ này.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {ms.tasks.map((task) => (
                                    <div
                                      key={task.id}
                                      onClick={() => setSelectedTaskId(task.id)}
                                      className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                    >
                                      <div className="space-y-1 min-w-0">
                                        <div className="font-bold text-xs text-foreground truncate">
                                          {task.title}
                                        </div>
                                        {task.review_feedback && (
                                          <div className="text-[11px] text-muted-foreground italic">
                                            Nhận xét: "{task.review_feedback}"
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {task.rating_grade && (
                                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                            Loại {task.rating_grade} ({task.rating_score?.toFixed(1)} đ)
                                          </span>
                                        )}
                                        <span className="text-[11px] text-muted-foreground font-mono">
                                          {task.completed_at ? format(new Date(task.completed_at), 'dd/MM') : 'Đang làm'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: DANH SÁCH CHI TIẾT TẤT CẢ CÔNG VIỆC TRONG KỲ */}
        {/* ------------------------------------------------------------------ */}
        {activeViewMode === 'tasks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-3">Tên công việc</th>
                  <th className="py-3 px-3">Người phụ trách</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Hạn chót</th>
                  <th className="py-3 px-3 text-center">Điểm KPI</th>
                  <th className="py-3 px-3 text-center">Xếp loại</th>
                  <th className="py-3 px-3">Nhận xét của lãnh đạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allPeriodTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground italic">
                      Không tìm thấy công việc nào phù hợp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  allPeriodTasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-bold text-foreground max-w-xs truncate">
                        {t.title}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{t.ownerName}</div>
                        <div className="text-[10px] text-muted-foreground">{t.ownerRole}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border">
                          {formatStatus(t.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-muted-foreground">
                        {t.due_at ? format(new Date(t.due_at), 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-primary">
                        {t.rating_score ? `${t.rating_score.toFixed(1)} đ` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {t.rating_grade ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${formatRatingGrade(t.rating_grade).bg} ${formatRatingGrade(t.rating_grade).color}`}>
                            Loại {t.rating_grade}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground italic max-w-sm truncate">
                        {t.review_feedback || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
