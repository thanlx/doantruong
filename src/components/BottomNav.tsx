'use client';

// ==============================================================================
// BOTTOM NAVIGATION: THANH ĐIỀU HƯỚNG ĐÁY CHUẨN HCMUTE DESIGN SYSTEM (OKLCH)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Home,
  CheckSquare,
  Plus,
  Calendar,
  MoreHorizontal,
  FolderGit2,
  Palette,
  Compass,
  FileText,
  MessageSquare,
  Users,
  BarChart3,
  Smartphone,
  Settings,
  ShieldAlert,
  X,
} from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, setIsCreateTaskModalOpen, hasPermission } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const canAccessAdmin = hasPermission('access_admin_portal');
  const canAccessCoordinator = hasPermission('access_coordinator');
  const canViewReports = hasPermission('view_reports_kpi');

  const moreItems = [
    { id: 'du_an', label: 'Dự án / Chiến dịch', icon: FolderGit2 },
    { id: 'thiet_ke', label: 'Hệ thống thiết kế', icon: Palette },
    ...(canAccessAdmin ? [{ id: 'admin', label: 'Quản trị Admin', icon: ShieldAlert }] : []),
    { id: 'viec_cua_toi', label: 'Việc của tôi', icon: CheckSquare },
    ...(canAccessCoordinator ? [{ id: 'dieu_phoi', label: 'Bảng điều phối', icon: Compass }] : []),
    { id: 'van_ban_den', label: 'Sổ văn bản đến', icon: FileText },
    { id: 'chat', label: 'Chat nhóm BTV', icon: MessageSquare },
    { id: 'thanh_vien', label: 'Thành viên', icon: Users },
    ...(canViewReports ? [{ id: 'bao_cao', label: 'Báo cáo & Thống kê', icon: BarChart3 }] : []),
    { id: 'huong_dan_ios', label: 'Cài đặt iOS (PWA)', icon: Smartphone },
    { id: 'cai_dat', label: 'Cài đặt & Tài khoản', icon: Settings },
  ];

  return (
    <>
      {/* Modal / Menu Thêm */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-t-3xl p-5 pb-8 shadow-xl border-t border-border animate-in slide-in-from-bottom duration-200 text-card-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-foreground">Tính năng mở rộng</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-muted active:scale-95 transition-all text-card-foreground"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Thanh điều hướng 5 nút dưới đáy màn hình */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border px-2 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe transition-colors">
        {/* 1. Trang chủ */}
        <button
          onClick={() => setActiveTab('trang_chu')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            activeTab === 'trang_chu' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Trang chủ</span>
        </button>

        {/* 2. Công việc */}
        <button
          onClick={() => setActiveTab('cong_viec')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            activeTab === 'cong_viec' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Công việc</span>
        </button>

        {/* 3. Nút (+) Nổi bật ở giữa để tạo công việc */}
        <div className="-mt-5">
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md flex items-center justify-center active:scale-90 transition-transform ring-4 ring-card"
            aria-label="Tạo công việc mới"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Lịch làm việc */}
        <button
          onClick={() => setActiveTab('lich')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
            activeTab === 'lich' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Lịch</span>
        </button>

        {/* 5. Thêm */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px]">Thêm</span>
        </button>
      </nav>
    </>
  );
}
