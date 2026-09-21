'use client';

// ==============================================================================
// MODAL TẠO MẢNG VIỆC / DỰ ÁN / CHIẾN DỊCH MỚI - BAN THƯỜNG VỤ ĐOÀN TRƯỜNG
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, FolderPlus, Calendar, Palette, Check } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { label: 'Xanh Đoàn TN', value: '#0284c7' },
  { label: 'Đỏ Nhiệt huyết', value: '#dc2626' },
  { label: 'Lục Tình nguyện', value: '#10b981' },
  { label: 'Cam Năng động', value: '#f59e0b' },
  { label: 'Tím Sáng tạo', value: '#8b5cf6' },
];

export default function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const { addCampaign } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#0284c7');
  const [status, setStatus] = useState<'du_kien' | 'dang_chay' | 'hoan_thanh' | 'huy'>('dang_chay');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập Tên mảng việc / chiến dịch!');
      return;
    }

    addCampaign({
      name: name.trim(),
      description: description.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      color,
      status,
    });

    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Tạo Mảng việc / Chiến dịch</h3>
              <p className="text-[11px] text-muted-foreground">Mục lục dự án và chuỗi hoạt động trọng tâm BTV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs">
          <div className="space-y-1">
            <label className="font-bold text-foreground">Tên mảng việc / Chiến dịch (*)</label>
            <input
              type="text"
              placeholder="VD: Chiến dịch Tình nguyện hè 2026, Tháng Thanh niên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Mô tả mục tiêu</label>
            <textarea
              rows={3}
              placeholder="VD: Chuỗi hoạt động tình nguyện cao điểm của sinh viên HCMUTE..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ngày bắt đầu</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ngày kết thúc</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Màu nhận diện */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Màu sắc nhận diện</span>
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                    color === c.value ? 'scale-110 ring-2 ring-foreground ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {color === c.value && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Trạng thái khởi tạo</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="dang_chay">Đang diễn ra (dang_chay)</option>
              <option value="du_kien">Dự kiến kế hoạch (du_kien)</option>
              <option value="hoan_thanh">Đã hoàn thành (hoan_thanh)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-muted-foreground font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary/90"
            >
              <Check className="w-4 h-4" />
              <span>Tạo Mảng việc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
