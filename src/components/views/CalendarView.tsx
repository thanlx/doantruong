'use client';

// ==============================================================================
// CALENDAR VIEW: LỊCH LÀM VIỆC & TIẾN ĐỘ THÁNG (KHỚP 100% MÀN HÌNH 3 VÀ DESKTOP)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarView() {
  const { tasks, members, setSelectedTaskId, setIsCreateTaskModalOpen } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(22);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // Tháng 9 (0-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Sự kiện mẫu theo ngày khớp trong ảnh
  const scheduleEvents: Record<number, any[]> = {
    22: [
      {
        id: 'ev-1',
        time: '08:00',
        endTime: '09:00',
        title: 'Họp BTV Đoàn trường',
        location: 'Phòng họp A (Nhà trung tâm)',
        attendees: '9 Đ/c BTV',
        type: 'meeting',
      },
      {
        id: 'ev-2',
        time: '14:00',
        endTime: '15:30',
        title: 'Làm việc với các đơn vị',
        location: 'Phòng làm việc Đoàn trường',
        attendees: '12 Đoàn cơ sở Khoa',
        type: 'meeting',
      },
      {
        id: 'ev-3',
        time: '16:00',
        endTime: '17:00',
        title: 'Duyệt nội dung truyền thông',
        location: 'Online / Google Meet',
        attendees: 'Ban Tuyên giáo',
        type: 'review',
      },
    ],
    25: [
      {
        id: 'ev-4',
        time: '09:00',
        endTime: '11:00',
        title: 'Khảo sát địa điểm Chào Tân sinh viên',
        location: 'Hội trường Lớn',
        attendees: 'Ban Tổ chức',
        type: 'survey',
      },
    ],
    30: [
      {
        id: 'ev-5',
        time: '07:30',
        endTime: '12:00',
        title: 'Ngày hội Hiến máu tình nguyện đợt 3',
        location: 'Sảnh tòa nhà trung tâm',
        attendees: 'Hội Chữ thập đỏ & Sinh viên',
        type: 'event',
      },
    ],
  };

  const currentEvents = scheduleEvents[selectedDay] || [];

  // Tìm các task có deadline trong ngày được chọn
  const tasksDueOnSelectedDay = tasks.filter((t) => {
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return due.getDate() === selectedDay && due.getMonth() === selectedMonth;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Lịch làm việc BTV</h2>
          <p className="text-xs text-muted-foreground">
            Kế hoạch hội họp, sự kiện và hạn chót công việc của Ban Thường vụ
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Thêm lịch / Công việc</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: LỊCH THÁNG TƯƠNG TÁC */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Tháng {selectedMonth + 1}/{selectedYear}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDay(Math.min(30, selectedDay + 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid tiêu đề thứ */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground py-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span className="text-destructive font-semibold">CN</span>
          </div>

          {/* Grid 30 ngày Tháng 9/2025 */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const isSelected = selectedDay === day;
              const hasEvents = Boolean(scheduleEvents[day]);
              const hasTasksDue = tasks.some((t) => {
                if (!t.due_at) return false;
                const d = new Date(t.due_at);
                return d.getDate() === day && d.getMonth() === selectedMonth;
              });

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[56px] sm:min-h-[70px] p-2 rounded-2xl flex flex-col items-center justify-between transition-all relative ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm scale-102 font-bold'
                      : 'hover:bg-muted text-foreground border border-border/60'
                  }`}
                >
                  <span className="text-xs font-bold">{day}</span>

                  <div className="flex items-center gap-1 mt-1">
                    {hasEvents && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-primary'}`}
                      />
                    )}
                    {hasTasksDue && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-destructive'}`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH TRÌNH CHI TIẾT CỦA NGÀY ĐƯỢC CHỌN (KHỚP ẢNH MẪU) */}
        <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-muted-foreground uppercase">Lịch trình chi tiết</div>
              <h3 className="text-base font-black text-foreground">
                Ngày {selectedDay}/{selectedMonth + 1}/{selectedYear}
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {currentEvents.length + tasksDueOnSelectedDay.length} sự kiện
            </span>
          </div>

          {/* Sự kiện hội họp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hội họp & Sự kiện</h4>
            {currentEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Không có lịch họp BTV nào trong ngày này.</p>
            ) : (
              currentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-2xl bg-muted/30 border border-border hover:border-primary/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ev.time} - {ev.endTime}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-foreground leading-snug">{ev.title}</h5>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>{ev.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border">
                    <Users className="w-3 h-3 text-muted-foreground/70" />
                    <span>Thành phần: {ev.attendees}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Công việc đến hạn trong ngày */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hạn chót công việc</h4>
            {tasksDueOnSelectedDay.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Không có công việc nào đến hạn ngày này.</p>
            ) : (
              tasksDueOnSelectedDay.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="p-3 rounded-2xl border border-border hover:border-primary/50 transition-colors cursor-pointer space-y-1 group bg-card"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">{t.title}</h5>
                    <span className="text-[10px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
                      Hạn chót
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Hạn: {t.due_at ? format(new Date(t.due_at), 'HH:mm') : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
