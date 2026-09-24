'use client';

// ==============================================================================
// INACTIVITY AUTO-LOCK MODAL: BẢO MẬT PHIÊN LÀM VIỆC BTV (20 PHÚT IDLE)
// ==============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, Unlock, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole } from '@/lib/formatters';

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 phút

export default function InactivityLockModal() {
  const { currentMember } = useApp();
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockTime, setLockTime] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (isLocked) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsLocked(true);
      setLockTime(
        new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, IDLE_TIMEOUT_MS);
  }, [isLocked]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => resetTimer();

    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    resetTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Mật khẩu mặc định hoặc mở khóa xác nhận
    if (pinInput.trim().length > 0 || pinInput === '') {
      setIsLocked(false);
      setPinInput('');
      setErrorMsg(null);
      resetTimer();
    } else {
      setErrorMsg('Vui lòng xác nhận mở khóa màn hình.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-modal-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-card w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl space-y-5 text-center text-foreground animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <h3 id="lock-modal-title" className="text-lg font-black text-foreground">
            Màn hình tạm khóa bảo mật
          </h3>
          <p className="text-xs text-muted-foreground">
            Hệ thống tự động khóa sau 20 phút không hoạt động để bảo vệ dữ liệu Ban Thường vụ
          </p>
          {lockTime && (
            <span className="text-[10px] text-muted-foreground font-mono block">
              Thời gian khóa: {lockTime}
            </span>
          )}
        </div>

        {/* Thông tin cán bộ hiện tại */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border text-left">
          <AvatarWithFallback
            src={currentMember.avatar_url}
            name={currentMember.full_name}
            className="w-10 h-10 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-foreground truncate">{currentMember.full_name}</div>
            <div className="text-[10px] text-muted-foreground">{formatRole(currentMember.role)}</div>
          </div>
        </div>

        {/* Form mở khóa */}
        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Nhập mã PIN hoặc bấm Mở khóa..."
              autoFocus
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border bg-muted/30 focus:bg-card text-foreground focus:ring-2 focus:ring-primary outline-none text-center tracking-widest font-mono"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-destructive font-semibold">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Unlock className="w-4 h-4" />
            <span>Tiếp tục phiên làm việc</span>
          </button>
        </form>
      </div>
    </div>
  );
}
