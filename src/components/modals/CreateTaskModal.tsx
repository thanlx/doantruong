'use client';

// ==============================================================================
// CREATE TASK MODAL: FORM TẠO CÔNG VIỆC MỚI (KHỚP 100% MÀN HÌNH 5 TRONG ẢNH MẪU)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Calendar, Clock, User, Users, Flag, FolderGit2, Shield, AlertTriangle, Lock, Globe } from 'lucide-react';
import { TaskPriority, ApprovalScope } from '@/types';
import { format } from 'date-fns';

export default function CreateTaskModal() {
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    members,
    campaigns,
    addTask,
    currentMember,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState(currentMember.id);
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('2026-09-25');
  const [dueTime, setDueTime] = useState('17:00');
  const [priority, setPriority] = useState<TaskPriority>('binh_thuong');
  const [approvalScope, setApprovalScope] = useState<ApprovalScope>('chuyen_mon');
  const [campaignId, setCampaignId] = useState('');
  const [accessLevel, setAccessLevel] = useState<'cong_khai' | 'thuong_truc'>('cong_khai');

  const selectedOwner = members.find((m) => m.id === ownerId);
  const delegateOfOwner = selectedOwner?.delegate_to_id ? members.find((m) => m.id === selectedOwner.delegate_to_id) : null;
  const isOwnerBusy = !!(selectedOwner?.busy_from && selectedOwner?.busy_to);

  if (!isCreateTaskModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ownerId) return;

    let combinedDueAt: string | null = null;
    if (dueDate) {
      combinedDueAt = new Date(`${dueDate}T${dueTime || '17:00'}:00+07:00`).toISOString();
    }

    addTask({
      title,
      description,
      owner_id: ownerId,
      collaborator_ids: collaboratorIds,
      due_at: combinedDueAt,
      priority,
      approval_scope: approvalScope,
      campaign_id: campaignId || null,
      status: 'moi',
      access_level: accessLevel,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setIsCreateTaskModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-border overflow-hidden text-card-foreground">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <h3 className="text-base font-bold text-foreground">Tạo công việc</h3>
          <button
            onClick={() => setIsCreateTaskModalOpen(false)}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {/* Tên công việc * */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Tên công việc <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nhập tên công việc..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all font-medium"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Mô tả</label>
            <textarea
              rows={3}
              placeholder="Nhập mô tả chi tiết nhiệm vụ, yêu cầu kết quả..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all leading-relaxed"
            />
          </div>

          {/* Người phụ trách chính (Đúng 1 người bắt buộc) */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Người phụ trách chính <span className="text-destructive">*</span>
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full text-xs p-3 rounded-2xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-ring bg-card text-foreground font-medium"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-card text-foreground">
                  {m.full_name} ({m.role.replace('_', ' ')})
                </option>
              ))}
            </select>

            {/* Cảnh báo nếu đồng chí đang bận & nút chuyển giao 1 chạm */}
            {isOwnerBusy && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in">
                <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Đ/c {selectedOwner?.full_name} đang bận {selectedOwner?.busy_reason || 'công tác'} ({selectedOwner?.busy_from ? format(new Date(selectedOwner.busy_from), 'dd/MM') : ''} - {selectedOwner?.busy_to ? format(new Date(selectedOwner.busy_to), 'dd/MM/yyyy') : ''})
                  </span>
                </div>
                {delegateOfOwner && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                    <span className="text-[11px]">
                      Đã chỉ định ủy quyền cho: <strong className="text-foreground">{delegateOfOwner.full_name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOwnerId(delegateOfOwner.id)}
                      className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-colors self-start sm:self-auto"
                    >
                      Chuyển sang Đ/c {delegateOfOwner.full_name.split(' ').slice(-2).join(' ')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chế độ bảo mật / Phân quyền truy cập */}
          {(currentMember.role === 'bi_thu' || currentMember.role === 'pho_bi_thu') && (
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Chế độ bảo mật / Phân quyền nhiệm vụ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccessLevel('cong_khai')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    accessLevel === 'cong_khai'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Globe className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-foreground text-[11px]">Công khai BTV</div>
                    <div className="text-[10px] text-muted-foreground">Tất cả 9 đồng chí theo dõi</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel('thuong_truc')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    accessLevel === 'thuong_truc'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-600'
                      : 'border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-rose-700 dark:text-rose-400 text-[11px]">Mật (Thường trực)</div>
                    <div className="text-[10px] text-muted-foreground">Chỉ Bí thư & Phó Bí thư</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Hạn hoàn thành (cả ngày lẫn giờ) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Hạn ngày</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Giờ hết hạn</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-2xl border border-border bg-card text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">Mức độ ưu tiên</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'thap', label: 'Thấp' },
                { id: 'binh_thuong', label: 'Trung bình' },
                { id: 'cao', label: 'Cao' },
                { id: 'khan', label: 'Khẩn cấp' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as TaskPriority)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    priority === p.id
                      ? p.id === 'khan'
                        ? 'bg-destructive text-destructive-foreground border-destructive shadow-xs'
                        : p.id === 'cao'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phạm vi duyệt hoàn thành */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Phạm vi duyệt hoàn thành</label>
            <select
              value={approvalScope}
              onChange={(e) => setApprovalScope(e.target.value as ApprovalScope)}
              className="w-full text-xs p-2.5 rounded-2xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-ring bg-card text-foreground"
            >
              <option value="chuyen_mon" className="bg-card text-foreground">Chuyên môn / Chủ trương (Chỉ Bí thư / Phó Bí thư duyệt)</option>
              <option value="hanh_chinh" className="bg-card text-foreground">Hành chính / Văn phòng (Chánh văn phòng cũng duyệt được)</option>
            </select>
          </div>

          {/* Gắn dự án / chiến dịch */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">Gắn dự án / mảng việc</label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-2xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-ring bg-card text-foreground"
            >
              <option value="" className="bg-card text-foreground">Chọn dự án (nếu có)</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nút Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 active:scale-98 transition-all"
            >
              Tạo công việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
