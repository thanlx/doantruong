'use client';

// ==============================================================================
// SIDEBAR: THANH ĐIỀU HƯỚNG CHUẨN HCMUTE DESIGN SYSTEM (OKLCH, BORDER-BORDER)
// ==============================================================================

import React from 'react';
import { useApp } from '@/context/AppContext';
import DoanLogo from './DoanLogo';
import {
  Home,
  CheckSquare,
  UserCheck,
  Calendar,
  FolderGit2,
  FileText,
  Compass,
  MessageSquare,
  Users,
  BarChart3,
  Smartphone,
  Settings,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, tasks, currentMember } = useApp();

  const overdueCount = tasks.filter(
    (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < new Date()
  ).length;

  const waitingApprovalCount = tasks.filter((t) => t.status === 'cho_duyet').length;

  const navItems = [
    { id: 'trang_chu', label: 'Trang chủ', icon: Home },
    { id: 'cong_viec', label: 'Công việc', icon: CheckSquare },
    { id: 'viec_cua_toi', label: 'Việc của tôi', icon: UserCheck },
    { id: 'lich', label: 'Lịch làm việc', icon: Calendar },
    { id: 'du_an', label: 'Dự án / Mảng việc', icon: FolderGit2 },
    { id: 'van_ban_den', label: 'Sổ văn bản đến', icon: FileText },
    {
      id: 'dieu_phoi',
      label: 'Bảng điều phối',
      icon: Compass,
      badge: overdueCount + waitingApprovalCount > 0 ? overdueCount + waitingApprovalCount : undefined,
      badgeColor: 'bg-destructive text-destructive-foreground',
    },
    { id: 'chat', label: 'Chat nhóm BTV', icon: MessageSquare },
    { id: 'thanh_vien', label: 'Thành viên', icon: Users },
    { id: 'bao_cao', label: 'Báo cáo & Thống kê', icon: BarChart3 },
    { id: 'huong_dan_ios', label: 'Cài đặt iOS (PWA)', icon: Smartphone },
    { id: 'cai_dat', label: 'Cài đặt & Tài khoản', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 select-none shadow-xs transition-colors">
      {/* Header Logo Đoàn trường HCMUTE */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <DoanLogo size={42} />
        <div className="flex flex-col">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-destructive leading-tight">
            Đoàn Thanh Niên
          </span>
          <span className="text-[12px] font-bold text-foreground leading-tight">
            ĐH SƯ PHẠM KỸ THUẬT
          </span>
          <span className="text-[10px] font-semibold text-primary">
            TP. HỒ CHÍ MINH (HCMUTE)
          </span>
        </div>
      </div>

      {/* Danh sách Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 relative group ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
                }`}
              />
              <span className="flex-1 text-left truncate">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-primary text-primary-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Thẻ phương châm ở chân Sidebar (Khớp HCMUTE Brand Gradient) */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-[oklch(0.4912_0.2867_268.64)] text-primary-foreground relative overflow-hidden shadow-md">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HCMUTE Youth</span>
          </div>
          <h4 className="text-xs font-bold leading-snug tracking-tight text-white">
            Tuổi trẻ HCMUTE
          </h4>
          <p className="text-[11px] text-primary-foreground/85 italic font-medium leading-relaxed mt-0.5">
            Tiên phong • Sáng tạo • Vì cộng đồng
          </p>

          <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-primary-foreground/85">
            <span>BTV Khóa 2024 - 2027</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono font-bold">9 Đ/c</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
