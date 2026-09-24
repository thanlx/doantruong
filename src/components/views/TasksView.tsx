'use client';

// ==============================================================================
// TASKS VIEW: QUẢN LÝ CÔNG VIỆC BTV (LIST, KANBAN TOUCH-FRIENDLY & GANTT TIMELINE)
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
  LayoutGrid,
  List,
  ChevronRight,
  Send,
  Flag,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import GanttTimeline from '@/components/GanttTimeline';
import { matchesVietnameseSearch } from '@/lib/searchUtils';
import { formatStatus, formatRole } from '@/lib/formatters';
import { TaskStatus } from '@/types';

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

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');

  const now = new Date();

  // Lọc công việc có hỗ trợ tìm kiếm tiếng Việt không dấu
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

    // Lọc theo trạng thái
    if (filterStatus === 'dang_lam' && task.status !== 'dang_lam') return false;
    if (filterStatus === 'cho_duyet' && task.status !== 'cho_duyet' && task.status !== 'pending_review') return false;
    if (filterStatus === 'hoan_thanh' && task.status !== 'hoan_thanh') return false;
    if (filterStatus === 'qua_han' && !isOverdue) return false;

    // Lọc theo mảng việc / chiến dịch
    if (selectedCampaign !== 'all' && task.campaign_id !== selectedCampaign) return false;

    // Lọc theo người phụ trách
    if (selectedMember !== 'all' && task.owner_id !== selectedMember) return false;

    // Lọc theo từ khóa tiếng Việt không dấu
    if (searchQuery.trim()) {
      const matchTitle = matchesVietnameseSearch(task.title, searchQuery);
      const matchDesc = matchesVietnameseSearch(task.description || '', searchQuery);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  const getStatusBadge = (task: any) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
          Quá hạn
        </span>
      );
    }

    switch (task.status) {
      case 'cho_duyet':
      case 'pending_review':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            Chờ duyệt
          </span>
        );
      case 'hoan_thanh':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            Hoàn thành
          </span>
        );
      case 'dang_lam':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            Đang thực hiện
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Chưa bắt đầu
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
        return 'bg-muted-foreground';
      default:
        return 'bg-primary ring-2 ring-primary/20';
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header & Công cụ chuyển View (Khớp hình 04-task-management.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0A2558] dark:text-foreground tracking-tight">
            Quản lý công việc
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Thao tác việc này quản lý các công việc cho các thành viên.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Nút chuyển đổi View 3 chế độ: Danh sách, Kanban, Gantt Timeline */}
          <div className="flex items-center bg-white dark:bg-muted p-1 rounded-xl border border-border shadow-2xs">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-[#0B5CFF] text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Bảng</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#0B5CFF] text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#0B5CFF] text-white shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Tiến độ Gantt</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0B5CFF] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tạo công việc</span>
          </button>
        </div>
      </div>

      {/* Thanh lọc trạng thái Chips (Khớp 100% hình 04-task-management.png) */}
      {viewMode !== 'timeline' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `Tất cả (${tasks.length})` },
            { id: 'dang_lam', label: 'Đang thực hiện' },
            { id: 'moi', label: 'Chưa bắt đầu' },
            { id: 'hoan_thanh', label: 'Hoàn thành' },
            { id: 'qua_han', label: 'Quá hạn', isDanger: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'border-2 border-[#0B5CFF] text-[#0B5CFF] bg-blue-50/80 dark:bg-blue-950/40 shadow-2xs'
                  : tab.isDanger
                  ? 'bg-white dark:bg-card hover:bg-rose-50 text-rose-600 border border-border/80'
                  : 'bg-white dark:bg-card hover:bg-muted text-foreground border border-border/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Bộ lọc phụ & Tìm kiếm không dấu */}
      {viewMode !== 'timeline' && (
        <div className="bg-card rounded-2xl p-3 border border-border shadow-xs flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc (tiếng Việt có/không dấu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 hover:bg-muted/70 focus:bg-card text-xs pl-9 pr-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-ring text-foreground transition-all"
            />
          </div>

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
      )}

      {/* HIỂN THỊ THEO CHẾ ĐỘ: TIMELINE / LIST / KANBAN */}
      {viewMode === 'timeline' ? (
        <GanttTimeline />
      ) : viewMode === 'list' ? (
        /* CHẾ ĐỘ BẢNG DỮ LIỆU (Khớp 100% hình 04-task-management.png) */
        <div className="bg-white dark:bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground">Không có công việc nào</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Không tìm thấy nhiệm vụ phù hợp với điều kiện lọc hiện tại.
              </p>
            </div>
          ) : (
            <>
              {/* Bảng trên Desktop / Tablet */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-slate-50/50 dark:bg-muted/30">
                      <th className="py-3.5 pl-4 w-12">#</th>
                      <th className="py-3.5 px-3">Tên công việc</th>
                      <th className="py-3.5 px-3">Người phụ trách</th>
                      <th className="py-3.5 px-3">Hạn hoàn thành</th>
                      <th className="py-3.5 pr-4 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredTasks.map((task, index) => {
                      const owner = members.find((m) => m.id === task.owner_id);
                      return (
                        <tr
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-4 font-bold text-muted-foreground w-12">
                            {index + 1}
                          </td>

                          <td className="py-3.5 px-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${getPriorityDot(task.priority)}`} />
                              <span className="truncate max-w-sm sm:max-w-md">{task.title}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <AvatarWithFallback
                                src={owner?.avatar_url}
                                name={owner?.full_name || 'BTV'}
                                size={26}
                                className="ring-1 ring-border"
                              />
                              <span className="font-medium text-foreground truncate">{owner?.full_name || 'Chưa gán'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-muted-foreground font-mono text-[11px]">
                            {task.due_at ? format(new Date(task.due_at), 'dd/MM/yyyy') : 'Linh hoạt'}
                          </td>

                          <td className="py-3.5 pr-4 text-right">{getStatusBadge(task)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Danh sách thẻ Card trên Mobile */}
              <div className="sm:hidden divide-y divide-border">
                {filteredTasks.map((task) => {
                  const owner = members.find((m) => m.id === task.owner_id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="p-4 active:bg-muted/50 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getPriorityDot(task.priority)}`} />
                          <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                            {task.title}
                          </h4>
                        </div>
                        <div className="shrink-0">{getStatusBadge(task)}</div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <div className="flex items-center gap-1.5">
                          <AvatarWithFallback
                            src={owner?.avatar_url}
                            name={owner?.full_name || 'BTV'}
                            size={20}
                          />
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {owner?.full_name || 'Chưa gán'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px]">
                          {task.due_at ? format(new Date(task.due_at), 'dd/MM/yyyy') : 'Linh hoạt'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ KANBAN BẢNG CỘT TOUCH-FRIENDLY CHO MOBILE */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'moi', title: 'Mới giao', color: 'border-border' },
            { id: 'dang_lam', title: 'Đang thực hiện', color: 'border-primary' },
            { id: 'cho_duyet', title: 'Chờ duyệt', color: 'border-purple-500' },
            { id: 'hoan_thanh', title: 'Đã hoàn thành', color: 'border-emerald-500' },
          ].map((col) => {
            const colTasks = filteredTasks.filter((t) => {
              if (col.id === 'cho_duyet') {
                return t.status === 'cho_duyet' || t.status === 'pending_review';
              }
              return t.status === col.id;
            });

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
                          <span className={`w-2.5 h-2.5 rounded-full ${getPriorityDot(task.priority)}`} />
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {task.due_at ? format(new Date(task.due_at), 'dd/MM') : ''}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                          {task.title}
                        </h5>

                        <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <AvatarWithFallback
                              src={owner?.avatar_url}
                              name={owner?.full_name}
                              className="w-5 h-5 rounded-full shrink-0 ring-1 ring-border"
                            />
                            <span className="text-[10px] text-muted-foreground font-medium truncate">
                              {owner?.full_name}
                            </span>
                          </div>

                          {/* Dropdown đổi trạng thái 1 chạm (Touch-friendly cho Mobile) */}
                          <select
                            value={task.status === 'pending_review' ? 'cho_duyet' : task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, e.target.value as TaskStatus);
                            }}
                            className="text-[10px] font-bold bg-muted hover:bg-muted/80 text-foreground px-1.5 py-1 rounded-lg border border-border outline-none shrink-0"
                            title="Chạm để chuyển trạng thái nhanh"
                            aria-label="Đổi trạng thái công việc"
                          >
                            <option value="moi">Mới</option>
                            <option value="dang_lam">Đang làm</option>
                            <option value="cho_duyet">Chờ duyệt</option>
                            <option value="hoan_thanh">Hoàn thành</option>
                          </select>
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
