'use client';

// ==============================================================================
// QUẢN LÝ ĐÁNH GIÁ HẰNG THÁNG (ADMIN EVALUATIONS VIEW - SCREEN 15 MOCKUP)
// Hỗ trợ cấu hình kỳ, mở kỳ, chấm A/B/C/D, duyệt kết quả và Công bố/Khóa kỳ theo Mục 8
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Settings,
  Play,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Bell,
  AlertCircle,
  Lock,
  Unlock,
} from 'lucide-react';
import { MonthlyEvaluation, EvaluationGrade } from '@/types';

export default function AdminEvaluationsView() {
  const {
    units,
    evaluationPeriods,
    evaluations,
    publishEvaluationPeriod,
    reopenEvaluationPeriod,
    reviewEvaluation,
    setAdminTab,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('10/2026');
  const [selectedUnitId, setSelectedUnitId] = useState('unit_doan_co_so');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected candidate evaluation for right-side drawer
  const [selectedEvalId, setSelectedEvalId] = useState<string>('eval_ma_10_dcs');
  const selectedEval = evaluations.find((e) => e.id === selectedEvalId) || evaluations[0];

  // Grade selection in drawer
  const [chosenGrade, setChosenGrade] = useState<EvaluationGrade>(
    (selectedEval?.approved_grade || selectedEval?.proposed_grade || 'B') as EvaluationGrade
  );
  const [unitFeedback, setUnitFeedback] = useState(
    selectedEval?.unit_comment || 'Cán bộ chủ động, hoàn thành tốt các nhiệm vụ được giao, tinh thần phối hợp tốt.'
  );

  const activePeriod =
    evaluationPeriods.find((p) => p.month_year === selectedMonth) || evaluationPeriods[0];

  // Candidates list
  const filteredCandidates = evaluations.filter((e) => {
    if (e.period_id !== activePeriod.id) return false;
    if (selectedUnitId !== 'all' && e.unit_id !== selectedUnitId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.profile_name.toLowerCase().includes(q);
      const matchMssv = e.student_id.toLowerCase().includes(q);
      if (!matchName && !matchMssv) return false;
    }
    return true;
  });

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
    alert(res.message);
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
    alert(res.message);
  };

  const handlePublish = () => {
    if (activePeriod.is_published) {
      const reason = prompt('Nhập căn cứ/lý do mở lại kỳ đánh giá đã khóa:') || 'Điều chỉnh theo kiến nghị của cán bộ';
      const res = reopenEvaluationPeriod(activePeriod.id, reason);
      alert(res.message);
    } else {
      const res = publishEvaluationPeriod(activePeriod.id);
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Quản lý đánh giá hằng tháng
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                activePeriod.is_published
                  ? 'bg-emerald-500/10 text-emerald-700'
                  : 'bg-rose-500/10 text-rose-700'
              }`}
            >
              {activePeriod.is_published ? 'Đã công bố' : 'Chưa công bố'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activePeriod.is_published
              ? 'Kết quả đã được công bố chính thức cho toàn bộ cán bộ Đoàn – Hội.'
              : 'Kết quả chưa hiển thị cho cán bộ cho đến khi Thường trực nhấn công bố.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month selector */}
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
            onClick={() => setAdminTab('cau_hinh')}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Settings className="h-4 w-4 text-primary" />
            <span>Cấu hình kỳ</span>
          </button>

          <button
            onClick={handlePublish}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer ${
              activePeriod.is_published
                ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {activePeriod.is_published ? (
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

      {/* 2. 4 STAT CARDS (MATCHING SCREEN 15 MOCKUP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đối tượng đánh giá</p>
            <p className="text-2xl font-black text-primary tracking-tight">{activePeriod.total_targets}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đã gửi đánh giá</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              {activePeriod.submitted_count}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Đã duyệt</p>
            <p className="text-2xl font-black text-primary tracking-tight">
              {activePeriod.approved_count}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Chưa gửi</p>
            <p className="text-2xl font-black text-rose-600 tracking-tight">
              {activePeriod.total_targets - activePeriod.submitted_count}
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (TABLE 7 COLS + DETAIL DRAWER 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CANDIDATES LIST TABLE */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Danh sách cán bộ ({activePeriod.total_targets})
              </h3>

              <div className="relative w-64">
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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                    <th className="py-2.5 px-2 w-10 text-center">STT</th>
                    <th className="py-2.5 px-2">Cán bộ</th>
                    <th className="py-2.5 px-2">Chức vụ</th>
                    <th className="py-2.5 px-2">Tự đánh giá</th>
                    <th className="py-2.5 px-2 text-center">Mức đề xuất</th>
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
                        onClick={() => setSelectedEvalId(cand.id)}
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
                          {cand.position_title}
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
                            {cand.proposed_grade || '—'}
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
                                alert(`Đã gửi thông báo nhắc hạn đánh giá tới ${cand.profile_name}.`);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-700 text-[11px] font-bold hover:bg-rose-50 cursor-pointer"
                            >
                              Nhắc hạn
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvalId(cand.id);
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

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Hiển thị 1 - {filteredCandidates.length} của {activePeriod.total_targets} cán bộ</span>
              <div className="flex items-center gap-1 font-bold">
                <span className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
                  1
                </span>
                <span className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center cursor-pointer">
                  2
                </span>
                <span className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center cursor-pointer">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL EVALUATION DRAWER (MATCHING SCREEN 15) */}
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
                    MSSV: {selectedEval.student_id} • {selectedEval.position_title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ngày gửi: {selectedEval.submitted_at || 'Chưa gửi'}
                  </p>
                </div>
              </div>

              {/* Bộ tiêu chí áp dụng */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-foreground">Bộ tiêu chí đã phê duyệt</strong>
                  <span className="text-[11px] text-muted-foreground">Áp dụng từ 01/10/2026</span>
                </div>
                <button
                  onClick={() => alert('Xem chi tiết các quy định tiêu chuẩn xếp loại A, B, C, D.')}
                  className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-bold"
                >
                  Xem chi tiết
                </button>
              </div>

              {/* Mức đánh giá đề xuất (Radio A, B, C, D) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block uppercase tracking-wider">
                  Mức đánh giá đề xuất
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
                <label className="text-xs font-bold text-foreground">Nhận xét của cán bộ (tự đánh giá)</label>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs text-foreground leading-relaxed">
                  {selectedEval.task_results ||
                    'Trong tháng 10, em đã tham gia đầy đủ các hoạt động theo phân công, hỗ trợ tổ chức thành công Chương trình Ngày hội Sinh viên...'}
                </div>
              </div>

              {/* Nhận xét của đơn vị (đề xuất) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Nhận xét của đơn vị (đề xuất)</label>
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
                  Trả lại
                </button>
                <button
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Duyệt đánh giá
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
    </div>
  );
}
