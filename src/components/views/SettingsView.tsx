'use client';

// ==============================================================================
// SETTINGS VIEW: CÀI ĐẶT HỆ THỐNG, XÁC THỰC GOOGLE OAUTH & SUPABASE REALTIME
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  UserCheck,
  Database,
  ShieldCheck,
  RefreshCw,
  Key,
  ExternalLink,
  Radio,
  CheckCircle2,
  LogIn,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  Palette,
  UserPlus,
  AlertTriangle,
  Clock,
  Calendar,
  Check,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole } from '@/lib/formatters';

export default function SettingsView() {
  const {
    currentMember,
    members,
    setCurrentMemberId,
    authUser,
    setIsAuthModalOpen,
    signOut,
    isRealtimeLive,
    isSupabaseConnected,
    refreshDataFromSupabase,
    updateMemberDelegation,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State Ủy quyền & Bàn giao nhiệm vụ
  const [busyFrom, setBusyFrom] = useState(currentMember.busy_from || '');
  const [busyTo, setBusyTo] = useState(currentMember.busy_to || '');
  const [busyReason, setBusyReason] = useState(currentMember.busy_reason || '');
  const [delegateToId, setDelegateToId] = useState(currentMember.delegate_to_id || '');
  const [delegationFeedback, setDelegationFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    setBusyFrom(currentMember.busy_from || '');
    setBusyTo(currentMember.busy_to || '');
    setBusyReason(currentMember.busy_reason || '');
    setDelegateToId(currentMember.delegate_to_id || '');
  }, [currentMember]);

  const handleSaveDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberDelegation(currentMember.id, {
      busy_from: busyFrom || null,
      busy_to: busyTo || null,
      busy_reason: busyReason || null,
      delegate_to_id: delegateToId || null,
    });
    setDelegationFeedback('Đã cập nhật thông tin ủy quyền & bàn giao thành công!');
    setTimeout(() => setDelegationFeedback(null), 4000);
  };

  const handleCancelDelegation = () => {
    setBusyFrom('');
    setBusyTo('');
    setBusyReason('');
    setDelegateToId('');
    updateMemberDelegation(currentMember.id, {
      busy_from: null,
      busy_to: null,
      busy_reason: null,
      delegate_to_id: null,
    });
    setDelegationFeedback('Đã hủy bỏ trạng thái ủy quyền.');
    setTimeout(() => setDelegationFeedback(null), 4000);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('hcmute_theme') === 'dark'
      );
    }
  }, []);

  const handleToggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hcmute_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hcmute_theme', 'light');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await refreshDataFromSupabase();
      setSyncMessage('Đã đồng bộ thành công dữ liệu mới nhất từ Supabase!');
    } catch (e) {
      setSyncMessage('Có lỗi khi đồng bộ từ Supabase.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleResetData = () => {
    if (confirm('Đồng chí có chắc chắn muốn khôi phục dữ liệu ban đầu không? Thao tác này sẽ xóa toàn bộ bộ nhớ tạm trên trình duyệt và đồng bộ lại nguyên bản từ máy chủ Supabase.')) {
      localStorage.removeItem('btv_tasks');
      localStorage.removeItem('btv_docs');
      localStorage.removeItem('btv_members');
      localStorage.removeItem('btv_campaigns');
      localStorage.removeItem('btv_chat_messages');
      localStorage.removeItem('btv_comments');
      localStorage.removeItem('btv_activity_logs');
      localStorage.removeItem('btv_role_permissions');
      localStorage.removeItem('btv_weekly_checkins');
      localStorage.removeItem('btv_deleted_member_ids');
      localStorage.removeItem('btv_deleted_task_ids');
      localStorage.removeItem('btv_deleted_campaign_ids');
      localStorage.removeItem('btv_deleted_doc_ids');
      localStorage.removeItem('btv_current_member_id');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Cài đặt Hệ thống</h2>
        <p className="text-xs text-muted-foreground">
          Cấu hình môi trường, xác thực Google OAuth và kết nối Supabase Realtime
        </p>
      </div>

      {/* 1. XÁC THỰC GOOGLE OAUTH */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Xác thực Google OAuth (Supabase Auth)</h3>
              <p className="text-[11px] text-muted-foreground">Đăng nhập tài khoản Google và bảo mật phân quyền</p>
            </div>
          </div>

          {authUser ? (
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất Google</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập với Google</span>
            </button>
          )}
        </div>

        {authUser ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {authUser.user_metadata?.avatar_url ? (
                <img
                  src={authUser.user_metadata.avatar_url}
                  alt={authUser.email}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">
                  {authUser.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">
                    {authUser.user_metadata?.full_name || authUser.email}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p className="text-[11px] text-muted-foreground">{authUser.email}</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Đã xác thực
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
            Chưa có tài khoản Google nào được đăng nhập. Đồng chí có thể bấm nút <b>Đăng nhập với Google</b> ở trên để liên kết tài khoản và đồng bộ công việc.
          </div>
        )}

        <div className="text-[11px] text-muted-foreground bg-muted/40 p-3.5 rounded-2xl border border-border space-y-1.5">
          <div className="font-bold text-foreground">⚙️ Hướng dẫn bật Google OAuth trên Supabase Dashboard:</div>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Vào Supabase Dashboard của dự án: <b>Authentication → Providers → Google</b>.</li>
            <li>Bật <b>Enable Google provider</b> và dán <b>Client ID</b> & <b>Client Secret</b> từ Google Cloud Console.</li>
            <li>Thêm Redirect URL vào Google Cloud Console: <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono text-[10px]">https://bejwlwyminqdhvriukfm.supabase.co/auth/v1/callback</code>.</li>
          </ol>
        </div>
      </div>

      {/* 2. CHẾ ĐỘ GIAO DIỆN & DESIGN SYSTEM (OKLCH) */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Giao diện & Hệ thống Thiết kế (HCMUTE OKLCH)</h3>
              <p className="text-[11px] text-muted-foreground">Tùy biến chế độ Sáng / Tối và đồng bộ trực tiếp với v2DESIGN-GUIDE</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleToggleTheme(false)}
            className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
              !isDarkMode
                ? 'border-primary bg-primary/10 font-bold text-primary shadow-xs'
                : 'border-border hover:bg-muted text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">Giao diện Sáng (Light)</div>
                <div className="text-[10px] text-muted-foreground">Phông nền chuẩn HCMUTE Navy</div>
              </div>
            </div>
            {!isDarkMode && <CheckCircle2 className="w-4 h-4 text-primary" />}
          </button>

          <button
            onClick={() => handleToggleTheme(true)}
            className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
              isDarkMode
                ? 'border-primary bg-primary/10 font-bold text-primary shadow-xs'
                : 'border-border hover:bg-muted text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">Giao diện Tối (Dark)</div>
                <div className="text-[10px] text-muted-foreground">Độ tương phản cao, dịu mắt ban đêm</div>
              </div>
            </div>
            {isDarkMode && <CheckCircle2 className="w-4 h-4 text-primary" />}
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-relaxed flex items-center justify-between">
          <span>Chuẩn màu: <b>OKLCH (Perceptually Uniform)</b> • Tỉ lệ khung: <b>80rem (1280px)</b></span>
          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono text-[10px] font-bold">
            v2.0 Design System
          </span>
        </div>
      </div>

      {/* 3. ỦY QUYỀN TẠM THỜI & BÀN GIAO NHIỆM VỤ */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Ủy quyền tạm thời & Bàn giao nhiệm vụ</h3>
              <p className="text-[11px] text-muted-foreground">Tự động gợi ý chuyển giao công việc khi đồng chí bận học tập, công tác hoặc nghỉ phép</p>
            </div>
          </div>

          {currentMember.busy_from && currentMember.busy_to && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Đang bật ủy quyền</span>
            </span>
          )}
        </div>

        {delegationFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{delegationFeedback}</span>
          </div>
        )}

        {currentMember.busy_from && currentMember.busy_to && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Trạng thái ủy quyền đang có hiệu lực</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Các văn bản đến và công việc mới được phân công cho đồng chí từ <b>{currentMember.busy_from}</b> đến <b>{currentMember.busy_to}</b> sẽ tự động cảnh báo và đề xuất bàn giao xử lý cho <b>{members.find((m) => m.id === currentMember.delegate_to_id)?.full_name || 'Đồng chí BTV'}</b>.
            </p>
          </div>
        )}

        <form onSubmit={handleSaveDelegation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Thời gian bắt đầu vắng / bận
              </label>
              <input
                type="date"
                value={busyFrom}
                onChange={(e) => setBusyFrom(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Thời gian kết thúc (Dự kiến)
              </label>
              <input
                type="date"
                value={busyTo}
                onChange={(e) => setBusyTo(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Lý do bận công tác / vắng mặt
            </label>
            <input
              type="text"
              placeholder="VD: Tham gia học tập cao học, Đi công tác cơ sở, Nghỉ phép..."
              value={busyReason}
              onChange={(e) => setBusyReason(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Chỉ định đồng chí BTV nhận bàn giao & xử lý thay
            </label>
            <select
              value={delegateToId}
              onChange={(e) => setDelegateToId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chưa chọn người nhận bàn giao --</option>
              {members
                .filter((m) => m.id !== currentMember.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({formatRole(m.role)})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            {(currentMember.busy_from || currentMember.delegate_to_id) && (
              <button
                type="button"
                onClick={handleCancelDelegation}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
              >
                Hủy ủy quyền
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Lưu cấu hình ủy quyền
            </button>
          </div>
        </form>
      </div>

      {/* 4. CƠ SỞ DỮ LIỆU & REALTIME SUPABASE */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Cơ sở dữ liệu Supabase & Realtime</h3>
              <p className="text-[11px] text-muted-foreground">Lưu trữ vĩnh viễn và đồng bộ WebSocket đa thiết bị</p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ Cloud'}</span>
          </button>
        </div>

        {syncMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Trạng thái Cơ sở dữ liệu</span>
            <div className="font-bold flex items-center gap-2 text-foreground">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Supabase Cloud (Active)' : 'Chế độ Demo Nội bộ'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Kênh Realtime WebSocket</span>
            <div className="font-bold flex items-center gap-2 text-foreground">
              <span className={`w-2 h-2 rounded-full ${isRealtimeLive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
              <span>{isRealtimeLive ? 'Đang kết nối Realtime Live' : 'Đang thiết lập WebSocket'}</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-3.5 rounded-2xl border border-border">
          💡 <b>Kích hoạt Realtime trên Supabase:</b> Chạy file SQL migration tại <code className="text-primary font-semibold">supabase/migrations/20260921000001_enable_realtime_and_oauth.sql</code> trong SQL Editor của Supabase để đảm bảo Supabase tự động phát tín hiệu Realtime khi có công việc hoặc tin nhắn mới!
        </div>
      </div>

      {/* 4. TÍCH HỢP BOT 2 CHIỀU TELEGRAM & ZALO */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Kết nối Bot 2 chiều (Telegram / Zalo)</h3>
            <p className="text-[11px] text-muted-foreground">
              Nhận thông báo công việc tức thời và nộp báo cáo kết quả nhanh từ điện thoại
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hướng dẫn & Cú pháp */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5">
              <span className="font-bold text-foreground block">Cú pháp liên kết Bot:</span>
              <div className="font-mono bg-card p-2 rounded-xl border border-border text-[11px] text-primary select-all">
                /start btv_{currentMember.id.substring(0, 8)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gửi mã trên đến <b>@HCMUTE_BTV_Bot</b> để kích hoạt nhận thông báo trên Telegram.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5">
              <span className="font-bold text-foreground block">Lệnh nộp báo cáo kết quả nhanh:</span>
              <div className="font-mono bg-card p-2 rounded-xl border border-border text-[11px] text-emerald-600 dark:text-emerald-400 select-all">
                /nop &lt;mã_công_việc&gt; &lt;link_báo_cáo_hoặc_ghi_chú&gt;
              </div>
              <p className="text-[11px] text-muted-foreground">
                Ví dụ: <code className="text-primary font-bold">/nop a1111111 https://drive.google.com/...</code>
              </p>
            </div>
          </div>

          {/* Khung mã QR */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col items-center justify-center text-center space-y-2.5">
            <div className="w-36 h-36 bg-white p-2.5 rounded-2xl shadow-xs border border-border flex items-center justify-center">
              {/* Mã QR hình ảnh hoặc SVG tượng trưng */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://t.me/HCMUTE_BTV_Bot?start=btv_${currentMember.id.substring(0, 8)}`}
                alt="QR Code Telegram Bot"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] font-bold text-foreground">
              Quét mã để mở Telegram Bot
            </span>
            <span className="text-[10px] text-muted-foreground">
              Đồng chí: {currentMember.full_name} ({currentMember.telegram_chat_id ? 'Đã liên kết' : 'Chưa liên kết'})
            </span>
          </div>
        </div>
      </div>

      {/* 5. BỘ CHUYỂN ĐỔI 9 THÀNH VIÊN BTV KIỂM THỬ */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <UserCheck className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Chuyển đổi Vai trò BTV (Kiểm thử phân quyền 4 vai trò)</h3>
            <p className="text-[11px] text-muted-foreground">Bí thư, Phó Bí thư, Chánh văn phòng, Ủy viên BTV</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Đang thao tác với tư cách: <b className="text-primary">{currentMember.full_name}</b> ({formatRole(currentMember.role)})
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {members.map((m) => {
            const isSelected = m.id === currentMember.id;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentMemberId(m.id)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 font-semibold text-primary shadow-xs'
                    : 'border-border hover:bg-muted text-foreground'
                }`}
              >
                <AvatarWithFallback
                  src={m.avatar_url}
                  name={m.full_name}
                  className="w-8 h-8 rounded-full shrink-0 ring-1 ring-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate font-bold">{m.full_name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {formatRole(m.role)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. KHÔI PHỤC DỮ LIỆU */}
      <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-destructive">Khôi phục cài đặt & Dữ liệu bộ nhớ tạm</h4>
          <p className="text-[11px] text-muted-foreground">Xóa cache trình duyệt và nạp lại dữ liệu chuẩn từ hệ thống</p>
        </div>
        <button
          onClick={handleResetData}
          className="px-3.5 py-1.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold transition-colors"
        >
          Khôi phục
        </button>
      </div>
    </div>
  );
}
