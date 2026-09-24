'use client';

// ==============================================================================
// HEADER: THANH ĐỈNH CHUẨN HCMUTE DESIGN SYSTEM (GOOGLE AUTH & REALTIME BADGE)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Bell,
  CheckCircle2,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Radio,
  Heart,
} from 'lucide-react';
import DoanLogo from './DoanLogo';
import AuthModal from './modals/AuthModal';
import AvatarWithFallback from './AvatarWithFallback';
import { cn } from '@/lib/utils';
import { matchesVietnameseSearch } from '@/lib/searchUtils';
import { formatRole } from '@/lib/formatters';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const {
    currentMember,
    members,
    campaigns,
    setCurrentMemberId,
    notifications,
    tasks,
    activeTab,
    setActiveTab,
    setSelectedTaskId,
    authUser,
    signOut,
    logout,
    weeklyCheckins,
    setIsWeeklyCheckinModalOpen,
    isRealtimeLive,
    isSupabaseConnected,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeekNumber = Math.ceil(
    (((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7
  );
  const hasCheckedInThisWeek = (weeklyCheckins || []).some(
    (c) => c.member_id === currentMember.id && c.week_number === currentWeekNumber && c.year === now.getFullYear()
  );

  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; title: string; subtitle: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Khởi tạo và đồng bộ Dark Mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('hcmute_theme') === 'dark';
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hcmute_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hcmute_theme', 'light');
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);

    const matchedTasks = tasks
      .filter(
        (t) =>
          matchesVietnameseSearch(t.title, q) ||
          matchesVietnameseSearch(t.description || '', q)
      )
      .slice(0, 4)
      .map((t) => ({ type: 'task', id: t.id, title: t.title, subtitle: 'Công việc' }));

    const matchedCampaigns = campaigns
      .filter(
        (c) =>
          matchesVietnameseSearch(c.name, q) ||
          matchesVietnameseSearch(c.description || '', q)
      )
      .slice(0, 2)
      .map((c) => ({ type: 'campaign', id: c.id, title: c.name, subtitle: 'Mảng việc / Dự án' }));

    const matchedMembers = members
      .filter(
        (m) =>
          matchesVietnameseSearch(m.full_name, q) ||
          matchesVietnameseSearch(m.email, q) ||
          (m.alias && m.alias.some((a) => matchesVietnameseSearch(a, q)))
      )
      .slice(0, 3)
      .map((m) => ({ type: 'member', id: m.id, title: m.full_name, subtitle: formatRole(m.role) }));

    setSearchResults([...matchedTasks, ...matchedCampaigns, ...matchedMembers]);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'bi_thu':
        return 'Bí thư Đoàn trường';
      case 'pho_bi_thu':
        return 'Phó Bí thư Đoàn trường';
      case 'chanh_van_phong':
        return 'Chánh văn phòng';
      default:
        return 'Ủy viên BTV';
    }
  };

  const tabInfoMap: Record<string, { num: string; title: string }> = {
    trang_chu: { num: '01', title: 'Trang chủ – Tổng quan' },
    cong_viec: { num: '02', title: 'Quản lý công việc' },
    viec_cua_toi: { num: '03', title: 'Việc của tôi' },
    lich: { num: '04', title: 'Lịch làm việc' },
    du_an: { num: '05', title: 'Dự án / Chiến dịch' },
    van_ban_den: { num: '06', title: 'Văn bản đến' },
    dieu_phoi: { num: '07', title: 'Bảng điều phối' },
    chat: { num: '08', title: 'Chat nhóm BTV' },
    admin: { num: '09', title: 'Quản trị Admin' },
    thanh_vien: { num: '10', title: 'Thành viên BTV' },
    bao_cao: { num: '11', title: 'Báo cáo & Thống kê' },
    cai_dat: { num: '12', title: 'Cài đặt hệ thống' },
    thiet_ke: { num: '0', title: 'Hệ thống thiết kế (Design System)' },
    huong_dan_ios: { num: '13', title: 'Cài đặt iOS (PWA)' },
  };

  const currentTabInfo = tabInfoMap[activeTab] || { num: '01', title: 'Trang chủ – Tổng quan' };

  return (
    <>
      <header className="h-[var(--header-h)] bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border/80 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs transition-colors">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <DoanLogo size={34} />
          <div className="flex flex-col">
            <span className="text-xs font-black text-foreground leading-tight">ĐOÀN HCMUTE</span>
            <span className="text-[10px] text-primary font-bold">BTV Đoàn trường</span>
          </div>
        </div>

        {/* Tiêu đề trang kèm Numbered Pill Badge (Khớp 100% hình 02-dashboard-overview.png & tất cả màn hình) */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0B5CFF] text-white text-xs font-black shadow-xs">
            {currentTabInfo.num}
          </span>
          <h1 className="text-sm lg:text-base font-bold tracking-tight text-[#0A2558] dark:text-foreground">
            {currentTabInfo.title}
          </h1>
        </div>

        {/* Global Search Bar (Pill Shape khớp hình mẫu) */}
        <div className="hidden xl:flex flex-1 min-w-0 max-w-sm relative mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Tìm kiếm công việc, dự án, thành viên"
              onKeyDown={(event) => { if (event.key === 'Escape') setIsSearching(false); }}
              placeholder="Tìm công việc, dự án, thành viên..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-100/90 dark:bg-muted/70 hover:bg-white dark:hover:bg-muted focus:bg-white dark:focus:bg-card text-foreground placeholder-muted-foreground text-xs pl-10 pr-4 py-2 rounded-full border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Quick Search Dropdown */}
          {isSearching && (
            <div className="absolute top-12 left-0 w-full bg-card rounded-2xl shadow-lg border border-border p-2 z-50 animate-in fade-in">
              <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1">
                Công việc phù hợp
              </div>
              {searchResults.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground">Không tìm thấy kết quả phù hợp.</p>}
              {searchResults.map((t) => (
                <button
                  key={`${t.type}-${t.id}`}
                  onClick={() => {
                    if (t.type === 'task') setSelectedTaskId(t.id);
                    else setActiveTab(t.type === 'campaign' ? 'du_an' : 'thanh_vien');
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/30 flex items-center justify-between text-xs group"
                >
                  <span className="font-semibold text-card-foreground group-hover:text-primary truncate">
                    {t.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{t.subtitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: Realtime Indicator, Dark Mode, Notifications & Google Auth */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Huy hiệu Supabase Realtime */}
          <div
            className={cn(
              "hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all select-none",
              isRealtimeLive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : isSupabaseConnected
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/70 border-border text-muted-foreground"
            )}
            title={
              isRealtimeLive
                ? 'Đang kết nối Realtime WebSocket qua Supabase'
                : isSupabaseConnected
                ? 'Đã kết nối Supabase Cloud'
                : 'Chế độ Demo Nội bộ'
            }
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isRealtimeLive
                  ? "bg-emerald-500 animate-ping"
                  : isSupabaseConnected
                  ? "bg-primary"
                  : "bg-muted-foreground/60"
              )}
            />
            <span>{isRealtimeLive ? 'Realtime Live' : isSupabaseConnected ? 'Cloud Sync' : 'Local'}</span>
          </div>

          {/* Nút Nhiệt kế Tinh thần & Check-in Tuần (Chấm đỏ khi chưa check-in) */}
          <button
            onClick={() => setIsWeeklyCheckinModalOpen(true)}
            className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
            title="Nhiệt kế Tinh thần & Check-in Tuần BTV"
            aria-label="Nhiệt kế Tinh thần & Check-in Tuần"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            {!hasCheckedInThisWeek && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-card"></span>
              </span>
            )}
          </button>

          {/* Nút bật/tắt Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
            title={isDarkMode ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            aria-label="Chuyển chế độ giao diện"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Chuông thông báo */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-card">
                3
              </span>
            </button>

            {/* Drawer thông báo */}
            {showNotificationDrawer && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-card rounded-2xl shadow-xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-card-foreground">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-sm font-bold text-foreground">Thông báo mới</h4>
                  <button
                    onClick={() => {
                      setActiveTab('thong_bao');
                      setShowNotificationDrawer(false);
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="divide-y divide-border mt-2 max-h-72 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="py-2.5 px-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nút Đăng nhập Google (Nếu chưa đăng nhập) */}
          {!authUser && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card text-foreground hover:bg-muted border border-border shadow-2xs text-xs font-bold transition-all"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Đăng nhập Google</span>
            </button>
          )}

          {/* Role Switcher & Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted border border-border transition-all text-left bg-white dark:bg-card shadow-2xs"
            >
              <div className="relative">
                <AvatarWithFallback
                  name={currentMember.full_name}
                  src={authUser?.user_metadata?.avatar_url || currentMember.avatar_url}
                  size="sm"
                  className="w-8 h-8 rounded-full ring-1 ring-border"
                />
                {authUser && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-card"
                    title="Đã xác thực Google"
                  />
                )}
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[130px]">
                  {currentMember.full_name}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[130px]">
                  {getRoleLabel(currentMember.role)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {showMemberDropdown && (
              <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-24px)] bg-card rounded-2xl shadow-xl border border-border p-2 z-50 animate-in fade-in duration-150 text-card-foreground">
                {/* Trạng thái Google Account */}
                {authUser ? (
                  <div className="p-2.5 mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Google đã kết nối</span>
                      </div>
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowMemberDropdown(false);
                        }}
                        className="text-[10px] text-destructive hover:underline font-bold"
                      >
                        Đăng xuất
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{authUser.email}</p>
                  </div>
                ) : (
                  <div className="p-2.5 mb-2 rounded-xl bg-muted/60 border border-border">
                    <button
                      onClick={() => {
                        setShowMemberDropdown(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng nhập Google OAuth</span>
                    </button>
                  </div>
                )}

                <div className="p-2 border-b border-border mb-1 bg-muted/40 rounded-xl">
                  <div className="text-[11px] font-bold text-foreground">Chuyển vai trò BTV kiểm thử</div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                    Chọn 1 trong 9 đồng chí BTV để trải nghiệm phân quyền 4 vai trò.
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-0.5">
                  {members.map((m) => {
                    const isCurrent = m.id === currentMember.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setCurrentMemberId(m.id);
                          setShowMemberDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                          isCurrent
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-muted/70 text-card-foreground'
                        }`}
                      >
                        <img
                          src={m.avatar_url}
                          alt={m.full_name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 truncate">
                          <div className="text-xs truncate font-medium">{m.full_name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {getRoleLabel(m.role)}
                          </div>
                        </div>
                        {isCurrent && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Nút Đăng xuất hệ thống */}
                <div className="pt-2 mt-2 border-t border-border">
                  <button
                    onClick={async () => {
                      setShowMemberDropdown(false);
                      await logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất hệ thống BTV</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal đăng nhập Google OAuth */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
