'use client';

// ==============================================================================
// INCOMING DOCS VIEW: SỔ THEO DÕI VĂN BẢN ĐẾN (8 CỘT CHUẨN + GIAO VIỆC + XUẤT EXCEL)
// Thay thế hoàn toàn file THEO DOI VAN BAN DEN.xlsx thực tế
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Plus,
  Download,
  Search,
  UserPlus,
  CheckCircle2,
  Calendar,
  Building,
  AlertCircle,
  Clock,
  Send,
  X,
  Paperclip,
  Lock,
  ShieldAlert,
  Sparkles,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { matchesVietnameseSearch } from '@/lib/searchUtils';
import { getDocumentSignedUrl } from '@/lib/supabaseStorage';

export default function IncomingDocsView() {
  const { incomingDocs, members, addIncomingDoc, createTasksFromDoc, currentMember, tasks, openPdfViewer, setIsCreateDocModalOpen } = useApp();

  const isLeader = currentMember.role === 'bi_thu' || currentMember.role === 'pho_bi_thu';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSender, setFilterSender] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'chua_xu_ly' | 'dang_xu_ly' | 'hoan_thanh'>('all');
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [assigningDoc, setAssigningDoc] = useState<any | null>(null);

  // Helper tính trạng thái văn bản
  const getDocStatusCode = (docId: string): 'chua_xu_ly' | 'dang_xu_ly' | 'hoan_thanh' => {
    const linkedTasks = tasks.filter((t) => t.source_document_id === docId);
    if (linkedTasks.length === 0) return 'chua_xu_ly';
    const allCompleted = linkedTasks.every((t) => t.status === 'hoan_thanh');
    if (allCompleted) return 'hoan_thanh';
    return 'dang_xu_ly';
  };

  // Đếm theo trạng thái cho các filter pills
  const statusCounts = {
    all: incomingDocs.length,
    chua_xu_ly: incomingDocs.filter((d) => getDocStatusCode(d.id) === 'chua_xu_ly').length,
    dang_xu_ly: incomingDocs.filter((d) => getDocStatusCode(d.id) === 'dang_xu_ly').length,
    hoan_thanh: incomingDocs.filter((d) => getDocStatusCode(d.id) === 'hoan_thanh').length,
  };

  // State form thêm văn bản
  const [newDoc, setNewDoc] = useState({
    don_vi_gui: '',
    noi_dung: '',
    so_ky_hieu: '',
    ngay_nhan: new Date().toISOString().split('T')[0],
    ngay_chuyen_xu_ly: '',
    nguoi_nhan_xu_ly: 'Xin ý kiến BTV',
    thoi_han_xu_ly: '',
    ghi_chu: '',
  });

  // State form giao việc từ văn bản
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assigneeTaskTitle, setAssigneeTaskTitle] = useState('');
  const [assigneePriority, setAssigneePriority] = useState<'thap' | 'binh_thuong' | 'cao' | 'khan'>('binh_thuong');
  const [assigneeScope, setAssigneeScope] = useState<'hanh_chinh' | 'chuyen_mon'>('hanh_chinh');

  // Lọc văn bản có hỗ trợ tìm kiếm tiếng Việt không dấu & lọc trạng thái
  const filteredDocs = incomingDocs.filter((doc) => {
    if (filterSender !== 'all' && doc.don_vi_gui !== filterSender) return false;
    if (filterStatus !== 'all' && getDocStatusCode(doc.id) !== filterStatus) return false;
    if (searchQuery.trim()) {
      const matchNoiDung = matchesVietnameseSearch(doc.noi_dung, searchQuery);
      const matchSo = matchesVietnameseSearch(doc.so_ky_hieu || '', searchQuery);
      const matchNguoi = matchesVietnameseSearch(doc.nguoi_nhan_xu_ly || '', searchQuery);
      const matchDonVi = matchesVietnameseSearch(doc.don_vi_gui, searchQuery);
      if (!matchNoiDung && !matchSo && !matchNguoi && !matchDonVi) return false;
    }
    return true;
  });

  // Xuất file Excel 8 cột chuẩn gốc
  const handleExportExcel = () => {
    const exportData = incomingDocs.map((doc, idx) => ({
      STT: idx + 1,
      'ĐƠN VỊ GỬI ĐẾN': doc.don_vi_gui,
      'NỘI DUNG': doc.noi_dung,
      'SỐ, KÝ HIỆU VB': doc.so_ky_hieu || '',
      'NGÀY NHẬN': doc.ngay_nhan ? format(new Date(doc.ngay_nhan), 'dd/MM/yyyy') : '',
      'NGÀY CHUYỂN XỬ LÝ': doc.ngay_chuyen_xu_ly ? format(new Date(doc.ngay_chuyen_xu_ly), 'dd/MM/yyyy') : '',
      'NGƯỜI NHẬN XỬ LÝ': doc.nguoi_nhan_xu_ly || 'Xin ý kiến BTV',
      'THỜI HẠN XỬ LÝ': doc.thoi_han_xu_ly ? format(new Date(doc.thoi_han_xu_ly), 'dd/MM/yyyy HH:mm') : '',
      'GHI CHÚ': doc.ghi_chu || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'THEO DOI VAN BAN DEN');
    XLSX.writeFile(workbook, `THEO_DOI_VAN_BAN_DEN_HCMUTE_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  // Mở modal giao việc từ văn bản
  const openAssignModal = (doc: any) => {
    setAssigningDoc(doc);
    setAssigneeTaskTitle(`Xử lý VB [${doc.so_ky_hieu || 'VB'}]: ${doc.noi_dung.slice(0, 60)}...`);
    setSelectedAssignees([]);
  };

  // Thực hiện giao việc
  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningDoc || selectedAssignees.length === 0) return;

    createTasksFromDoc(
      assigningDoc.id,
      selectedAssignees,
      assigneeTaskTitle,
      `Theo văn bản số ${assigningDoc.so_ky_hieu || ''} của ${assigningDoc.don_vi_gui}. Ghi chú: ${assigningDoc.ghi_chu || 'Không'}`,
      assigneePriority,
      assigneeScope
    );

    setAssigningDoc(null);
    setSelectedAssignees([]);
  };

  // Thêm văn bản mới
  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.don_vi_gui || !newDoc.noi_dung) return;

    addIncomingDoc({
      ...newDoc,
      thoi_han_xu_ly: newDoc.thoi_han_xu_ly ? new Date(newDoc.thoi_han_xu_ly).toISOString() : null,
    });

    setIsAddDocModalOpen(false);
    setNewDoc({
      don_vi_gui: '',
      noi_dung: '',
      so_ky_hieu: '',
      ngay_nhan: new Date().toISOString().split('T')[0],
      ngay_chuyen_xu_ly: '',
      nguoi_nhan_xu_ly: 'Xin ý kiến BTV',
      thoi_han_xu_ly: '',
      ghi_chu: '',
    });
  };

  // Kiểm tra trạng thái xử lý văn bản dựa trên các task sinh ra từ nó
  const getDocumentStatus = (docId: string) => {
    const code = getDocStatusCode(docId);
    if (code === 'chua_xu_ly') {
      return { label: 'Chưa xử lý', color: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]' };
    }
    if (code === 'hoan_thanh') {
      return { label: 'Đã hoàn thành', color: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]' };
    }
    const linkedTasks = tasks.filter((t) => t.source_document_id === docId);
    return { label: `Đang xử lý (${linkedTasks.length})`, color: 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]' };
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
              Sổ theo dõi Văn bản đến
            </h2>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full">
              8 Cột Chuẩn
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Quản lý văn bản từ Thành Đoàn, Đảng ủy, Phòng ban; phân công xử lý và liên kết trực tiếp với công việc
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Xuất Excel 8 cột */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>

          {/* Nút Thêm văn bản */}
          <button
            onClick={() => setIsCreateDocModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0B5CFF] hover:bg-[#094cd4] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nhập văn bản mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Trạng thái theo thiết kế 08-incoming-documents.png */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Tất cả ({statusCounts.all})
        </button>

        <button
          onClick={() => setFilterStatus('chua_xu_ly')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'chua_xu_ly'
              ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Chưa xử lý ({statusCounts.chua_xu_ly})
        </button>

        <button
          onClick={() => setFilterStatus('dang_xu_ly')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'dang_xu_ly'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Đang xử lý ({statusCounts.dang_xu_ly})
        </button>

        <button
          onClick={() => setFilterStatus('hoan_thanh')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === 'hoan_thanh'
              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/80'
          }`}
        >
          Đã hoàn thành ({statusCounts.hoan_thanh})
        </button>
      </div>

      {/* Thanh lọc & tìm kiếm */}
      <div className="bg-card rounded-2xl p-3 border border-border shadow-xs flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, số ký hiệu VB, người nhận..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 hover:bg-muted/70 focus:bg-card text-xs pl-9 pr-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-ring text-foreground transition-all"
          />
        </div>

        <select
          value={filterSender}
          onChange={(e) => setFilterSender(e.target.value)}
          className="bg-muted/40 hover:bg-muted/70 text-xs px-3 py-2 rounded-xl border border-input outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="all">Tất cả đơn vị gửi</option>
          <option value="THANH ĐOÀN TP. HỒ CHÍ MINH">Thành Đoàn TP.HCM</option>
          <option value="ĐẢNG ỦY TRƯỜNG ĐH SPKT">Đảng ủy Trường</option>
          <option value="HỘI CHỮ THẬP ĐỎ TP.HCM">Hội Chữ thập đỏ</option>
          <option value="BAN DÂN VẬN THÀNH ỦY">Ban Dân vận Thành ủy</option>
          <option value="TRUNG TÂM PHÁT TRIỂN KHOA HỌC TRẺ">Trung tâm PT Khoa học Trẻ</option>
        </select>
      </div>

      {/* BẢNG 8 CỘT GỐC CHUẨN EXCEL (HIỂN THỊ TRÊN DESKTOP/TABLET) */}
      <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-3 min-w-[150px]">Đơn vị gửi đến</th>
                <th className="py-3 px-3 min-w-[240px]">Nội dung (Trích yếu)</th>
                <th className="py-3 px-3 min-w-[120px]">Số, ký hiệu VB</th>
                <th className="py-3 px-3 min-w-[100px]">Ngày nhận</th>
                <th className="py-3 px-3 min-w-[130px]">Người nhận xử lý</th>
                <th className="py-3 px-3 min-w-[130px]">Thời hạn xử lý</th>
                <th className="py-3 px-3 min-w-[110px]">Trạng thái</th>
                <th className="py-3 px-3 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocs.map((doc, idx) => {
                const isConfidential = doc.access_level === 'thuong_truc';
                const isLockedForMe = isConfidential && !isLeader;
                const isUnassigned =
                  doc.nguoi_nhan_xu_ly?.toLowerCase().includes('xin ý kiến') || !doc.nguoi_nhan_xu_ly;
                const status = getDocumentStatus(doc.id);

                if (isLockedForMe) {
                  return (
                    <tr key={doc.id} className="bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{doc.don_vi_gui}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-foreground">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 mb-1">
                          <Lock className="w-3 h-3" />
                          <span>MẬT - NỘI BỘ THƯỜNG TRỰC</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground italic">
                          Văn bản mật nội bộ Thường trực Đoàn trường. Chỉ Bí thư & Phó Bí thư có thẩm quyền truy cập.
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground select-none">
                        ••••••••
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                        {doc.ngay_nhan ? format(new Date(doc.ngay_nhan), 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground italic text-xs">
                        Thường trực
                      </td>
                      <td className="py-3 px-3 text-muted-foreground italic text-[11px] select-none">
                        ••••
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          Bảo mật
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/80 italic">
                          <Lock className="w-3 h-3 text-rose-500" />
                          <span>Khóa quyền</span>
                        </span>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{doc.don_vi_gui}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-foreground">
                      {isConfidential && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 mb-1">
                          <Lock className="w-3 h-3" />
                          <span>🔒 MẬT - THƯỜNG TRỰC</span>
                        </div>
                      )}
                      <div className="font-medium line-clamp-2 leading-relaxed">{doc.noi_dung}</div>
                      {doc.ghi_chu && (
                        <div className="text-[10px] text-muted-foreground italic mt-0.5">
                          Ghi chú: {doc.ghi_chu}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-primary">
                      {doc.so_ky_hieu || '-'}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                      {doc.ngay_nhan ? format(new Date(doc.ngay_nhan), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {isUnassigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" />
                          <span>Xin ý kiến BTV</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-foreground">{doc.nguoi_nhan_xu_ly}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                      {doc.thoi_han_xu_ly ? (
                        <span className="text-destructive font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(doc.thoi_han_xu_ly), 'dd/MM HH:mm')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">Không có</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(doc.file_url || doc.file_path) && (
                          <button
                            onClick={() => openPdfViewer(doc.file_url || doc.file_path!, doc.so_ky_hieu || doc.noi_dung, doc)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-rose-500/30"
                            title="Xem trực tiếp PDF scan công văn"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Xem PDF</span>
                          </button>
                        )}
                        <button
                          onClick={() => openAssignModal(doc)}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-primary/20"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Giao việc</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* DANH SÁCH THẺ DẠNG CARD TRÊN ĐIỆN THOẠI DI ĐỘNG */}
        <div className="md:hidden divide-y divide-border">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Không có văn bản nào phù hợp.
            </div>
          ) : (
            filteredDocs.map((doc, idx) => {
              const isConfidential = doc.access_level === 'thuong_truc';
              const isLockedForMe = isConfidential && !isLeader;
              const isUnassigned =
                doc.nguoi_nhan_xu_ly?.toLowerCase().includes('xin ý kiến') || !doc.nguoi_nhan_xu_ly;
              const status = getDocumentStatus(doc.id);

              if (isLockedForMe) {
                return (
                  <div key={doc.id} className="p-4 space-y-2.5 bg-rose-500/5 border-l-4 border-rose-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <Lock className="w-3 h-3" />
                        <span>MẬT - THƯỜNG TRỰC</span>
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-foreground">{doc.don_vi_gui}</div>
                    <p className="text-[11px] text-muted-foreground italic">
                      Văn bản mật nội bộ Thường trực Đoàn trường. Chỉ Bí thư & Phó Bí thư có quyền truy cập.
                    </p>
                  </div>
                );
              }

              return (
                <div key={doc.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-primary">
                        {doc.so_ky_hieu || 'Chưa có số'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isConfidential && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Mật</span>
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-3">
                      {doc.noi_dung}
                    </h4>
                    {doc.ghi_chu && (
                      <p className="text-[10px] text-muted-foreground italic mt-1">
                        Ghi chú: {doc.ghi_chu}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2.5 rounded-xl border border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Đơn vị gửi:</span>
                      <span className="font-semibold text-foreground truncate block">{doc.don_vi_gui}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Ngày nhận:</span>
                      <span className="font-mono text-foreground block">
                        {doc.ngay_nhan ? format(new Date(doc.ngay_nhan), 'dd/MM/yyyy') : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Người xử lý:</span>
                      {isUnassigned ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Xin ý kiến BTV</span>
                      ) : (
                        <span className="font-semibold text-foreground">{doc.nguoi_nhan_xu_ly}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Hạn chót:</span>
                      {doc.thoi_han_xu_ly ? (
                        <span className="text-destructive font-bold">
                          {format(new Date(doc.thoi_han_xu_ly), 'dd/MM HH:mm')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Không có</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {(doc.file_url || doc.file_path) && (
                      <button
                        onClick={() => openPdfViewer(doc.file_url || doc.file_path!, doc.so_ky_hieu || doc.noi_dung, doc)}
                        className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-500/30 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Xem trực tiếp PDF scan</span>
                      </button>
                    )}
                    <button
                      onClick={() => openAssignModal(doc)}
                      className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-transform"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Giao việc từ văn bản này</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL GIAO VIỆC TỪ VĂN BẢN (1 văn bản sinh nhiều task riêng lẻ) */}
      {assigningDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Giao việc từ văn bản đến</h3>
                <p className="text-xs text-muted-foreground">
                  Số VB: <span className="font-mono font-bold text-primary">{assigningDoc.so_ky_hieu || 'Chưa có'}</span> • {assigningDoc.don_vi_gui}
                </p>
              </div>
              <button
                onClick={() => setAssigningDoc(null)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cảnh báo trùng lặp (Idempotency check) */}
            {tasks.filter((t) => t.source_document_id === assigningDoc.id).length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Lưu ý: Văn bản này đã được giao {tasks.filter((t) => t.source_document_id === assigningDoc.id).length} việc trước đó!
                  </span>
                </div>
                <div className="text-[11px] opacity-90 pl-1 space-y-0.5">
                  {tasks
                    .filter((t) => t.source_document_id === assigningDoc.id)
                    .map((t) => (
                      <div key={t.id} className="truncate">
                        • {t.title} ({members.find((m) => m.id === t.owner_id)?.full_name || 'BTV'})
                      </div>
                    ))}
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmAssign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Tiêu đề công việc giao
                </label>
                <input
                  type="text"
                  required
                  value={assigneeTaskTitle}
                  onChange={(e) => setAssigneeTaskTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Chọn người chịu trách nhiệm (Có thể chọn nhiều - Mỗi người sẽ nhận 1 Task độc lập)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-xl">
                  {members.map((m) => {
                    const isChecked = selectedAssignees.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-border text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignees([...selectedAssignees, m.id]);
                            } else {
                              setSelectedAssignees(selectedAssignees.filter((id) => id !== m.id));
                            }
                          }}
                          className="rounded text-primary focus:ring-ring"
                        />
                        <span className="truncate">{m.full_name}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Cảnh báo BTV đang bận & gợi ý thay thế 1 chạm */}
                {members
                  .filter((m) => selectedAssignees.includes(m.id) && m.busy_from && m.busy_to)
                  .map((bm) => {
                    const delegateMember = members.find((m) => m.id === bm.delegate_to_id);
                    return (
                      <div
                        key={bm.id}
                        className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5"
                      >
                        <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Đ/c {bm.full_name} đang bận {bm.busy_reason || 'công tác'} ({format(new Date(bm.busy_from!), 'dd/MM')} - {format(new Date(bm.busy_to!), 'dd/MM')})
                          </span>
                        </div>
                        {delegateMember && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                            <span className="text-[11px]">
                              Đã ủy quyền cho: <strong className="text-foreground">{delegateMember.full_name}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAssignees((prev) => [
                                  ...prev.filter((id) => id !== bm.id),
                                  delegateMember.id,
                                ]);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-colors self-start sm:self-auto"
                            >
                              Chuyển giao cho Đ/c {delegateMember.full_name.split(' ').slice(-2).join(' ')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Mức độ ưu tiên</label>
                  <select
                    value={assigneePriority}
                    onChange={(e: any) => setAssigneePriority(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="binh_thuong">Bình thường</option>
                    <option value="thap">Thấp</option>
                    <option value="cao">Cao</option>
                    <option value="khan">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Phạm vi duyệt</label>
                  <select
                    value={assigneeScope}
                    onChange={(e: any) => setAssigneeScope(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="hanh_chinh">Hành chính (Chánh VP duyệt)</option>
                    <option value="chuyen_mon">Chuyên môn (Bí thư duyệt)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssigningDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={selectedAssignees.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm"
                >
                  Giao việc ({selectedAssignees.length} người)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM VĂN BẢN ĐẾN MỚI */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Nhập thông tin Văn bản đến</h3>
              <button
                onClick={() => setIsAddDocModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Đơn vị gửi đến (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: THÀNH ĐOÀN TP. HỒ CHÍ MINH, ĐẢNG ỦY..."
                  value={newDoc.don_vi_gui}
                  onChange={(e) => setNewDoc({ ...newDoc, don_vi_gui: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Nội dung trích yếu (*)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tóm tắt ngắn gọn nội dung văn bản..."
                  value={newDoc.noi_dung}
                  onChange={(e) => setNewDoc({ ...newDoc, noi_dung: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Số, ký hiệu VB</label>
                  <input
                    type="text"
                    placeholder="VD: 262-TB/TDTN"
                    value={newDoc.so_ky_hieu}
                    onChange={(e) => setNewDoc({ ...newDoc, so_ky_hieu: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Ngày nhận (*)</label>
                  <input
                    type="date"
                    required
                    value={newDoc.ngay_nhan}
                    onChange={(e) => setNewDoc({ ...newDoc, ngay_nhan: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Người nhận xử lý</label>
                  <input
                    type="text"
                    placeholder="VD: Đ/c Mai, hoặc để 'Xin ý kiến BTV'"
                    value={newDoc.nguoi_nhan_xu_ly}
                    onChange={(e) => setNewDoc({ ...newDoc, nguoi_nhan_xu_ly: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Thời hạn xử lý</label>
                  <input
                    type="datetime-local"
                    value={newDoc.thoi_han_xu_ly}
                    onChange={(e) => setNewDoc({ ...newDoc, thoi_han_xu_ly: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Ghi chú</label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm nếu có..."
                  value={newDoc.ghi_chu}
                  onChange={(e) => setNewDoc({ ...newDoc, ghi_chu: e.target.value })}
                  className="w-full text-xs p-2 rounded-xl border border-input bg-card text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  Lưu văn bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
