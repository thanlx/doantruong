'use client';

// ==============================================================================
// MODAL CHECK-IN TUẦN: NHIỆT KẾ TINH THẦN & ĐÁNH GIÁ TẢI CÔNG VIỆC BTV
// 5 Trạng thái cảm xúc, Đánh giá 1-5 sao, Góp ý Thường trực & Ẩn danh
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CheckinMood } from '@/types';
import {
  X,
  Heart,
  Star,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOOD_OPTIONS: Array<{
  key: CheckinMood;
  emoji: string;
  title: string;
  desc: string;
  activeColor: string;
  badgeColor: string;
}> = [
  {
    key: 'energetic',
    emoji: '🚀',
    title: 'Tràn đầy năng lượng',
    desc: 'Sẵn sàng chinh phục mọi nhiệm vụ và phong trào!',
    activeColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    badgeColor: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    key: 'happy',
    emoji: '😊',
    title: 'Vui vẻ / Ổn định',
    desc: 'Công việc trôi chảy, nhịp độ làm việc thoải mái.',
    activeColor: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    badgeColor: 'bg-blue-500/15 text-blue-600',
  },
  {
    key: 'neutral',
    emoji: '😐',
    title: 'Bình thường',
    desc: 'Đang duy trì tiến độ bình ổn theo kế hoạch.',
    activeColor: 'border-slate-500 bg-slate-500/10 text-slate-600 dark:text-slate-400',
    badgeColor: 'bg-slate-500/15 text-slate-600',
  },
  {
    key: 'stressed',
    emoji: '😫',
    title: 'Căng thẳng / Áp lực',
    desc: 'Nhiều hạn chót dồn dập hoặc gặp vướng mắc.',
    activeColor: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    badgeColor: 'bg-amber-500/15 text-amber-600',
  },
  {
    key: 'overloaded',
    emoji: '🆘',
    title: 'Quá tải / Cần hỗ trợ',
    desc: 'Cần Thường trực can thiệp điều phối hoặc san sẻ việc.',
    activeColor: 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    badgeColor: 'bg-rose-500/15 text-rose-600',
  },
];

export default function WeeklyCheckinModal({ isOpen, onClose }: WeeklyCheckinModalProps) {
  const { currentMember, addWeeklyCheckin, weeklyCheckins } = useApp();
  const [selectedMood, setSelectedMood] = useState<CheckinMood>('energetic');
  const [workloadRating, setWorkloadRating] = useState<number>(3);
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  // Tính tuần hiện tại
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    (((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWeeklyCheckin({
      member_id: currentMember.id,
      week_number: weekNumber,
      year: now.getFullYear(),
      mood: selectedMood,
      workload_rating: workloadRating,
      message: message.trim() || undefined,
      is_anonymous: isAnonymous,
    });

    setIsSubmitted(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Nhiệt kế Tinh thần & Check-in Tuần
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Tuần {weekNumber}/2026
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Đồng hành, lắng nghe và chăm lo sức khỏe tinh thần Ban Thường vụ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Form */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-foreground">Gửi Check-in thành công!</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Cảm ơn đồng chí đã chia sẻ. Thường trực Đoàn trường luôn lắng nghe và sẵn sàng hỗ trợ!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. Chọn Trạng thái Tinh thần (Mood) */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>1. Cảm xúc & Năng lượng tuần này của đồng chí thế nào?</span>
                <span className="text-[11px] font-normal text-muted-foreground">Chọn 1 trạng thái</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((item) => {
                  const isSelected = selectedMood === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedMood(item.key)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? `${item.activeColor} shadow-xs font-bold ring-1 ring-primary/40`
                          : 'border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-foreground">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Đánh giá khối lượng công việc (1 - 5 sao) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  2. Đánh giá khối lượng & áp lực công việc tuần này:
                </label>
                <span className="text-xs font-bold text-primary">
                  {workloadRating === 1 && 'Rất nhẹ nhàng (1/5)'}
                  {workloadRating === 2 && 'Vừa sức (2/5)'}
                  {workloadRating === 3 && 'Bình thường (3/5)'}
                  {workloadRating === 4 && 'Khá bận rộn (4/5)'}
                  {workloadRating === 5 && 'Quá tải / Căng thẳng (5/5)'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 bg-muted/30 rounded-2xl border border-border">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWorkloadRating(star)}
                    className="p-1.5 transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                    aria-label={`${star} sao`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= workloadRating
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-xs'
                          : 'text-muted-foreground/30 hover:text-amber-400/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Lời nhắn gửi Thường trực */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>3. Tâm sự, đề xuất hoặc phản hồi nội bộ gửi Thường trực (Tùy chọn):</span>
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Cần bổ sung thêm nhân sự hỗ trợ thiết kế; đề xuất dời lịch họp tuần tới..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-background border border-border text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50 resize-none"
              />
            </div>

            {/* 4. Tùy chọn Ẩn danh */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-foreground">Gửi ẩn danh (Giữ kín danh tính)</div>
                  <div className="text-[10px] text-muted-foreground">
                    Không hiển thị tên đồng chí trong báo cáo tổng hợp.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
                id="anonymous-toggle"
              />
            </div>

            {/* Nút gửi */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Để sau
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hoàn tất Check-in Tuần</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
