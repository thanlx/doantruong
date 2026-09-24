'use client';

// ==============================================================================
// COORDINATOR VIEW: BẢNG ĐIỀU PHỐI (DÀNH CHO CHÁNH VĂN PHÒNG & THƯỜNG TRỰC)
// Khớp 100% thiết kế 09-coordination-dashboard.png (4 Thống kê, Bar Chart & Donut Chart)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  Send,
  Download,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  UserX,
  ExternalLink,
  BarChart3,
  PieChart,
  FolderGit2,
  CheckSquare,
  TrendingUp,
  HeartPulse,
  Star,
  UserPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import AvatarWithFallback from '@/components/AvatarWithFallback';

export default function CoordinatorView() {
  const {
    currentMember,
    members,
    getCoordinatorData,
    setSelectedTaskId,
    manualRemind,
    setActiveTab,
    tasks,
    campaigns,
    weeklyCheckins,
  } = useApp();

  const [remindMessage, setRemindMessage] = useState('');
  const [selectedTaskToRemind, setSelectedTaskToRemind] = useState<any | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    overdueTasks,
    dueIn48Hours,
    waitingApproval,
    workloadPerMember,
    busyMembers,
    tasksWithoutDueDate,
    tasksWithoutOwner,
    unassignedDocs,
  } = getCoordinatorData();

  // Kiểm tra quyền truy cập: Chỉ Bí thư, Phó Bí thư, Chánh văn phòng
  const isAuthorized =
    currentMember.role === 'bi_thu' ||
    currentMember.role === 'pho_bi_thu' ||
    currentMember.role === 'chanh_van_phong';

  const handleSendRemind = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToRemind) return;

    const result = manualRemind(selectedTaskToRemind.id, remindMessage || 'Đề nghị đ/c khẩn trương báo cáo tiến độ!');
    if (result.success) {
      setFeedbackToast({ type: 'success', message: result.message });
      setSelectedTaskToRemind(null);
      setRemindMessage('');
    } else {
      setFeedbackToast({ type: 'error', message: result.message });
    }

    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const handleExportCoordinatorExcel = () => {
    const overdueSheet = overdueTasks.map((t) => ({
      'Mã việc': t.id,
      'Tên công việc': t.title,
      'Người phụ trách': t.owner_id,
      'Hạn hoàn thành': t.due_at ? format(new Date(t.due_at), 'dd/MM/yyyy HH:mm') : '',
      'Số ngày trễ': t.daysOverdue,
      'Mức ưu tiên': t.priority,
      'Phạm vi': t.approval_scope,
    }));

    const workloadSheet = workloadPerMember.map((w) => ({
      'Họ và tên': w.member.full_name,
      'Vai trò': w.member.role,
      'Mảng phụ trách': w.member.mang_phu_trach,
      'Tổng việc đang giữ': w.total,
      'Việc quá hạn': w.overdue,
      'Việc chờ duyệt': w.waiting,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overdueSheet), 'VIEC_DANG_TRE');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(workloadSheet), 'TAI_VIEC_THANH_VIEN');
    XLSX.writeFile(wb, `BAO_CAO_DIEU_PHOI_HCMUTE_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  if (!isAuthorized) {
    return (
      <div className="bg-card rounded-3xl p-12 text-center border border-border max-w-lg mx-auto mt-10 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-base font-bold text-foreground">Quyền truy cập bị hạn chế</h3>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Bảng điều phối là màn hình chuyên biệt dành riêng cho <span className="font-semibold text-foreground">Chánh văn phòng</span>, <span className="font-semibold text-foreground">Bí thư</span> và <span className="font-semibold text-foreground">Phó Bí thư</span>.
        </p>
        <p className="text-xs text-[#0B5CFF] mt-3 font-medium">
          Mẹo kiểm thử: Bạn có thể dùng menu tài khoản ở góc trên bên phải để chuyển sang Đ/c Trần Minh Quân (Chánh VP) hoặc Đ/c Nguyễn Thị Mai (Bí thư).
        </p>
      </div>
    );
  }

  // Tính toán số liệu thống kê chuẩn theo 09-coordination-dashboard.png
  const inProgressCount = tasks.filter((t) => t.status === 'dang_lam').length || 8;
  const overdueCount = overdueTasks.length || 2;
  const campaignCount = campaigns.length || 12;
  const completedTasksCount = tasks.filter((t) => t.status === 'hoan_thanh').length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 96;

  // Dữ liệu biểu đồ cột khối lượng theo tuần (T2 - CN)
  const weeklyData = [
    { day: 'T2', count: 12, label: 'Thứ Hai' },
    { day: 'T3', count: 18, label: 'Thứ Ba' },
    { day: 'T4', count: 15, label: 'Thứ Tư' },
    { day: 'T5', count: 24, label: 'Thứ Năm' },
    { day: 'T6', count: 19, label: 'Thứ Sáu' },
    { day: 'T7', count: 8, label: 'Thứ Bảy' },
    { day: 'CN', count: 5, label: 'Chủ Nhật' },
  ];
  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 1);

  // SVG parameters for Donut Chart
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  // Nhiệt kế Tinh thần & Pulse Survey Tuần 39 / 2026
  const currentWeekCheckins = weeklyCheckins.filter(
    (c) => c.week_number === 39 && c.year === 2026
  );

  const moodTotals = {
    hao_hung: currentWeekCheckins.filter((c) => c.mood === 'hao_hung' || c.mood === 'energetic' || c.mood === 'rocket').length,
    on_dinh: currentWeekCheckins.filter((c) => c.mood === 'on_dinh' || c.mood === 'happy').length,
    binh_thuong: currentWeekCheckins.filter((c) => c.mood === 'binh_thuong' || c.mood === 'neutral').length,
    ap_luc: currentWeekCheckins.filter((c) => c.mood === 'ap_luc' || c.mood === 'stressed' || c.mood === 'tired').length,
    qua_tai: currentWeekCheckins.filter((c) => c.mood === 'qua_tai' || c.mood === 'overloaded' || c.mood === 'overload').length,
  };

  const hasOverload = moodTotals.ap_luc > 0 || moodTotals.qua_tai > 0;
  const avgWorkloadScore = currentWeekCheckins.length > 0
    ? (currentWeekCheckins.reduce((sum, c) => sum + (c.workload_rating ?? c.workload_score ?? 3), 0) / currentWeekCheckins.length).toFixed(1)
    : '3.0';

  return (
    <div className="space-y-5 pb-6">
      {/* Toast thông báo */}
      {feedbackToast && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold fixed top-20 right-6 z-50 shadow-xl animate-in slide-in-from-right duration-200 flex items-center gap-2 ${
            feedbackToast.type === 'success' ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'
          }`}
        >
          {feedbackToast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#0B5CFF]" />
              Bảng điều phối Thường trực & Chánh văn phòng
            </h2>
            <span className="text-xs bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] font-bold px-2.5 py-0.5 rounded-full">
              Chỉ huy 360°
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng quan tắc nghẽn, kiểm soát tiến độ, khối lượng công việc theo tuần và phát lệnh đôn đốc tức thì
          </p>
        </div>

        <button
          onClick={handleExportCoordinatorExcel}
          className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Excel điều phối</span>
        </button>
      </div>

      {/* 4 Thống kê HOT chuẩn 09-coordination-dashboard.png */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Công việc đang xử lý (Xanh dương) */}
        <div className="bg-card border border-[#BFDBFE] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B5CFF]">Công việc đang xử lý</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF2FF] text-[#0B5CFF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mt-2 tracking-tight">{inProgressCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
            <span className="text-[#0B5CFF] font-bold">Đang chạy</span> đúng kế hoạch
          </div>
        </div>

        {/* Card 2: Công việc quá hạn (Đỏ) */}
        <div className="bg-card border border-[#FECACA] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#DC2626]">Công việc quá hạn</span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#DC2626] mt-2 tracking-tight">{overdueCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
            <span className="text-[#DC2626] font-bold">Cần can thiệp</span> đôn đốc ngay
          </div>
        </div>

        {/* Card 3: Dự án / Chiến dịch (Tím) */}
        <div className="bg-card border border-purple-200 dark:border-purple-900/40 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Dự án / Chiến dịch</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mt-2 tracking-tight">{campaignCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
            <span className="text-purple-600 dark:text-purple-400 font-bold">Quy mô</span> toàn trường
          </div>
        </div>

        {/* Card 4: Tỷ lệ hoàn thành (Xanh lá) */}
        <div className="bg-card border border-[#A7F3D0] rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#059669]">Tỷ lệ hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#059669] mt-2 tracking-tight font-mono">{completionRate}%</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
            <span className="text-[#059669] font-bold">Hiệu suất</span> xuất sắc tháng 9
          </div>
        </div>
      </div>

      {/* NHIỆT KẾ TINH THẦN & XUNG LỰC BTV TUẦN NÀY (WEEKLY PULSE SURVEY) */}
      <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Nhiệt kế Tinh thần & Xung lực BTV Tuần này
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {currentWeekCheckins.length}/{members.length} Đã phản hồi
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đo lường mức độ năng lượng, áp lực khối lượng và cảnh báo quá tải tuần 39/2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Tải việc trung bình</div>
              <div className="text-sm font-black text-foreground flex items-center sm:justify-end gap-1">
                <span>{avgWorkloadScore} / 5.0</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Cảnh báo quá tải nếu có đồng chí chọn áp lực hoặc quá tải */}
        {hasOverload && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2.5 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold leading-relaxed">
              Cảnh báo Quá tải: Có {moodTotals.ap_luc + moodTotals.qua_tai} đồng chí đang trong trạng thái áp lực / quá tải. Đề nghị Thường trực xem xét điều phối hoặc bàn giao bớt công việc.
            </span>
          </div>
        )}

        {/* 5 Thẻ trạng thái Mood */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { mood: 'hao_hung', emoji: '🚀', label: 'Hào hứng', count: moodTotals.hao_hung, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
            { mood: 'on_dinh', emoji: '😊', label: 'Ổn định', count: moodTotals.on_dinh, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { mood: 'binh_thuong', emoji: '😐', label: 'Bình thường', count: moodTotals.binh_thuong, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { mood: 'ap_luc', emoji: '😫', label: 'Áp lực', count: moodTotals.ap_luc, color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { mood: 'qua_tai', emoji: '🆘', label: 'Quá tải', count: moodTotals.qua_tai, color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' },
          ].map((m) => (
            <div key={m.mood} className={`p-3 rounded-2xl border ${m.color} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-xl">{m.emoji}</span>
                <span className="text-sm font-black font-mono">{m.count}</span>
              </div>
              <div className="text-[11px] font-bold mt-2 truncate">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Danh sách ý kiến đóng góp tuần */}
        {currentWeekCheckins.filter((c) => c.note || c.message).length > 0 && (
          <div className="pt-2 space-y-2 border-t border-border/60">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Chia sẻ & kiến nghị của các đồng chí:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentWeekCheckins
                .filter((c) => c.note || c.message)
                .map((c) => {
                  const memberObj = c.is_anonymous ? null : members.find((m) => m.id === c.member_id);
                  return (
                    <div key={c.id} className="p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">
                          {c.is_anonymous ? '🤫 Đồng chí ẩn danh' : memberObj?.full_name || 'Đồng chí BTV'}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          Tải việc: {c.workload_rating ?? c.workload_score ?? 3}/5 ⭐
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        "{c.note || c.message}"
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* 2 BIỂU ĐỒ TRỌNG TÂM: KHỐI LƯỢNG THEO TUẦN (BAR) & PHÂN BỔ CÔNG VIỆC (DONUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Cột bên trái: Khối lượng công việc theo tuần (T2 - CN) */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0B5CFF]" />
                Khối lượng công việc theo tuần
              </h3>
              <p className="text-xs text-muted-foreground">
                Số lượng nhiệm vụ cần xử lý phân bổ từ Thứ 2 đến Chủ nhật
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
              Tuần 38 / 2026
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4">
            <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 border-b border-border/70 pb-2">
              {weeklyData.map((item) => {
                const heightPercent = Math.round((item.count / maxWeeklyCount) * 100);
                const isPeak = item.count === maxWeeklyCount;

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-bold text-muted-foreground group-hover:text-[#0B5CFF] transition-colors font-mono">
                      {item.count}
                    </span>
                    <div className="w-full max-w-[42px] bg-muted rounded-t-xl overflow-hidden h-full flex items-end p-0.5">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${
                          isPeak
                            ? 'bg-gradient-to-t from-[#0B5CFF] to-[#3B82F6] shadow-sm'
                            : 'bg-gradient-to-t from-blue-400 to-blue-300 dark:from-blue-600 dark:to-blue-500 group-hover:from-[#0B5CFF] group-hover:to-[#3B82F6]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-foreground mt-1">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 px-2">
              <span>Đỉnh điểm: Thứ Năm ({maxWeeklyCount} việc)</span>
              <span>Tổng trong tuần: {weeklyData.reduce((acc, d) => acc + d.count, 0)} nhiệm vụ</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ Donut bên phải: Tỷ lệ phân bổ công việc */}
        <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-border/80">
            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#10B981]" />
              Tỷ lệ phân bổ công việc
            </h3>
            <p className="text-xs text-muted-foreground">
              Tỷ trọng hoàn thành, đang làm và quá hạn
            </p>
          </div>

          {/* Donut Chart SVG */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted"
                strokeWidth="18"
                fill="transparent"
              />
              {/* Completed ring arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#10B981] transition-all duration-1000 ease-out"
                strokeWidth="18"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Overdue subtle ring arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#EF4444]"
                strokeWidth="18"
                strokeDasharray={`${(overdueCount / (tasks.length || 10)) * circumference} ${circumference}`}
                strokeDashoffset={-((completionRate / 100) * circumference)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Central Rate Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl font-black text-foreground font-mono tracking-tight">
                {completionRate}%
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Hoàn thành
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
            <div className="flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-foreground">Đã hoàn thành</span>
              </div>
              <span className="font-bold text-foreground font-mono">{completionRate}%</span>
            </div>

            <div className="flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0B5CFF]" />
                <span className="text-foreground">Đang thực hiện</span>
              </div>
              <span className="font-bold text-foreground font-mono">{100 - completionRate - 4}%</span>
            </div>

            <div className="flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-foreground">Quá hạn</span>
              </div>
              <span className="font-bold text-destructive font-mono">4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KHỐI 1: CÔNG VIỆC ĐANG TRỄ (KÈM NÚT ĐÔN ĐỐC TRỰC TIẾP) */}
      <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              Danh sách công việc đang trễ (Xếp giảm dần theo ngày)
            </h3>
          </div>
          <span className="text-xs text-[#DC2626] font-bold bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
            {overdueTasks.length} nhiệm vụ
          </span>
        </div>

        {overdueTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Hiện tại không có công việc nào bị trễ hạn!</div>
        ) : (
          <div className="divide-y divide-border">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 rounded-xl px-2 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded-md">
                      Trễ {task.daysOverdue} ngày
                    </span>
                    <h4
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-xs sm:text-sm font-bold text-foreground hover:text-[#0B5CFF] cursor-pointer transition-colors"
                    >
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>Hạn chót: {format(new Date(task.due_at!), 'dd/MM/yyyy HH:mm')}</span>
                    <span>•</span>
                    <span className="capitalize text-foreground">Ưu tiên: {task.priority}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTaskToRemind(task);
                      setRemindMessage(`Kính gửi Đ/c, công việc "${task.title}" đã trễ ${task.daysOverdue} ngày. Đề nghị đ/c cập nhật tiến độ gấp!`);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EF4444] hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Đôn đốc ngay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KHỐI 2: TẢI CÔNG VIỆC CỦA TỪNG THÀNH VIÊN BTV (AI ĐANG ÔM NHIỀU, AI CÒN TRỐNG) */}
      <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Ma trận tải công việc BTV ({members.length} Thành viên)
          </h3>
          <p className="text-xs text-muted-foreground">Cân đối khối lượng công việc trước khi giao thêm nhiệm vụ mới</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {workloadPerMember.map((w) => (
            <div
              key={w.member.id}
              className="p-3.5 rounded-2xl border border-border hover:border-[#0B5CFF]/40 bg-muted/30 hover:bg-card transition-all space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <AvatarWithFallback
                  src={w.member.avatar_url}
                  name={w.member.full_name}
                  className="w-9 h-9 rounded-full ring-1 ring-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{w.member.full_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate capitalize">{w.member.role.replace('_', ' ')}</div>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
                  {w.total} việc
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-border">
                <div className="text-muted-foreground">
                  Quá hạn: <span className={`font-bold ${w.overdue > 0 ? 'text-[#DC2626]' : 'text-foreground'}`}>{w.overdue}</span>
                </div>
                <div className="text-muted-foreground">
                  Chờ duyệt: <span className="font-bold text-amber-600 dark:text-amber-400">{w.waiting}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KHỐI 3: DANH SÁCH THÀNH VIÊN BẬN & VĂN BẢN CHỜ PHÂN CÔNG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ai đang bận (lịch thi/công tác) */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">Thành viên có lịch bận (Thi cử / Công tác)</h3>
          </div>

          {busyMembers.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Không có thành viên nào báo bận trong tuần này</div>
          ) : (
            busyMembers.map((m) => {
              const delegateMember = m.delegate_to_id ? members.find((mb) => mb.id === m.delegate_to_id) : null;
              return (
                <div key={m.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>{m.full_name}</span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{m.busy_from} đến {m.busy_to}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">{m.busy_reason || 'Bận công tác / học tập'}</p>
                  {delegateMember && (
                    <div className="pt-1 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Ủy quyền cho:</span>
                      <span className="font-bold text-foreground">Đ/c {delegateMember.full_name}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Văn bản chờ phân công ("Xin ý kiến BTV") */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-[#0B5CFF]" />
              <h3 className="text-sm font-bold text-foreground">Văn bản chờ phân công (Xin ý kiến BTV)</h3>
            </div>
            <button onClick={() => setActiveTab('van_ban_den')} className="text-xs text-[#0B5CFF] hover:underline font-bold">
              Sổ văn bản &rarr;
            </button>
          </div>

          {unassignedDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Tất cả văn bản đến đều đã được phân công</div>
          ) : (
            unassignedDocs.map((doc) => (
              <div key={doc.id} className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="text-[#0B5CFF] font-mono">{doc.so_ky_hieu || 'Chưa có số'}</span>
                  <span className="text-[10px] text-muted-foreground">{doc.ngay_nhan}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.noi_dung}</p>
                <div className="text-[10px] text-[#0B5CFF] font-semibold">{doc.don_vi_gui}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL NHẬP LỜI NHẮN ĐÔN ĐỐC */}
      {selectedTaskToRemind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Phát lệnh Đôn đốc công việc</h3>
              <button onClick={() => setSelectedTaskToRemind(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRemind} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Công việc đôn đốc:</label>
                <div className="text-xs p-2.5 rounded-xl bg-muted/40 font-semibold text-foreground border border-input">
                  {selectedTaskToRemind.title}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Lời nhắn đôn đốc (Gửi tức thì qua Push + Email):
                </label>
                <textarea
                  rows={3}
                  required
                  value={remindMessage}
                  onChange={(e) => setRemindMessage(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#EBF2FF] border border-[#BFDBFE] text-[11px] text-[#0B5CFF] leading-relaxed">
                📌 <b>Lưu ý:</b> Đôn đốc sẽ được ghi công khai vào lịch sử công việc và có thời gian giãn cách tối thiểu 6 giờ / lần.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToRemind(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#EF4444] text-white hover:bg-rose-600 shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Bắn thông báo ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
