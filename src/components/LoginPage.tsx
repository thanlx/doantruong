'use client';

// ==============================================================================
// TRANG ĐĂNG NHẬP CHUYÊN BIỆT & AUTH GATE - BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
// Bảo mật cấp cao, Google Workspace OAuth & Lựa chọn nhanh 9 đồng chí BTV
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import DoanLogo from './DoanLogo';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export default function LoginPage() {
  const { members, loginAsMember, signInWithGoogle, isSupabaseConnected } = useApp();
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'bi_thu':
        return { label: 'Bí thư Đoàn trường', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'pho_bi_thu':
        return { label: 'Phó Bí thư', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'chanh_van_phong':
        return { label: 'Chánh Văn phòng', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'Ủy viên BTV', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    }
  };

  const getDepartmentLabel = (dept?: string) => {
    switch (dept) {
      case 'to_chuc':
        return 'Mảng Tổ chức - Xây dựng Đoàn';
      case 'tuyen_giao':
        return 'Mảng Tuyên giáo - Đối ngoại';
      case 'phong_trao':
        return 'Mảng Phong trào - Tình nguyện';
      case 'kiem_tra':
        return 'Mảng Kiểm tra - Giám sát';
      case 'van_phong':
        return 'Bộ phận Văn phòng - Hành chính';
      default:
        return 'Ban Thường vụ Đoàn trường';
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

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 max-w-5xl mx-auto w-full">
        {/* Card Trung tâm */}
        <div className="w-full bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Header & Tiêu đề hệ thống */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600/20 via-primary/20 to-blue-600/20 rounded-full blur-md" />
              <DoanLogo size={68} className="relative drop-shadow-md" />
            </div>

            <div className="space-y-1 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                CỔNG BẢO MẬT ĐIỀU HÀNH NỘI BỘ
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight uppercase">
                Hệ thống Quản lý Điều hành Công việc
              </h1>
              <p className="text-sm font-semibold text-primary/90">
                BAN THƯỜNG VỤ ĐOÀN TRƯỜNG ĐH SƯ PHẠM KỸ THUẬT TP. HỒ CHÍ MINH
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto pt-1">
                Khu vực xác thực danh tính dành riêng cho các đồng chí Ủy viên Ban Thường vụ Đoàn trường HCMUTE.
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
          <div className="max-w-md mx-auto w-full space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-5 rounded-2xl bg-card hover:bg-muted text-foreground border border-border font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
            >
              {/* Google Logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>{isGoogleLoading ? 'Đang kết nối Google...' : 'Đăng nhập bằng tài khoản @hcmute.edu.vn'}</span>
            </button>
            <p className="text-[11px] text-center text-muted-foreground">
              Hệ thống tự động liên kết quyền hạn BTV thông qua tài khoản Google Workspace Nhà trường.
            </p>
          </div>

          {/* Đường phân cách */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="shrink-0 mx-4 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Hoặc Đăng nhập thử nghiệm nhanh (Dành cho 9 đồng chí BTV)
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Khối 2: 9 Đồng chí BTV truy cập nhanh */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Bấm chọn đồng chí tương ứng để vào giao diện làm việc với phân quyền chuẩn:</span>
              <span className="font-semibold text-primary">Nhiệm kỳ 2024 - 2027</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((member) => {
                const roleInfo = getRoleBadge(member.role);
                const isBusy = !!(member.busy_from && member.busy_to);
                return (
                  <button
                    key={member.id}
                    onClick={() => loginAsMember(member.id)}
                    className="p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/60 hover:border-primary/50 text-left transition-all duration-200 shadow-xs hover:shadow-md group flex items-start gap-3.5 cursor-pointer relative overflow-hidden"
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {member.full_name}
                        </h4>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {getDepartmentLabel(member.mang_phu_trach)}
                      </p>

                      {isBusy && (
                        <div className="pt-0.5">
                          <span className="text-[10px] inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-medium">
                            <Clock className="w-3 h-3 shrink-0" />
                            Đang bận thi (Ủy quyền thay)
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer thông tin bảo mật */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isSupabaseConnected ? 'Máy chủ Supabase Realtime đã sẵn sàng' : 'Chế độ Demo / Offline Nội bộ'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Mã hóa SSL 256-bit
              </span>
              <span>•</span>
              <span>Phiên bản v2.6.9 (Tháng 09/2026)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
