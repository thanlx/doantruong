'use client';

// ==============================================================================
// CALENDAR VIEW: LỊCH LÀM VIỆC & TIẾN ĐỘ THÁNG 9/2026 (HCMUTE BTV)
// Tự động hóa tính ngày động, offset thứ trong tuần, .ics export & Google Calendar
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Users,
  Download,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';

export default function CalendarView() {
  const { tasks, setSelectedTaskId, setIsCreateTaskModalOpen } = useApp();

  // Mặc định Tháng 9/2026 (0-indexed: month 8)
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Tính số ngày trong tháng động (Tháng 9 có 30 ngày)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Tính độ lệch ngày đầu tháng theo chuẩn Thứ 2 đầu tuần (T2=0, T3=1, ..., CN=6)
  // Ngày 01/09/2026 là Thứ Ba -> getDay() trả về 2 -> (2 + 6) % 7 = 1 (1 ô trống đầu tuần)
  const firstDayOffset = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;

  // Lịch mẫu các phiên họp và sự kiện trọng tâm
  const scheduleEvents: Record<number, any[]> = selectedMonth === 8 && selectedYear === 2026 ? {
    1: [
      {
        id: 'ev-0',
        time: '08:30',
        endTime: '11:00',
        title: 'Khởi động Chiến dịch Chào Tân sinh viên 2026',
        location: 'Hội trường Lớn HCMUTE',
        attendees: 'Toàn thể BTV & Đoàn khoa',
        type: 'event',
      },
    ],
    12: [
      {
        id: 'ev-12',
        time: '14:00',
        endTime: '16:00',
        title: 'Kiểm kê cơ sở vật chất Văn phòng Đoàn',
        location: 'Văn phòng Đoàn trường',
        attendees: 'Văn phòng & Ban CSVC',
        type: 'meeting',
      },
    ],
    15: [
      {
        id: 'ev-15',
        time: '08:00',
        endTime: '11:30',
        title: 'Họp trù bị công tác Đại hội Đoàn trường',
        location: 'Phòng họp A - Nhà Trung tâm',
        attendees: 'Thường trực & Trưởng ban',
        type: 'meeting',
      },
    ],
    22: [
      {
        id: 'ev-1',
        time: '08:00',
        endTime: '09:30',
        title: 'Họp BTV Đoàn trường định kỳ tháng 9',
        location: 'Phòng họp A (Nhà trung tâm)',
        attendees: '9 Đ/c BTV',
        type: 'meeting',
      },
      {
        id: 'ev-2',
        time: '14:00',
        endTime: '15:30',
        title: 'Làm việc với các Đoàn cơ sở Khoa về nhân sự',
        location: 'Phòng làm việc Đoàn trường',
        attendees: 'Chánh VP & 12 Đoàn khoa',
        type: 'coordination',
      },
      {
        id: 'ev-3',
        time: '16:00',
        endTime: '17:30',
        title: 'Duyệt nội dung truyền thông Tân sinh viên',
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
        title: 'Khảo sát sân khấu & gian hàng Tân sinh viên',
        location: 'Hội trường Lớn & Sảnh A',
        attendees: 'Ban Tổ chức',
        type: 'survey',
      },
    ],
    30: [
      {
        id: 'ev-5',
        time: '07:00',
        endTime: '12:00',
        title: 'Ngày hội Hiến máu tình nguyện đợt 3/2026',
        location: 'Sảnh tòa nhà trung tâm HCMUTE',
        attendees: 'Hội Chữ thập đỏ & Sinh viên',
        type: 'event',
      },
    ],
  } : {};

  const currentEvents = scheduleEvents[selectedDay] || [];

  // Tìm các task có deadline trong ngày được chọn
  const tasksDueOnSelectedDay = tasks.filter((t) => {
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return (
      due.getDate() === selectedDay &&
      due.getMonth() === selectedMonth &&
      due.getFullYear() === selectedYear
    );
  });

  // Điều hướng tháng
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDay(1);
  };

  // Tạo file iCalendar (.ics) tải về điện thoại / Outlook / Google Calendar
  const handleExportIcs = () => {
    const eventsToExport: any[] = [];

    // Thu thập tất cả sự kiện trong tháng
    Object.entries(scheduleEvents).forEach(([dayStr, evList]) => {
      const day = parseInt(dayStr, 10);
      evList.forEach((ev) => {
        const [sh, sm] = ev.time.split(':').map(Number);
        const [eh, em] = ev.endTime.split(':').map(Number);
        const start = new Date(selectedYear, selectedMonth, day, sh, sm);
        const end = new Date(selectedYear, selectedMonth, day, eh, em);
        eventsToExport.push({
          title: `[BTV Đoàn] ${ev.title}`,
          start,
          end,
          location: ev.location,
          description: `Thành phần tham dự: ${ev.attendees}`,
        });
      });
    });

    // Thêm các deadline task trong tháng
    tasks.forEach((t) => {
      if (!t.due_at) return;
      const due = new Date(t.due_at);
      if (due.getMonth() === selectedMonth && due.getFullYear() === selectedYear) {
        const start = new Date(due.getTime() - 3600000); // 1 giờ trước
        eventsToExport.push({
          title: `[Hạn chót BTV] ${t.title}`,
          start,
          end: due,
          location: 'HCMUTE',
          description: t.description || 'Hạn chót công việc trên hệ thống BTV Đoàn trường',
        });
      }
    });

    if (eventsToExport.length === 0) {
      alert('Không có sự kiện nào trong tháng này để xuất!');
      return;
    }

    const formatIcsDate = (d: Date) => {
      return format(d, "yyyyMMdd'T'HHmmss");
    };

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BTV Doan Truong HCMUTE//Lich Lam Viec//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    eventsToExport.forEach((item, index) => {
      icsLines.push(
        'BEGIN:VEVENT',
        `UID:btv-event-${selectedYear}-${selectedMonth + 1}-${index}@hcmute.edu.vn`,
        `DTSTAMP:${formatIcsDate(new Date())}Z`,
        `DTSTART:${formatIcsDate(item.start)}`,
        `DTEND:${formatIcsDate(item.end)}`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:${item.description}`,
        `LOCATION:${item.location}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsLines.push('END:VCALENDAR');

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LICH_LAM_VIEC_BTV_T${selectedMonth + 1}_${selectedYear}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Tạo URL thêm nhanh vào Google Calendar
  const getGoogleCalendarUrl = (ev: any, day: number) => {
    const [sh, sm] = ev.time.split(':').map(Number);
    const [eh, em] = ev.endTime.split(':').map(Number);
    const start = new Date(selectedYear, selectedMonth, day, sh, sm);
    const end = new Date(selectedYear, selectedMonth, day, eh, em);

    const startStr = format(start, "yyyyMMdd'T'HHmmss");
    const endStr = format(end, "yyyyMMdd'T'HHmmss");

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `[BTV Đoàn] ${ev.title}`,
      dates: `${startStr}/${endStr}`,
      details: `Thành phần: ${ev.attendees}`,
      location: ev.location || 'Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Lịch làm việc BTV Tháng {selectedMonth + 1}/{selectedYear}
          </h2>
          <p className="text-xs text-muted-foreground">
            Kế hoạch hội họp, sự kiện và hạn chót công việc của Ban Thường vụ Đoàn trường HCMUTE
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Xuất iCal (.ics) */}
          <button
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1.5 bg-card hover:bg-muted text-foreground border border-border text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl shadow-2xs active:scale-95 transition-all"
            title="Đồng bộ lịch vào điện thoại iPhone, Android hoặc Outlook"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Xuất iCalendar (.ics)</span>
          </button>

          {/* Nút Thêm việc */}
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm lịch / Công việc</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: LỊCH THÁNG TƯƠNG TÁC */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Tháng {selectedMonth + 1} năm {selectedYear}
              </h3>
              <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {daysInMonth} ngày
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Tháng trước"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedMonth(new Date().getMonth());
                  setSelectedYear(new Date().getFullYear());
                  setSelectedDay(new Date().getDate());
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                Hôm nay (22/09)
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Tháng sau"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid tiêu đề thứ: Thứ 2 đến Chủ nhật */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground py-1 border-b border-border/50">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span className="text-destructive font-semibold">CN</span>
          </div>

          {/* Grid ngày với offset đầu tuần */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm font-semibold">
            {/* 1. Các ô trống offset trước ngày mùng 1 */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div
                key={`offset-${i}`}
                className="min-h-[44px] sm:min-h-[68px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border border-transparent opacity-20 bg-muted/10 pointer-events-none"
              />
            ))}

            {/* 2. Danh sách ngày trong tháng (chính xác 30 ngày cho Tháng 9) */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isSelected = selectedDay === day;
              const isToday =
                day === new Date().getDate() && selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();
              const hasEvents = Boolean(scheduleEvents[day]);
              const hasTasksDue = tasks.some((t) => {
                if (!t.due_at) return false;
                const d = new Date(t.due_at);
                return (
                  d.getDate() === day &&
                  d.getMonth() === selectedMonth &&
                  d.getFullYear() === selectedYear
                );
              });

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[44px] sm:min-h-[68px] p-1 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col items-center justify-between transition-all relative ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm scale-102 font-bold ring-2 ring-primary/30'
                      : isToday
                      ? 'bg-primary/10 text-primary border-2 border-primary/40 hover:bg-primary/20'
                      : 'hover:bg-muted text-foreground border border-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="text-[11px] sm:text-xs font-bold">{day}</span>
                    {isToday && !isSelected && (
                      <span className="text-[8px] font-black uppercase text-primary tracking-tighter">Nay</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    {hasEvents && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-amber-300' : 'bg-primary'
                        }`}
                        title="Có lịch họp / sự kiện"
                      />
                    )}
                    {hasTasksDue && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-destructive'
                        }`}
                        title="Có hạn chót công việc"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chú giải màu sắc chuẩn 06-work-calendar.png */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs" />
              <span>Có sự kiện</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B5CFF] shadow-2xs" />
              <span>Hôm nay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shadow-2xs" />
              <span>Ngày khác</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH TRÌNH CHI TIẾT CỦA NGÀY ĐƯỢC CHỌN */}
        <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-muted-foreground uppercase">
                Lịch trình ngày đã chọn
              </div>
              <h3 className="text-base font-black text-foreground">
                Ngày {selectedDay < 10 ? `0${selectedDay}` : selectedDay}/{selectedMonth + 1 < 10 ? `0${selectedMonth + 1}` : selectedMonth + 1}/{selectedYear}
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
              {currentEvents.length + tasksDueOnSelectedDay.length} mục
            </span>
          </div>

          {/* Sự kiện hội họp với viền màu dọc bên trái (Xanh lá - Xanh dương - Đỏ) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Lịch làm việc trong ngày
            </h4>
            {currentEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Không có lịch họp BTV nào trong ngày này.
              </p>
            ) : (
              currentEvents.map((ev) => {
                const isMeeting = ev.type === 'meeting';
                const isReview = ev.type === 'review' || ev.type === 'deadline';
                const isCoord = ev.type === 'coordination' || ev.type === 'event';

                const borderClass = isMeeting
                  ? 'border-l-4 border-l-[#10B981] bg-[#F0FDF4] dark:bg-emerald-950/20'
                  : isReview
                  ? 'border-l-4 border-l-[#EF4444] bg-[#FEF2F2] dark:bg-rose-950/20'
                  : 'border-l-4 border-l-[#0B5CFF] bg-[#EFF6FF] dark:bg-blue-950/20';

                const badgeClass = isMeeting
                  ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                  : isReview
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                  : 'bg-[#EBF2FF] text-[#0B5CFF] border-[#BFDBFE]';

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-2xl border border-border/70 hover:shadow-xs transition-all space-y-2 group ${borderClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${badgeClass}`}>
                        <Clock className="w-3 h-3" />
                        {ev.time} - {ev.endTime}
                      </span>

                      {/* Nút Mở trên Google Calendar */}
                      <a
                        href={getGoogleCalendarUrl(ev, selectedDay)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md border border-border/50"
                        title="Thêm vào Google Calendar cá nhân"
                      >
                        <span>Google Cal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <h5 className="text-xs font-bold text-foreground leading-snug">{ev.title}</h5>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      <span>{ev.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1.5 border-t border-border/50">
                      <Users className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                      <span>Thành phần: {ev.attendees}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Công việc đến hạn trong ngày */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Hạn chót công việc
            </h4>
            {tasksDueOnSelectedDay.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Không có công việc nào đến hạn ngày này.
              </p>
            ) : (
              tasksDueOnSelectedDay.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTaskId(t.id)}
                  className="p-3 rounded-2xl border border-border hover:border-primary/50 transition-colors cursor-pointer space-y-1 group bg-card"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {t.title}
                    </h5>
                    <span className="text-[10px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full shrink-0">
                      Hạn chót
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Thời gian: {t.due_at ? format(new Date(t.due_at), 'HH:mm') : 'Trong ngày'}
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
