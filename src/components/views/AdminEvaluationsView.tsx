'use client';

// ==============================================================================
// QUẢN LÝ ĐÁNH GIÁ HẰNG THÁNG (ADMIN EVALUATIONS VIEW - SCREEN 15)
// Hỗ trợ tạo kỳ đánh giá mới, khởi tạo phiếu cho toàn bộ cán bộ, chấm A/B/C/D,
// duyệt kết quả, nhắc hạn tự động, xuất Excel và Công bố/Khóa kỳ
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Settings,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Unlock,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { EvaluationGrade } from '@/types';
import * as XLSX from 'xlsx';

export default function AdminEvaluationsView() {
  const {
    units,
    evaluationPeriods,
    evaluations,
    systemConfig,
    publishEvaluationPeriod,
    reopenEvaluationPeriod,
    reviewEvaluation,
    createEvaluationPeriod,
    generateEvaluationsForPeriod,
    addNotification,
    setAdminTab,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState(
    evaluationPeriods[0]?.month_year || '10/2026'
  );
  const [selectedUnitId, setSelectedUnitId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modals
  const [isCreatePeriodOpen, setIsCreatePeriodOpen] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [newMonthYear, setNewMonthYear] = useState('11/2026');
  const [newStartDate, setNewStartDate] = useState('2026-11-01');
  const [newSelfDeadline, setNewSelfDeadline] = useState('2026-11-25');
  const [newEndDate, setNewEndDate] = useState('2026-11-30');

  const activePeriod =
    evaluationPeriods.find((p) => p.month_year === selectedMonth) || evaluationPeriods[0];

  const periodEvaluations = evaluations.filter((e) => e.period_id === activePeriod?.id);

  // Candidates list filtered
  const filteredCandidates = periodEvaluations.filter((e) => {
    if (selectedUnitId !== 'all' && e.unit_id !== selectedUnitId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.profile_name.toLowerCase().includes(q);
      const matchMssv = e.student_id.toLowerCase().includes(q);
      if (!matchName && !matchMssv) return false;
    }
    return true;
  });

  // Selected candidate evaluation for right-side drawer
  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    filteredCandidates[0]?.id || evaluations[0]?.id || ''
  );
  const selectedEval =
    filteredCandidates.find((e) => e.id === selectedEvalId) ||
    periodEvaluations.find((e) => e.id === selectedEvalId) ||
    filteredCandidates[0];

  // Grade selection in drawer
  const [chosenGrade, setChosenGrade] = useState<EvaluationGrade>(
    (selectedEval?.approved_grade || selectedEval?.proposed_grade || 'B') as EvaluationGrade
  );
  const [unitFeedback, setUnitFeedback] = useState(
    selectedEval?.unit_comment ||
      'Cán bộ chủ động, hoàn thành tốt các nhiệm vụ được giao, tinh thần phối hợp tốt.'
  );

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSelectCandidate = (evalId: string) => {
    setSelectedEvalId(evalId);
    const found = evaluations.find((e) => e.id === evalId);
    if (found) {
      setChosenGrade((found.approved_grade || found.proposed_grade || 'B') as EvaluationGrade);
      setUnitFeedback(
        found.unit_comment ||
          'Cán bộ chủ động, hoàn thành tốt các nhiệm vụ được giao, tinh thần phối hợp tốt.'
      );
    }
  };

  const handleApprove = () => {
    if (!selectedEval) return;
    const res = reviewEvaluation(
      selectedEval.id,
      chosenGrade,
      unitFeedback,
      chosenGrade,
      'Thường trực Đoàn trường phê duyệt xếp loại.',
      'approve'
    );
    showToast(res.message);
  };

  const handleReturn = () => {
    if (!selectedEval) return;
    const res = reviewEvaluation(
      selectedEval.id,
      null,
      unitFeedback,
      null,
      'Yêu cầu bổ sung minh chứng hoạt động.',
      'return'
    );
    showToast(res.message);
  };

  const handlePublish = () => {
    if (!activePeriod) return;
    if (activePeriod.is_published) {
      const reason =
        prompt('Nhập căn cứ/lý do mở lại kỳ đánh giá đã khóa:') ||
        'Điều chỉnh theo kiến nghị của cán bộ';
      const res = reopenEvaluationPeriod(activePeriod.id, reason);
      showToast(res.message);
    } else {
      const res = publishEvaluationPeriod(activePeriod.id);
      showToast(res.message);
    }
  };

  const handleGenerateSheets = () => {
    if (!activePeriod) return;
    const res = generateEvaluationsForPeriod(activePeriod.id);
    showToast(res.message);
  };

  const handleCreatePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthYear.trim()) return;
    const parts = newMonthYear.trim().split('/');
    const monthNum = parseInt(parts[0]) || 11;
    const yearNum = parseInt(parts[1]) || 2026;
    const res = createEvaluationPeriod({
      month_year: newMonthYear.trim(),
      month_number: monthNum,
      year_number: yearNum,
      title: `Đánh giá cán bộ tháng ${newMonthYear.trim()}`,
      subsystem_ids: ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07'],
      unit_ids: units.map((u) => u.id),
      self_evaluation_deadline: newSelfDeadline,
      review_deadline: newEndDate,
      status: 'open',
      is_published: false,
      criteria_version: systemConfig.evaluation_criteria?.version || '1.0',
    });
    if (res.success) {
      setSelectedMonth(newMonthYear.trim());
      setIsCreatePeriodOpen(false);
    }
    showToast(res.message);
  };

  const handleExportExcel = () => {
    if (!activePeriod) return;
    const rows = filteredCandidates.map((cand, idx) => ({
      STT: idx + 1,
      'Kỳ đánh giá': cand.month_year,
      'Họ và tên': cand.profile_name,
      'MSSV / Mã CB': cand.student_id,
      'Đơn vị': cand.unit_name,
      'Chức vụ': cand.position_title,
      'Trạng thái gửi': cand.status === 'not_submitted' ? 'Chưa gửi' : 'Đã gửi',
      'Ngày gửi': cand.submitted_at || '',
      'Mức đề xuất': cand.proposed_grade || '',
      'Mức phê duyệt': cand.approved_grade || '',
      'Trạng thái duyệt':
        cand.status === 'approved'
          ? 'Đã duyệt'
          : cand.status === 'submitted'
          ? 'Chờ duyệt'
          : 'Chưa xử lý',
      'Nhận xét đơn vị': cand.unit_comment || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KetQuaDanhGia');
    XLSX.writeFile(wb, `Danh_Gia_Can_Bo_${activePeriod.month_year.replace('/', '_')}.xlsx`);
    showToast(`Đã xuất tệp Excel kết quả đánh giá kỳ ${activePeriod.month_year}.`);
  };

  // Live computed metrics for activePeriod
  const totalTargets = Math.max(activePeriod?.total_targets || 0, periodEvaluations.length);
  const submittedCount = periodEvaluations.filter((e) => e.status !== 'not_submitted').length;
  const approvedCount = periodEvaluations.filter((e) => e.status === 'approved').length;
  const notSubmittedCount = Math.max(0, totalTargets - submittedCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Quản lý đánh giá hằng tháng
            </h1>
            {activePeriod && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  activePeriod.is_published
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : 'bg-rose-500/10 text-rose-700'
                }`}
              >
                {activePeriod.is_published ? 'Đã công bố' : 'Chưa công bố'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activePeriod?.is_published
              ? 'Kết quả đã được công bố chính thức cho toàn bộ cán bộ Đoàn – Hội.'
              : 'Kết quả chưa hiển thị cho cán bộ cho đến khi Thường trực nhấn công bố.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
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

          {/* Unit selector */}
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs focus:border-primary focus:outline-hidden"
          >
            <option value="all">Tất cả đơn vị</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreatePeriodOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Tạo kỳ mới</span>
          </button>

          <button
            onClick={handleGenerateSheets}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            title="Tạo phiếu đánh giá cho các cán bộ mới được thêm vào hệ thống"
          >
            <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
            <span>Đồng bộ danh sách CB</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handlePublish}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer ${
              activePeriod?.is_published
                ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {activePeriod?.is_published ? (
              <>
                <Unlock className="h-4 w-4" />
                <span>Mở lại kỳ</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                <span>Công bố kết quả</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đối tượng đánh giá</p>
            <p className="text-2xl font-black text-primary tracking-tight">{totalTargets}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đã gửi đánh giá</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tight">{submittedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đã duyệt</p>
            <p className="text-2xl font-black text-primary tracking-tight">{approvedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Chưa gửi</p>
            <p className="text-2xl font-black text-rose-600 tracking-tight">{notSubmittedCount}</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (TABLE 7 COLS + DETAIL DRAWER 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CANDIDATES LIST TABLE */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Danh sách phiếu đánh giá ({filteredCandidates.length})
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cán bộ theo họ tên, MSSV..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center space-y-3 border border-dashed border-border rounded-xl">
                <p className="text-xs text-muted-foreground">
                  Chưa có phiếu đánh giá nào trong kỳ này hoặc không khớp bộ lọc.
                </p>
                <button
                  onClick={handleGenerateSheets}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Khởi tạo phiếu đánh giá cho toàn bộ cán bộ</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                      <th className="py-2.5 px-2 w-10 text-center">STT</th>
                      <th className="py-2.5 px-2">Cán bộ</th>
                      <th className="py-2.5 px-2">Chức vụ</th>
                      <th className="py-2.5 px-2">Tự đánh giá</th>
                      <th className="py-2.5 px-2 text-center">Mức xếp loại</th>
                      <th className="py-2.5 px-2">Phê duyệt</th>
                      <th className="py-2.5 px-2 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCandidates.map((cand, idx) => {
                      const isSelected = selectedEval?.id === cand.id;
                      return (
                        <tr
                          key={cand.id}
                          onClick={() => handleSelectCandidate(cand.id)}
                          className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/5 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-center text-muted-foreground font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-2">
                            <strong className="text-foreground block">{cand.profile_name}</strong>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              MSSV: {cand.student_id}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-medium text-foreground text-[11px]">
                            <span className="block">{cand.position_title}</span>
                            <span className="text-[10px] text-muted-foreground">{cand.unit_name}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cand.status === 'not_submitted'
                                  ? 'bg-rose-500/10 text-rose-700'
                                  : 'bg-emerald-500/10 text-emerald-700'
                              }`}
                            >
                              {cand.status === 'not_submitted'
                                ? 'Chưa gửi'
                                : `Đã gửi ${cand.submitted_at?.split(' ')[0] || ''}`}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="font-black text-xs text-primary">
                              {cand.approved_grade || cand.proposed_grade || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                cand.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : cand.status === 'submitted'
                                  ? 'bg-amber-500/10 text-amber-700'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {cand.status === 'approved'
                                ? 'Đã duyệt'
                                : cand.status === 'submitted'
                                ? 'Chờ duyệt'
                                : 'Chưa xử lý'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            {cand.status === 'not_submitted' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addNotification({
                                    title: `Nhắc hạn tự đánh giá tháng ${cand.month_year}`,
                                    content: `Đề nghị đồng chí ${cand.profile_name} hoàn thành phiếu tự đánh giá chức vụ ${cand.position_title} trước hạn định.`,
                                    category: 'danh_gia',
                                    sender_name: 'Ban Tổ chức - Kiểm tra',
                                    target_scope: `${cand.profile_name} (${cand.student_id})`,
                                    channel: 'in_app',
                                    link_type: 'danh_gia',
                                    link_label: 'Mở phiếu đánh giá',
                                  });
                                  showToast(`Đã gửi thông báo nhắc hạn tới ${cand.profile_name}.`);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-700 text-[11px] font-bold hover:bg-rose-50 cursor-pointer"
                              >
                                Nhắc hạn
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCandidate(cand.id);
                                }}
                                className="px-3 py-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold cursor-pointer"
                              >
                                Xem xét
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL EVALUATION DRAWER */}
        <div className="lg:col-span-5">
          {selectedEval ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 sticky top-20">
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-foreground">{selectedEval.profile_name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedEval.status === 'not_submitted'
                          ? 'bg-rose-500/10 text-rose-700'
                          : 'bg-emerald-500/10 text-emerald-700'
                      }`}
                    >
                      {selectedEval.status === 'not_submitted' ? 'Chưa gửi' : 'Đã gửi'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    MSSV: {selectedEval.student_id} • {selectedEval.position_title} ({selectedEval.unit_name})
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ngày gửi: {selectedEval.submitted_at || 'Chưa gửi'}
                  </p>
                </div>
              </div>

              {/* Bộ tiêu chí áp dụng */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-foreground">
                    Bộ tiêu chí v{systemConfig.evaluation_criteria?.version || '1.0'}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">
                    Áp dụng từ {systemConfig.evaluation_criteria?.created_date || '01/10/2026'}
                  </span>
                </div>
                <button
                  onClick={() => setIsCriteriaModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-bold cursor-pointer"
                >
                  Xem tiêu chí A/B/C/D
                </button>
              </div>

              {/* Mức đánh giá đề xuất (Radio A, B, C, D) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block uppercase tracking-wider">
                  Xếp loại đánh giá (A / B / C / D)
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { grade: 'A', label: 'A - Hoàn thành xuất sắc nhiệm vụ' },
                    { grade: 'B', label: 'B - Hoàn thành tốt nhiệm vụ' },
                    { grade: 'C', label: 'C - Hoàn thành nhiệm vụ' },
                    { grade: 'D', label: 'D - Chưa hoàn thành nhiệm vụ' },
                  ].map((g) => {
                    const isSelected = chosenGrade === g.grade;
                    return (
                      <label
                        key={g.grade}
                        onClick={() => setChosenGrade(g.grade as EvaluationGrade)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-bold shadow-2xs'
                            : 'border-border bg-background text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gradeChoice"
                          checked={isSelected}
                          onChange={() => setChosenGrade(g.grade as EvaluationGrade)}
                          className="h-3.5 w-3.5 text-primary"
                        />
                        <span>{g.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Nhận xét của cán bộ (tự đánh giá) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nội dung tự đánh giá của cán bộ
                </label>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs text-foreground leading-relaxed">
                  {selectedEval.task_results ||
                    'Cán bộ chưa gửi nội dung tự đánh giá hoặc đang cập nhật minh chứng.'}
                </div>
              </div>

              {/* Nhận xét của đơn vị (đề xuất) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nhận xét của đơn vị / Thường trực</label>
                <textarea
                  rows={2}
                  value={unitFeedback}
                  onChange={(e) => setUnitFeedback(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  onClick={handleReturn}
                  className="px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  Trả lại bổ sung
                </button>
                <button
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Duyệt đánh giá ({chosenGrade})
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
              Chọn một cán bộ trong danh sách để xem chi tiết phiếu đánh giá.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: TẠO KỲ ĐÁNH GIÁ MỚI */}
      {isCreatePeriodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Mở kỳ đánh giá hằng tháng mới</h3>
              <button
                onClick={() => setIsCreatePeriodOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriodSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Tháng / Năm (Định dạng MM/YYYY) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 11/2026"
                  value={newMonthYear}
                  onChange={(e) => setNewMonthYear(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 font-bold focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Ngày bắt đầu mở kỳ</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Hạn tự đánh giá</label>
                  <input
                    type="date"
                    value={newSelfDeadline}
                    onChange={(e) => setNewSelfDeadline(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground">Ngày kết thúc kỳ</label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-xl">
                Hệ thống sẽ tự động khởi tạo phiếu đánh giá cho toàn bộ cán bộ đang giữ chức vụ hiện hành.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreatePeriodOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 cursor-pointer"
                >
                  Tạo và mở kỳ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: XEM CHI TIẾT BỘ TIÊU CHÍ A/B/C/D */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Quy định tiêu chuẩn xếp loại A, B, C, D
                </h3>
                <p className="text-xs text-muted-foreground">
                  Phiên bản {systemConfig.evaluation_criteria?.version || '1.0'}
                </p>
              </div>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <strong className="text-emerald-800 block mb-1">
                  Mức A – Hoàn thành xuất sắc nhiệm vụ
                </strong>
                <p className="text-slate-700">
                  {systemConfig.evaluation_criteria?.rules_a ||
                    'Hoàn thành xuất sắc 100% nhiệm vụ, có sáng kiến cải tiến hiệu quả hoạt động Đoàn - Hội.'}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60">
                <strong className="text-blue-800 block mb-1">Mức B – Hoàn thành tốt nhiệm vụ</strong>
                <p className="text-slate-700">
                  {systemConfig.evaluation_criteria?.rules_b ||
                    'Hoàn thành đầy đủ các nhiệm vụ được giao đúng hạn, tham gia tích cực sinh hoạt định kỳ.'}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
                <strong className="text-amber-800 block mb-1">Mức C – Hoàn thành nhiệm vụ</strong>
                <p className="text-slate-700">
                  {systemConfig.evaluation_criteria?.rules_c ||
                    'Cơ bản hoàn thành nhiệm vụ được phân công nhưng còn trễ hạn hoặc cần nhắc nhở.'}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60">
                <strong className="text-rose-800 block mb-1">
                  Mức D – Không hoàn thành nhiệm vụ
                </strong>
                <p className="text-slate-700">
                  {systemConfig.evaluation_criteria?.rules_d ||
                    'Bỏ bê nhiệm vụ, vắng họp không lý do quá quy định hoặc vi phạm kỷ luật.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <button
                onClick={() => {
                  setIsCriteriaModalOpen(false);
                  setAdminTab('cau_hinh');
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Chỉnh sửa bộ tiêu chí tại Cấu hình hệ thống &gt;
              </button>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
