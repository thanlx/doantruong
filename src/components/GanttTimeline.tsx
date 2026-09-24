'use client';

// ==============================================================================
// GANTT TIMELINE CHART: TIẾN ĐỘ CÔNG VIỆC & PHÁT HIỆN ĐIỂM NGHẼN BTV (BOTTLENECK)
// Cảnh báo khi cán bộ có >= 3 công việc dồn vào cùng 1 tuần trong Tháng 9/2026
// ==============================================================================

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole, formatStatus } from '@/lib/formatters';
import { Task, Member } from '@/types';

interface WeekInterval {
  weekNumber: number;
  label: string;
  startDate: Date;
  endDate: Date;
}

export default function GanttTimeline() {
  const { tasks, members, setSelectedTaskId } = useApp();

  // Định nghĩa các tuần trong Tháng 9 và đầu Tháng 10 năm 2026
  const timelineWeeks: WeekInterval[] = useMemo(() => [
    {
      weekNumber: 1,
      label: 'Tuần 36 (01/09 - 06/09)',
      startDate: new Date(2026, 8, 1),
      endDate: new Date(2026, 8, 6, 23, 59, 59),
    },
    {
      weekNumber: 2,
      label: 'Tuần 37 (07/09 - 13/09)',
      startDate: new Date(2026, 8, 7),
      endDate: new Date(2026, 8, 13, 23, 59, 59),
    },
    {
      weekNumber: 3,
      label: 'Tuần 38 (14/09 - 20/09)',
      startDate: new Date(2026, 8, 14),
      endDate: new Date(2026, 8, 20, 23, 59, 59),
    },
    {
      weekNumber: 4,
      label: 'Tuần 39 (21/09 - 27/09)',
      startDate: new Date(2026, 8, 21),
      endDate: new Date(2026, 8, 27, 23, 59, 59),
    },
    {
      weekNumber: 5,
      label: 'Tuần 40 (28/09 - 04/10)',
      startDate: new Date(2026, 8, 28),
      endDate: new Date(2026, 9, 4, 23, 59, 59),
    },
  ], []);

  // Kiểm tra xem task có hoạt động trong khoảng tuần này hay không
  const isTaskInWeek = (task: Task, week: WeekInterval): boolean => {
    const taskStart = task.started_at ? new Date(task.started_at) : new Date(task.created_at);
    const taskEnd = task.due_at ? new Date(task.due_at) : new Date(taskStart.getTime() + 7 * 86400000);

    return taskStart <= week.endDate && taskEnd >= week.startDate;
  };

  // Tính toán tải công việc và phát hiện điểm nghẽn (Bottleneck >= 3 việc/tuần)
  const memberWorkload = useMemo(() => {
    return members.map((member) => {
      const memberTasks = tasks.filter(
        (t) => t.owner_id === member.id && t.status !== 'huy'
      );

      const weeklyCounts = timelineWeeks.map((week) => {
        const activeTasks = memberTasks.filter(
          (t) => t.status !== 'hoan_thanh' && isTaskInWeek(t, week)
        );
        return {
          week,
          tasks: activeTasks,
          count: activeTasks.length,
          isBottleneck: activeTasks.length >= 3,
        };
      });

      const hasAnyBottleneck = weeklyCounts.some((w) => w.isBottleneck);

      return {
        member,
        totalTasks: memberTasks.length,
        tasks: memberTasks,
        weeklyCounts,
        hasAnyBottleneck,
      };
    });
  }, [members, tasks, timelineWeeks]);

  // Danh sách các điểm nghẽn cần cảnh báo cho lãnh đạo
  const bottleneckAlerts = useMemo(() => {
    const alerts: Array<{ member: Member; weekLabel: string; count: number; tasks: Task[] }> = [];
    memberWorkload.forEach((mw) => {
      mw.weeklyCounts.forEach((wc) => {
        if (wc.isBottleneck) {
          alerts.push({
            member: mw.member,
            weekLabel: wc.week.label,
            count: wc.count,
            tasks: wc.tasks,
          });
        }
      });
    });
    return alerts;
  }, [memberWorkload]);

  return (
    <div className="space-y-5">
      {/* CẢNH BÁO ĐIỂM NGHẼN TIẾN ĐỘ (NẾU CÓ) */}
      {bottleneckAlerts.length > 0 ? (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Cảnh báo điểm nghẽn tải công việc (Quá tải &gt;= 3 việc/tuần)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {bottleneckAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-card border border-amber-500/30 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AvatarWithFallback
                    src={alert.member.avatar_url}
                    name={alert.member.full_name}
                    className="w-7 h-7 rounded-full shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">{alert.member.full_name}</div>
                    <div className="text-[10px] text-muted-foreground">{alert.weekLabel}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 shrink-0">
                  {alert.count} việc dồn
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground italic">
            Gợi ý: Lãnh đạo có thể phân công thêm người phối hợp hoặc gia hạn thời gian để đảm bảo chất lượng.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tiến độ phân bổ cân bằng, không có thành viên nào bị quá tải trong Tháng 9/2026.</span>
        </div>
      )}

      {/* MA TRẬN TIMELINE GANTT THEO CÁN BỘ */}
      <div className="bg-card rounded-3xl border border-border p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Biểu đồ Phân bổ Tiến độ BTV (Tháng 09/2026)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Theo dõi mật độ công việc phân bổ qua 5 tuần cao điểm công tác Đoàn
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px] space-y-2">
            {/* Header các cột tuần */}
            <div className="grid grid-cols-6 gap-2 text-center text-xs font-bold text-muted-foreground py-2 border-b border-border">
              <div className="text-left px-2">Cán bộ BTV</div>
              {timelineWeeks.map((week) => (
                <div key={week.weekNumber} className="bg-muted/40 py-1.5 rounded-xl text-[11px]">
                  T{week.weekNumber}: {week.label.split(' ')[1]}
                </div>
              ))}
            </div>

            {/* Hàng từng thành viên BTV */}
            {memberWorkload.map((mw) => (
              <div
                key={mw.member.id}
                className={`grid grid-cols-6 gap-2 items-center p-2 rounded-2xl border transition-colors ${
                  mw.hasAnyBottleneck
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/60 hover:bg-muted/30'
                }`}
              >
                {/* Thông tin cán bộ */}
                <div className="flex items-center gap-2 px-1 min-w-0">
                  <AvatarWithFallback
                    src={mw.member.avatar_url}
                    name={mw.member.full_name}
                    className="w-7 h-7 rounded-full shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{mw.member.full_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{formatRole(mw.member.role)}</div>
                  </div>
                </div>

                {/* 5 Tuần timeline */}
                {mw.weeklyCounts.map((wc, wIdx) => {
                  const hasTasks = wc.count > 0;
                  return (
                    <div
                      key={wIdx}
                      className={`min-h-[44px] p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        wc.isBottleneck
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold'
                          : hasTasks
                          ? 'bg-primary/10 border-primary/20 text-primary font-semibold'
                          : 'bg-muted/15 border-transparent text-muted-foreground/50'
                      }`}
                    >
                      {hasTasks ? (
                        <div className="space-y-1 w-full text-center">
                          <span className="text-xs font-black leading-none">{wc.count} việc</span>
                          {wc.isBottleneck && (
                            <span className="text-[8px] uppercase tracking-wider block text-rose-600 dark:text-rose-400 font-black">
                              Nghẽn
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] opacity-40">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Chú giải */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-muted/40 border border-border" />
            <span>Trống lịch / Chưa có việc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-primary/20 border border-primary/40" />
            <span>1 - 2 việc (Tải bình thường)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500/25 border border-rose-500/40" />
            <span className="font-bold text-rose-600 dark:text-rose-400">&gt;= 3 việc (Điểm nghẽn cần san tải)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
