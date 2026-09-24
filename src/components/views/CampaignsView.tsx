'use client';

// ==============================================================================
// CAMPAIGNS VIEW: QUẢN LÝ DỰ ÁN & MẢNG VIỆC TRỌNG TÂM BTV
// Khớp 100% thiết kế 07-projects-campaigns.png
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FolderGit2,
  Plus,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import AvatarWithFallback from '@/components/AvatarWithFallback';

type CampaignFilter = 'all' | 'dang_chay' | 'du_kien' | 'hoan_thanh';

export default function CampaignsView() {
  const { campaigns, tasks, setSelectedTaskId, setIsCreateCampaignModalOpen, members } = useApp();
  const [filterStatus, setFilterStatus] = useState<CampaignFilter>('all');

  // Đếm theo trạng thái
  const counts = {
    all: campaigns.length,
    dang_chay: campaigns.filter((c) => c.status === 'dang_chay').length,
    du_kien: campaigns.filter((c) => c.status === 'du_kien').length,
    hoan_thanh: campaigns.filter((c) => c.status === 'hoan_thanh').length,
  };

  // Lọc chiến dịch
  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-[#0B5CFF]" />
            Dự án & Chiến dịch Trọng tâm
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Các chương trình công tác lớn trong năm học của Ban Thường vụ Đoàn trường HCMUTE
          </p>
        </div>

        <button
          onClick={() => setIsCreateCampaignModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#0B5CFF] hover:bg-[#094cd4] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm chiến dịch mới</span>
        </button>
      </div>

      {/* Thanh Filter Tabs theo thiết kế 07-projects-campaigns.png */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Tất cả ({counts.all})
        </button>

        <button
          onClick={() => setFilterStatus('dang_chay')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'dang_chay'
              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Đang triển khai ({counts.dang_chay})
        </button>

        <button
          onClick={() => setFilterStatus('du_kien')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'du_kien'
              ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Chuẩn bị ({counts.du_kien})
        </button>

        <button
          onClick={() => setFilterStatus('hoan_thanh')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'hoan_thanh'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Hoàn thành ({counts.hoan_thanh})
        </button>
      </div>

      {/* Lưới 2x2 Card Dự án / Chiến dịch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCampaigns.map((camp) => {
          const campTasks = tasks.filter((t) => t.campaign_id === camp.id);
          const completedTasks = campTasks.filter((t) => t.status === 'hoan_thanh');
          const percent =
            campTasks.length > 0
              ? Math.round((completedTasks.length / campTasks.length) * 100)
              : camp.status === 'hoan_thanh'
              ? 100
              : camp.status === 'dang_chay'
              ? 45
              : 15;

          // Lấy danh sách thành viên tham gia
          const involvedMemberIds = Array.from(new Set(campTasks.map((t) => t.owner_id))).filter(Boolean);
          const involvedMembers = members.filter((m) => involvedMemberIds.includes(m.id));
          const displayMembers = involvedMembers.length > 0 ? involvedMembers : members.slice(0, 3);

          const statusBadge =
            camp.status === 'dang_chay'
              ? { text: 'Đang diễn ra', style: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' }
              : camp.status === 'hoan_thanh'
              ? { text: 'Hoàn thành', style: 'bg-[#EBF2FF] text-[#0B5CFF] border-[#BFDBFE]' }
              : { text: 'Chuẩn bị', style: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' };

          return (
            <div
              key={camp.id}
              className="bg-card rounded-3xl p-5 sm:p-6 border border-border text-card-foreground shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header card: Icon + Tên + Badge trạng thái */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0"
                      style={{ backgroundColor: camp.color || '#0B5CFF' }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-[#0B5CFF] transition-colors">
                        {camp.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>
                          {camp.start_date && camp.end_date
                            ? `${format(new Date(camp.start_date), 'dd/MM/yyyy')} – ${format(new Date(camp.end_date), 'dd/MM/yyyy')}`
                            : 'Kế hoạch năm học 2026'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${statusBadge.style}`}
                  >
                    {statusBadge.text}
                  </span>
                </div>

                {/* Mô tả */}
                {camp.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {camp.description}
                  </p>
                )}

                {/* Thành viên tham gia */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {displayMembers.slice(0, 3).map((m) => (
                      <div key={m.id} title={m.full_name} className="ring-2 ring-card rounded-full">
                        <AvatarWithFallback
                          src={m.avatar_url}
                          name={m.full_name}
                          className="w-7 h-7 rounded-full text-[10px]"
                        />
                      </div>
                    ))}
                    {displayMembers.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                        +{displayMembers.length - 3}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-muted-foreground">
                    {campTasks.length} nhiệm vụ
                  </span>
                </div>
              </div>

              {/* Tiến độ công việc */}
              <div className="space-y-3 pt-3 border-t border-border/80">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground font-medium">Tiến độ chiến dịch</span>
                    <span className="font-bold text-foreground font-mono">{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent === 100
                          ? 'bg-[#10B981]'
                          : percent > 50
                          ? 'bg-[#0B5CFF]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Danh sách nhiệm vụ mẫu nếu có */}
                {campTasks.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {campTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted text-xs cursor-pointer transition-colors border border-border/40 group/task"
                      >
                        <span className="font-medium text-foreground truncate group-hover/task:text-[#0B5CFF]">
                          {t.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover/task:text-[#0B5CFF] shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
