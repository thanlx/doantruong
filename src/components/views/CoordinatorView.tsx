'use client';

// ==============================================================================
// COORDINATOR VIEW: BẢNG ĐIỀU PHỐI (DÀNH CHO CHÁNH VĂN PHÒNG & THƯỜNG TRỰC)
// Màn hình tối quan trọng giúp nhìn toàn cảnh và đôn đốc đúng lúc
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
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export default function CoordinatorView() {
  const { currentMember, getCoordinatorData, setSelectedTaskId, manualRemind, setActiveTab } = useApp();

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
        <p className="text-xs text-primary mt-3 font-medium">
          Mẹo kiểm thử: Bạn có thể dùng menu tài khoản ở góc trên bên phải để chuyển sang Đ/c Trần Minh Quân (Chánh VP) hoặc Đ/c Nguyễn Thị Mai (Bí thư).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast thông báo */}
      {feedbackToast && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold fixed top-20 right-6 z-50 shadow-xl animate-in slide-in-from-right duration-200 flex items-center gap-2 ${
            feedbackToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-destructive text-destructive-foreground'
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
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Bảng điều phối Thường trực & Chánh văn phòng
            </h2>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 font-bold px-2.5 py-0.5 rounded-full">
              Chỉ huy 360°
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tổng quan tắc nghẽn, kiểm soát tiến độ, giám sát tải công việc và phát lệnh đôn đốc tức thì
          </p>
        </div>

        <button
          onClick={handleExportCoordinatorExcel}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Excel điều phối</span>
        </button>
      </div>

      {/* 4 Thống kê nóng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-destructive">Đang trễ hạn</div>
          <div className="text-2xl font-black text-destructive mt-1">{overdueTasks.length} việc</div>
          <div className="text-[10px] text-destructive/80 mt-0.5">Xếp theo số ngày trễ giảm dần</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Đến hạn trong 48 giờ</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{dueIn48Hours.length} việc</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Cần đôn đốc trước khi trễ</div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-primary">Đang chờ duyệt</div>
          <div className="text-2xl font-black text-primary mt-1">{waitingApproval.length} việc</div>
          <div className="text-[10px] text-primary/80 mt-0.5">Chờ Thường trực / Chánh VP chốt</div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">VB chờ phân công</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{unassignedDocs.length} VB</div>
          <div className="text-[10px] text-indigo-600/80 mt-0.5">Chờ xin ý kiến BTV</div>
        </div>
      </div>

      {/* KHỐI 1: CÔNG VIỆC ĐANG TRỄ (KÈM NÚT ĐÔN ĐỐC TRỰC TIẾP) */}
      <div className="bg-card rounded-3xl border border-border p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-ping" />
            <h3 className="text-sm font-bold text-foreground">Danh sách công việc đang trễ (Xếp giảm dần theo ngày)</h3>
          </div>
          <span className="text-xs text-destructive font-bold bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
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
                    <span className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-md">
                      Trễ {task.daysOverdue} ngày
                    </span>
                    <h4
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-xs sm:text-sm font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
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
                    className="px-3 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Đôn đốc ngay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KHỐI 2: TẢI CÔNG VIỆC CỦA TỪNG THÀNH VIÊN BTV (AI ĐANG ÔM NHIỀU, AI CÒN TRỐNG) */}
      <div className="bg-card rounded-3xl border border-border p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Ma trận tải công việc BTV (9 Thành viên)</h3>
          <p className="text-xs text-muted-foreground">Cân đối khối lượng công việc trước khi giao thêm nhiệm vụ mới</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {workloadPerMember.map((w) => (
            <div
              key={w.member.id}
              className="p-3.5 rounded-2xl border border-border hover:border-primary/40 bg-muted/30 hover:bg-card transition-all space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <img src={w.member.avatar_url} alt={w.member.full_name} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{w.member.full_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate capitalize">{w.member.role.replace('_', ' ')}</div>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {w.total} việc
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-border">
                <div className="text-muted-foreground">
                  Quá hạn: <span className={`font-bold ${w.overdue > 0 ? 'text-destructive' : 'text-foreground'}`}>{w.overdue}</span>
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
            busyMembers.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>{m.full_name}</span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{m.busy_from} đến {m.busy_to}</span>
                </div>
                <p className="text-[11px] text-muted-foreground italic">{m.busy_reason}</p>
              </div>
            ))
          )}
        </div>

        {/* Văn bản chờ phân công ("Xin ý kiến BTV") */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-foreground">Văn bản chờ phân công (Xin ý kiến BTV)</h3>
            </div>
            <button onClick={() => setActiveTab('van_ban_den')} className="text-xs text-primary hover:underline">
              Sổ văn bản &rarr;
            </button>
          </div>

          {unassignedDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Tất cả văn bản đến đều đã được phân công</div>
          ) : (
            unassignedDocs.map((doc) => (
              <div key={doc.id} className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="text-primary font-mono">{doc.so_ky_hieu || 'Chưa có số'}</span>
                  <span className="text-[10px] text-muted-foreground">{doc.ngay_nhan}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.noi_dung}</p>
                <div className="text-[10px] text-primary font-semibold">{doc.don_vi_gui}</div>
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

              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-[11px] text-foreground leading-relaxed">
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm flex items-center gap-1.5"
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
