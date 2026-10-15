'use client';

// ==============================================================================
// TÀI KHOẢN CỦA TÔI (MY ACCOUNT VIEW - SCREEN 7 MOCKUP)
// ==============================================================================

import React, { useState, useRef } from 'react';
import { useApp, ADMIN_TAB_DEFINITIONS } from '@/context/AppContext';
import {
  User,
  Shield,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  Laptop,
  Smartphone,
  AlertCircle,
  ExternalLink,
  LogOut,
  Camera,
  KeyRound,
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin Toàn trường',
  admin_don_vi: 'Admin Quản trị Đơn vị',
  lanh_dao: 'Lãnh đạo',
  nguoi_duyet: 'Người duyệt',
  quan_ly_don_vi: 'Quản lý đơn vị',
  can_bo_ca_nhan: 'Cán bộ cá nhân',
};

export default function MyAccountView() {
  const { currentUser, setUserTab, signOut, changePassword, updateCurrentUserAvatar, addAuditLog, canAccessAdminPortal, allowedAdminTabs } = useApp();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'dang_nhap' | 'bao_mat' | 'thong_bao'>('bao_mat');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  // Notification toggles
  const [notifPreferences, setNotifPreferences] = useState({
    general: { email: true, inApp: true },
    decisions: { email: true, inApp: true },
    calendar: { email: true, inApp: false },
    evaluations: { email: true, inApp: true },
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCurrentUserAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!newPassword || !confirmPassword) {
      setPwError('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    if (!res.success) {
      setPwError(res.message);
      return;
    }

    addAuditLog({
      action: 'doi_mat_khau',
      action_label: 'Đổi mật khẩu đăng nhập',
      actor_name: currentUser.full_name,
      actor_code: currentUser.student_id,
      target_id: currentUser.id,
      target_name: currentUser.email,
      target_type: 'Tài khoản',
      description: `Người dùng ${currentUser.full_name} (${currentUser.email}) đã cập nhật mật khẩu đăng nhập mới.`,
    });

    setPwSuccess(res.message);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwSuccess(null), 5000);
  };

  const handleLogoutOtherDevice = () => {
    alert('Đã đăng xuất các phiên thiết bị phụ thành công.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Tài khoản của tôi</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý thông tin đăng nhập, đổi mật khẩu bảo mật và cấu hình kênh nhận thông báo.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Tài khoản: <b>{currentUser.email}</b>
        </span>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border">
        {[
          { id: 'dang_nhap', label: 'Thông tin đăng nhập' },
          { id: 'bao_mat', label: 'Bảo mật & Đổi mật khẩu' },
          { id: 'thong_bao', label: 'Tùy chọn thông báo' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACCOUNT INFO + CHANGE PASSWORD */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Thông tin tài khoản */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Thông tin tài khoản
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative group">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 shadow-xs"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-black shadow-xs">
                    {currentUser.avatar_code}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-black text-foreground">{currentUser.full_name}</h4>
                <p className="text-xs text-muted-foreground font-semibold">
                  Mã cán bộ / MSSV: {currentUser.student_id || 'CB-HCMUTE'}
                </p>
                <p className="text-xs text-muted-foreground">Email: {currentUser.email}</p>
                {currentUser.username && (
                  <p className="text-xs text-muted-foreground">Username: @{currentUser.username}</p>
                )}
                {currentUser.roles.includes('admin') && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 text-[10px] font-bold border border-rose-500/20">
                    Quản trị viên hệ thống (Admin)
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Tài khoản liên kết với Google Workspace Nhà trường và cho phép đăng nhập bằng cả Google lẫn Mật khẩu cá nhân.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setUserTab('ho_so')}
                className="px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Xem hồ sơ</span>
                <ExternalLink className="h-3 w-3" />
              </button>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Đổi ảnh đại diện</span>
              </button>
              <button
                onClick={async () => {
                  await signOut();
                }}
                className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-rose-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Card: Đổi mật khẩu */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-primary" />
                Đổi mật khẩu đăng nhập
              </h3>
              <span className="text-[11px] text-emerald-600 font-semibold">Đang kích hoạt</span>
            </div>

            {pwSuccess && (
              <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{pwSuccess}</span>
              </div>
            )}

            {pwError && (
              <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs font-bold text-foreground">
                  Mật khẩu hiện tại <span className="text-muted-foreground font-normal">(Bỏ trống nếu mới đăng nhập bằng Google lần đầu)</span>
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground pr-10 focus:border-primary focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-foreground">Mật khẩu mới *</label>
                <div className="relative mt-1.5">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground pr-10 focus:border-primary focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ít nhất 6 ký tự. Mật khẩu mới sẽ được lưu trữ để đăng nhập trực tiếp tại màn hình Đăng nhập.
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-bold text-foreground">Xác nhận mật khẩu mới *</label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Lưu mật khẩu mới
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PERMISSIONS + LOGGED IN DEVICES + NOTIF PREFERENCES */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Quyền được cấp */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Quyền được cấp trên hệ thống
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium w-20 shrink-0 mt-0.5">Vai trò:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentUser.roles.map((r) => (
                    <span
                      key={r}
                      className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${
                        r === 'admin'
                          ? 'bg-rose-500/10 text-rose-700 border-rose-500/20'
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {ROLE_LABELS[r] || r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium w-24 shrink-0">Phạm vi:</span>
                <strong className="text-foreground">
                  {canAccessAdminPortal ? (currentUser.scope_unit_name || 'Toàn trường') : 'Cổng cá nhân (Không có quyền Quản trị)'}
                </strong>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium w-24 shrink-0 mt-0.5">Menu Quản trị:</span>
                {canAccessAdminPortal ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {allowedAdminTabs.map((tabId) => {
                      const def = ADMIN_TAB_DEFINITIONS.find((t) => t.id === tabId);
                      return (
                        <span
                          key={tabId}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold"
                        >
                          {def ? def.label : tabId}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-[11px]">
                    Chưa được cấp quyền truy cập Trang quản trị
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2 pt-1 border-t border-border">
                <span className="text-muted-foreground font-medium w-24 shrink-0">Ghi chú:</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Chỉ tài khoản được Quản trị viên Tối cao (<b>thanlx@hcmute.edu.vn</b>) cấp quyền mới nhìn thấy nút &quot;Trang quản trị&quot; và truy cập đúng các phân hệ được giao.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Thiết bị đang đăng nhập */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Thiết bị đang đăng nhập
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 px-2">Thiết bị / Trình duyệt</th>
                    <th className="py-2.5 px-2">Hệ điều hành</th>
                    <th className="py-2.5 px-2">Thời gian đăng nhập</th>
                    <th className="py-2.5 px-2">Trạng thái</th>
                    <th className="py-2.5 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-2 font-semibold text-foreground flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-emerald-600" />
                      <span>Chrome 118.0</span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">Windows 11</td>
                    <td className="py-3 px-2 text-muted-foreground">13/10/2026 08:24</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                        Phiên hiện tại
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">—</td>
                  </tr>

                  <tr>
                    <td className="py-3 px-2 font-semibold text-foreground flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <span>Safari (iPhone)</span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">iOS 17</td>
                    <td className="py-3 px-2 text-muted-foreground">12/10/2026 21:10</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                        Phiên khác
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={handleLogoutOtherDevice}
                        className="px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive text-[11px] font-bold hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Tùy chọn thông báo */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Tùy chọn thông báo
            </h3>
            <p className="text-[11px] text-muted-foreground">Chọn các kênh nhận thông báo từ hệ thống.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 px-2">Loại thông báo</th>
                    <th className="py-2.5 px-2 text-center w-24">Email</th>
                    <th className="py-2.5 px-2 text-center w-28">Trong ứng dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { key: 'general', label: 'Thông báo chung của hệ thống' },
                    { key: 'decisions', label: 'Thông báo về quyết định, phân công' },
                    { key: 'calendar', label: 'Nhắc nhở lịch họp, lịch công tác' },
                    { key: 'evaluations', label: 'Cập nhật đánh giá, nhận xét' },
                  ].map((row) => {
                    const currentPref = (notifPreferences as any)[row.key];
                    return (
                      <tr key={row.key} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 font-medium text-foreground">{row.label}</td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={currentPref.email}
                            onChange={(e) =>
                              setNotifPreferences((prev) => ({
                                ...prev,
                                [row.key]: { ...currentPref, email: e.target.checked },
                              }))
                            }
                            className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={currentPref.inApp}
                            onChange={(e) =>
                              setNotifPreferences((prev) => ({
                                ...prev,
                                [row.key]: { ...currentPref, inApp: e.target.checked },
                              }))
                            }
                            className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
