'use client';

// ==============================================================================
// ĐÁNH GIÁ CỦA TÔI (MY EVALUATION VIEW - SCREEN 2 MOCKUP)
// Hỗ trợ chọn chức vụ (kiêm nhiệm), quy trình 4 bước, tự đánh giá, đính kèm minh chứng,
// và xem kết quả xếp loại sau khi được công bố theo Mục 8 Đặc tả!
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Clock,
  Info,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  ChevronRight,
  Send,
  Save,
  AlertCircle,
} from 'lucide-react';
import { MonthlyEvaluation } from '@/types';

export default function MyEvaluationView() {
  const {
    currentUser,
    profiles,
    evaluationPeriods,
    evaluations,
    submitSelfEvaluation,
  } = useApp();

  const profile = profiles.find((p) => p.id === currentUser.profile_id) || profiles[0];

  // Month period selection
  const [selectedMonth, setSelectedMonth] = useState('10/2026');

  // Selected role for evaluation (Kiêm nhiệm support!)
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    profile.roles[0]?.id || 'role_ma_1'
  );

  const selectedRole = profile.roles.find((r) => r.id === selectedRoleId) || profile.roles[0];

  // Find or create current evaluation record
  const currentPeriod = evaluationPeriods.find((p) => p.month_year === selectedMonth) || evaluationPeriods[0];
  const userEval = evaluations.find(
    (e) =>
      e.profile_id === profile.id &&
      e.period_id === currentPeriod.id &&
      (e.role_assignment_id === selectedRoleId || !e.role_assignment_id)
  );

  // Form states
  const [taskResults, setTaskResults] = useState(
    userEval?.task_results ||
      'Trong tháng 10, em đã tham gia đầy đủ các hoạt động theo phân công, hỗ trợ tổ chức thành công Chương trình Ngày hội Sinh viên, đồng thời tham gia công tác truyền thông, hậu cần cho các sự kiện của Đoàn cơ sở. ...'
  );
  const [limitations, setLimitations] = useState(
    userEval?.limitations_mitigation ||
      'Một số nhiệm vụ triển khai còn chậm so với kế hoạch do trùng lịch học. Trong thời gian tới, em sẽ chủ động sắp xếp thời gian, trao đổi sớm với đồng đội để đảm bảo tiến độ công việc. ...'
  );
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; size: string }[]>(
    userEval?.evidence_files || [{ name: 'Bao_cao_thang_10.pdf', size: '1.2 MB' }]
  );

  const [feedback, setFeedback] = useState<string | null>(null);

  // Step calculation (1: Tự đánh giá, 2: Đơn vị đánh giá, 3: Phê duyệt, 4: Công bố)
  const currentStep =
    !userEval || userEval.status === 'not_submitted'
      ? 1
      : userEval.status === 'submitted'
      ? 2
      : userEval.status === 'approved' && !currentPeriod.is_published
      ? 3
      : 4;

  const handleSubmit = () => {
    const evalId = userEval?.id || 'eval_' + Date.now();
    const res = submitSelfEvaluation(evalId, taskResults, limitations, evidenceFiles);
    if (res.success) {
      setFeedback('Đã nộp bài tự đánh giá thành công! Kết quả đang chờ đơn vị và Thường trực xem xét.');
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added = Array.from(files).map((f) => ({
      name: f.name,
      size: `${Math.max(0.1, Number((f.size / (1024 * 1024)).toFixed(2)))} MB`,
    }));
    setEvidenceFiles((prev) => [...prev, ...added]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Published past results (Tháng 9)
  const publishedEvals = evaluations.filter(
    (e) =>
      e.profile_id === profile.id &&
      evaluationPeriods.find((p) => p.id === e.period_id)?.is_published
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & MONTH SELECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-semibold">
            Xin chào, <strong className="text-foreground">{profile.full_name}</strong> | MSSV:{' '}
            {profile.student_id} | Sinh viên
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">Đánh giá của tôi</h1>
        </div>

        {/* Month selector dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-2xs">
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
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. CHOOSE ROLE FOR THIS MONTH (KIÊM NHIỆM SUPPORT - MỤC 8) */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Chọn chức vụ cần đánh giá trong tháng này
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.roles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            return (
              <label
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-xs'
                    : 'border-border bg-background text-foreground hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  checked={isSelected}
                  onChange={() => setSelectedRoleId(role.id)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold block">{role.position_title}</span>
                  <span className="text-[11px] text-muted-foreground">{role.unit_name}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (FORM ON LEFT + STATUS ON RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: EVALUATION FORM (4 STEPS) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-foreground">
                    Tự đánh giá {currentPeriod.month_year.replace('/', ' năm ')}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    {currentPeriod.status === 'open' ? 'Đang mở' : 'Đã khóa'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chức vụ: <strong className="text-foreground">{selectedRole?.position_title}</strong> (
                  {selectedRole?.unit_name})
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold shrink-0">
                <Clock className="h-4 w-4" />
                <span>Hạn nộp: {currentPeriod.self_evaluation_deadline}</span>
              </div>
            </div>

            {/* Stepper (1 -> 2 -> 3 -> 4) */}
            <div className="grid grid-cols-4 gap-2 pt-1 pb-4 border-b border-border text-center">
              {[
                { step: 1, title: 'Tự đánh giá' },
                { step: 2, title: 'Đơn vị đánh giá' },
                { step: 3, title: 'Phê duyệt' },
                { step: 4, title: 'Công bố' },
              ].map((s) => {
                const isDone = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div key={s.step} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-xs ring-4 ring-primary/20'
                          : isDone
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.step}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Form field 1: Kết quả thực hiện nhiệm vụ */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Kết quả thực hiện nhiệm vụ *</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  {taskResults.length}/2000
                </span>
              </label>
              <textarea
                rows={4}
                value={taskResults}
                onChange={(e) => setTaskResults(e.target.value)}
                placeholder="Mô tả cụ thể các nhiệm vụ, hoạt động, sự kiện và kết quả đạt được trong tháng..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Form field 2: Hạn chế và hướng khắc phục */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Hạn chế và hướng khắc phục *</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  {limitations.length}/2000
                </span>
              </label>
              <textarea
                rows={3}
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                placeholder="Nêu rõ các mặt còn hạn chế, khó khăn khách quan/chủ quan và hướng khắc phục trong tháng tiếp theo..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden leading-relaxed"
              />
            </div>

            {/* Form field 3: Minh chứng (File attachments) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Minh chứng
              </label>
              <p className="text-[11px] text-muted-foreground">
                Đính kèm các tài liệu, hình ảnh, báo cáo liên quan (tối đa 10 tệp, mỗi tệp 10MB).
              </p>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 p-6 text-center cursor-pointer transition-colors space-y-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Kéo thả tệp vào đây hoặc <span className="text-primary font-bold underline">chọn tệp từ máy tính</span>
                </p>
              </div>

              {/* Uploaded files list */}
              {evidenceFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-rose-600" />
                    <div>
                      <span className="font-bold text-foreground">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{file.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => alert('Đã lưu nháp bài tự đánh giá.')}
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Lưu nháp
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi tự đánh giá</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATUS CARDS & PUBLISHED HISTORY */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Trạng thái kỳ đánh giá */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Trạng thái kỳ đánh giá
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  userEval?.status === 'submitted'
                    ? 'bg-blue-500/10 text-primary'
                    : 'bg-rose-500/10 text-rose-700'
                }`}
              >
                {userEval?.status === 'submitted' ? 'Đã gửi' : 'Chưa gửi'}
              </span>
            </div>

            {/* Alert box 1: Deadline reminder */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
              <Clock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-rose-900 dark:text-rose-300">
                  {userEval?.status === 'submitted'
                    ? 'Đã nộp bài tự đánh giá.'
                    : 'Bạn chưa gửi bài tự đánh giá.'}
                </p>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-400 mt-0.5">
                  Vui lòng hoàn thành và gửi trước ngày {currentPeriod.self_evaluation_deadline}.
                </p>
              </div>
            </div>

            {/* Alert box 2: Published grade notice (Mục 8 & Tình huống 9) */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-blue-900 dark:text-blue-300">Kết quả xếp loại</p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-400 mt-0.5 leading-relaxed">
                  {currentPeriod.is_published && userEval?.approved_grade ? (
                    <span>
                      Mức xếp loại chính thức: <strong className="font-bold">{userEval.approved_grade}</strong>
                    </span>
                  ) : (
                    <span>
                      Kết quả xếp loại hiển thị sau khi công bố. Hiện tại, bạn chưa có kết quả cho tháng 10 năm
                      2026.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Kết quả đã công bố */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Kết quả đã công bố</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 px-2">Tháng</th>
                    <th className="py-2.5 px-2">Chức vụ</th>
                    <th className="py-2.5 px-2 text-center">Kết quả</th>
                    <th className="py-2.5 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {publishedEvals.map((pe) => (
                    <tr key={pe.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-2 font-medium text-foreground whitespace-nowrap">
                        Tháng {pe.month_year.replace('/', ' năm ')}
                      </td>
                      <td className="py-3 px-2 font-medium text-foreground text-[11px]">
                        {pe.position_title}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black text-xs">
                          {pe.approved_grade || 'B'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() =>
                            alert(
                              `Nhận xét của đơn vị: "${
                                pe.unit_comment || 'Hoàn thành tốt nhiệm vụ được giao'
                              }"`
                            )
                          }
                          className="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-0.5 cursor-pointer"
                        >
                          <span>Xem nhận xét</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-muted-foreground italic text-right">Dữ liệu minh họa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
