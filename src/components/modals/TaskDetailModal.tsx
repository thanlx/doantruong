'use client';

// ==============================================================================
// TASK DETAIL MODAL: CHI TIẾT CÔNG VIỆC, WORKFLOW NỘP & DUYỆT 2 BƯỚC + ĐÁNH GIÁ KPI
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  History,
  Send,
  Trash2,
  Award,
  Link as LinkIcon,
  FileText,
  FileCheck,
  RotateCcw,
  Star,
  ExternalLink,
  Eye,
  Lock,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole, formatStatus, formatPriority, formatRatingGrade, getStatusBadgeProps } from '@/lib/formatters';
import { RatingGrade } from '@/types';

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
    submitTaskResult,
    reviewTaskResult,
    manualRemind,
    deleteTask,
    openPdfViewer,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'comments' | 'history'>('details');
  const [commentInput, setCommentInput] = useState('');
  const [remindMessage, setRemindMessage] = useState('');
  const [showRemindInput, setShowRemindInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State cho Bước 1: Assignee nộp kết quả
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionLinksInput, setSubmissionLinksInput] = useState('');

  // State cho Bước 2: Lãnh đạo đánh giá & duyệt
  const [selectedGrade, setSelectedGrade] = useState<RatingGrade>('A');
  const [ratingScore, setRatingScore] = useState<number>(9.0);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Lắng nghe phím ESC để đóng Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTaskId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedTaskId]);

  if (!selectedTaskId) return null;

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const owner = members.find((m) => m.id === task.owner_id);
  const approver = members.find((m) => m.id === task.approved_by);
  const rater = members.find((m) => m.id === task.rated_by);
  const campaign = campaigns.find((c) => c.id === task.campaign_id);
  const sourceDoc = incomingDocs.find((d) => d.id === task.source_document_id);
  const taskComments = comments.filter((c) => c.task_id === task.id);
  const taskLogs = activityLogs.filter((l) => l.task_id === task.id);

  const isLeader = currentMember.role === 'bi_thu' || currentMember.role === 'pho_bi_thu';
  const isOfficeChief = currentMember.role === 'chanh_van_phong';
  const isOwner = task.owner_id === currentMember.id;
  const isCollaborator = task.collaborator_ids?.includes(currentMember.id);
  const canSubmit = isOwner || isCollaborator || isLeader;

  // Quyền duyệt: chuyên môn -> chỉ Bí thư/Phó BT; hành chính -> cả Chánh VP
  const canReview =
    task.approval_scope === 'chuyen_mon'
      ? isLeader
      : isLeader || isOfficeChief;

  const statusBadge = getStatusBadgeProps(task.status);

  // Xử lý nộp bình luận
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(task.id, commentInput);
    setCommentInput('');
  };

  // Xử lý Bước 1: Assignee nộp kết quả
  const handleConfirmSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionNote.trim()) {
      setErrorMessage('Vui lòng nhập ghi chú tóm tắt kết quả hoàn thành!');
      return;
    }

    const links = submissionLinksInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    submitTaskResult(task.id, {
      note: submissionNote,
      links,
    });

    setShowSubmitForm(false);
    setSubmissionNote('');
    setSubmissionLinksInput('');
    setErrorMessage(null);
  };

  // Xử lý Bước 2: Lãnh đạo duyệt & chấm điểm KPI
  const handleApproveWithEvaluation = () => {
    if (!canReview) {
      setErrorMessage(
        task.approval_scope === 'chuyen_mon'
          ? 'Chỉ Bí thư hoặc Phó Bí thư mới có quyền phê duyệt việc Chuyên môn!'
          : 'Chỉ Bí thư, Phó Bí thư hoặc Chánh Văn phòng mới có quyền phê duyệt việc Hành chính!'
      );
      return;
    }

    reviewTaskResult(task.id, {
      grade: selectedGrade,
      score: Number(ratingScore),
      feedback: reviewFeedback.trim() || 'Hoàn thành tốt nhiệm vụ được giao.',
      approved: true,
    });

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setErrorMessage(null);
  };

  // Lãnh đạo yêu cầu làm lại
  const handleRejectWithFeedback = () => {
    if (!canReview) {
      setErrorMessage('Đồng chí không đủ thẩm quyền yêu cầu chỉnh sửa công việc này!');
      return;
    }
    if (!reviewFeedback.trim()) {
      setErrorMessage('Vui lòng nhập lý do/nhận xét yêu cầu làm lại để người phụ trách nắm rõ!');
      return;
    }

    reviewTaskResult(task.id, {
      grade: 'D',
      score: 5.0,
      feedback: reviewFeedback,
      approved: false,
    });
    setErrorMessage(null);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-border overflow-hidden text-card-foreground">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 bg-muted/30">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge Trạng thái */}
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.className}`}>
                {statusBadge.label}
              </span>

              {/* Badge Ưu tiên */}
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  task.priority === 'khan'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : task.priority === 'cao'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {formatPriority(task.priority)}
              </span>

              {/* Badge Phạm vi duyệt */}
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                {task.approval_scope === 'chuyen_mon' ? 'Chuyên môn (Thường trực)' : 'Hành chính (Văn phòng)'}
              </span>

              {/* Badge Xếp loại nếu đã hoàn thành */}
              {task.rating_grade && (
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${formatRatingGrade(task.rating_grade).bg} ${formatRatingGrade(task.rating_grade).color}`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>Loại {task.rating_grade} ({task.rating_score?.toFixed(1)} đ)</span>
                </span>
              )}

              {/* Badge Bảo mật nếu Mật */}
              {task.access_level === 'thuong_truc' && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>MẬT - THƯỜNG TRỰC</span>
                </span>
              )}

              {/* Badge Việc nhận bàn giao */}
              {task.delegated_from_id && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Nhận bàn giao từ Đ/c {members.find((m) => m.id === task.delegated_from_id)?.full_name || 'BTV'}
                </span>
              )}
            </div>

            <h3 id="task-detail-title" className="text-base sm:text-lg font-black text-foreground leading-snug break-words">
              {task.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 transition-colors"
            title="Đóng (Esc)"
            aria-label="Đóng cửa sổ"
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

        {/* Tab chuyển đổi nội dung */}
        <div className="flex items-center gap-4 px-6 border-b border-border text-xs font-bold text-muted-foreground bg-card">
          <button
            onClick={() => setActiveSubTab('details')}
            className={`py-3 border-b-2 transition-colors ${
              activeSubTab === 'details' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            Thông tin & Tiến độ
          </button>
          <button
            onClick={() => setActiveSubTab('comments')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'comments' ? 'border-primary text-primary' : 'border-transparent hover:text-foreground'
            }`}
          >
            <span>Thảo luận</span>
            <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded-full border border-border">
              {taskComments.length}
            </span>
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
                    <AvatarWithFallback
                      src={owner?.avatar_url}
                      name={owner?.full_name}
                      className="w-8 h-8 rounded-full ring-1 ring-border"
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground">{owner?.full_name || 'Chưa phân công'}</div>
                      <div className="text-[10px] text-muted-foreground">{formatRole(owner?.role)}</div>
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

              {/* Nguồn văn bản hoặc dự án */}
              {(sourceDoc || campaign) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {campaign && (
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                      <span className="text-[10px] font-bold text-primary uppercase">Mảng việc / Dự án:</span>
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

              {/* Văn bản scan PDF gốc đính kèm nếu có */}
              {(task.inherited_doc_file_url || sourceDoc?.file_url) && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <span>Văn bản gốc đính kèm (PDF Scan)</span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
                          Chính thức
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {task.inherited_doc_file_name || sourceDoc?.file_name || (sourceDoc?.so_ky_hieu ? `${sourceDoc.so_ky_hieu}.pdf` : 'Van_ban_goc_dinh_kem.pdf')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => openPdfViewer(
                        (task.inherited_doc_file_url || sourceDoc?.file_url)!,
                        task.inherited_doc_file_name || sourceDoc?.so_ky_hieu || 'Văn bản gốc',
                        sourceDoc || undefined
                      )}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem PDF trực tiếp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KHỐI KẾT QUẢ NỘP CỦA ASSIGNEE (NẾU CÓ HOẶC ĐANG CHỜ DUYỆT) */}
              {/* ------------------------------------------------------------------ */}
              {(task.submission_note || task.status === 'cho_duyet' || task.status === 'pending_review') && (
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      Kết quả báo cáo của người phụ trách
                    </span>
                    {task.submitted_at && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Nộp lúc: {format(new Date(task.submitted_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-foreground bg-card p-3 rounded-xl border border-border leading-relaxed">
                    {task.submission_note || 'Đã nộp đề xuất nghiệm thu công việc.'}
                  </div>

                  {task.submission_links && task.submission_links.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-muted-foreground">Liên kết đính kèm:</span>
                      <div className="space-y-1">
                        {task.submission_links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-card px-2.5 py-1 rounded-lg border border-border break-all"
                          >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span>{link}</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KHỐI ĐÁNH GIÁ & XẾP LOẠI KPI KHI ĐÃ HOÀN THÀNH */}
              {/* ------------------------------------------------------------------ */}
              {task.status === 'hoan_thanh' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                        Đã nghiệm thu hoàn thành & Chốt KPI
                      </span>
                    </div>
                    {task.completed_at && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Chốt: {format(new Date(task.completed_at), 'dd/MM/yyyy HH:mm')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-card border border-border space-y-0.5">
                      <span className="text-[10px] text-muted-foreground font-semibold">Xếp loại đánh giá</span>
                      <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {task.rating_grade ? `Loại ${task.rating_grade}` : 'Chưa xếp loại'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border space-y-0.5">
                      <span className="text-[10px] text-muted-foreground font-semibold">Điểm KPI chốt</span>
                      <div className="font-black text-sm text-primary">
                        {task.rating_score ? `${task.rating_score.toFixed(1)} / 10.0` : '10.0 / 10.0'}
                      </div>
                    </div>
                  </div>

                  {task.review_feedback && (
                    <div className="text-xs text-foreground bg-card p-3 rounded-xl border border-border italic">
                      "{task.review_feedback}"
                    </div>
                  )}

                  {approver && (
                    <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
                      <span>Người phê duyệt:</span>
                      <span className="font-bold text-foreground">{approver.full_name}</span>
                      <span>({formatRole(approver.role)})</span>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* FORM CHO ASSIGNEE NỘP BÁO CÁO (NẾU ĐANG LÀM VÀ BẤM NÚT NỘP) */}
              {/* ------------------------------------------------------------------ */}
              {showSubmitForm && (
                <form onSubmit={handleConfirmSubmitResult} className="p-4 rounded-2xl bg-muted/40 border border-primary/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Báo cáo kết quả hoàn thành nhiệm vụ
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Hủy
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Tóm tắt nội dung đã hoàn thành (*)
                    </label>
                    <textarea
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      placeholder="Mô tả tóm tắt kết quả đã thực hiện, sản phẩm đạt được..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Liên kết tài liệu / sản phẩm Drive (mỗi dòng 1 link)
                    </label>
                    <textarea
                      value={submissionLinksInput}
                      onChange={(e) => setSubmissionLinksInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      rows={2}
                      className="w-full text-xs p-3 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      Xác nhận Nộp báo cáo
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KHỐI LÃNH ĐẠO DUYỆT & ĐÁNH GIÁ KPI (KHI TRẠNG THÁI CHỜ DUYỆT) */}
              {/* ------------------------------------------------------------------ */}
              {(task.status === 'cho_duyet' || task.status === 'pending_review') && canReview && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    <Star className="w-4 h-4" />
                    <span>Dành cho Lãnh đạo: Thẩm định & Đánh giá KPI</span>
                  </div>

                  {/* Chọn Xếp loại A/B/C/D */}
                  <div>
                    <label className="text-[11px] font-bold text-foreground block mb-1.5">
                      Xếp loại chất lượng:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['A', 'B', 'C', 'D'] as RatingGrade[]).map((grade) => {
                        const isSelected = selectedGrade === grade;
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => {
                              setSelectedGrade(grade);
                              if (grade === 'A') setRatingScore(9.5);
                              else if (grade === 'B') setRatingScore(8.0);
                              else if (grade === 'C') setRatingScore(6.5);
                              else if (grade === 'D') setRatingScore(4.5);
                            }}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30'
                                : 'bg-card text-foreground border-border hover:bg-muted'
                            }`}
                          >
                            Loại {grade}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Điểm KPI thang 1.0 - 10.0 */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground mb-1">
                      <span>Điểm số KPI (thang 1.0 - 10.0):</span>
                      <span className="font-mono text-xs text-primary">{Number(ratingScore).toFixed(1)} đ</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.1"
                      value={ratingScore}
                      onChange={(e) => setRatingScore(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Nhận xét feedback */}
                  <div>
                    <label className="text-[11px] font-bold text-foreground block mb-1">
                      Nhận xét / Ý kiến chỉ đạo:
                    </label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Nhận xét chất lượng sản phẩm, tinh thần trách nhiệm..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  {/* Hành động phê duyệt */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRejectWithFeedback}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yêu cầu làm lại</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApproveWithEvaluation}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Duyệt & Lưu xếp loại</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB THẢO LUẬN */}
          {activeSubTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {taskComments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground italic">
                    Chưa có bình luận hoặc trao đổi nào cho công việc này.
                  </div>
                ) : (
                  taskComments.map((comment) => {
                    const author = members.find((m) => m.id === comment.member_id);
                    return (
                      <div key={comment.id} className="flex gap-2.5 text-xs p-3 rounded-2xl bg-muted/20 border border-border">
                        <AvatarWithFallback
                          src={author?.avatar_url}
                          name={author?.full_name}
                          className="w-7 h-7 rounded-full shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">{author?.full_name || 'Thành viên'}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {comment.created_at ? format(new Date(comment.created_at), 'dd/MM HH:mm') : ''}
                            </span>
                          </div>
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Gửi tin nhắn trao đổi về tiến độ..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB LỊCH SỬ HOẠT ĐỘNG */}
          {activeSubTab === 'history' && (
            <div className="space-y-3 text-xs">
              {taskLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground italic">
                  Chưa có nhật ký hoạt động nào được ghi nhận.
                </div>
              ) : (
                taskLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-muted/20 border border-border flex items-start gap-2.5">
                    <History className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-foreground">
                        {log.action === 'approved'
                          ? 'Đã duyệt hoàn thành & xếp loại'
                          : log.action === 'created'
                          ? 'Đã tạo việc'
                          : 'Cập nhật trạng thái'}
                      </div>
                      {log.detail?.note && (
                        <div className="text-[11px] text-foreground mt-0.5">Báo cáo: "{log.detail.note}"</div>
                      )}
                      {log.detail?.feedback && (
                        <div className="text-[11px] text-primary italic mt-0.5">Lãnh đạo: "{log.detail.feedback}"</div>
                      )}
                      <div className="text-[10px] text-muted-foreground font-mono mt-1">
                        {log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss') : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Nút Xóa (chỉ người tạo hoặc Thường trực) */}
          {(isLeader || task.created_by === currentMember.id) && (
            <button
              onClick={() => {
                if (confirm('Đồng chí có chắc chắn muốn xóa công việc này?')) {
                  deleteTask(task.id);
                  setSelectedTaskId(null);
                }
              }}
              className="text-xs text-destructive hover:underline font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa việc</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Nút Đôn đốc (Thường trực hoặc Chánh VP) */}
            {(isLeader || isOfficeChief) && task.status !== 'hoan_thanh' && (
              <button
                onClick={() => setShowRemindInput(!showRemindInput)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Đôn đốc</span>
              </button>
            )}

            {/* Trạng thái Đang làm / Mới -> Nút mở form nộp báo cáo */}
            {(task.status === 'dang_lam' || task.status === 'moi') && canSubmit && !showSubmitForm && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Nộp báo cáo hoàn thành</span>
              </button>
            )}
          </div>
        </div>

        {/* Khung nhập nội dung đôn đốc nếu bấm Đôn đốc */}
        {showRemindInput && (
          <form onSubmit={handleRemindSubmit} className="p-3 bg-destructive/5 border-t border-destructive/20 flex gap-2">
            <input
              type="text"
              value={remindMessage}
              onChange={(e) => setRemindMessage(e.target.value)}
              placeholder="Nội dung đôn đốc (VD: Đề nghị đ/c báo cáo tiến độ gấp trong hôm nay!)..."
              className="flex-1 text-xs p-2 rounded-xl border border-destructive/30 bg-card text-foreground outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-destructive text-destructive-foreground text-xs font-semibold rounded-xl"
            >
              Gửi nhắc nhở
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
