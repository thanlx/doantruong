'use client';

// ==============================================================================
// DUYỆT YÊU CẦU CẬP NHẬT HỒ SƠ (ADMIN APPROVAL VIEW - SCREEN 12 MOCKUP)
// Hỗ trợ kiểm tra Diff trước/sau, ngăn chặn tự duyệt (Mục 3), duyệt hoặc trả lại có lý do
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  FileText,
  User,
} from 'lucide-react';
import { ProfileUpdateRequest } from '@/types';

export default function AdminApprovalView() {
  const {
    updateRequests,
    selectedRequestId,
    setSelectedRequestId,
    approveProfileUpdateRequest,
    returnProfileUpdateRequest,
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewerComment, setReviewerComment] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = updateRequests.filter((r) => {
    if (filterTab === 'pending' && r.status !== 'pending') return false;
    if (filterTab === 'approved' && r.status !== 'approved') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchName = r.profile_name.toLowerCase().includes(q);
      const matchMssv = r.student_id.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchMssv) return false;
    }
    return true;
  });

  const activeRequest =
    updateRequests.find((r) => r.id === selectedRequestId) ||
    filteredRequests[0] ||
    updateRequests[0];

  const handleApprove = () => {
    if (!activeRequest) return;
    const res = approveProfileUpdateRequest(activeRequest.id, reviewerComment);
    if (res.success) {
      setActionFeedback(res.message);
      setReviewerComment('');
      setTimeout(() => setActionFeedback(null), 5000);
    } else {
      alert(res.message);
    }
  };

  const handleReturn = () => {
    if (!activeRequest) return;
    if (!reviewerComment.trim()) {
      alert('Vui lòng nhập lý do trả lại vào ô "Ý kiến xử lý" để cán bộ nắm rõ và điều chỉnh.');
      return;
    }
    const res = returnProfileUpdateRequest(activeRequest.id, reviewerComment);
    if (res.success) {
      setActionFeedback(res.message);
      setReviewerComment('');
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Duyệt yêu cầu cập nhật hồ sơ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xem xét các nội dung điều chỉnh thông tin cá nhân, chuyên môn và liên hệ trước khi cập nhật chính thức
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="bg-muted px-2.5 py-1 rounded-lg font-semibold">Dữ liệu minh họa</span>
          <span>Hôm nay: 13/10/2026</span>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN SECTION (LIST 4 COLS + DETAIL 8 COLS - MATCHING SCREEN 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: DANH SÁCH YÊU CẦU */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Danh sách yêu cầu ({updateRequests.length})
              </h3>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo mã, họ tên hoặc MSSV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 border-b border-border pb-1">
              {[
                { id: 'all', label: `Tất cả (${updateRequests.length})` },
                {
                  id: 'pending',
                  label: `Chờ duyệt (${updateRequests.filter((r) => r.status === 'pending').length})`,
                },
                {
                  id: 'approved',
                  label: `Đã duyệt (${updateRequests.filter((r) => r.status === 'approved').length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Requests List */}
            <div className="space-y-2.5">
              {filteredRequests.map((req) => {
                const isSelected = activeRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-border bg-background hover:bg-muted/40 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-foreground">{req.id}</span>
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
                    </div>

                    <h4 className="text-xs font-bold text-foreground mt-1">{req.profile_name}</h4>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                      <span>MSSV {req.student_id}</span>
                      <span>{req.created_at.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REQUEST DETAIL & DIFF COMPARISON (MATCHING SCREEN 12) */}
        <div className="lg:col-span-8">
          {activeRequest ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-foreground font-mono">{activeRequest.id}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeRequest.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : activeRequest.status === 'returned'
                          ? 'bg-rose-500/10 text-rose-700'
                          : 'bg-amber-500/10 text-amber-700'
                      }`}
                    >
                      {activeRequest.status === 'approved'
                        ? 'Đã duyệt'
                        : activeRequest.status === 'returned'
                        ? 'Đã trả lại'
                        : 'Chờ duyệt'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{activeRequest.profile_name}</h3>
                  <p className="text-xs text-muted-foreground">MSSV {activeRequest.student_id}</p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <p className="text-muted-foreground">
                    Ngày gửi yêu cầu: <strong className="text-foreground">{activeRequest.created_at}</strong>
                  </p>
                  <p className="flex items-center justify-end gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Phiên bản hồ sơ đã kiểm tra: {activeRequest.version}</span>
                  </p>
                </div>
              </div>

              {/* SECTION: NỘI DUNG ĐỀ NGHỊ CẬP NHẬT (TABLE DIFF) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Nội dung đề nghị cập nhật</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                        <th className="py-2.5 px-3">Trường thông tin</th>
                        <th className="py-2.5 px-3">Giá trị hiện tại</th>
                        <th className="py-2.5 px-3">Giá trị đề xuất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeRequest.diffs.map((diff, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="py-3 px-3 font-semibold text-foreground">{diff.label}</td>
                          <td className="py-3 px-3 text-muted-foreground">{diff.current_value}</td>
                          <td className="py-3 px-3 font-bold text-primary">{diff.proposed_value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: LÝ DO CẬP NHẬT */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Lý do cập nhật
                </h4>
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground leading-relaxed">
                  {activeRequest.reason}
                </div>
              </div>

              {/* SECTION: Ý KIẾN XỬ LÝ (TEXTAREA) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Ý kiến xử lý (khi phê duyệt hoặc trả lại)</span>
                  <span className="text-[10px] text-muted-foreground">0/500</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder="Nhập ý kiến xử lý, căn cứ phê duyệt hoặc lý do trả lại..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* SECTION: SAU KHI DUYỆT (STEPPER EXPLANATION - SCREEN 12) */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Sau khi duyệt</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                      1
                    </span>
                    <div>
                      <strong className="block text-foreground font-bold">Cập nhật hồ sơ chính thức</strong>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Thông tin sẽ được cập nhật vào hồ sơ cán bộ.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                      2
                    </span>
                    <div>
                      <strong className="block text-foreground font-bold">Thông báo cho cán bộ</strong>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Hệ thống sẽ gửi thông báo về kết quả xử lý.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                      3
                    </span>
                    <div>
                      <strong className="block text-foreground font-bold">Ghi lịch sử thay đổi</strong>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Lưu vết thời gian, người xử lý và nội dung thay đổi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleReturn}
                  className="px-5 py-2.5 rounded-xl border border-destructive/40 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  Trả lại yêu cầu
                </button>

                <button
                  onClick={handleApprove}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Phê duyệt cập nhật</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
              Chọn một yêu cầu trong danh sách để xem nội dung đề xuất.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
