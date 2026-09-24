'use client';

// ==============================================================================
// MODAL TIẾP NHẬN VĂN BẢN ĐẾN NHANH - BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
// Hỗ trợ tải tệp trực tiếp lên Supabase Storage từ trình duyệt (Client-Side Upload)
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  FileText,
  Calendar,
  Building,
  Hash,
  FileUp,
  Check,
  Paperclip,
  Loader2,
  Lock,
  Globe,
  Trash2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { uploadPdfDocument, validatePdfFile, formatFileSize } from '@/lib/pdfStorage';
import { formatRole } from '@/lib/formatters';

interface CreateIncomingDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateIncomingDocModal({ isOpen, onClose }: CreateIncomingDocModalProps) {
  const { addIncomingDoc, members, currentMember } = useApp();

  const [donViGui, setDonViGui] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [soKyHieu, setSoKyHieu] = useState('');
  const [ngayNhan, setNgayNhan] = useState(new Date().toISOString().split('T')[0]);
  const [nguoiNhan, setNguoiNhan] = useState('Xin ý kiến BTV');
  const [thoiHan, setThoiHan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [accessLevel, setAccessLevel] = useState<'cong_khai' | 'thuong_truc'>('cong_khai');

  // State tệp đính kèm PDF & Drag/Drop
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    setFileError(null);
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Tệp không hợp lệ.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donViGui.trim() || !noiDung.trim()) {
      alert('Vui lòng nhập Đơn vị gửi và Nội dung trích yếu của văn bản!');
      return;
    }

    setIsUploading(true);
    let uploadedFileUrl: string | undefined = undefined;
    let uploadedFileName: string | undefined = undefined;
    let uploadedFileSize: number | undefined = undefined;

    if (selectedFile) {
      const uploadRes = await uploadPdfDocument(selectedFile);
      if (uploadRes.success && uploadRes.fileUrl) {
        uploadedFileUrl = uploadRes.fileUrl;
        uploadedFileName = uploadRes.fileName;
        uploadedFileSize = uploadRes.fileSize;
      } else if (uploadRes.error) {
        setFileError(uploadRes.error);
        setIsUploading(false);
        return;
      }
    }

    addIncomingDoc({
      don_vi_gui: donViGui.trim(),
      noi_dung: noiDung.trim(),
      so_ky_hieu: soKyHieu.trim() || undefined,
      ngay_nhan: ngayNhan,
      nguoi_nhan_xu_ly: nguoiNhan,
      thoi_han_xu_ly: thoiHan ? `${thoiHan}T17:00:00+07:00` : null,
      ghi_chu: ghiChu.trim() || undefined,
      file_path: uploadedFileUrl,
      file_url: uploadedFileUrl,
      file_name: uploadedFileName,
      file_size: uploadedFileSize,
      access_level: accessLevel,
    });

    setIsUploading(false);

    // Reset
    setDonViGui('');
    setNoiDung('');
    setSoKyHieu('');
    setThoiHan('');
    setGhiChu('');
    setAccessLevel('cong_khai');
    setSelectedFile(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-incoming-doc-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
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
              <h3 id="modal-incoming-doc-title" className="text-sm font-bold text-foreground">
                Tiếp nhận Văn bản đến
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Sổ theo dõi văn bản đến 8 cột chuẩn HCMUTE & Tải tệp lên Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            title="Đóng (Esc)"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
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
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
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
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
              />
            </div>
          </div>

          {/* Nội dung trích yếu */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Nội dung (Trích yếu văn bản) (*)</label>
            <textarea
              rows={3}
              placeholder="VD: Thông báo về việc triển khai bình chọn Giải thưởng Sao Tháng Giêng năm 2026..."
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed text-foreground"
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
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
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
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
              />
            </div>
          </div>

          {/* Người nhận xử lý & Ghi chú */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Đề xuất người nhận xử lý</label>
            <select
              value={nguoiNhan}
              onChange={(e) => setNguoiNhan(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
            >
              <option value="Xin ý kiến BTV">Xin ý kiến BTV (Chờ Thường trực phân công)</option>
              {members.map((m) => (
                <option key={m.id} value={`Đ/c ${m.full_name.split(' ').slice(-1)[0]}`}>
                  {m.full_name} ({formatRole(m.role)})
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
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
            />
          </div>

          {/* Phân loại độ mật */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-muted/40 border border-border">
            <label className="font-bold text-foreground flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Phân loại Độ mật / Phạm vi tiếp cận</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                accessLevel === 'thuong_truc'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}>
                {accessLevel === 'thuong_truc' ? '🔒 CHỈ THƯỜNG TRỰC' : '🌐 CÔNG KHAI BTV'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAccessLevel('cong_khai')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  accessLevel === 'cong_khai'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <div>
                  <div className="text-xs">Công khai toàn BTV</div>
                  <div className="text-[10px] text-muted-foreground">9 Đ/c BTV đều xem được</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccessLevel('thuong_truc')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  accessLevel === 'thuong_truc'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0 text-rose-500" />
                <div>
                  <div className="text-xs">Chỉ Thường trực xem</div>
                  <div className="text-[10px] text-muted-foreground">Bí thư & Phó Bí thư</div>
                </div>
              </button>
            </div>
          </div>

          {/* Tải tệp văn bản PDF scan đính kèm (Kéo thả, giới hạn 15MB) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-muted/30 border border-border">
            <label className="font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileUp className="w-3.5 h-3.5 text-primary" />
                <span>File PDF Scan Công văn gốc</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">Định dạng .pdf (Tối đa 15MB)</span>
            </label>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                isDragOver
                  ? 'border-primary bg-primary/10 text-primary scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-border bg-background hover:bg-muted/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,application/pdf"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between w-full p-2 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-foreground truncate max-w-[220px] sm:max-w-xs">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • PDF Scan
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                    title="Xóa tệp"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Kéo thả tệp PDF vào đây hoặc <span className="text-primary underline">chọn từ thiết bị</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Tối đa 15MB. Hỗ trợ xem trực tiếp toàn màn hình trên máy tính và điện thoại.
                  </p>
                </>
              )}
            </div>

            {fileError && (
              <div className="text-[11px] text-destructive flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-muted-foreground font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu & Tải tệp...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu vào Sổ văn bản</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
