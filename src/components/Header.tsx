'use client';

// ==============================================================================
// HEADER: THANH ĐỈNH CHUẨN HCMUTE DESIGN SYSTEM (OKLCH, THEME TOGGLE, SEARCH)
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
} from 'lucide-react';
import DoanLogo from './DoanLogo';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { currentMember, members, setCurrentMemberId, notifications, tasks, setActiveTab, setSelectedTaskId } = useApp();
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Khởi tạo và đồng bộ Dark Mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
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
    const lower = q.toLowerCase();
    const matchedTasks = tasks
      .filter((t) => t.title.toLowerCase().includes(lower) || (t.description && t.description.toLowerCase().includes(lower)))
      .slice(0, 5);
    setSearchResults(matchedTasks);
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

  return (
    <header className="h-[var(--header-h)] bg-card border-b border-border px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs transition-colors">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <DoanLogo size={36} />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground leading-tight">ĐOÀN HCMUTE</span>
          <span className="text-[10px] text-primary font-semibold">BTV Đoàn trường</span>
        </div>
      </div>

      {/* Global Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md relative">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc, dự án, thành viên..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-muted/70 hover:bg-muted focus:bg-card text-foreground placeholder-muted-foreground text-xs pl-10 pr-4 py-2.5 rounded-full border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Quick Search Dropdown */}
        {isSearching && searchResults.length > 0 && (
          <div className="absolute top-12 left-0 w-full bg-card rounded-2xl shadow-lg border border-border p-2 z-50 animate-in fade-in">
            <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1">Công việc phù hợp</div>
            {searchResults.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTaskId(t.id);
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/30 flex items-center justify-between text-xs group"
              >
                <span className="font-semibold text-card-foreground group-hover:text-primary truncate">{t.title}</span>
                <span className="text-[10px] text-muted-foreground">Xem</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Area: Dark Mode Toggle, Notifications & Account */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Nút bật/tắt Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          title={isDarkMode ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          aria-label="Chuyển chế độ giao diện"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
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
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card rounded-2xl shadow-xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-card-foreground">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="text-sm font-bold text-foreground">Thông báo mới</h4>
                <button
                  onClick={() => setActiveTab('thong_bao')}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="divide-y divide-border mt-2 max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer">
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

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMemberDropdown(!showMemberDropdown)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted border border-border transition-all text-left bg-card"
          >
            <img
              src={currentMember.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentMember.full_name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-foreground leading-tight">
                {currentMember.full_name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {getRoleLabel(currentMember.role)}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Dropdown 9 thành viên BTV */}
          {showMemberDropdown && (
            <div className="absolute right-0 top-12 w-72 bg-card rounded-2xl shadow-xl border border-border p-2 z-50 animate-in fade-in duration-150 text-card-foreground">
              <div className="p-2 border-b border-border mb-1 bg-muted/50 rounded-xl">
                <div className="text-[11px] font-bold text-foreground">Chuyển tài khoản kiểm thử</div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
                  Chọn trong 9 thành viên BTV để kiểm tra phân quyền (Bí thư, Phó Bí thư, Chánh VP, Ủy viên).
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto scrollbar-thin space-y-0.5">
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
                        isCurrent ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/70 text-card-foreground'
                      }`}
                    >
                      <img
                        src={m.avatar_url}
                        alt={m.full_name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 truncate">
                        <div className="text-xs truncate font-medium">{m.full_name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{getRoleLabel(m.role)}</div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
