'use client';

// ==============================================================================
// MODAL XÁC THỰC GOOGLE OAUTH - HỆ THỐNG QUẢN LÝ BTV ĐOÀN TRƯỜNG HCMUTE
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, ShieldCheck, LogIn, LogOut, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import DoanLogo from '../DoanLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { authUser, currentMember, members, setCurrentMemberId, signInWithGoogle, signOut, isSupabaseConnected } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi kết nối Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <DoanLogo size={36} />
            <div>
              <h3 className="text-sm font-bold text-foreground">Xác thực Tài khoản BTV</h3>
              <p className="text-[11px] text-muted-foreground">Đăng nhập Google OAuth & Phân quyền</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-6 space-y-5">
          {/* Trạng thái hiện tại */}
          {authUser ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-3">
                {authUser.user_metadata?.avatar_url ? (
                  <img
                    src={authUser.user_metadata.avatar_url}
                    alt={authUser.email || ''}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">
                    {authUser.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground truncate">
                      {authUser.user_metadata?.full_name || authUser.email}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{authUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    Đã xác thực Google
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500/20 text-xs">
                <span className="text-[11px] text-muted-foreground">Hồ sơ BTV đang gắn kết: </span>
                <b className="text-primary">{currentMember.full_name}</b> ({currentMember.role})
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-foreground">Đăng nhập tài khoản Google</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Sử dụng tài khoản Google để xác thực danh tính và đồng bộ công việc trong Ban Thường vụ Đoàn trường HCMUTE.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <b>Thông báo xác thực:</b> {errorMsg}
                <div className="text-[10px] text-muted-foreground mt-1">
                  💡 Nếu Supabase chưa cấu hình Google Client ID, đồng chí hãy vào Supabase Dashboard: <b>Authentication → Providers → Google</b> để bật.
                </div>
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="space-y-3">
            {authUser ? (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border border-border hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4 text-destructive" />
                <span>Đăng xuất tài khoản Google</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
              >
                {/* Google Logo SVG */}
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
                <span>{loading ? 'Đang chuyển hướng Google...' : 'Đăng nhập với Google'}</span>
              </button>
            )}

            {/* Chuyển nhanh vai trò trong 9 BTV */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-foreground">Liên kết / Đổi vai trò kiểm thử</span>
                <span className="text-[10px] text-primary font-medium">9 Đồng chí BTV</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin p-1">
                {members.map((m) => {
                  const isCurrent = m.id === currentMember.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentMemberId(m.id);
                        onClose();
                      }}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isCurrent
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border hover:bg-muted text-card-foreground'
                      }`}
                    >
                      <img src={m.avatar_url} alt={m.full_name} className="w-7 h-7 rounded-full mx-auto object-cover" />
                      <span className="text-[10px] block truncate mt-1">{m.full_name.split(' ').slice(-1)[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isSupabaseConnected ? 'Supabase Realtime Live' : 'Chế độ Demo Nội bộ'}</span>
          </span>
          <button onClick={onClose} className="font-semibold text-primary hover:underline">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
