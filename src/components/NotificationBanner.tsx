'use client';

// ==============================================================================
// BANNER KÍCH HOẠT THÔNG BÁO ĐẨY & RUNG CHUÔNG TRÊN ĐIỆN THOẠI / PWA
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { BellRing, X, Volume2, CheckCircle2 } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermissionState,
  requestNotificationPermission,
} from '@/lib/pushNotifications';

export default function NotificationBanner() {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [justActivated, setJustActivated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isNotificationSupported()) {
      setIsDismissed(true);
      return;
    }

    const state = getNotificationPermissionState();
    setPermissionState(state);

    const dismissed = localStorage.getItem('btv_notif_banner_dismissed') === 'true';
    // Chỉ hiện nếu quyền là default (chưa bật) và chưa bị đóng
    if (state === 'default' && !dismissed) {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionState('granted');
      setJustActivated(true);
      setTimeout(() => {
        setIsDismissed(true);
      }, 4000);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('btv_notif_banner_dismissed', 'true');
    }
  };

  if (isDismissed && !justActivated) return null;

  if (justActivated) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl p-3 sm:p-3.5 mb-4 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs font-bold leading-tight">
            Đã bật thông báo thành công! Thiết bị sẽ rung và phát chuông khi có công văn, sự kiện và tin nhắn mới.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 sm:p-3.5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <BellRing className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
            Bật thông báo chuông & rung trên điện thoại
            <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            Nhận thông báo tức thì khi có <strong>công văn mới</strong>, <strong>sự kiện</strong>, <strong>tin nhắn nhóm chat BTV</strong> và <strong>nhiệm vụ</strong>.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
        <button
          onClick={handleEnable}
          className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer text-center"
        >
          Bật thông báo ngay
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer shrink-0"
          title="Để sau"
          aria-label="Đóng banner thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
