'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function DashboardCalendar() {
  const { tasks, setSelectedTaskId, setActiveTab } = useApp();
  const [selected, setSelected] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const today = new Date();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const dueTasks = tasks.filter(task => task.due_at && task.status !== 'huy');
  const selectedTasks = dueTasks.filter(task => sameDay(new Date(task.due_at!), selected));
  const moveMonth = (step: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + step, 1);
    setMonth(next);
    setSelected(next);
  };

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="text-sm font-bold">Lịch làm việc</h3>
        <button onClick={() => setActiveTab('lich')} aria-label="Mở lịch làm việc" className="p-2 rounded-lg text-primary hover:bg-primary/10"><ArrowRight size={16} /></button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <button aria-label="Tháng trước" onClick={() => moveMonth(-1)} className="p-2 border border-border rounded-lg hover:bg-muted"><ChevronLeft size={14} /></button>
        <span className="text-xs font-semibold">Tháng {month.getMonth() + 1}, {month.getFullYear()}</span>
        <button aria-label="Tháng sau" onClick={() => moveMonth(1)} className="p-2 border border-border rounded-lg hover:bg-muted"><ChevronRight size={14} /></button>
      </div>
      <div className="grid grid-cols-7 text-center gap-y-1">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span key={day} className={`text-[10px] font-semibold py-2 ${day === 'CN' ? 'text-destructive' : 'text-muted-foreground'}`}>{day}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`offset-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
          const isSelected = sameDay(date, selected);
          const isToday = sameDay(date, today);
          const hasTasks = dueTasks.some(task => sameDay(new Date(task.due_at!), date));
          return <button key={i} onClick={() => setSelected(date)} aria-label={date.toLocaleDateString('vi-VN')} aria-pressed={isSelected} aria-current={isToday ? 'date' : undefined} className={`relative mx-auto w-8 h-8 rounded-lg text-xs ${isSelected ? 'bg-primary text-white shadow-sm' : isToday ? 'ring-1 ring-primary text-primary' : 'hover:bg-muted'}`}>
            {i + 1}{hasTasks && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-destructive'}`} />}
          </button>;
        })}
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-destructive rounded-full" />Có công việc</span>
        <button onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }} className="text-primary ml-auto hover:underline">Về hôm nay</button>
      </div>
      <div className="mt-3 space-y-2" aria-live="polite">
        <p className="text-[11px] font-semibold">Ngày {selected.toLocaleDateString('vi-VN')}</p>
        {selectedTasks.length ? selectedTasks.slice(0, 3).map(task => <button key={task.id} onClick={() => setSelectedTaskId(task.id)} className="w-full text-left text-xs p-2 rounded-lg bg-primary/5 hover:bg-primary/10 border-l-2 border-primary">{task.title}</button>) : <p className="text-[11px] text-muted-foreground">Không có công việc đến hạn.</p>}
      </div>
    </section>
  );
}
