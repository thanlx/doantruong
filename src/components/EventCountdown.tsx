'use client';

// ==============================================================================
// EVENT COUNTDOWN WIDGET: ĐẾM NGƯỢC CÁC SỰ KIỆN TRỌNG ĐẠI CỦA ĐOÀN TRƯỜNG HCMUTE
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Sparkles, Clock, ChevronRight } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  targetDate: string; // ISO date string
  location: string;
  badge: string;
  color: string;
}

const MAJOR_EVENTS: EventItem[] = [
  {
    id: 'dai-hoi-doan',
    title: 'Đại hội Đại biểu Đoàn TNCS Hồ Chí Minh HCMUTE nhiệm kỳ mới',
    targetDate: '2026-10-15T08:00:00+07:00',
    location: 'Hội trường Lớn HCMUTE',
    badge: 'Sự kiện Trọng đại',
    color: 'from-amber-500/20 via-primary/15 to-transparent border-amber-500/30',
  },
  {
    id: 'tan-sinh-vien',
    title: 'Ngày hội Chào đón Tân sinh viên khóa 2026',
    targetDate: '2026-09-28T07:30:00+07:00',
    location: 'Toàn khuôn viên trường',
    badge: 'Cao điểm tháng 9',
    color: 'from-emerald-500/20 via-teal-500/15 to-transparent border-emerald-500/30',
  },
  {
    id: 'hien-mau',
    title: 'Ngày hội Hiến máu tình nguyện đợt 3 năm 2026',
    targetDate: '2026-09-30T07:00:00+07:00',
    location: 'Sảnh Tòa nhà Trung tâm',
    badge: 'Tình nguyện vì cộng đồng',
    color: 'from-rose-500/20 via-pink-500/15 to-transparent border-rose-500/30',
  },
];

export default function EventCountdown() {
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const activeEvent = MAJOR_EVENTS[activeEventIndex];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(activeEvent.targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [activeEvent]);

  return (
    <div className={`relative rounded-3xl bg-gradient-to-r ${activeEvent.color} p-4 sm:p-5 border shadow-xs transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tiêu đề & Thông tin */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="w-3 h-3" />
              {activeEvent.badge}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(activeEvent.targetDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-foreground leading-snug truncate">
            {activeEvent.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Địa điểm: <strong className="text-foreground">{activeEvent.location}</strong></span>
          </div>
        </div>

        {/* Đồng hồ đếm ngược */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          {/* Ngày */}
          <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] p-2 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-lg sm:text-xl font-black text-primary font-mono leading-tight">
              {timeLeft.days < 10 ? `0${timeLeft.days}` : timeLeft.days}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Ngày</span>
          </div>

          <span className="text-sm font-black text-muted-foreground">:</span>

          {/* Giờ */}
          <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] p-2 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-lg sm:text-xl font-black text-primary font-mono leading-tight">
              {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Giờ</span>
          </div>

          <span className="text-sm font-black text-muted-foreground">:</span>

          {/* Phút */}
          <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] p-2 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-lg sm:text-xl font-black text-primary font-mono leading-tight">
              {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Phút</span>
          </div>

          <span className="text-sm font-black text-muted-foreground">:</span>

          {/* Giây */}
          <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] p-2 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-lg sm:text-xl font-black text-primary font-mono leading-tight">
              {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Giây</span>
          </div>
        </div>

        {/* Nút chuyển đổi sự kiện khác */}
        <div className="flex md:flex-col items-center gap-1 shrink-0">
          {MAJOR_EVENTS.map((ev, idx) => (
            <button
              key={ev.id}
              onClick={() => setActiveEventIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeEventIndex === idx ? 'w-5 bg-primary' : 'bg-muted-foreground/40 hover:bg-muted-foreground'
              }`}
              title={ev.title}
              aria-label={`Chuyển sang sự kiện ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
