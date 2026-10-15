'use client';

// ==============================================================================
// HEADER CHÍNH: QUẢN LÝ CÁN BỘ ĐOÀN - HỘI (DESKTOP & MOBILE RESPONSIVE)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  Search,
  ChevronDown,
  ExternalLink,
  Shield,
  User,
  Building2,
  CheckCircle2,
  Menu,
  Sparkles,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { UserRole } from '@/types';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenTestModal?: () => void;
}

export default function Header({ onOpenMobileMenu, onOpenTestModal }: HeaderProps) {
  const {
    portalMode,
    togglePortalMode,
    currentUser,
    switchUserRole,
    allUnits,
    updateUserScope,
    notifications,
    setUserTab,
    setAdminTab,
    signOut,
    canAccessAdminPortal,
    isSuperAdmin,
    isGlobalScope,
    accessibleUnitIds,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScopeMenuOpen, setIsScopeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const roleLabels: Record<UserRole, string> = {
    can_bo_ca_nhan: 'Cán bộ cá nhân',
    quan_ly_don_vi: 'Cán bộ Quản lý đơn vị',
    admin_don_vi: 'Admin Quản trị Đơn vị',
    nguoi_duyet: 'Người duyệt nghiệp vụ',
    lanh_dao: 'Lãnh đạo / Xem báo cáo',
    admin: 'Quản trị hệ thống (Toàn trường)',
  };

  // Danh sách vai trò thực tế mà tài khoản được cấp
  const assignedRoles: UserRole[] = isSuperAdmin
    ? ['admin', 'admin_don_vi', 'lanh_dao', 'nguoi_duyet', 'quan_ly_don_vi', 'can_bo_ca_nhan']
    : Array.isArray(currentUser.roles) && currentUser.roles.length > 0
    ? currentUser.roles
    : ['can_bo_ca_nhan'];

  // Các đơn vị được phép chọn trong bộ lọc phạm vi
  const selectableUnits = isGlobalScope
    ? allUnits
    : allUnits.filter((u) => accessibleUnitIds.includes(u.id));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 sm:px-6 shadow-xs">
      {/* LEFT: Mobile Toggle & Brand/Scope */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {portalMode === 'admin' && canAccessAdminPortal ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
              {isGlobalScope ? 'Quản trị /' : 'Admin Đơn vị /'}
            </span>
            {/* Scope selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsScopeMenuOpen(!isScopeMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>{currentUser.scope_unit_name || (isGlobalScope ? 'Toàn trường' : 'Đơn vị phụ trách')}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {isScopeMenuOpen && (
                <div className="absolute left-0 mt-1 w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {isGlobalScope ? 'Phạm vi quản lý (Toàn trường)' : 'Đơn vị được phân quyền quản lý'}
                  </div>

                  {isGlobalScope ? (
                    <button
                      onClick={() => {
                        updateUserScope('all', 'Toàn trường');
                        setIsScopeMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        !currentUser.scope_unit_id || currentUser.scope_unit_id === 'all' || currentUser.scope_unit_id === 'ALL'
                          ? 'text-primary font-bold bg-primary/10'
                          : 'text-foreground'
                      }`}
                    >
                      <span>Toàn trường (Tất cả đơn vị)</span>
                      {(!currentUser.scope_unit_id || currentUser.scope_unit_id === 'all' || currentUser.scope_unit_id === 'ALL') && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  ) : (
                    selectableUnits.length > 1 && (
                      <button
                        onClick={() => {
                          updateUserScope('managed_all', `Tất cả đơn vị phụ trách (${selectableUnits.length})`);
                          setIsScopeMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                          currentUser.scope_unit_id === 'managed_all'
                            ? 'text-primary font-bold bg-primary/10'
                            : 'text-foreground'
                        }`}
                      >
                        <span>Tất cả đơn vị phụ trách ({selectableUnits.length})</span>
                        {currentUser.scope_unit_id === 'managed_all' && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    )
                  )}

                  {selectableUnits.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => {
                        updateUserScope(unit.id, unit.name);
                        setIsScopeMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        currentUser.scope_unit_id === unit.id
                          ? 'text-primary font-bold bg-primary/10'
                          : 'text-foreground'
                      }`}
                    >
                      <span className="truncate">{unit.name}</span>
                      {currentUser.scope_unit_id === unit.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Hệ thống Quản lý Cán bộ Đoàn – Hội</span>
          </div>
        )}
      </div>

      {/* CENTER: Quick Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              portalMode === 'admin' && canAccessAdminPortal
                ? 'Tìm kiếm cán bộ, đơn vị, quyết định...'
                : 'Tìm kiếm tổ chức, cán bộ...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* RIGHT: Notifications, User, Role Switcher, Portal Switch */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Test Scenario Runner Button - Chỉ dành cho Super Admin */}
        {isSuperAdmin && onOpenTestModal && (
          <button
            onClick={onOpenTestModal}
            className="hidden xl:flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Kiểm tra 12 tình huống nghiệm thu chuẩn theo Mục 11"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>12 Tình huống nghiệm thu</span>
          </button>
        )}

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => {
            if (portalMode === 'admin' && canAccessAdminPortal) setAdminTab('thong_bao');
            else setUserTab('thong_bao');
          }}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 rounded-xl p-1 sm:px-2 sm:py-1 hover:bg-muted transition-colors cursor-pointer"
          >
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/30"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                {currentUser.avatar_code}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight">{currentUser.full_name}</span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {roleLabels[currentUser.current_role] || 'Cán bộ cá nhân'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-68 rounded-2xl border border-border bg-card p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {currentUser.avatar_code}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground truncate">{currentUser.full_name}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                  <p className="text-[10px] text-primary font-semibold">
                    MSSV: {currentUser.student_id || 'CB-HCMUTE'}
                  </p>
                </div>
              </div>

              {/* Chỉ hiển thị các vai trò thực sự được cấp cho tài khoản */}
              <div className="py-2.5 border-b border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Vai trò được cấp ({assignedRoles.length})
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                    {isGlobalScope ? 'Toàn trường' : currentUser.scope_unit_name || 'Đơn vị'}
                  </span>
                </div>
                <div className="space-y-1">
                  {assignedRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchUserRole(role);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between hover:bg-muted transition-colors cursor-pointer ${
                        currentUser.current_role === role
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground'
                      }`}
                    >
                      <span>{roleLabels[role] || role}</span>
                      {currentUser.current_role === role && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <button
                  onClick={() => {
                    if (portalMode === 'admin') togglePortalMode();
                    setUserTab('tai_khoan');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Thông tin tài khoản & đổi mật khẩu</span>
                </button>
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await signOut();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Portal Switch Button: CHỈ HIỂN THỊ KHI ĐƯỢC CẤP QUYỀN TRUY CẬP TRANG QUẢN TRỊ */}
        {canAccessAdminPortal && (
          <button
            onClick={togglePortalMode}
            className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary px-3 py-1.5 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{portalMode === 'user' ? 'Trang quản trị' : 'Trang người dùng'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
