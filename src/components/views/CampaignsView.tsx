'use client';

// ==============================================================================
// CAMPAIGNS VIEW: QUẢN LÝ DỰ ÁN & MẢNG VIỆC TRỌNG TÂM BTV
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FolderGit2, Plus, Calendar, Target, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignsView() {
  const { campaigns, tasks, setSelectedTaskId } = useApp();

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Dự án & Chiến dịch Trọng tâm
          </h2>
          <p className="text-xs text-muted-foreground">
            Các chương trình công tác lớn trong năm học của Ban Thường vụ Đoàn trường HCMUTE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const campTasks = tasks.filter((t) => t.campaign_id === camp.id);
          const completedTasks = campTasks.filter((t) => t.status === 'hoan_thanh');
          const percent = campTasks.length > 0 ? Math.round((completedTasks.length / campTasks.length) * 100) : 0;

          return (
            <div
              key={camp.id}
              className="bg-card rounded-3xl p-5 border border-border text-card-foreground shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                    style={{ backgroundColor: camp.color || 'var(--primary)' }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">{camp.name}</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {camp.start_date} đến {camp.end_date}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    camp.status === 'dang_chay'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : camp.status === 'hoan_thanh'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-secondary text-secondary-foreground border-border'
                  }`}
                >
                  {camp.status === 'dang_chay' ? 'Đang triển khai' : camp.status === 'hoan_thanh' ? 'Đã hoàn thành' : 'Dự kiến'}
                </span>
              </div>

              {camp.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{camp.description}</p>
              )}

              {/* Tiến độ công việc */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Tiến độ nhiệm vụ</span>
                  <span className="font-bold text-foreground">
                    {completedTasks.length}/{campTasks.length} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Danh sách nhiệm vụ nhỏ */}
              <div className="space-y-1.5 pt-1">
                {campTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted text-xs cursor-pointer transition-colors border border-border/40"
                  >
                    <span className="font-medium text-foreground truncate">{t.title}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {t.due_at ? format(new Date(t.due_at), 'dd/MM') : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
