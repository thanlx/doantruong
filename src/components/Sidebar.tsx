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
  ShieldAlert,
  Palette,
  LogOut,
} from 'lucide-react';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { activeTab, setActiveTab, tasks, currentMember, logout, hasPermission } = useApp();

  const overdueCount = tasks.filter(
    (t) => t.status !== 'hoan_thanh' && t.status !== 'huy' && t.due_at && new Date(t.due_at) < new Date()
  ).length;

  const waitingApprovalCount = tasks.filter((t) => t.status === 'cho_duyet').length;

  const canAccessAdmin = hasPermission('access_admin_portal');
  const canAccessCoordinator = hasPermission('access_coordinator');
  const canViewReports = hasPermission('view_reports_kpi');

  const navItems = [
    { id: 'trang_chu', label: 'Trang chủ', icon: Home },
    { id: 'cong_viec', label: 'Công việc', icon: CheckSquare },
    { id: 'viec_cua_toi', label: 'Việc của tôi', icon: UserCheck },
    { id: 'lich', label: 'Lịch làm việc', icon: Calendar },
    { id: 'du_an', label: 'Dự án / Mảng việc', icon: FolderGit2 },
    { id: 'van_ban_den', label: 'Sổ văn bản đến', icon: FileText },
    ...(canAccessCoordinator
      ? [
          {
            id: 'dieu_phoi',
            label: 'Bảng điều phối',
            icon: Compass,
            badge: overdueCount + waitingApprovalCount > 0 ? overdueCount + waitingApprovalCount : undefined,
            badgeColor: 'bg-destructive text-destructive-foreground',
          },
        ]
      : []),
    { id: 'chat', label: 'Chat nhóm BTV', icon: MessageSquare },
    { id: 'thanh_vien', label: 'Thành viên', icon: Users },
    ...(canAccessAdmin
      ? [
          {
            id: 'admin',
            label: 'Quản trị Admin',
            icon: ShieldAlert,
            badge: 'Admin',
            badgeColor: 'bg-destructive text-destructive-foreground',
          },
        ]
      : []),
    ...(canViewReports
      ? [
          { id: 'bao_cao', label: 'Báo cáo & Thống kê', icon: BarChart3 },
        ]
      : []),
    { id: 'huong_dan_ios', label: 'Cài đặt iOS (PWA)', icon: Smartphone },
    { id: 'thiet_ke', label: 'Hệ thống thiết kế', icon: Palette },
    { id: 'cai_dat', label: 'Cài đặt & Tài khoản', icon: Settings },
  ];

  return (
    <aside className="app-sidebar w-60 text-white flex flex-col shrink-0 select-none">
      {/* Header Logo Đoàn trường HCMUTE */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <DoanLogo size={40} />
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 leading-tight">
            ĐOÀN THANH NIÊN
          </span>
          <span className="text-[11px] font-extrabold text-white leading-tight">
            CỘNG SẢN HỒ CHÍ MINH
          </span>
          <span className="text-[9px] font-semibold text-blue-200 mt-0.5">
            HCMUTE • BTV Đoàn trường
          </span>
        </div>
      </div>

      {/* Danh sách Menu */}
      <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => { setActiveTab(item.id); onNavigate?.(); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 relative group ${
                isActive
                  ? 'bg-[#0B5CFF] text-white font-bold shadow-md shadow-blue-900/50'
                  : 'text-blue-100/90 hover:text-white hover:bg-white/10 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                }`}
              />
              <span className="flex-1 text-left truncate">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-white/20 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all text-blue-200 hover:text-white hover:bg-white/10 font-medium group cursor-pointer mt-2"
        >
          <LogOut className="w-4 h-4 text-blue-300 group-hover:text-red-300 transition-colors" />
          <span className="flex-1 text-left truncate">Đăng xuất BTV</span>
        </button>
      </nav>

      {/* Thẻ phương châm ở chân Sidebar (Khớp hình 02-dashboard-overview.png) */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-[#0B3A8E] to-[#07245B] border border-blue-400/25 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h4 className="text-xs font-black tracking-tight text-white leading-tight">
              Thanh niên
            </h4>
            <p className="text-[12px] font-extrabold text-blue-200 leading-snug mt-0.5">
              Làm việc tốt hơn
            </p>
            <span className="text-[11px] text-blue-300/90 italic font-semibold">Mỗi ngày</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 shadow-inner">
            <svg
              className="w-4 h-4 transform -rotate-45"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-blue-200">
          <span>BTV Khóa 2024 - 2027</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded font-bold text-white">HCMUTE</span>
        </div>
      </div>
    </aside>
  );
}
