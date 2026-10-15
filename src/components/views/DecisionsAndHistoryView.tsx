'use client';

// ==============================================================================
// QUYẾT ĐỊNH VÀ LỊCH SỬ (DECISIONS & HISTORY VIEW - SCREEN 5 & 10 MOCKUPS)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Calendar,
  Download,
  Clock,
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PersonnelDecision } from '@/types';

export default function DecisionsAndHistoryView() {
  const {
    currentUser,
    profiles,
    allProfiles,
    decisions,
    units,
    allUnits,
    selectedDecisionId,
    setSelectedDecisionId,
  } = useApp();

  const directoryProfiles = allProfiles && allProfiles.length > 0 ? allProfiles : profiles;
  const directoryDecisions = decisions;
  const directoryUnits = allUnits && allUnits.length > 0 ? allUnits : units;

  const profile =
    directoryProfiles.find((p) => p.id === currentUser.profile_id) ||
    directoryProfiles.find((p) => p.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
    directoryProfiles.find(
      (p) => currentUser.student_id && p.student_id?.toLowerCase() === currentUser.student_id?.toLowerCase()
    ) ||
    directoryProfiles[0];

  const [activeTab, setActiveTab] = useState<'chuc_vu' | 'qua_trinh' | 'quyet_dinh'>('qua_trinh');
  const [unitFilter, setUnitFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [fromDate, setFromDate] = useState('2025-01-01');
  const [toDate, setToDate] = useState('2027-12-31');

  const filteredDecisions = directoryDecisions.filter((d) => {
    if (unitFilter !== 'all' && d.unit_id !== unitFilter && !d.changes?.some((c) => c.unit_id === unitFilter)) {
      return false;
    }
    if (termFilter !== 'all' && d.term && d.term !== termFilter) {
      return false;
    }
    return true;
  });

  // Find active decision for detail view
  const activeDecision =
    filteredDecisions.find((d) => d.id === selectedDecisionId) ||
    filteredDecisions[0] ||
    directoryDecisions[0];

  const handleDownload = (fileName?: string) => {
    alert(`Đang tải tệp quyết định đính kèm: ${fileName || 'Quyet_dinh.pdf'}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
          <span>Trang chủ</span>
          <span>&gt;</span>
          <span className="text-foreground">Quyết định và lịch sử</span>
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">Quyết định và lịch sử</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Theo dõi quá trình công tác, các quyết định và lịch sử tham gia Đoàn – Hội.
        </p>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        {[
          { id: 'chuc_vu', label: 'Chức vụ hiện tại' },
          { id: 'qua_trinh', label: 'Quá trình công tác' },
          { id: 'quyet_dinh', label: 'Quyết định' },
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

      {/* 3. FILTER BAR */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold text-foreground">Đơn vị</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Tất cả đơn vị</option>
              {directoryUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-foreground">Nhiệm kỳ</label>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Tất cả nhiệm kỳ</option>
              <option value="2026 - 2027">2026 - 2027</option>
              <option value="2025 - 2027">2025 - 2027</option>
              <option value="2025 - 2026">2025 - 2026</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-foreground">Từ ngày</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground pr-8"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-foreground">Đến ngày</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground pr-8"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <button className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer">
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN SECTION (TIMELINE/TABLE 2/3 & DECISION DETAIL 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TIMELINE & DECISIONS TABLE */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Dòng thời gian quá trình công tác */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Dòng thời gian quá trình công tác
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/30">
              {profile.roles.map((role, idx) => (
                <div key={role.id} className="relative space-y-1">
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background shadow-xs" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">{role.start_date}</span>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                      {idx === 0 ? 'Bổ nhiệm' : 'Kiện toàn'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <h4 className="text-sm font-bold text-foreground">{role.position_title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{role.unit_name}</p>
                    <p className="text-[11px] text-muted-foreground">Nhiệm kỳ: {role.term}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Danh sách quyết định */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Danh sách quyết định ({filteredDecisions.length})
              </h3>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded">
                Đồng bộ trực tuyến
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-3">Số quyết định</th>
                    <th className="py-3 px-3">Nội dung</th>
                    <th className="py-3 px-3">Ngày ban hành ↓</th>
                    <th className="py-3 px-3">Hiệu lực</th>
                    <th className="py-3 px-3 text-center">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Tệp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDecisions.map((dec) => {
                    const isSelected = activeDecision?.id === dec.id;
                    return (
                      <tr
                        key={dec.id}
                        onClick={() => setSelectedDecisionId(dec.id)}
                        className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-foreground">
                          {dec.decision_number}
                        </td>
                        <td className="py-3 px-3 text-foreground">{dec.title}</td>
                        <td className="py-3 px-3 text-muted-foreground">{dec.issue_date}</td>
                        <td className="py-3 px-3 text-muted-foreground">{dec.effective_date}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                            Đang hiệu lực
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(dec.file_name);
                            }}
                            className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHI TIẾT QUYẾT ĐỊNH (MATCHING SCREEN 5 MOCKUP) */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Chi tiết quyết định
              </h3>
            </div>

            {activeDecision ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">Số quyết định</span>
                      <strong className="text-sm font-black text-foreground">
                        {activeDecision.decision_number}
                      </strong>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                    Đang hiệu lực
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Nội dung:</span>
                    <strong className="text-foreground text-right max-w-[60%]">
                      {activeDecision.title}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Đơn vị:</span>
                    <span className="text-foreground font-semibold">
                      {activeDecision.unit_name || 'CLB Truyền thông'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Nhiệm kỳ:</span>
                    <span className="text-foreground font-semibold">{activeDecision.term || '2026 - 2027'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Cơ quan ban hành:</span>
                    <span className="text-foreground font-semibold">{activeDecision.issuing_authority}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Ngày ban hành:</span>
                    <span className="text-foreground">{activeDecision.issue_date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Hiệu lực từ:</span>
                    <span className="text-foreground font-bold">{activeDecision.effective_date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Người ký:</span>
                    <span className="text-foreground">{activeDecision.signer_name}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-muted-foreground block mb-0.5">Ghi chú:</span>
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {activeDecision.notes || 'Kiện toàn nhân sự Ban chủ nhiệm nhiệm kỳ 2026 - 2027.'}
                    </p>
                  </div>
                </div>

                {/* Tệp đính kèm */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold text-foreground block">Tệp đính kèm</span>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-rose-600" />
                      <div>
                        <p className="font-bold text-foreground truncate max-w-[160px]">
                          {activeDecision.file_name || `${activeDecision.decision_number.replace('/', '_')}.pdf`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          PDF • {activeDecision.file_size || '320 KB'} • {activeDecision.issue_date}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(activeDecision.file_name)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDownload(activeDecision.file_name)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Tải quyết định</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                Chọn một quyết định để xem chi tiết
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
