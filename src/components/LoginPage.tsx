'use client';

// ==============================================================================
// TRANG ĐĂNG NHẬP CHUYÊN BIỆT & AUTH GATE - HỆ THỐNG QUẢN LÝ ĐOÀN TRƯỜNG HCMUTE
// Bảo mật cấp cao, Google Workspace OAuth & Phân quyền Quản trị viên
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import DoanLogo from './DoanLogo';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  AlertTriangle,
  LogIn,
  KeyRound,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, loginAsSuperAdminDev, isSupabaseConnected } = useApp();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLoginError(null);
    try {
      const res = await signInWithGoogle();
      if (res && res.error) {
        setLoginError(res.error);
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Có lỗi xảy ra khi xác thực qua Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Brand Header Banner */}
      <div className="brand-banner shadow-sm" aria-label="Đoàn trường HCMUTE — Tuổi trẻ hôm nay, kiến tạo ngày mai">
        <img
          src="/images/header-brand.png"
          alt="Đoàn trường HCMUTE — Tuổi trẻ hôm nay, kiến tạo ngày mai"
          width={1536}
          height={92}
          className="brand-banner-image"
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 max-w-xl mx-auto w-full">
        {/* Card Trung tâm */}
        <div className="w-full bg-card rounded-3xl border border-border shadow-2xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Header & Tiêu đề hệ thống */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600/20 via-primary/20 to-blue-600/20 rounded-full blur-md" />
              <DoanLogo size={72} className="relative drop-shadow-md" />
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                CỔNG XÁC THỰC BẢO MẬT NỘI BỘ
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase">
                Quản lý Cán bộ Đoàn - Hội
              </h1>
              <p className="text-sm font-bold text-primary">
                TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP. HỒ CHÍ MINH
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto pt-1 leading-relaxed">
                Vui lòng đăng nhập bằng tài khoản Google để truy cập dữ liệu và hệ thống làm việc nội bộ của Đoàn trường.
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 max-w-lg mx-auto">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><b>Lỗi đăng nhập:</b> {loginError}</span>
            </div>
          )}

          {/* Khối 1: Đăng nhập Google Workspace Trường */}
          <div className="w-full space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              {/* Google Logo SVG */}
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isGoogleLoading ? 'Đang kết nối xác thực Google...' : 'Đăng nhập bằng tài khoản Google (@hcmute.edu.vn)'}</span>
            </button>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/60 border border-border/80 text-[11px] text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Tất cả cá nhân khi đăng nhập Google thành công sẽ vào được hệ thống. Tài khoản <strong className="text-foreground">thanlx@hcmute.edu.vn</strong> được cấp quyền <strong>Quản trị viên tối cao (Super Admin)</strong> để phân quyền và quản lý danh sách Ban Quản trị.
              </p>
            </div>
          </div>

          {/* Đường phân cách */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="shrink-0 mx-4 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quyền Quản trị viên Cấp cao
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Khối 2: Đăng nhập nhanh cho Super Admin Lê Xuân Thân */}
          <div className="space-y-3">
            <button
              onClick={loginAsSuperAdminDev}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-foreground transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  XT
                </div>
                <div>
                  <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Thầy Lê Xuân Thân</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 text-[10px] font-bold border border-rose-500/20">
                      Super Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    thanlx@hcmute.edu.vn (Bí thư Đoàn trường)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-all">
                <span>Vào ngay</span>
                <LogIn className="w-4 h-4" />
              </div>
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              Bấm để kích hoạt phiên làm việc Quản trị viên cấp cao của Thầy Lê Xuân Thân.
            </p>
          </div>

          {/* Footer thông tin bảo mật */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Máy chủ Supabase Realtime sẵn sàng' : 'Chế độ Cục bộ (Local Active)'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Bảo mật Đoàn trường
              </span>
              <span>•</span>
              <span>Phiên bản 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
