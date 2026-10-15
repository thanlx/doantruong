'use client';

// ==============================================================================
// SIDEBAR CHÍNH: MENU ĐIỀU HƯỚNG THEO CHUẨN DESIGN SYSTEM ĐOÀN - HỘI
// ==============================================================================

import React from 'react';
import { useApp, UserTab, AdminTab } from '@/context/AppContext';
import {
  Home,
  User,
  GitFork,
  Award,
  History,
  Bell,
  Settings,
  LayoutDashboard,
  Users,
  Network,
  FileText,
  CheckSquare,
  BarChart3,
  PieChart,
  ShieldAlert,
  Sliders,
  FileClock,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ onItemClick, onNavigate }: SidebarProps) {
  const handleNav = () => {
    onItemClick?.();
    onNavigate?.();
  };
  const {
    portalMode,
    userTab,
    setUserTab,
    adminTab,
    setAdminTab,
    notifications,
    updateRequests,
  } = useApp();

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  const pendingRequestsCount = updateRequests.filter((r) => r.status === 'pending').length;

  const userMenuItems: { id: UserTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'trang_chu', label: 'Trang chủ', icon: <Home className="h-4.5 w-4.5" /> },
    { id: 'ho_so', label: 'Hồ sơ của tôi', icon: <User className="h-4.5 w-4.5" /> },
    { id: 'to_chuc', label: 'Tổ chức và cán bộ', icon: <GitFork className="h-4.5 w-4.5" /> },
    { id: 'danh_gia', label: 'Đánh giá của tôi', icon: <Award className="h-4.5 w-4.5" /> },
    { id: 'quyet_dinh', label: 'Quyết định và lịch sử', icon: <History className="h-4.5 w-4.5" /> },
    {
      id: 'thong_bao',
      label: 'Thông báo',
      icon: <Bell className="h-4.5 w-4.5" />,
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
    },
    { id: 'tai_khoan', label: 'Tài khoản', icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  const adminMenuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'tong_quan', label: 'Tổng quan', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { id: 'ho_so', label: 'Hồ sơ cán bộ', icon: <Users className="h-4.5 w-4.5" /> },
    { id: 'to_chuc', label: 'Tổ chức và chức vụ', icon: <Network className="h-4.5 w-4.5" /> },
    { id: 'quyet_dinh', label: 'Quyết định nhân sự', icon: <FileText className="h-4.5 w-4.5" /> },
    {
      id: 'duyet_ho_so',
      label: 'Duyệt hồ sơ',
      icon: <CheckSquare className="h-4.5 w-4.5" />,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { id: 'danh_gia', label: 'Đánh giá hằng tháng', icon: <BarChart3 className="h-4.5 w-4.5" /> },
    { id: 'bao_cao', label: 'Báo cáo', icon: <PieChart className="h-4.5 w-4.5" /> },
    { id: 'thong_bao', label: 'Thông báo', icon: <Bell className="h-4.5 w-4.5" /> },
    { id: 'phan_quyen', label: 'Tài khoản và phân quyền', icon: <ShieldAlert className="h-4.5 w-4.5" /> },
    { id: 'cau_hinh', label: 'Cấu hình', icon: <Sliders className="h-4.5 w-4.5" /> },
    { id: 'nhat_ky', label: 'Nhật ký', icon: <FileClock className="h-4.5 w-4.5" /> },
  ];

  return (
    <aside className="w-64 flex flex-col h-full bg-[#005BAA] text-white shadow-md select-none shrink-0">
      {/* BRAND HEADER */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center font-black text-sm tracking-wider text-white shadow-2xs">
              ĐH
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-white">ĐOÀN – HỘI</h1>
              <p className="text-[11px] text-white/70 font-medium mt-0.5">Quản lý cán bộ</p>
            </div>
          </div>

          {portalMode === 'admin' && (
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/30">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {portalMode === 'user' ? (
          <>
            <div className="px-3 py-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Cán bộ cá nhân
            </div>
            {userMenuItems.map((item) => {
              const isActive = userTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setUserTab(item.id);
                    handleNav();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm font-bold border border-white/20'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-white/70'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : (
          <>
            <div className="px-3 py-1.5 text-[10px] font-bold text-white/50 uppercase tracking-wider">
              Quản trị hệ thống
            </div>
            {adminMenuItems.map((item) => {
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    handleNav();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm font-bold border border-white/20'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-white/70'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 text-center">
        <p className="text-[10px] text-white/60 font-medium">Phiên bản 1.0 | Ngày 13/10/2026</p>
        <p className="text-[9px] text-white/40 mt-0.5">Đoàn trường – Hội Sinh viên</p>
      </div>
    </aside>
  );
}
