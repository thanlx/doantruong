'use client';

// ==============================================================================
// TỔ CHỨC VÀ CHỨC VỤ (ADMIN ORGANIZATION & POSITIONS - SCREEN 6 MOCKUP)
// Phân biệt rõ Ban điều hành (Đoàn trường) vs Ban chủ nhiệm (Hội Sinh viên) theo Mục 1
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Plus,
  Search,
  Building2,
  Folder,
  FolderOpen,
  MoreVertical,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronRight,
  Users,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { PositionDefinition, Unit } from '@/types';

export default function AdminOrganizationView() {
  const {
    units,
    positions,
    addUnit,
    addPosition,
    selectedUnitId,
    setSelectedUnitId,
  } = useApp();

  const [activeUnitId, setActiveUnitId] = useState<string>(
    selectedUnitId || 'unit_clb_truyen_thong'
  );
  const [activeTab, setActiveTab] = useState<'thong_tin' | 'chuc_danh' | 'nhan_su' | 'lich_su'>('chuc_danh');
  const [unitSearch, setUnitSearch] = useState('');
  const [posSearch, setPosSearch] = useState('');

  // Modals
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isAddPosOpen, setIsAddPosOpen] = useState(false);

  // New unit states
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitType, setNewUnitType] = useState<Unit['type']>('clb_doi_nhom');
  const [newUnitParent, setNewUnitParent] = useState('unit_hoi_sinh_vien');

  // New position states
  const [newPosName, setNewPosName] = useState('');
  const [newPosGroup, setNewPosGroup] = useState<PositionDefinition['group']>('ban_chu_nhiem');
  const [newPosCount, setNewPosCount] = useState<string>('1');

  const selectedUnit = units.find((u) => u.id === activeUnitId) || units.find((u) => u.id === 'unit_clb_truyen_thong') || units[0];

  // Positions belonging to group/unit
  const isDoanFunction = selectedUnit.type === 'don_vi_chuc_nang';
  const unitPositions = positions.filter((p) => {
    if (isDoanFunction) return p.group === 'ban_dieu_hanh';
    if (selectedUnit.type === 'clb_doi_nhom') return p.group === 'ban_chu_nhiem';
    if (selectedUnit.type === 'chi_doan') return p.group === 'chi_doan';
    return p.group === 'ban_chap_hanh';
  });

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !newUnitCode.trim()) return;

    addUnit({
      code: newUnitCode.toUpperCase(),
      name: newUnitName,
      type: newUnitType,
      parent_id: newUnitParent,
      status: 'active',
      subsystem_id: newUnitType === 'don_vi_chuc_nang' ? 'P05' : 'P06',
      established_date: new Date().toISOString().split('T')[0],
      description: `Đơn vị mới thành lập: ${newUnitName}`,
      member_count: 0,
    });

    setIsAddUnitOpen(false);
    setNewUnitName('');
    setNewUnitCode('');
    alert(`Đã thêm mới đơn vị: ${newUnitName}`);
  };

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosName.trim()) return;

    addPosition({
      name: newPosName,
      group: newPosGroup,
      expected_count: newPosCount === 'Nhieu_nguoi' ? 'Nhieu_nguoi' : parseInt(newPosCount) || 1,
      status: 'active',
      unit_id: selectedUnit.id,
    });

    setIsAddPosOpen(false);
    setNewPosName('');
    alert(`Đã thêm chức danh mới: ${newPosName}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Tổ chức và chức vụ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý cây đơn vị, thiết lập chức danh Ban điều hành và Ban chủ nhiệm
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddUnitOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Thêm đơn vị</span>
          </button>

          <button
            onClick={() => setIsAddPosOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm chức danh</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION (TREE 4 COLS + DETAIL 8 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CƠ CẤU TỔ CHỨC TREE */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cơ cấu tổ chức</h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn vị..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Tree nodes */}
            <div className="space-y-2 text-xs">
              {/* Đoàn trường */}
              <div>
                <button
                  onClick={() => setActiveUnitId('unit_doan_truong')}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                    activeUnitId === 'unit_doan_truong'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Đoàn trường</span>
                </button>

                <div className="pl-6 space-y-1 border-l-2 border-border ml-3 mt-1">
                  <button
                    onClick={() => setActiveUnitId('unit_doan_co_so')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      activeUnitId === 'unit_doan_co_so'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Đoàn cơ sở</span>
                  </button>

                  <button
                    onClick={() => setActiveUnitId('unit_chuc_nang_doan')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      activeUnitId === 'unit_chuc_nang_doan'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Folder className="h-3.5 w-3.5 text-amber-600" />
                    <span>Đơn vị chức năng</span>
                  </button>
                </div>
              </div>

              {/* Hội Sinh viên trường */}
              <div className="pt-2">
                <button
                  onClick={() => setActiveUnitId('unit_hoi_sinh_vien')}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                    activeUnitId === 'unit_hoi_sinh_vien'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Hội Sinh viên trường</span>
                </button>

                <div className="pl-6 space-y-1 border-l-2 border-border ml-3 mt-1">
                  <button
                    onClick={() => setActiveUnitId('unit_lien_chi_hoi')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      activeUnitId === 'unit_lien_chi_hoi'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5 text-purple-600" />
                    <span>Liên chi hội</span>
                  </button>

                  <button
                    onClick={() => setActiveUnitId('unit_clb_truyen_thong')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                      activeUnitId === 'unit_clb_truyen_thong'
                        ? 'bg-primary/15 text-primary shadow-2xs border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Folder className="h-3.5 w-3.5 text-primary" />
                    <span>CLB Truyền thông</span>
                  </button>

                  <button
                    onClick={() => setActiveUnitId('unit_doi_tinh_nguyen')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      activeUnitId === 'unit_doi_tinh_nguyen'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Folder className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Đội Tình nguyện</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground italic pt-2">Dữ liệu minh họa</p>
          </div>
        </div>

        {/* RIGHT COLUMN: UNIT CARD & CHỨC DANH MANAGEMENT */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            {/* Header Card of selected unit (Matching Screen 6) */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
                  <Folder className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-foreground">{selectedUnit.name}</h2>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Đang hoạt động
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                      {selectedUnit.type === 'don_vi_chuc_nang'
                        ? 'Đơn vị trực thuộc Đoàn trường'
                        : 'Đơn vị trực thuộc Hội Sinh viên'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-muted-foreground pt-1">
                    <span>
                      Mã đơn vị: <strong className="text-foreground font-mono">{selectedUnit.code}</strong>
                    </span>
                    <span>
                      Cấp trên:{' '}
                      <strong className="text-foreground">
                        {selectedUnit.parent_id === 'unit_hoi_sinh_vien'
                          ? 'Hội Sinh viên trường'
                          : 'Đoàn trường'}
                      </strong>
                    </span>
                    <span>
                      Loại: <strong className="text-foreground">Câu lạc bộ</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border text-xs font-bold">
              {[
                { id: 'thong_tin', label: 'Thông tin' },
                { id: 'chuc_danh', label: 'Chức danh' },
                { id: 'nhan_su', label: 'Nhân sự' },
                { id: 'lich_su', label: 'Lịch sử' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: CHỨC DANH */}
            {activeTab === 'chuc_danh' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Danh sách chức danh
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm chức danh..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold bg-muted/20">
                        <th className="py-3 px-3">Tên chức danh</th>
                        <th className="py-3 px-3">Thuộc nhóm</th>
                        <th className="py-3 px-3">Số lượng dự kiến</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {unitPositions.map((pos) => (
                        <tr key={pos.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3 font-bold text-foreground">{pos.name}</td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {pos.group === 'ban_dieu_hanh'
                              ? 'Ban điều hành'
                              : pos.group === 'ban_chu_nhiem'
                              ? 'Ban chủ nhiệm'
                              : 'Ban Chấp hành'}
                          </td>
                          <td className="py-3 px-3 text-foreground font-medium">
                            {pos.expected_count === 'Nhieu_nguoi' ? 'Nhiều người' : pos.expected_count}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Đang áp dụng
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-muted-foreground">
                            <button className="p-1 hover:text-foreground cursor-pointer">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Callout Notice (Section 1 requirement & Screen 6) */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Đơn vị chức năng Đoàn trường sử dụng:{' '}
                    <strong className="font-bold">Ban điều hành</strong> (CLB/Đội/Nhóm Hội Sinh viên sử
                    dụng: <strong className="font-bold">Ban chủ nhiệm</strong>)
                  </span>
                </div>

                <div className="text-right pt-2">
                  <button
                    onClick={() => alert('Đã lưu các thiết lập chức danh thành công!')}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: THÊM ĐƠN VỊ */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Thêm mới đơn vị Đoàn – Hội</h3>
              <button
                onClick={() => setIsAddUnitOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Tên đơn vị *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: CLB Tiếng Anh Sáng tạo"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Mã đơn vị (duy nhất) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: CLB-TA"
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 font-mono focus:border-primary focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Loại tổ chức</label>
                <select
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                >
                  <option value="clb_doi_nhom">Câu lạc bộ, Đội, Nhóm (Hội Sinh viên)</option>
                  <option value="don_vi_chuc_nang">Đơn vị chức năng (Đoàn trường)</option>
                  <option value="lien_chi_hoi">Liên chi hội</option>
                  <option value="chi_doan">Chi đoàn</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs"
                >
                  Tạo đơn vị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM CHỨC DANH */}
      {isAddPosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Thêm chức danh mới</h3>
              <button
                onClick={() => setIsAddPosOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePosition} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Tên chức danh *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phó Chủ nhiệm Thường trực"
                  value={newPosName}
                  onChange={(e) => setNewPosName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Thuộc nhóm</label>
                <select
                  value={newPosGroup}
                  onChange={(e) => setNewPosGroup(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                >
                  <option value="ban_chu_nhiem">Ban chủ nhiệm</option>
                  <option value="ban_dieu_hanh">Ban điều hành</option>
                  <option value="ban_chap_hanh">Ban Chấp hành</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground">Số lượng dự kiến</label>
                <select
                  value={newPosCount}
                  onChange={(e) => setNewPosCount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                >
                  <option value="1">1 người</option>
                  <option value="2">2 người</option>
                  <option value="3">3 người</option>
                  <option value="Nhieu_nguoi">Nhiều người</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddPosOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs"
                >
                  Thêm chức danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
