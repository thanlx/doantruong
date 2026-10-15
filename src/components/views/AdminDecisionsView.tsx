'use client';

// ==============================================================================
// QUYẾT ĐỊNH NHÂN SỰ (ADMIN DECISIONS VIEW - FULL CRUD & INTERACTIVE SELECTORS)
// Hỗ trợ bổ nhiệm, thay thế nhân sự có hiệu lực tương lai, đính kèm file PDF và lịch sử!
// ==============================================================================

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Info,
  Send,
  X,
  FileCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { DecisionType } from '@/types';

export default function AdminDecisionsView() {
  const {
    decisions,
    profiles,
    units,
    createDecision,
    deleteDecision,
    currentUser,
  } = useApp();

  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'danh_sach' | 'tao_quyet_dinh' | 'lich_su'>('tao_quyet_dinh');

  // Decision Form fields
  const [decisionNumber, setDecisionNumber] = useState('156-QĐ/ĐTN');
  const [decisionType, setDecisionType] = useState<DecisionType>('bo_nhiem');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuingAuthority, setIssuingAuthority] = useState('Đoàn trường');
  const [targetUnitId, setTargetUnitId] = useState(units[0]?.id || 'unit_doan_truong');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Ủy viên BCH');
  const [replacesProfileId, setReplacesProfileId] = useState(profiles[0]?.id || '');
  const [newProfileId, setNewProfileId] = useState(profiles[0]?.id || '');
  const [fileName, setFileName] = useState('Quyet_dinh_nhan_su.pdf');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [notes, setNotes] = useState('Bổ nhiệm / Kiện toàn nhân sự cán bộ Đoàn - Hội.');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Safe Entities (Never undefined even when profiles has 1 item)
  const fallbackOfficer = profiles[0] || {
    id: 'prof_thanlx',
    full_name: 'Lê Xuân Thân',
    student_id: 'CB-HCMUTE',
  };
  const currentOfficer = profiles.find((p) => p.id === replacesProfileId) || fallbackOfficer;
  const newOfficer = profiles.find((p) => p.id === newProfileId) || fallbackOfficer;
  const targetUnit = units.find((u) => u.id === targetUnitId) || units[0] || {
    id: 'unit_doan_truong',
    name: 'Đoàn trường',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
  };

  const handleCreateDecision = () => {
    if (!decisionNumber.trim() || !targetRoleTitle.trim()) {
      alert('Vui lòng nhập Số quyết định và Chức danh áp dụng.');
      return;
    }

    const typeLabels: Record<DecisionType, string> = {
      bo_nhiem: 'Bổ nhiệm cán bộ',
      thay_the: 'Thay thế nhân sự',
      mien_nhiem: 'Miễn nhiệm cán bộ',
      kien_toan: 'Kiện toàn nhân sự',
    };

    const res = createDecision({
      decision_number: decisionNumber.trim(),
      decision_type: decisionType,
      title: `${typeLabels[decisionType]} ${targetRoleTitle} - ${targetUnit.name}`,
      issue_date: issueDate,
      effective_date: effectiveDate,
      issuing_authority: issuingAuthority,
      signer_name: currentUser.full_name,
      signer_title: 'Bí thư Đoàn trường',
      unit_id: targetUnit.id,
      unit_name: targetUnit.name,
      term: '2025 - 2027',
      file_name: fileName,
      file_size: fileSize,
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

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quyết định nhân sự này?')) return;
    const res = deleteDecision(id);
    if (res.success) {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Quyết định nhân sự</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ban hành quyết định bổ nhiệm, kiện toàn, thay thế cán bộ và đồng bộ chức vụ tự động theo ngày hiệu lực
          </p>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
          Tổng số quyết định đã ban hành: {decisions.length}
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-border">
        {[
          { id: 'tao_quyet_dinh', label: 'Tạo & Ban hành quyết định' },
          { id: 'danh_sach', label: `Danh sách quyết định (${decisions.length})` },
          { id: 'lich_su', label: 'Lịch sử biến động nhân sự' },
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
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. TAB: DANH SÁCH QUYẾT ĐỊNH */}
      {activeTab === 'danh_sach' && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {decisions.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs font-bold text-foreground">Chưa có quyết định nhân sự nào được ban hành</p>
              <p className="text-[11px] text-muted-foreground">
                Chuyển sang tab "Tạo & Ban hành quyết định" để thêm quyết định mới.
              </p>
            </div>
          ) : (
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
                    <th className="py-3 px-3 text-right">Thao tác</th>
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
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDelete(dec.id)}
                          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Xóa quyết định"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: LỊCH SỬ BIẾN ĐỘNG NHÂN SỰ */}
      {activeTab === 'lich_su' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Chi tiết các dòng biến động nhân sự theo Quyết định
          </h3>
          {decisions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Chưa có lịch sử biến động nhân sự nào.
            </p>
          ) : (
            <div className="space-y-3">
              {decisions.map((dec) => (
                <div key={dec.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-foreground">
                      {dec.decision_number} — {dec.title}
                    </span>
                    <span className="text-[11px] text-primary font-bold">
                      Hiệu lực: {dec.effective_date}
                    </span>
                  </div>
                  {dec.changes.map((ch) => (
                    <div key={ch.id} className="pl-3 border-l-2 border-primary/40 text-muted-foreground">
                      <p>
                        • Cán bộ: <b className="text-foreground">{ch.profile_name}</b> ({ch.student_id}) — Chức vụ:{' '}
                        <b className="text-foreground">{ch.position_title}</b> tại <b>{ch.unit_name}</b>
                        {ch.replaces_profile_name ? ` (Thay thế đồng chí ${ch.replaces_profile_name})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: TẠO QUYẾT ĐỊNH */}
      {activeTab === 'tao_quyet_dinh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                    <option value="bo_nhiem">Bổ nhiệm nhân sự</option>
                    <option value="thay_the">Thay thế nhân sự</option>
                    <option value="kien_toan">Kiện toàn nhân sự</option>
                    <option value="mien_nhiem">Miễn nhiệm</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Ngày ban hành *</label>
                  <div className="relative mt-1.5">
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Ngày hiệu lực *</label>
                  <div className="relative mt-1.5">
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full rounded-xl border border-primary bg-background px-3.5 py-2 text-xs font-bold text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Cơ quan ban hành *</label>
                  <select
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
                  >
                    <option value="Đoàn trường">Đoàn trường</option>
                    <option value="Hội Sinh viên trường">Hội Sinh viên trường</option>
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

              <div>
                <label className="text-xs font-bold text-foreground">Chức danh áp dụng *</label>
                <input
                  type="text"
                  value={targetRoleTitle}
                  onChange={(e) => setTargetRoleTitle(e.target.value)}
                  placeholder="VD: Bí thư, Phó Bí thư, Chủ nhiệm CLB, Ủy viên BCH..."
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground"
                />
              </div>

              {/* Tệp quyết định */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-foreground block">Tệp quyết định đính kèm (PDF/DOCX)</label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-rose-600" />
                    <div>
                      <strong className="text-foreground">{fileName}</strong>
                      <span className="text-[10px] text-muted-foreground ml-2">{fileSize}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-[11px] hover:bg-primary/20 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Chọn tệp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: CHỌN NHÂN SỰ BỔ NHIỆM / THAY THẾ */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Nhân sự áp dụng trong quyết định
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {decisionType === 'thay_the' && (
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                      Nhân sự hiện tại (Thôi giữ chức vụ)
                    </span>
                    <div>
                      <label className="text-[11px] font-bold text-foreground block mb-1">
                        Chọn cán bộ bị thay thế:
                      </label>
                      <select
                        value={replacesProfileId}
                        onChange={(e) => setReplacesProfileId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-2 text-xs font-semibold"
                      >
                        {profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} ({p.student_id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-xs space-y-1 pt-2 border-t border-border/60 text-muted-foreground">
                      <p>
                        Họ tên: <strong className="text-foreground">{currentOfficer.full_name}</strong>
                      </p>
                      <p>
                        MSSV/Mã CB: <strong className="text-foreground">{currentOfficer.student_id}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Nhân sự mới được bổ nhiệm / thay thế */}
                <div
                  className={`p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5 ${
                    decisionType !== 'thay_the' ? 'md:col-span-2' : ''
                  }`}
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                    Nhân sự được bổ nhiệm / kiện toàn mới
                  </span>
                  <div>
                    <label className="text-[11px] font-bold text-foreground block mb-1">
                      Chọn cán bộ nhận quyết định:
                    </label>
                    <select
                      value={newProfileId}
                      onChange={(e) => setNewProfileId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background p-2 text-xs font-semibold"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.student_id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-border/60 text-muted-foreground">
                    <p>
                      Chức vụ: <strong className="text-foreground">{targetRoleTitle}</strong>
                    </p>
                    <p>
                      Đơn vị: <strong className="text-foreground">{targetUnit.name}</strong>
                    </p>
                    <p className="text-[11px] font-bold text-primary">
                      Thời gian hiệu lực: Từ {effectiveDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">
                    Hiệu lực áp dụng từ ngày {effectiveDate}.
                  </strong>
                  <span>
                    Khi ban hành, chức vụ <b>{targetRoleTitle}</b> tại <b>{targetUnit.name}</b> sẽ được tự động gắn vào hồ sơ của đồng chí <b>{newOfficer.full_name}</b>.
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCreateDecision}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ký duyệt & Ban hành Quyết định</span>
              </button>
            </div>
          </div>

          {/* RIGHT 4 COLS: SUMMARY */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">
                Tóm tắt Quyết định chuẩn bị ban hành
              </h3>

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Số quyết định:</span>
                <strong className="font-mono text-foreground">{decisionNumber}</strong>
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

              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Cán bộ được bổ nhiệm:</span>
                <span className="text-foreground font-bold">{newOfficer.full_name}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Người ký:</span>
                <span className="text-foreground font-semibold">{currentUser.full_name}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
