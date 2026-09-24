'use client';

// ==============================================================================
// FEATURE SHOWCASE: HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM)
// Khớp 100% hình minh họa hcmute-ui-components/03-design-system.png
// ==============================================================================

import React from 'react';
import {
  Home,
  CheckCircle,
  Calendar,
  Folder,
  BarChart2,
  MessageSquare,
  Settings,
  Plus,
  Lightbulb,
} from 'lucide-react';

export default function FeatureShowcase() {
  const colors = [
    { name: 'Primary', hex: '#0B5CFF', bg: 'bg-[#0B5CFF]', text: 'text-white' },
    { name: 'Navy', hex: '#0F2D73', bg: 'bg-[#0F2D73]', text: 'text-white' },
    { name: 'Red', hex: '#EF4444', bg: 'bg-[#EF4444]', text: 'text-white' },
    { name: 'Success', hex: '#10B981', bg: 'bg-[#10B981]', text: 'text-white' },
    { name: 'Warning', hex: '#F59E0B', bg: 'bg-[#F59E0B]', text: 'text-white' },
    { name: 'Gray', hex: '#6B7280', bg: 'bg-[#6B7280]', text: 'text-white' },
    { name: 'Điểm', hex: '#EBF2FF', bg: 'bg-[#EBF2FF] border border-blue-200', text: 'text-[#0F2D73]' },
    { name: 'Light', hex: '#F8FAFC', bg: 'bg-[#F8FAFC] border border-slate-200', text: 'text-slate-800' },
  ];

  const typography = [
    { level: 'H1', size: '24/32', weight: 'Semibold', role: 'Tiêu đề trang' },
    { level: 'H2', size: '20/28', weight: 'Semibold', role: 'Tiêu đề phần' },
    { level: 'H3', size: '16/24', weight: 'Medium', role: 'Tiêu đề thẻ' },
    { level: 'Body', size: '14/20', weight: 'Regular', role: 'Nội dung chính' },
    { level: 'Caption', size: '12/16', weight: 'Regular', role: 'Chú thích, phụ đề' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#0B5CFF] text-white flex items-center justify-center text-sm font-black shadow-xs">
            0
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A2558] dark:text-foreground tracking-tight">
              Hệ thống thiết kế (Design System)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giao diện thống nhất • Hiện đại • Dễ sử dụng • Phục vụ thanh niên
            </p>
          </div>
        </div>
      </div>

      {/* Grid 2 cột chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2/3): Màu sắc & Typography */}
        <div className="lg:col-span-2 space-y-6">
          {/* 01. Màu sắc */}
          <div className="bg-white dark:bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2D73] dark:text-foreground">
              01. Màu sắc
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {colors.map((c) => (
                <div key={c.name} className="space-y-1.5 text-center">
                  <div className={`h-14 sm:h-16 rounded-2xl ${c.bg} shadow-2xs transition-transform hover:scale-105`} />
                  <div className="text-[11px] font-bold text-foreground truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{c.hex}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 02. Typography */}
          <div className="bg-white dark:bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2D73] dark:text-foreground">
              02. Typography
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Cột chữ Aa Inter */}
              <div className="space-y-1 text-center md:text-left">
                <div className="text-6xl font-black text-[#0A2558] dark:text-primary tracking-tight">
                  Aa
                </div>
                <div className="text-xl font-black text-[#0A2558] dark:text-foreground">
                  Inter
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Hiện đại • Rõ ràng • Thân thiện
                </div>
              </div>

              {/* Bảng phân cấp Typography */}
              <div className="md:col-span-2 divide-y divide-border text-xs">
                {typography.map((t) => (
                  <div key={t.level} className="py-2 flex items-center justify-between">
                    <span className="font-bold text-primary w-12">{t.level}</span>
                    <span className="text-muted-foreground font-mono text-[11px] w-14">{t.size}</span>
                    <span className="text-muted-foreground w-20">{t.weight}</span>
                    <span className="font-semibold text-foreground text-right flex-1">{t.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (1/3): Nút bấm */}
        <div className="space-y-6">
          {/* 03. Nút (Buttons) */}
          <div className="bg-white dark:bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F2D73] dark:text-foreground">
              03. Nút (Buttons)
            </h3>

            <div className="space-y-2.5">
              <button className="w-full py-2.5 px-4 rounded-xl bg-[#0B5CFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98">
                <Plus className="w-4 h-4" />
                <span>Nút chính</span>
              </button>

              <button className="w-full py-2.5 px-4 rounded-xl bg-[#EBF2FF] hover:bg-blue-100 text-[#0F2D73] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98">
                <span>Nút phụ</span>
              </button>

              <button className="w-full py-2.5 px-4 rounded-xl border-2 border-[#0B5CFF] text-[#0B5CFF] hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98">
                <span>Nút viền</span>
              </button>

              <button className="w-full py-2.5 px-4 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98">
                <span>Nút cảnh báo</span>
              </button>
            </div>

            {/* Quote slogan */}
            <div className="pt-4 border-t border-border flex items-center gap-2 text-amber-500">
              <Lightbulb className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200 italic leading-snug">
                Những ý tưởng nhỏ tạo nên thay đổi lớn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng dưới: Trạng thái & Icon gợi ý */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 04. Trạng thái (Status) */}
        <div className="bg-white dark:bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#0F2D73] dark:text-foreground">
            04. Trạng thái (Status)
          </h3>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
              <span className="w-2 h-2 rounded-full bg-[#0B5CFF]" />
              <span>Đang thực hiện</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Hoàn thành</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
              <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
              <span>Chưa bắt đầu</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span>Quá hạn</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Đã hủy</span>
            </span>
          </div>
        </div>

        {/* 05. Icon gợi ý */}
        <div className="bg-white dark:bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#0F2D73] dark:text-foreground">
            05. Icon gợi ý
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            {[Home, CheckCircle, Calendar, Folder, BarChart2, MessageSquare, Settings].map((Icon, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-2xl border border-border flex items-center justify-center text-[#0B5CFF] hover:bg-blue-50 dark:hover:bg-muted transition-colors shadow-2xs"
              >
                <Icon className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
