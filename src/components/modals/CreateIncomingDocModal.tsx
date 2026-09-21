'use client';

// ==============================================================================
// MODAL TIẾP NHẬN VĂN BẢN ĐẾN NHANH - BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, FileText, Send, Calendar, Building, Hash, FileUp, Check } from 'lucide-react';

interface CreateIncomingDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateIncomingDocModal({ isOpen, onClose }: CreateIncomingDocModalProps) {
  const { addIncomingDoc, members } = useApp();

  const [donViGui, setDonViGui] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [soKyHieu, setSoKyHieu] = useState('');
  const [ngayNhan, setNgayNhan] = useState(new Date().toISOString().split('T')[0]);
  const [nguoiNhan, setNguoiNhan] = useState('Xin ý kiến BTV');
  const [thoiHan, setThoiHan] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donViGui.trim() || !noiDung.trim()) {
      alert('Vui lòng nhập Đơn vị gửi và Nội dung trích yếu của văn bản!');
      return;
    }

    addIncomingDoc({
      don_vi_gui: donViGui.trim(),
      noi_dung: noiDung.trim(),
      so_ky_hieu: soKyHieu.trim() || undefined,
      ngay_nhan: ngayNhan,
      nguoi_nhan_xu_ly: nguoiNhan,
      thoi_han_xu_ly: thoiHan ? `${thoiHan}T17:00:00+07:00` : null,
      ghi_chu: ghiChu.trim() || undefined,
    });

    // Reset
    setDonViGui('');
    setNoiDung('');
    setSoKyHieu('');
    setThoiHan('');
    setGhiChu('');
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
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Tiếp nhận Văn bản đến</h3>
              <p className="text-[11px] text-muted-foreground">Sổ theo dõi văn bản đến 8 cột chuẩn HCMUTE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto scrollbar-thin text-xs">
          {/* Đơn vị gửi & Số ký hiệu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Đơn vị gửi đến (*)</span>
              </label>
              <input
                type="text"
                placeholder="VD: THÀNH ĐOÀN, ĐẢNG ỦY..."
                value={donViGui}
                onChange={(e) => setDonViGui(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Số, ký hiệu văn bản</span>
              </label>
              <input
                type="text"
                placeholder="VD: 262-TB/TDTN"
                value={soKyHieu}
                onChange={(e) => setSoKyHieu(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Nội dung trích yếu */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Nội dung (Trích yếu văn bản) (*)</label>
            <textarea
              rows={3}
              placeholder="VD: Thông báo về việc triển khai bình chọn Giải thưởng Sao Tháng Giêng năm 2025..."
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Ngày nhận & Hạn xử lý */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ngày nhận</span>
              </label>
              <input
                type="date"
                value={ngayNhan}
                onChange={(e) => setNgayNhan(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Thời hạn xử lý (nếu có)</span>
              </label>
              <input
                type="date"
                value={thoiHan}
                onChange={(e) => setThoiHan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Người nhận xử lý & Ghi chú */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Đề xuất người nhận xử lý</label>
            <select
              value={nguoiNhan}
              onChange={(e) => setNguoiNhan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="Xin ý kiến BTV">Xin ý kiến BTV (Chờ Thường trực phân công)</option>
              {members.map((m) => (
                <option key={m.id} value={`Đ/c ${m.full_name.split(' ').slice(-1)[0]}`}>
                  {m.full_name} ({m.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Ghi chú chỉ đạo</label>
            <input
              type="text"
              placeholder="VD: Triển khai cho tất cả các cơ sở Đoàn rà soát..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
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
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Lưu vào Sổ văn bản</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
