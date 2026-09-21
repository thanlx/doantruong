'use client';

// ==============================================================================
// TASK DETAIL MODAL: CHI TIẾT CÔNG VIỆC, DUYỆT HOÀN THÀNH, ĐÔN ĐỐC & THẢO LUẬN
// Phê duyệt nghiêm ngặt theo approval_scope ('hanh_chinh' vs 'chuyen_mon')
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  History,
  Send,
  Trash2,
  ShieldCheck,
  Building,
  Flag,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export default function TaskDetailModal() {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    members,
    campaigns,
    incomingDocs,
    currentMember,
    comments,
    addComment,
    activityLogs,
    updateTaskStatus,
    approveTask,
    rejectTask,
    manualRemind,
    deleteTask,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'comments' | 'history'>('details');
  const [commentInput, setCommentInput] = useState('');
  const [remindMessage, setRemindMessage] = useState('');
  const [showRemindInput, setShowRemindInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!selectedTaskId) return null;

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const owner = members.find((m) => m.id === task.owner_id);
  const creator = members.find((m) => m.id === task.created_by);
  const approver = members.find((m) => m.id === task.approved_by);
  const campaign = campaigns.find((c) => c.id === task.campaign_id);
  const sourceDoc = incomingDocs.find((d) => d.id === task.source_document_id);
  const taskComments = comments.filter((c) => c.task_id === task.id);
  const taskLogs = activityLogs.filter((l) => l.task_id === task.id);

  // Xử lý nộp bình luận
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(task.id, commentInput);
    setCommentInput('');
  };

  // Xử lý Duyệt hoàn thành
  const handleApprove = () => {
    const res = approveTask(task.id);
    if (res.success) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setErrorMessage(null);
    } else {
      setErrorMessage(res.message || 'Không đủ quyền hạn duyệt việc này!');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Xử lý đôn đốc
  const handleRemindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = manualRemind(task.id, remindMessage || 'Đề nghị đ/c báo cáo tiến độ công việc gấp!');
    if (res.success) {
      setShowRemindInput(false);
      setRemindMessage('');
      setErrorMessage(null);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const isLeader = currentMember.role === 'bi_thu' || currentMember.role === 'pho_bi_thu';
  const isOfficeChief = currentMember.role === 'chanh_van_phong';
  const isOwner = task.owner_id === currentMember.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden text-card-foreground">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 bg-muted/30">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  task.priority === 'khan'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : task.priority === 'cao'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                Ưu tiên: {task.priority}
              </span>

              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                Phạm vi: {task.approval_scope === 'chuyen_mon' ? 'Chuyên môn (Thường trực duyệt)' : 'Hành chính (Chánh VP duyệt)'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-foreground leading-snug break-words">
              {task.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="bg-destructive/10 border-b border-destructive/20 text-destructive text-xs px-6 py-2.5 flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab chuyển đổi nội dung: Chi tiết / Thảo luận / Lịch sử */}
        <div className="flex items-center gap-4 px-6 border-b border-border text-xs font-bold text-muted-foreground bg-card">
          <button
            onClick={() => setActiveSubTab('details')}
            className={`py-3 border-b-2 transition-colors ${
              activeSubTab === 'details' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            Thông tin nhiệm vụ
          </button>
          <button
            onClick={() => setActiveSubTab('comments')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'comments' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            <span>Thảo luận</span>
            <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded-full border border-border">{taskComments.length}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`py-3 border-b-2 transition-colors ${
              activeSubTab === 'history' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            Lịch sử hoạt động
          </button>
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {activeSubTab === 'details' && (
            <div className="space-y-4">
              {/* Người phụ trách & Hạn chót */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Người chịu trách nhiệm chính (*)
                  </span>
                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={owner?.avatar_url}
                      alt={owner?.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground">{owner?.full_name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{owner?.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Thời hạn hoàn thành
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary pt-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{task.due_at ? format(new Date(task.due_at), 'dd/MM/yyyy HH:mm') : 'Chưa đặt hạn'}</span>
                  </div>
                </div>
              </div>

              {/* Mô tả nhiệm vụ */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground">Mô tả công việc:</span>
                <div className="p-3.5 rounded-2xl bg-muted/30 text-xs text-foreground leading-relaxed whitespace-pre-wrap border border-border">
                  {task.description || 'Không có mô tả chi tiết.'}
                </div>
              </div>

              {/* Nguồn văn bản hoặc chiến dịch nếu có */}
              {(sourceDoc || campaign) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {campaign && (
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                      <span className="text-[10px] font-bold text-primary uppercase">Thuộc Dự án / Mảng việc:</span>
                      <div className="font-semibold text-foreground">{campaign.name}</div>
                    </div>
                  )}

                  {sourceDoc && (
                    <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Nguồn Văn bản đến:</span>
                      <div className="font-semibold text-foreground">
                        Số {sourceDoc.so_ky_hieu || '-'} ({sourceDoc.don_vi_gui})
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin người duyệt nếu đã xong */}
              {task.status === 'hoan_thanh' && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">Đã được phê duyệt hoàn thành!</div>
                    <div className="text-[11px] text-muted-foreground">
                      Người duyệt: {approver?.full_name || 'Thường trực Đoàn trường'} lúc{' '}
                      {task.completed_at ? format(new Date(task.completed_at), 'dd/MM/yyyy HH:mm') : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Hộp thoại đôn đốc nếu đang bật */}
              {showRemindInput && (
                <form onSubmit={handleRemindSubmit} className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
                  <div className="text-xs font-bold text-destructive">Soạn lời nhắn đôn đốc gửi ngay:</div>
                  <textarea
                    rows={2}
                    required
                    value={remindMessage}
                    onChange={(e) => setRemindMessage(e.target.value)}
                    placeholder="Nhập lời nhắc gửi tới người phụ trách..."
                    className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRemindInput(false)}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 shadow-sm"
                    >
                      Gửi đôn đốc (Push + Email)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeSubTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {taskComments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Chưa có ý kiến trao đổi nào.</p>
                ) : (
                  taskComments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5 text-xs">
                      <img
                        src={c.member?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={c.member?.full_name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-border"
                      />
                      <div className="bg-muted/40 p-3 rounded-2xl border border-border flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{c.member?.full_name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {c.created_at ? format(new Date(c.created_at), 'dd/MM HH:mm') : ''}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{c.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder="Viết phản hồi, tiến độ hoặc ghi chú..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-primary/90 shadow-sm"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="space-y-3">
              {taskLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Chưa có nhật ký hoạt động.</p>
              ) : (
                taskLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-muted/40 border border-border">
                    <History className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">
                        {log.member?.full_name || 'Hệ thống'} -{' '}
                        {log.action === 'don_doc'
                          ? 'Đã đôn đốc'
                          : log.action === 'approved'
                          ? 'Đã duyệt hoàn thành'
                          : log.action === 'created'
                          ? 'Đã tạo việc'
                          : 'Cập nhật trạng thái'}
                      </div>
                      {log.detail?.message && (
                        <div className="text-[11px] text-destructive italic mt-0.5">"{log.detail.message}"</div>
                      )}
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss') : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions (Thao tác phê duyệt & trạng thái) */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Nút Xóa (chỉ người tạo hoặc lãnh đạo) */}
          {(isLeader || task.created_by === currentMember.id) && (
            <button
              onClick={() => deleteTask(task.id)}
              className="text-xs text-destructive hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa việc</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Nút Đôn đốc (chỉ Thường trực hoặc Chánh VP) */}
            {(isLeader || isOfficeChief) && task.status !== 'hoan_thanh' && (
              <button
                onClick={() => setShowRemindInput(!showRemindInput)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Đôn đốc</span>
              </button>
            )}

            {/* Trạng thái Đang làm -> Cho phép Nộp duyệt */}
            {task.status === 'dang_lam' && (isOwner || isLeader || isOfficeChief) && (
              <button
                onClick={() => updateTaskStatus(task.id, 'cho_duyet')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
              >
                Nộp duyệt hoàn thành
              </button>
            )}

            {/* Trạng thái Chờ duyệt -> Duyệt hoặc Yêu cầu làm lại */}
            {task.status === 'cho_duyet' && (
              <>
                {(isLeader || (isOfficeChief && task.approval_scope === 'hanh_chinh')) && (
                  <button
                    onClick={() => rejectTask(task.id, 'Cần bổ sung thêm báo cáo chi tiết và danh sách kèm theo.')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-muted"
                  >
                    Yêu cầu làm lại
                  </button>
                )}

                <button
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt hoàn thành</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
