'use client';

// ==============================================================================
// BOTTOM NAVIGATION: THANH ĐIỀU HƯỚNG ĐÁY CHO DI ĐỘNG (QUẢN LÝ CÁN BỘ ĐOÀN - HỘI)
// ==============================================================================

import React, { useState } from 'react';
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
  ExternalLink,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface BottomNavProps {
  onOpenTestModal?: () => void;
}

export default function BottomNav({ onOpenTestModal }: BottomNavProps) {
  const {
    portalMode,
    togglePortalMode,
    userTab,
    setUserTab,
    adminTab,
    setAdminTab,
    notifications,
    updateRequests,
    canAccessAdminPortal,
    allowedAdminTabs,
    isSuperAdmin,
  } = useApp();

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  const pendingRequestsCount = updateRequests.filter((r) => r.status === 'pending').length;

  const isAdminView = portalMode === 'admin' && canAccessAdminPortal;

  if (!isAdminView) {
    return (
      <>
        {/* Modal Thêm cho Cán bộ */}
        {showMoreMenu && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-card rounded-t-3xl p-5 pb-8 shadow-xl border-t border-border animate-in slide-in-from-bottom duration-200 text-card-foreground">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Menu cá nhân mở rộng</h3>
                  <p className="text-[11px] text-muted-foreground">Tính năng tra cứu, quyết định và tài khoản</p>
                </div>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    setUserTab('quyet_dinh');
                    setShowMoreMenu(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-all text-foreground"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">Quyết định & Lịch sử</span>
                </button>

                <button
                  onClick={() => {
                    setUserTab('thong_bao');
                    setShowMoreMenu(false);
                  }}
                  className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-all text-foreground"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">Thông báo</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute top-2 right-4 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setUserTab('tai_khoan');
                    setShowMoreMenu(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-all text-foreground"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">Tài khoản</span>
                </button>

                {isSuperAdmin && onOpenTestModal && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenTestModal();
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 active:scale-95 transition-all text-amber-800 dark:text-amber-300"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight">12 Kịch bản Test</span>
                  </button>
                )}

                {canAccessAdminPortal && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      togglePortalMode();
                    }}
                    className="col-span-3 flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs active:scale-95 transition-all shadow-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Sang Trang Quản Trị</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Thanh đáy 5 nút chế độ Người dùng */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border px-2 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe transition-colors">
          <button
            onClick={() => setUserTab('trang_chu')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              userTab === 'trang_chu' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Trang chủ</span>
          </button>

          <button
            onClick={() => setUserTab('ho_so')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              userTab === 'ho_so' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Hồ sơ</span>
          </button>

          <button
            onClick={() => setUserTab('to_chuc')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              userTab === 'to_chuc' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <GitFork className="w-5 h-5" />
            <span className="text-[10px]">Tổ chức</span>
          </button>

          <button
            onClick={() => setUserTab('danh_gia')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              userTab === 'danh_gia' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px]">Đánh giá</span>
          </button>

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

  // Chế độ Admin: lọc các nút mở rộng theo allowedAdminTabs
  const allMoreAdminItems: { id: AdminTab; label: string; icon: React.ReactNode; colorClass: string }[] = [
    {
      id: 'to_chuc',
      label: 'Tổ chức',
      icon: <Network className="w-5 h-5" />,
      colorClass: 'bg-blue-500/10 text-primary',
    },
    {
      id: 'quyet_dinh',
      label: 'Quyết định',
      icon: <FileText className="w-5 h-5" />,
      colorClass: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 'bao_cao',
      label: 'Báo cáo',
      icon: <PieChart className="w-5 h-5" />,
      colorClass: 'bg-purple-500/10 text-purple-600',
    },
    {
      id: 'thong_bao',
      label: 'Thông báo',
      icon: <Bell className="w-5 h-5" />,
      colorClass: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      id: 'phan_quyen',
      label: 'Phân quyền',
      icon: <ShieldAlert className="w-5 h-5" />,
      colorClass: 'bg-rose-500/10 text-rose-600',
    },
    {
      id: 'cau_hinh',
      label: 'Cấu hình',
      icon: <Sliders className="w-5 h-5" />,
      colorClass: 'bg-teal-500/10 text-teal-600',
    },
    {
      id: 'nhat_ky',
      label: 'Nhật ký',
      icon: <FileClock className="w-5 h-5" />,
      colorClass: 'bg-slate-500/10 text-slate-600',
    },
  ];
  const moreAdminItems = allMoreAdminItems.filter((item) => allowedAdminTabs.includes(item.id));

  return (
    <>
      {/* Modal Thêm cho Admin */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-t-3xl p-5 pb-8 shadow-xl border-t border-border animate-in slide-in-from-bottom duration-200 text-card-foreground max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Phân hệ Quản trị được cấp ({allowedAdminTabs.length})</h3>
                <p className="text-[11px] text-muted-foreground">Chỉ hiển thị các chức năng trong phạm vi quyền của bạn</p>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {moreAdminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    setShowMoreMenu(false);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-all text-foreground"
                >
                  <div className={`w-10 h-10 rounded-2xl ${item.colorClass} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">{item.label}</span>
                </button>
              ))}

              {isSuperAdmin && onOpenTestModal && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenTestModal();
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 active:scale-95 transition-all text-amber-800 dark:text-amber-300"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">12 Kịch bản Test</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  togglePortalMode();
                }}
                className="col-span-3 flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs active:scale-95 transition-all shadow-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Sang Trang Người Dùng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thanh đáy chế độ Admin */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-t border-border px-2 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe transition-colors">
        {allowedAdminTabs.includes('tong_quan') && (
          <button
            onClick={() => setAdminTab('tong_quan')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              adminTab === 'tong_quan' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Tổng quan</span>
          </button>
        )}

        {allowedAdminTabs.includes('ho_so') && (
          <button
            onClick={() => setAdminTab('ho_so')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              adminTab === 'ho_so' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Hồ sơ</span>
          </button>
        )}

        {allowedAdminTabs.includes('duyet_ho_so') && (
          <button
            onClick={() => setAdminTab('duyet_ho_so')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              adminTab === 'duyet_ho_so' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px]">Duyệt</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        )}

        {allowedAdminTabs.includes('danh_gia') && (
          <button
            onClick={() => setAdminTab('danh_gia')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
              adminTab === 'danh_gia' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">Đánh giá</span>
          </button>
        )}

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
