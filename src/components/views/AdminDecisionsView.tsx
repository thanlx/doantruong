'use client';

// ==============================================================================
// QUYẾT ĐỊNH NHÂN SỰ (ADMIN DECISIONS VIEW - SCREEN 13 MOCKUP)
// Hỗ trợ bổ nhiệm, thay thế nhân sự có hiệu lực tương lai, kiểm tra xung đột chồng lấn!
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Info,
  Clock,
  ArrowRight,
  Plus,
  Send,
  Save,
  Eye,
  AlertTriangle,
  X,
  FileCheck,
} from 'lucide-react';
import { DecisionType } from '@/types';

export default function AdminDecisionsView() {
  const {
    decisions,
    profiles,
    units,
    createDecision,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'danh_sach' | 'tao_quyet_dinh' | 'lich_su'>('tao_quyet_dinh');

  // Decision Form fields matching Screen 13
  const [decisionNumber, setDecisionNumber] = useState('156-QĐ/HSV');
  const [decisionType, setDecisionType] = useState<DecisionType>('thay_the');
  const [issueDate, setIssueDate] = useState('2026-10-13');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-01'); // Future effective date!
  const [issuingAuthority, setIssuingAuthority] = useState('Hội Sinh viên trường');
  const [targetUnitId, setTargetUnitId] = useState('unit_clb_truyen_thong');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Chủ nhiệm');
  const [replacesProfileId, setReplacesProfileId] = useState('prof_hoang_nam');
  const [newProfileId, setNewProfileId] = useState('prof_thu_ha');
  const [notes, setNotes] = useState('Thay thế nhân sự Ban chủ nhiệm CLB Truyền thông.');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Entities
  const currentOfficer = profiles.find((p) => p.id === replacesProfileId) || profiles[1];
  const newOfficer = profiles.find((p) => p.id === newProfileId) || profiles[2];
  const targetUnit = units.find((u) => u.id === targetUnitId) || units[6];

  const handleCreateDecision = () => {
    const res = createDecision({
      decision_number: decisionNumber,
      decision_type: decisionType,
      title: `${
        decisionType === 'thay_the' ? 'Thay thế nhân sự' : 'Bổ nhiệm cán bộ'
      } ${targetRoleTitle} ${targetUnit.name}`,
      issue_date: issueDate,
      effective_date: effectiveDate,
      issuing_authority: issuingAuthority,
      signer_name: currentUser.full_name,
      signer_title: 'Chủ tịch Hội Sinh viên trường',
      unit_id: targetUnit.id,
      unit_name: targetUnit.name,
      term: '2026 - 2027',
      file_name: 'Quyet_dinh_156.pdf',
      file_size: '2.1 MB',
      status: 'approved',
      notes,
      changes: [
        {
          id: 'c_' + Date.now(),
          change_type: decisionType,
          profile_id: newOfficer.id,
          profile_name: newOfficer.full_name,
          student_id: newOfficer.student_id,
          unit_id: targetUnit.id,
          unit_name: targetUnit.name,
          position_title: targetRoleTitle,
          start_date: effectiveDate,
          replaces_profile_id: decisionType === 'thay_the' ? currentOfficer.id : undefined,
          replaces_profile_name: decisionType === 'thay_the' ? currentOfficer.full_name : undefined,
          replaces_student_id: decisionType === 'thay_the' ? currentOfficer.student_id : undefined,
        },
      ],
    });

    if (res.success) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 6000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & TABS */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Quyết định nhân sự</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý các quyết định bổ nhiệm, thay thế và kiểm soát khoảng thời gian hiệu lực
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-border">
        {[
          { id: 'danh_sach', label: 'Danh sách' },
          { id: 'tao_quyet_dinh', label: 'Tạo quyết định' },
          { id: 'lich_su', label: 'Lịch sử' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. TAB 1: DANH SÁCH QUYẾT ĐỊNH */}
      {activeTab === 'danh_sach' && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                  <th className="py-3 px-3">Số quyết định</th>
                  <th className="py-3 px-3">Loại quyết định</th>
                  <th className="py-3 px-3">Nội dung</th>
                  <th className="py-3 px-3">Ngày ban hành</th>
                  <th className="py-3 px-3">Hiệu lực</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {decisions.map((dec) => (
                  <tr key={dec.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-foreground">{dec.decision_number}</td>
                    <td className="py-3 px-3 text-muted-foreground capitalize">
                      {dec.decision_type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{dec.title}</td>
                    <td className="py-3 px-3 text-muted-foreground">{dec.issue_date}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">{dec.effective_date}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                        {dec.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB 2: TẠO QUYẾT ĐỊNH (MATCHING SCREEN 13 MOCKUP) */}
      {activeTab === 'tao_quyet_dinh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: FORM CARDS */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD 1: THÔNG TIN QUYẾT ĐỊNH */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Thông tin quyết định
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Số quyết định *</label>
                  <input
                    type="text"
                    value={decisionNumber}
                    onChange={(e) => setDecisionNumber(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Loại quyết định *</label>
                  <select
                    value={decisionType}
                    onChange={(e) => setDecisionType(e.target.value as any)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="thay_the">Thay thế nhân sự</option>
                    <option value="bo_nhiem">Bổ nhiệm nhân sự</option>
                    <option value="mien_nhiem">Miễn nhiệm</option>
                    <option value="kien_toan">Kiện toàn nhân sự</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Ngày ban hành *</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground pr-8"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Ngày hiệu lực *</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full rounded-xl border border-primary bg-background px-3.5 py-2 text-xs font-bold text-foreground pr-8"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Cơ quan ban hành *</label>
                  <select
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="Hội Sinh viên trường">Hội Sinh viên trường</option>
                    <option value="Đoàn trường">Đoàn trường</option>
                    <option value="Đoàn cơ sở">Đoàn cơ sở</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Đơn vị áp dụng *</label>
                  <select
                    value={targetUnitId}
                    onChange={(e) => setTargetUnitId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tệp quyết định */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-foreground block">Tệp quyết định (PDF) *</label>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-rose-600" />
                    <div>
                      <strong className="text-foreground">Quyet_dinh_156.pdf</strong>
                      <span className="text-[10px] text-muted-foreground ml-2">2.1 MB</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: NHÂN SỰ TRƯỚC VÀ SAU THAY ĐỔI (MATCHING SCREEN 13) */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Nhân sự trước và sau thay đổi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Hiện tại */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                    Hiện tại
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 font-bold text-xs">
                      TN
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{currentOfficer.full_name}</h4>
                      <p className="text-[10px] text-muted-foreground">MSSV: {currentOfficer.student_id}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-border/60 text-muted-foreground">
                    <p>
                      Chức vụ: <strong className="text-foreground">{targetRoleTitle}</strong>
                    </p>
                    <p>
                      Đơn vị: <strong className="text-foreground">{targetUnit.name}</strong>
                    </p>
                    <p className="text-[11px]">Thời gian hiệu lực: Từ 01/09/2026 đến 31/10/2026</p>
                  </div>
                </div>

                {/* Sau thay đổi */}
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                    Sau thay đổi
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      LH
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{newOfficer.full_name}</h4>
                      <p className="text-[10px] text-muted-foreground">MSSV: {newOfficer.student_id}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-border/60 text-muted-foreground">
                    <p>
                      Chức vụ: <strong className="text-foreground">{targetRoleTitle}</strong>
                    </p>
                    <p>
                      Đơn vị: <strong className="text-foreground">{targetUnit.name}</strong>
                    </p>
                    <p className="text-[11px] font-bold text-primary">
                      Thời gian hiệu lực: Từ {effectiveDate} đến hiện tại
                    </p>
                  </div>
                </div>
              </div>

              {/* Callout Notice: Section 7 & Section 11 Scenario 4! */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">
                    Danh sách hiện tại chỉ đổi từ ngày {effectiveDate}.
                  </strong>
                  <span>
                    Trước thời điểm này, đồng chí {currentOfficer.full_name} vẫn được hiển thị trong danh
                    sách với chức vụ {targetRoleTitle}.
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: KẾT QUẢ KIỂM TRA TRƯỚC KHI GỬI DUYỆT */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Kết quả kiểm tra trước khi gửi duyệt
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="font-bold text-emerald-800 dark:text-emerald-300 block">
                      Không có xung đột chức vụ
                    </strong>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
                      Nhân sự mới không trùng chức vụ trong cùng đơn vị tại thời điểm {effectiveDate}.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-start gap-2.5">
                  <FileCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="font-bold text-foreground block">Lịch sử được bảo toàn</strong>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Quá trình công tác của nhân sự cũ và mới sẽ được lưu đầy đủ trong cơ sở dữ liệu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => alert('Đã lưu nháp quyết định nhân sự.')}
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Lưu nháp
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Mở bản xem trước so sánh danh sách nhân sự trước và sau.')}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Xem trước
                </button>
                <button
                  onClick={handleCreateDecision}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi duyệt & Ban hành</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: STATUS STEPPER & SUMMARY (MATCHING SCREEN 13) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card: Trạng thái */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Trạng thái</h3>

              <div className="space-y-4 pl-4 border-l-2 border-primary/30 relative">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                  <p className="text-xs font-bold text-primary">Nháp</p>
                  <p className="text-[10px] text-muted-foreground">Tạo lúc 13/10/2026 10:15</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-border bg-card" />
                  <p className="text-xs font-semibold text-muted-foreground">Chờ duyệt</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-border bg-card" />
                  <p className="text-xs font-semibold text-muted-foreground">Đã duyệt</p>
                </div>
              </div>
            </div>

            {/* Card: Thông tin chung */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">
                Thông tin chung
              </h3>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Số quyết định:</span>
                <strong className="font-mono text-foreground">{decisionNumber}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Loại quyết định:</span>
                <span className="font-semibold text-foreground">Thay thế nhân sự</span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Ngày ban hành:</span>
                <span className="text-foreground">{issueDate}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Ngày hiệu lực:</span>
                <strong className="text-primary font-bold">{effectiveDate}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Cơ quan ban hành:</span>
                <span className="text-foreground">{issuingAuthority}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Đơn vị áp dụng:</span>
                <span className="text-foreground font-semibold">{targetUnit.name}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Người chịu trách nhiệm:</span>
                <span className="text-foreground">Hội Sinh viên trường</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
