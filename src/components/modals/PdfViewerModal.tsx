'use client';

// ==============================================================================
// MODAL XEM TRỰC TIẾP FILE PDF SCAN CÔNG VĂN (FULLSCREEN IN-APP VIEWER)
// Tích hợp điều khiển Phóng to/Thu nhỏ, Tải về, In ấn, Trích yếu tóm tắt & Phân loại mật
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { IncomingDocument } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  ShieldAlert,
  Calendar,
  Building,
  User,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import DoanLogo from '../DoanLogo';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string | null;
  title?: string;
  doc?: IncomingDocument | null;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  doc,
}: PdfViewerModalProps) {
  const { assignTaskFromDocument, setIsCreateTaskModalOpen } = useApp();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Phím tắt bàn phím (ESC để đóng)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => {
    setZoomLevel(100);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.print();
        return;
      } catch (e) {}
    }
    window.print();
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = doc?.file_name || `${doc?.so_ky_hieu || 'van_ban'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isConfidential = doc?.access_level === 'thuong_truc';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-card rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none fixed inset-0' : 'w-full max-w-7xl h-[92vh] max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* THANH CÔNG CỤ TOOLBAR */}
        <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center justify-between gap-3 shrink-0">
          {/* Thông tin văn bản */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="w-5 h-5 text-rose-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground truncate max-w-md">
                  {title || doc?.so_ky_hieu || 'Văn bản scan công văn'}
                </h3>
                {isConfidential ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    🔒 MẬT - THƯỜNG TRỰC
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    🌐 Công khai BTV
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {doc?.don_vi_gui} • Số: {doc?.so_ky_hieu || 'Chưa vào sổ'} • Ngày nhận:{' '}
                {doc?.ngay_nhan || '2026-09-21'}
              </p>
            </div>
          </div>

          {/* Các nút điều khiển Viewer */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Phóng to / Thu nhỏ */}
            <div className="flex items-center bg-background rounded-xl border border-border p-0.5 shadow-2xs">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                title="Thu nhỏ (-15%)"
                aria-label="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                title="Đặt lại 100%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                title="Phóng to (+15%)"
                aria-label="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Xoay trang */}
            <button
              onClick={handleRotate}
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
              title="Xoay 90 độ"
              aria-label="Xoay 90 độ"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* In ấn */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
              title="In văn bản scan"
              aria-label="In văn bản"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Tải về */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
              title="Tải tệp PDF về máy"
              aria-label="Tải về máy"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Đóng/Mở panel trích yếu */}
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                isSidePanelOpen
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-border bg-background hover:bg-muted text-muted-foreground'
              }`}
              title={isSidePanelOpen ? 'Thu gọn trích yếu' : 'Mở xem trích yếu'}
              aria-label="Đóng mở trích yếu"
            >
              <FileCheck className="w-4 h-4" />
            </button>

            {/* Toàn màn hình */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <div className="h-6 w-px bg-border mx-0.5" />

            {/* Đóng */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-muted/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Đóng (ESC)"
              aria-label="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* THÂN VIEWER & PANEL TRÍCH YẾU */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* KHUNG HIỂN THỊ PDF */}
          <div className="flex-1 bg-muted/30 overflow-auto flex items-center justify-center p-3 sm:p-6 relative">
            <div
              className="transition-transform duration-200 origin-center shadow-2xl rounded-lg overflow-hidden bg-white max-w-full"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                width: '840px',
                minHeight: '1100px',
              }}
            >
              {pdfUrl && (pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http') || pdfUrl.endsWith('.pdf')) ? (
                <iframe
                  ref={iframeRef}
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title={title || 'Văn bản PDF'}
                  className="w-full h-full min-h-[1100px] border-0"
                />
              ) : (
                /* BẢN TẢI LẬP TRÌNH MINH HỌA CÔNG VĂN CHÍNH THỨC CHUẨN VIỆT NAM KHI CHƯA CÓ FILE NHỊ PHÂN TRỰC TIẾP */
                <div className="p-10 sm:p-14 text-slate-800 font-serif leading-relaxed text-sm bg-white space-y-8 select-text">
                  {/* Quốc hiệu Tiêu ngữ & Đơn vị ban hành */}
                  <div className="flex justify-between items-start border-b pb-6 border-slate-200">
                    <div className="text-center w-5/12 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wide">
                        {doc?.don_vi_gui || 'ĐOÀN TNCS HỒ CHÍ MINH TRƯỜNG ĐH SPKT'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-600">
                        BAN THƯỜNG VỤ ĐOÀN TRƯỜNG
                      </p>
                      <div className="w-20 mx-auto border-b border-slate-400 pt-1" />
                      <p className="text-[11px] pt-1 italic font-sans">
                        Số: <b>{doc?.so_ky_hieu || '262-TB/TDTN'}</b>
                      </p>
                    </div>

                    <div className="text-center w-6/12 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider">
                        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      </p>
                      <p className="text-[11px] font-bold text-slate-700 underline underline-offset-4">
                        Độc lập - Tự do - Hạnh phúc
                      </p>
                      <p className="text-[11px] italic pt-2 font-sans">
                        TP. Hồ Chí Minh, ngày {doc?.ngay_nhan ? doc.ngay_nhan.split('-')[2] : '21'} tháng{' '}
                        {doc?.ngay_nhan ? doc.ngay_nhan.split('-')[1] : '09'} năm{' '}
                        {doc?.ngay_nhan ? doc.ngay_nhan.split('-')[0] : '2026'}
                      </p>
                    </div>
                  </div>

                  {/* Tiêu đề công văn */}
                  <div className="text-center space-y-2 py-4">
                    <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-slate-900">
                      THÔNG BÁO / CÔNG VĂN CHỈ ĐẠO
                    </h2>
                    <p className="text-xs italic text-slate-600 font-sans max-w-lg mx-auto">
                      V/v: {doc?.noi_dung || 'Triển khai công tác trọng tâm theo chỉ đạo của Đoàn trường'}
                    </p>
                  </div>

                  {/* Nội dung chi tiết */}
                  <div className="space-y-4 text-justify font-sans text-xs leading-relaxed text-slate-700">
                    <p>
                      Kính gửi: <b>Ban Thường vụ các Đoàn cơ sở, Chi đoàn trực thuộc, các Ban chuyên môn Đoàn trường.</b>
                    </p>
                    <p>
                      Căn cứ chương trình công tác Đoàn và phong trào thanh niên trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh năm học 2026 - 2027; Ban Thường vụ Đoàn trường thông báo và chỉ đạo các đơn vị triển khai thực hiện các nội dung cụ thể sau:
                    </p>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2 font-sans">
                      <p className="font-semibold text-xs text-primary">📌 YÊU CẦU TRỌNG TÂM:</p>
                      <p>{doc?.noi_dung}</p>
                      {doc?.ghi_chu && (
                        <p className="italic text-slate-600 text-[11px]">
                          * Ghi chú chỉ đạo: {doc.ghi_chu}
                        </p>
                      )}
                    </div>
                    <p>
                      Đề nghị các đồng chí được phân công phụ trách ({doc?.nguoi_nhan_xu_ly || 'Ban Thường vụ'}) khẩn trương xây dựng kế hoạch chi tiết, phối hợp với các bên liên quan và báo cáo tiến độ về Thường trực trước{' '}
                      <b>{doc?.thoi_han_xu_ly ? new Date(doc.thoi_han_xu_ly).toLocaleDateString('vi-VN') : 'ngày 25/09/2026'}</b>.
                    </p>
                  </div>

                  {/* Nơi nhận & Con dấu mô phỏng */}
                  <div className="pt-8 flex justify-between items-end border-t border-slate-200">
                    <div className="text-[11px] font-sans text-slate-500 space-y-0.5">
                      <p className="font-bold text-slate-700">Nơi nhận:</p>
                      <p>- Như trên;</p>
                      <p>- Đảng ủy - BGH (để báo cáo);</p>
                      <p>- Thường trực Đoàn trường;</p>
                      <p>- Lưu: VT, BTV.</p>
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-xs font-bold uppercase">TM. BAN THƯỜNG VỤ ĐOÀN TRƯỜNG</p>
                      <p className="text-[11px] font-semibold text-slate-600">BÍ THƯ</p>
                      <div className="py-2 relative flex items-center justify-center">
                        {/* Con dấu đỏ mô phỏng */}
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-red-600/70 text-red-600 flex flex-col items-center justify-center p-1 text-[8px] font-bold uppercase rotate-[-8deg] opacity-80">
                          <span>ĐOÀN TNCS HỒ CHÍ MINH</span>
                          <span className="text-[9px] font-black my-0.5">HCMUTE</span>
                          <span>★ ĐÃ KÝ DUYỆT ★</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-900">Nguyễn Thị Mai</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDE PANEL TÓM TẮT TRÍCH YẾU (DRAWER BÊN PHẢI) */}
          {isSidePanelOpen && (
            <div className="w-80 sm:w-96 border-l border-border bg-card flex flex-col shrink-0 overflow-y-auto p-5 space-y-5 animate-in slide-in-from-right-10 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-primary" />
                  Trích yếu công văn
                </span>
                <button
                  onClick={() => setIsSidePanelOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                  aria-label="Thu gọn trích yếu"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Thông số chi tiết */}
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <div className="text-[11px] text-muted-foreground">Đơn vị gửi đến:</div>
                  <div className="font-bold text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary shrink-0" />
                    <span>{doc?.don_vi_gui || 'THANH ĐOÀN TP. HỒ CHÍ MINH'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <div className="text-[11px] text-muted-foreground">Số & Ký hiệu:</div>
                  <div className="font-black text-primary font-mono text-sm">
                    {doc?.so_ky_hieu || '262-TB/TDTN'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <div className="text-[11px] text-muted-foreground">Trích yếu nội dung:</div>
                  <div className="font-semibold text-foreground leading-relaxed">
                    {doc?.noi_dung || 'Chưa cập nhật nội dung trích yếu'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Ngày nhận
                    </div>
                    <div className="font-bold text-foreground">{doc?.ngay_nhan || '2026-09-21'}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Hạn xử lý
                    </div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      {doc?.thoi_han_xu_ly
                        ? new Date(doc.thoi_han_xu_ly).toLocaleDateString('vi-VN')
                        : 'Không giới hạn'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Người / Bộ phận nhận xử lý:
                  </div>
                  <div className="font-bold text-foreground">
                    {doc?.nguoi_nhan_xu_ly || 'Xin ý kiến BTV'}
                  </div>
                </div>

                {doc?.ghi_chu && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-1 text-xs">
                    <div className="font-bold text-[11px]">Ghi chú xử lý:</div>
                    <p className="leading-snug">{doc.ghi_chu}</p>
                  </div>
                )}
              </div>

              {/* Nút Giao việc từ văn bản này */}
              {doc && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      setIsCreateTaskModalOpen(true);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Giao việc từ văn bản này</span>
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground mt-1.5">
                    Tự động kế thừa liên kết file PDF scan vào nhiệm vụ mới.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
