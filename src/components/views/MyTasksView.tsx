'use client';

// ==============================================================================
// MY TASKS VIEW: BẢNG "VIỆC CỦA TÔI" (NHÓM THEO: QUÁ HẠN / HÔM NAY / TUẦN NÀY / SẮP TỚI)
// ==============================================================================

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus,
  Send,
  Flag,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

export default function MyTasksView() {
  const { currentMember, getMyTasks, setSelectedTaskId, setIsCreateTaskModalOpen, updateTaskStatus } = useApp();

  const { overdue, today, thisWeek, upcoming, completed } = getMyTasks(currentMember.id);

  const sections = [
    {
      id: 'overdue',
      title: 'Quá hạn cần xử lý gấp',
      icon: AlertCircle,
      tasks: overdue,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      badge: 'bg-destructive text-destructive-foreground',
    },
    {
      id: 'today',
      title: 'Hôm nay',
      icon: Clock,
      tasks: today,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      badge: 'bg-primary text-primary-foreground',
    },
    {
      id: 'thisWeek',
      title: 'Tuần này',
      icon: Calendar,
      tasks: thisWeek,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500 text-white',
    },
    {
      id: 'upcoming',
      title: 'Sắp tới',
      icon: Sparkles,
      tasks: upcoming,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      badge: 'bg-indigo-500 text-white',
    },
    {
      id: 'completed',
      title: 'Đã hoàn thành',
      icon: CheckCircle2,
      tasks: completed,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500 text-white',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Việc của tôi • {currentMember.full_name}
          </h2>
          <p className="text-xs text-muted-foreground">
            Tất cả công việc đồng chí đang chịu trách nhiệm chính hoặc phối hợp thực hiện
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo việc cho mình</span>
        </button>
      </div>

      {/* Các khối phân nhóm theo tiến độ */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          if (section.tasks.length === 0 && section.id !== 'today' && section.id !== 'overdue') return null;

          return (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${section.bg} ${section.color} flex items-center justify-center border border-border/40`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.badge}`}>
                    {section.tasks.length}
                  </span>
                </div>
              </div>

              {section.tasks.length === 0 ? (
                <div className="bg-card/60 rounded-2xl p-6 text-center border border-dashed border-border text-xs text-muted-foreground">
                  Không có công việc nào trong mục này
                </div>
              ) : (
                <div className="space-y-2.5">
                  {section.tasks.map((task) => {
                    const isDone = task.status === 'hoan_thanh';
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`bg-card rounded-2xl p-4 border transition-all cursor-pointer group shadow-xs hover:shadow-md flex items-center justify-between gap-3 ${
                          section.id === 'overdue'
                            ? 'border-destructive/40 hover:border-destructive'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, isDone ? 'dang_lam' : 'hoan_thanh');
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            <h4
                              className={`text-xs sm:text-sm font-bold truncate leading-snug group-hover:text-primary transition-colors ${
                                isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              {task.due_at && (
                                <span className={section.id === 'overdue' ? 'text-destructive font-semibold' : ''}>
                                  Hạn: {format(new Date(task.due_at), 'dd/MM/yyyy HH:mm')}
                                </span>
                              )}
                              <span>•</span>
                              <span className="capitalize">{task.priority}</span>
                              {task.approval_scope === 'hanh_chinh' && (
                                <span className="bg-secondary text-secondary-foreground border border-border px-1.5 py-0.5 rounded text-[9px] font-semibold">
                                  Hành chính
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              task.status === 'cho_duyet'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : isDone
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}
                          >
                            {task.status === 'cho_duyet'
                              ? 'Chờ duyệt'
                              : isDone
                              ? 'Đã xong'
                              : 'Đang làm'}
                          </span>

                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
