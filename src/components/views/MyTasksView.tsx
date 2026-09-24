'use client';

// ==============================================================================
// MY TASKS VIEW: BẢNG "VIỆC CỦA TÔI"
// Khớp 100% hình minh họa hcmute-ui-components/05-my-tasks.png
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MyTasksView() {
  const { currentMember, getMyTasks, setSelectedTaskId, setIsCreateTaskModalOpen, updateTaskStatus, members } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'dang_lam' | 'hoan_thanh' | 'qua_han' | 'ban_giao'>('all');

  const { overdue, today, thisWeek, upcoming, completed } = getMyTasks(currentMember.id);

  const allMyTasks = [...overdue, ...today, ...thisWeek, ...upcoming, ...completed];
  // Remove duplicates by ID
  const uniqueTasks = Array.from(new Map(allMyTasks.map((t) => [t.id, t])).values());

  const inProgressList = uniqueTasks.filter((t) => t.status === 'dang_lam' || t.status === 'moi');
  const completedList = uniqueTasks.filter((t) => t.status === 'hoan_thanh');
  const overdueList = overdue;
  const delegatedList = uniqueTasks.filter((t) => !!t.delegated_from_id);

  const filteredTasks = (() => {
    switch (activeFilter) {
      case 'dang_lam':
        return inProgressList;
      case 'hoan_thanh':
        return completedList;
      case 'qua_han':
        return overdueList;
      case 'ban_giao':
        return delegatedList;
      default:
        return uniqueTasks;
    }
  })();

  const now = new Date();

  const getStatusPill = (task: any) => {
    const isOverdue = task.due_at && new Date(task.due_at) < now && task.status !== 'hoan_thanh';

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          <span>Quá hạn</span>
        </span>
      );
    }

    if (task.status === 'hoan_thanh') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          <span>Hoàn thành</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0B5CFF]" />
        <span>Đang thực hiện</span>
      </span>
    );
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header (Khớp hình 05-my-tasks.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#0A2558] dark:text-foreground tracking-tight">
            Việc của tôi
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách những việc được giao cho bạn.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#0B5CFF] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo việc cho mình</span>
        </button>
      </div>

      {/* Filter Tabs Bar (Khớp 100% hình 05-my-tasks.png) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'border-2 border-[#0B5CFF] text-[#0B5CFF] bg-blue-50/80 dark:bg-blue-950/40 shadow-2xs'
              : 'bg-white dark:bg-card hover:bg-muted text-foreground border border-border/80'
          }`}
        >
          Tất cả ({uniqueTasks.length})
        </button>

        <button
          onClick={() => setActiveFilter('dang_lam')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'dang_lam'
              ? 'border-2 border-[#0B5CFF] text-[#0B5CFF] bg-blue-50/80 dark:bg-blue-950/40 shadow-2xs'
              : 'bg-white dark:bg-card hover:bg-muted text-foreground border border-border/80'
          }`}
        >
          Đang thực hiện ({inProgressList.length})
        </button>

        <button
          onClick={() => setActiveFilter('hoan_thanh')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'hoan_thanh'
              ? 'border-2 border-[#0B5CFF] text-[#0B5CFF] bg-blue-50/80 dark:bg-blue-950/40 shadow-2xs'
              : 'bg-white dark:bg-card hover:bg-muted text-foreground border border-border/80'
          }`}
        >
          Hoàn thành ({completedList.length})
        </button>

        <button
          onClick={() => setActiveFilter('qua_han')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'qua_han'
              ? 'border-2 border-rose-500 text-rose-600 bg-rose-50/80 dark:bg-rose-950/40 shadow-2xs'
              : 'bg-white dark:bg-card hover:bg-rose-50 text-rose-600 border border-border/80'
          }`}
        >
          Quá hạn ({overdueList.length})
        </button>

        <button
          onClick={() => setActiveFilter('ban_giao')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'ban_giao'
              ? 'border-2 border-amber-500 text-amber-600 bg-amber-50/80 dark:bg-amber-950/40 shadow-2xs'
              : 'bg-white dark:bg-card hover:bg-amber-50/50 text-foreground border border-border/80'
          }`}
        >
          Việc nhận bàn giao ({delegatedList.length})
        </button>
      </div>

      {/* Bảng công việc dạng List card (Khớp 100% hình 05-my-tasks.png) */}
      <div className="bg-white dark:bg-card rounded-3xl border border-border p-3 sm:p-5 shadow-xs space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground">
            Không có công việc nào trong danh sách này.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'hoan_thanh';
            const isOverdue = task.due_at && new Date(task.due_at) < now && !isDone;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-border group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, isDone ? 'dang_lam' : 'hoan_thanh');
                    }}
                    className="shrink-0 transition-transform active:scale-90"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : isOverdue ? (
                      <AlertCircle className="w-5 h-5 text-rose-500 fill-rose-100 dark:fill-rose-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#0B5CFF]" />
                    )}
                  </button>

                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h4 className={`text-xs sm:text-sm font-semibold truncate leading-snug group-hover:text-primary transition-colors ${
                      isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {task.title}
                    </h4>

                    {task.delegated_from_id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                        🤝 Bàn giao từ Đ/c {members.find((m) => m.id === task.delegated_from_id)?.full_name.split(' ').slice(-2).join(' ') || 'BTV'}
                      </span>
                    )}

                    {task.access_level === 'thuong_truc' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
                        🔒 Mật
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {task.due_at ? format(new Date(task.due_at), 'dd/MM/yyyy') : 'Linh hoạt'}
                  </span>

                  <div>
                    {getStatusPill(task)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
