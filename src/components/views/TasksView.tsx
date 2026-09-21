'use client';

// ==============================================================================
// TASKS VIEW: QUẢN LÝ CÔNG VIỆC TOÀN NHÓM (KHỚP MÀN HÌNH 2 VÀ BẢNG TOÀN DIỆN)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Paperclip,
  LayoutGrid,
  List,
  ChevronRight,
  Send,
  Flag,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TasksView() {
  const {
    tasks,
    members,
    campaigns,
    setSelectedTaskId,
    setIsCreateTaskModalOpen,
    updateTaskStatus,
    manualRemind,
    currentMember,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, dang_lam, qua_han, cho_duyet, hoan_thanh
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const now = new Date();

  // Lọc công việc
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

    // Lọc theo trạng thái
    if (filterStatus === 'dang_lam' && task.status !== 'dang_lam') return false;
    if (filterStatus === 'cho_duyet' && task.status !== 'cho_duyet') return false;
    if (filterStatus === 'hoan_thanh' && task.status !== 'hoan_thanh') return false;
    if (filterStatus === 'qua_han' && !isOverdue) return false;

    // Lọc theo mảng việc
    if (selectedCampaign !== 'all' && task.campaign_id !== selectedCampaign) return false;

    // Lọc theo người phụ trách
    if (selectedMember !== 'all' && task.owner_id !== selectedMember) return false;

    // Lọc theo từ khóa
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  const getStatusBadge = (task: any) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
          Quá hạn
        </span>
      );
    }

    switch (task.status) {
      case 'cho_duyet':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Chờ duyệt
          </span>
        );
      case 'hoan_thanh':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Hoàn thành
          </span>
        );
      case 'dang_lam':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            Đang thực hiện
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
            Mới
          </span>
        );
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'khan':
        return 'bg-destructive ring-2 ring-destructive/20';
      case 'cao':
        return 'bg-amber-500 ring-2 ring-amber-500/20';
      case 'thap':
        return 'bg-muted-foreground/50';
      default:
        return 'bg-primary ring-2 ring-primary/20';
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Tiêu đề & Nút Tạo công việc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Quản lý Công việc</h2>
          <p className="text-xs text-muted-foreground">
            Theo dõi tiến độ, phân công nhiệm vụ và phê duyệt công việc BTV Đoàn trường
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút chuyển chế độ xem List / Kanban */}
          <div className="hidden sm:flex items-center bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-card text-primary shadow-xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-card text-primary shadow-xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cột (Kanban)</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo công việc</span>
          </button>
        </div>
      </div>

      {/* Thanh lọc trạng thái (Chips khớp chính xác Màn hình 2 Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'dang_lam', label: 'Đang làm' },
          { id: 'qua_han', label: 'Quá hạn' },
          { id: 'cho_duyet', label: 'Chờ duyệt' },
          { id: 'hoan_thanh', label: 'Hoàn thành' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === tab.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-secondary hover:bg-muted text-secondary-foreground border border-border/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bộ lọc phụ & Tìm kiếm */}
      <div className="bg-card rounded-2xl p-3 border border-border shadow-xs flex flex-col sm:flex-row gap-2.5">
        {/* Ô tìm kiếm */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 hover:bg-muted/70 focus:bg-card text-xs pl-9 pr-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-ring text-foreground transition-all"
          />
        </div>

        {/* Lọc theo Dự án */}
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="bg-muted/40 hover:bg-muted/70 text-xs px-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="all">Tất cả dự án / mảng việc</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Lọc theo Người phụ trách */}
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="bg-muted/40 hover:bg-muted/70 text-xs px-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="all">Tất cả người phụ trách</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* DANH SÁCH CÔNG VIỆC (CHẾ ĐỘ LIST HOẶC KANBAN) */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 text-center border border-border">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-foreground">Không tìm thấy công việc phù hợp</h4>
              <p className="text-xs text-muted-foreground mt-1">Thử thay đổi bộ lọc hoặc tạo thêm công việc mới</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const owner = members.find((m) => m.id === task.owner_id);
              const campaign = campaigns.find((c) => c.id === task.campaign_id);
              const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="bg-card rounded-2xl p-4 border border-border shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${getPriorityDot(task.priority)}`}
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {task.title}
                        </h4>
                        {task.approval_scope === 'hanh_chinh' && (
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                            Hành chính
                          </span>
                        )}
                        {task.approval_scope === 'chuyen_mon' && (
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Chuyên môn
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 flex-wrap">
                        {/* Người phụ trách */}
                        <div className="flex items-center gap-1.5 text-foreground">
                          <img
                            src={owner?.avatar_url}
                            alt={owner?.full_name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-border"
                          />
                          <span className="font-medium truncate">{owner?.full_name}</span>
                        </div>

                        {/* Hạn chót */}
                        {task.due_at && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(new Date(task.due_at), 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                        )}

                        {/* Mảng việc / Chiến dịch */}
                        {campaign && (
                          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[10px] font-medium border border-primary/20">
                            {campaign.name}
                          </span>
                        )}

                        {/* Bình luận */}
                        {Boolean(task.comments_count) && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{task.comments_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trạng thái & Nút thao tác */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <div>{getStatusBadge(task)}</div>

                    {/* Nút đôn đốc nếu trễ hạn (chỉ Thường trực hoặc Chánh VP) */}
                    {isOverdue &&
                      (currentMember.role === 'bi_thu' ||
                        currentMember.role === 'pho_bi_thu' ||
                        currentMember.role === 'chanh_van_phong') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            manualRemind(task.id, 'Đề nghị đồng chí khẩn trương hoàn thành công việc!');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold flex items-center gap-1 transition-colors border border-destructive/20"
                        >
                          <Send className="w-3 h-3" />
                          <span>Đôn đốc</span>
                        </button>
                      )}

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ KANBAN BẢNG CỘT */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'moi', title: 'Mới giao', color: 'border-border' },
            { id: 'dang_lam', title: 'Đang thực hiện', color: 'border-primary' },
            { id: 'cho_duyet', title: 'Chờ duyệt', color: 'border-amber-500' },
            { id: 'hoan_thanh', title: 'Đã hoàn thành', color: 'border-emerald-500' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="bg-muted/50 rounded-3xl p-3.5 space-y-3 border border-border">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{col.title}</h4>
                  <span className="text-xs font-bold bg-card px-2 py-0.5 rounded-full text-foreground border border-border shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map((task) => {
                    const owner = members.find((m) => m.id === task.owner_id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-card rounded-2xl p-3.5 shadow-xs border border-border hover:shadow-md hover:border-primary/40 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`} />
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {task.due_at ? format(new Date(task.due_at), 'dd/MM') : ''}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{task.title}</h5>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={owner?.avatar_url}
                              alt={owner?.full_name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-border"
                            />
                            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[80px]">
                              {owner?.full_name}
                            </span>
                          </div>

                          <div className="text-[10px]">{getStatusBadge(task)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
