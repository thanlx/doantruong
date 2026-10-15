'use client';

// ==============================================================================
// TỔ CHỨC VÀ CHỨC VỤ (ADMIN ORGANIZATION & POSITIONS - SCREEN 6)
// Hỗ trợ cây đơn vị động, tìm kiếm, Thêm/Sửa/Xóa Đơn vị & Chức danh,
// và đầy đủ 4 tab: Thông tin, Chức danh, Nhân sự, Lịch sử
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Plus,
  Search,
  Building2,
  Folder,
  CheckCircle2,
  Info,
  ChevronDown,
  Users,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  History,
} from 'lucide-react';
import { PositionDefinition, Unit } from '@/types';

export default function AdminOrganizationView() {
  const {
    units,
    positions,
    profiles,
    decisions,
    addUnit,
    updateUnit,
    deleteUnit,
    addPosition,
    updatePosition,
    deletePosition,
    selectedUnitId,
    setSelectedUnitId,
    setAdminTab,
    setSelectedProfileId,
  } = useApp();

  const [activeUnitId, setActiveUnitId] = useState<string>(
    selectedUnitId || units[0]?.id || 'unit_clb_truyen_thong'
  );
  const [activeTab, setActiveTab] = useState<'thong_tin' | 'chuc_danh' | 'nhan_su' | 'lich_su'>('chuc_danh');
  const [unitSearch, setUnitSearch] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modals
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isEditUnitOpen, setIsEditUnitOpen] = useState(false);
  const [isAddPosOpen, setIsAddPosOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PositionDefinition | null>(null);

  // New unit states
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitType, setNewUnitType] = useState<Unit['type']>('clb_doi_nhom');
  const [newUnitParent, setNewUnitParent] = useState('unit_hoi_sinh_vien');
  const [newUnitDesc, setNewUnitDesc] = useState('');

  // Edit unit states
  const [editUnitName, setEditUnitName] = useState('');
  const [editUnitCode, setEditUnitCode] = useState('');
  const [editUnitType, setEditUnitType] = useState<Unit['type']>('clb_doi_nhom');
  const [editUnitParent, setEditUnitParent] = useState('unit_hoi_sinh_vien');
  const [editUnitStatus, setEditUnitStatus] = useState<'active' | 'inactive'>('active');
  const [editUnitDesc, setEditUnitDesc] = useState('');

  // New position states
  const [newPosName, setNewPosName] = useState('');
  const [newPosGroup, setNewPosGroup] = useState<PositionDefinition['group']>('ban_chu_nhiem');
  const [newPosCount, setNewPosCount] = useState<string>('1');

  const selectedUnit =
    units.find((u) => u.id === activeUnitId) ||
    units.find((u) => u.id === 'unit_clb_truyen_thong') ||
    units[0];

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Tập hợp ID của đơn vị đang chọn và các phân hệ con trực thuộc
  const selectedAndChildIds = React.useMemo(() => {
    if (!selectedUnit) return new Set<string>();
    const set = new Set<string>([selectedUnit.id]);
    let added = true;
    while (added) {
      added = false;
      units.forEach((u) => {
        if (u.parent_id && set.has(u.parent_id) && !set.has(u.id)) {
          set.add(u.id);
          added = true;
        }
      });
    }
    return set;
  }, [selectedUnit, units]);

  const childUnits = React.useMemo(
    () => units.filter((u) => u.parent_id === selectedUnit?.id),
    [units, selectedUnit]
  );

  const parentUnitObj = React.useMemo(
    () => units.find((u) => u.id === selectedUnit?.parent_id) || null,
    [units, selectedUnit]
  );

  // Positions belonging to group/unit
  const isDoanFunction = selectedUnit?.type === 'don_vi_chuc_nang';
  const unitPositions = positions.filter((p) => {
    if (posSearch.trim() && !p.name.toLowerCase().includes(posSearch.toLowerCase())) {
      return false;
    }
    if (p.unit_id === selectedUnit?.id) return true;
    if (selectedUnit?.subsystem_id && p.subsystem_id === selectedUnit.subsystem_id && !p.unit_id) {
      return true;
    }
    if (isDoanFunction) return p.group === 'ban_dieu_hanh';
    if (selectedUnit?.type === 'clb_doi_nhom') return p.group === 'ban_chu_nhiem';
    if (selectedUnit?.type === 'chi_doan') return p.group === 'chi_doan';
    return p.group === 'ban_chap_hanh';
  });

  // Officers belonging to selectedUnit (and child sub-units if viewing a parent block)
  const unitOfficers = profiles.flatMap((p) =>
    p.roles
      .filter(
        (r) =>
          selectedAndChildIds.has(r.unit_id) ||
          r.unit_name === selectedUnit?.name
      )
      .map((role) => ({ profile: p, role }))
  );

  // Decisions belonging to selectedUnit (and child sub-units)
  const unitDecisions = decisions.filter(
    (d) => (d.unit_id && selectedAndChildIds.has(d.unit_id)) || d.unit_name === selectedUnit?.name
  );

  // Filter units for left tree
  const filteredUnits = units.filter((u) => {
    if (!unitSearch.trim()) return true;
    const q = unitSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q);
  });

  const doanUnits = filteredUnits.filter(
    (u) =>
      u.id === 'unit_doan_truong' ||
      u.parent_id === 'unit_doan_truong' ||
      u.parent_id === 'unit_doan_co_so' ||
      ['doan_truong', 'doan_co_so', 'don_vi_chuc_nang', 'chi_doan'].includes(u.type)
  );

  const hoiUnits = filteredUnits.filter(
    (u) =>
      u.id === 'unit_hoi_sinh_vien' ||
      u.parent_id === 'unit_hoi_sinh_vien' ||
      u.parent_id === 'unit_lien_chi_hoi' ||
      ['hoi_sinh_vien', 'lien_chi_hoi', 'clb_doi_nhom'].includes(u.type)
  );

  const dcsSubUnits = doanUnits.filter((u) => u.parent_id === 'unit_doan_co_so' && u.type === 'doan_co_so');
  const doanTopUnits = doanUnits.filter((u) => !(u.parent_id === 'unit_doan_co_so' && u.type === 'doan_co_so'));

  const lchSubUnits = hoiUnits.filter((u) => u.parent_id === 'unit_lien_chi_hoi' && u.type === 'lien_chi_hoi');
  const hoiTopUnits = hoiUnits.filter((u) => !(u.parent_id === 'unit_lien_chi_hoi' && u.type === 'lien_chi_hoi'));

  const handleSelectUnitNode = (id: string) => {
    setActiveUnitId(id);
    setSelectedUnitId(id);
  };

  const openEditUnitModal = () => {
    if (!selectedUnit) return;
    setEditUnitName(selectedUnit.name);
    setEditUnitCode(selectedUnit.code);
    setEditUnitType(selectedUnit.type);
    setEditUnitParent(selectedUnit.parent_id || 'unit_hoi_sinh_vien');
    setEditUnitStatus(selectedUnit.status);
    setEditUnitDesc(selectedUnit.description || '');
    setIsEditUnitOpen(true);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !newUnitCode.trim()) return;

    addUnit({
      code: newUnitCode.toUpperCase(),
      name: newUnitName.trim(),
      type: newUnitType,
      parent_id: newUnitParent,
      status: 'active',
      subsystem_id:
        newUnitType === 'don_vi_chuc_nang'
          ? 'P05'
          : newUnitType === 'clb_doi_nhom'
          ? 'P06'
          : newUnitType === 'lien_chi_hoi'
          ? 'P04'
          : newUnitType === 'doan_co_so'
          ? 'P03'
          : newUnitType === 'chi_doan'
          ? 'P07'
          : 'P01',
      established_date: new Date().toISOString().split('T')[0],
      description: newUnitDesc.trim() || `Đơn vị trực thuộc: ${newUnitName.trim()}`,
      member_count: 0,
    });

    setIsAddUnitOpen(false);
    setNewUnitName('');
    setNewUnitCode('');
    setNewUnitDesc('');
    showToast(`Đã thêm mới đơn vị: ${newUnitName}`);
  };

  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !editUnitName.trim() || !editUnitCode.trim()) return;

    const res = updateUnit(selectedUnit.id, {
      name: editUnitName.trim(),
      code: editUnitCode.trim().toUpperCase(),
      type: editUnitType,
      parent_id: editUnitParent,
      status: editUnitStatus,
      description: editUnitDesc.trim(),
    });
    setIsEditUnitOpen(false);
    showToast(res.message);
  };

  const handleDeleteCurrentUnit = () => {
    if (!selectedUnit) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn vị "${selectedUnit.name}"?`)) return;
    const res = deleteUnit(selectedUnit.id);
    if (res.success) {
      const remaining = units.filter((u) => u.id !== selectedUnit.id);
      if (remaining[0]) setActiveUnitId(remaining[0].id);
    }
    showToast(res.message);
  };

  const handleCreatePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosName.trim() || !selectedUnit) return;

    addPosition({
      name: newPosName.trim(),
      group: newPosGroup,
      expected_count: newPosCount === 'Nhieu_nguoi' ? 'Nhieu_nguoi' : parseInt(newPosCount) || 1,
      status: 'active',
      unit_id: selectedUnit.id,
    });

    setIsAddPosOpen(false);
    setNewPosName('');
    showToast(`Đã thêm chức danh mới: ${newPosName}`);
  };

  const handleSaveEditPos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPos) return;
    const res = updatePosition(editingPos.id, {
      name: editingPos.name,
      group: editingPos.group,
      expected_count: editingPos.expected_count,
      status: editingPos.status,
    });
    setEditingPos(null);
    showToast(res.message);
  };

  const handleDeletePos = (pos: PositionDefinition) => {
    if (!confirm(`Xóa chức danh "${pos.name}"?`)) return;
    const res = deletePosition(pos.id);
    showToast(res.message);
  };

  if (!selectedUnit) return null;

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

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN SECTION (TREE 4 COLS + DETAIL 8 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CƠ CẤU TỔ CHỨC TREE (DYNAMIC) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Cơ cấu tổ chức ({units.length})
              </h3>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn vị theo tên, mã..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Dynamic Tree nodes */}
            <div className="space-y-3 text-xs max-h-[600px] overflow-y-auto pr-1">
              {/* Khối Đoàn trường */}
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-black text-primary uppercase tracking-wider">
                  <ChevronDown className="h-3.5 w-3.5" />
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Hệ thống Đoàn Thanh niên ({doanUnits.length})</span>
                </div>
                <div className="pl-3 space-y-1 border-l-2 border-border ml-3 mt-1">
                  {doanTopUnits.map((u) => (
                    <div key={u.id} className="space-y-1">
                      <button
                        onClick={() => handleSelectUnitNode(u.id)}
                        className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl transition-colors text-left cursor-pointer ${
                          activeUnitId === u.id
                            ? 'bg-primary/15 text-primary font-bold shadow-2xs border border-primary/20'
                            : 'text-foreground hover:bg-muted font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{u.name}</span>
                          {u.id === 'unit_doan_co_so' && dcsSubUnits.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[9px] font-bold">
                              {dcsSubUnits.length} đơn vị
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {u.code}
                        </span>
                      </button>

                      {/* 15 Phân hệ con trực thuộc Đoàn cơ sở */}
                      {u.id === 'unit_doan_co_so' && dcsSubUnits.length > 0 && (
                        <div className="pl-3 ml-3 border-l-2 border-emerald-500/30 space-y-0.5 py-0.5">
                          {dcsSubUnits.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSelectUnitNode(sub.id)}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                                activeUnitId === sub.id
                                  ? 'bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-500/30'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium'
                              }`}
                            >
                              <span className="truncate text-[11px]">• {sub.name}</span>
                              <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                                {sub.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Khối Hội Sinh viên */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-black text-emerald-700 uppercase tracking-wider">
                  <ChevronDown className="h-3.5 w-3.5" />
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Hệ thống Hội Sinh viên ({hoiUnits.length})</span>
                </div>
                <div className="pl-3 space-y-1 border-l-2 border-border ml-3 mt-1">
                  {hoiTopUnits.map((u) => (
                    <div key={u.id} className="space-y-1">
                      <button
                        onClick={() => handleSelectUnitNode(u.id)}
                        className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl transition-colors text-left cursor-pointer ${
                          activeUnitId === u.id
                            ? 'bg-primary/15 text-primary font-bold shadow-2xs border border-primary/20'
                            : 'text-foreground hover:bg-muted font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{u.name}</span>
                          {u.id === 'unit_lien_chi_hoi' && lchSubUnits.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 text-[9px] font-bold">
                              {lchSubUnits.length} đơn vị
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {u.code}
                        </span>
                      </button>

                      {/* 14 Phân hệ con trực thuộc Liên chi hội */}
                      {u.id === 'unit_lien_chi_hoi' && lchSubUnits.length > 0 && (
                        <div className="pl-3 ml-3 border-l-2 border-purple-500/30 space-y-0.5 py-0.5">
                          {lchSubUnits.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSelectUnitNode(sub.id)}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                                activeUnitId === sub.id
                                  ? 'bg-purple-500/15 text-purple-700 font-bold border border-purple-500/30'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium'
                              }`}
                            >
                              <span className="truncate text-[11px]">• {sub.name}</span>
                              <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                                {sub.code}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UNIT CARD & 4 TABS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            {/* Header Card of selected unit */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
                  <Folder className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-foreground">{selectedUnit.name}</h2>
                    <span
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedUnit.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedUnit.status === 'active' ? 'bg-emerald-600' : 'bg-slate-500'
                        }`}
                      />
                      {selectedUnit.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                      {selectedUnit.type === 'don_vi_chuc_nang'
                        ? 'Đơn vị trực thuộc Đoàn trường'
                        : selectedUnit.type === 'clb_doi_nhom'
                        ? 'CLB / Đội / Nhóm Hội Sinh viên'
                        : selectedUnit.type === 'doan_co_so'
                        ? 'Đoàn cơ sở'
                        : selectedUnit.type === 'lien_chi_hoi'
                        ? 'Liên chi hội'
                        : 'Tổ chức Đoàn - Hội'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground pt-1">
                    <span>
                      Mã đơn vị: <strong className="text-foreground font-mono">{selectedUnit.code}</strong>
                    </span>
                    <span>
                      Cấp trên:{' '}
                      <strong className="text-foreground">
                        {parentUnitObj ? parentUnitObj.name : 'Cấp Trường'}
                      </strong>
                    </span>
                    <span>
                      Nhân sự hiện tại: <strong className="text-primary">{unitOfficers.length}</strong>
                    </span>
                    {childUnits.length > 0 && (
                      <span>
                        Phân hệ con trực thuộc:{' '}
                        <strong className="text-emerald-600">{childUnits.length} đơn vị</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openEditUnitModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-foreground cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 text-primary" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={handleDeleteCurrentUnit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border text-xs font-bold overflow-x-auto">
              {[
                { id: 'thong_tin', label: 'Thông tin đơn vị' },
                { id: 'chuc_danh', label: `Chức danh (${unitPositions.length})` },
                { id: 'nhan_su', label: `Nhân sự (${unitOfficers.length})` },
                { id: 'lich_su', label: `Lịch sử quyết định (${unitDecisions.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: THÔNG TIN ĐƠN VỊ */}
            {activeTab === 'thong_tin' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Tên đơn vị</span>
                    <strong className="text-foreground text-sm mt-0.5 block">{selectedUnit.name}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Mã định danh</span>
                    <strong className="text-foreground font-mono text-sm mt-0.5 block">
                      {selectedUnit.code}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Phân hệ quản lý</span>
                    <strong className="text-foreground text-sm mt-0.5 block">
                      {selectedUnit.subsystem_id}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Ngày thành lập</span>
                    <strong className="text-foreground text-sm mt-0.5 block">
                      {selectedUnit.established_date || '01/09/2020'}
                    </strong>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border">
                  <span className="text-muted-foreground block text-[11px] font-bold mb-1">
                    Mô tả chức năng / Nhiệm vụ
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {selectedUnit.description ||
                      'Đơn vị trực thuộc hệ thống Đoàn Thanh niên - Hội Sinh viên Trường Đại học Sư phạm Kỹ thuật TP.HCM.'}
                  </p>
                </div>

                {childUnits.length > 0 && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary uppercase tracking-wider">
                        Các phân hệ con trực thuộc {selectedUnit.name} ({childUnits.length})
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Bấm vào từng đơn vị để quản lý nhân sự và chức danh riêng
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {childUnits.map((cu) => (
                        <button
                          key={cu.id}
                          onClick={() => handleSelectUnitNode(cu.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate text-xs">{cu.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{cu.code}</p>
                          </div>
                          <span className="text-[10px] font-bold text-primary shrink-0 ml-2">Mở →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={openEditUnitModal}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Chỉnh sửa thông tin đơn vị</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CHỨC DANH */}
            {activeTab === 'chuc_danh' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Danh sách chức danh ({unitPositions.length})
                  </h3>
                  <div className="relative w-full sm:w-64">
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
                              : pos.group === 'chi_doan'
                              ? 'Chi đoàn'
                              : 'Ban Chấp hành'}
                          </td>
                          <td className="py-3 px-3 text-foreground font-medium">
                            {pos.expected_count === 'Nhieu_nguoi' ? 'Nhiều người' : pos.expected_count}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              {pos.status === 'active' ? 'Đang áp dụng' : 'Tạm ngưng'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setEditingPos(pos)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary cursor-pointer"
                                title="Sửa chức danh"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePos(pos)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-600 cursor-pointer"
                                title="Xóa chức danh"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Callout Notice */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Đơn vị chức năng Đoàn trường sử dụng:{' '}
                    <strong className="font-bold">Ban điều hành</strong> (CLB/Đội/Nhóm Hội Sinh viên sử
                    dụng: <strong className="font-bold">Ban chủ nhiệm</strong>)
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: NHÂN SỰ TRONG ĐƠN VỊ */}
            {activeTab === 'nhan_su' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Danh sách cán bộ thuộc {selectedUnit.name} ({unitOfficers.length})
                  </h3>
                  <button
                    onClick={() => setAdminTab('ho_so')}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Quản lý toàn bộ hồ sơ &gt;
                  </button>
                </div>

                {unitOfficers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Chưa có cán bộ nào được phân công vào đơn vị này.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-bold bg-muted/20">
                          <th className="py-2.5 px-3">Họ và tên</th>
                          <th className="py-2.5 px-3">MSSV / Mã CB</th>
                          <th className="py-2.5 px-3">Chức vụ đảm nhiệm</th>
                          <th className="py-2.5 px-3">Nhiệm kỳ</th>
                          <th className="py-2.5 px-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {unitOfficers.map(({ profile, role }, i) => (
                          <tr key={role.id + i} className="hover:bg-muted/40">
                            <td className="py-3 px-3 font-bold text-foreground">{profile.full_name}</td>
                            <td className="py-3 px-3 font-mono text-muted-foreground">
                              {profile.student_id || profile.staff_id}
                            </td>
                            <td className="py-3 px-3 font-semibold text-primary">{role.position_title}</td>
                            <td className="py-3 px-3 text-muted-foreground">{role.term}</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedProfileId(profile.id);
                                  setAdminTab('ho_so');
                                }}
                                className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5 text-primary font-bold text-[11px] hover:bg-primary/15 cursor-pointer"
                              >
                                Xem hồ sơ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LỊCH SỬ QUYẾT ĐỊNH CỦA ĐƠN VỊ */}
            {activeTab === 'lich_su' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Quyết định kiện toàn / nhân sự của đơn vị ({unitDecisions.length})
                  </h3>
                  <button
                    onClick={() => setAdminTab('quyet_dinh')}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Tạo quyết định mới &gt;
                  </button>
                </div>

                {unitDecisions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Chưa có quyết định nhân sự nào liên quan đến đơn vị này.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {unitDecisions.map((dec) => (
                      <div
                        key={dec.id}
                        className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-primary">{dec.decision_number}</span>
                            <span className="font-bold text-foreground">{dec.title}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Cơ quan ban hành: {dec.issuing_authority} • Ngày hiệu lực: {dec.effective_date}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                          {dec.status === 'approved' ? 'Đã ban hành' : 'Lưu nháp'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
                  <option value="doan_co_so">Đoàn cơ sở</option>
                  <option value="lien_chi_hoi">Liên chi hội</option>
                  <option value="chi_doan">Chi đoàn</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground">Mô tả nhiệm vụ</label>
                <textarea
                  rows={2}
                  value={newUnitDesc}
                  onChange={(e) => setNewUnitDesc(e.target.value)}
                  placeholder="Mô tả chức năng, nhiệm vụ của đơn vị..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Tạo đơn vị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SỬA ĐƠN VỊ */}
      {isEditUnitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Chỉnh sửa thông tin đơn vị</h3>
              <button
                onClick={() => setIsEditUnitOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUnit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Tên đơn vị *</label>
                <input
                  type="text"
                  required
                  value={editUnitName}
                  onChange={(e) => setEditUnitName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Mã đơn vị *</label>
                  <input
                    type="text"
                    required
                    value={editUnitCode}
                    onChange={(e) => setEditUnitCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 font-mono uppercase focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Trạng thái</label>
                  <select
                    value={editUnitStatus}
                    onChange={(e) => setEditUnitStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground">Loại tổ chức</label>
                <select
                  value={editUnitType}
                  onChange={(e) => setEditUnitType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                >
                  <option value="clb_doi_nhom">Câu lạc bộ, Đội, Nhóm (Hội Sinh viên)</option>
                  <option value="don_vi_chuc_nang">Đơn vị chức năng (Đoàn trường)</option>
                  <option value="doan_co_so">Đoàn cơ sở</option>
                  <option value="lien_chi_hoi">Liên chi hội</option>
                  <option value="chi_doan">Chi đoàn</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground">Mô tả</label>
                <textarea
                  rows={3}
                  value={editUnitDesc}
                  onChange={(e) => setEditUnitDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditUnitOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
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
                  <option value="chi_doan">Chi đoàn</option>
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
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Thêm chức danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHỈNH SỬA CHỨC DANH */}
      {editingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Chỉnh sửa chức danh</h3>
              <button
                onClick={() => setEditingPos(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPos} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Tên chức danh *</label>
                <input
                  type="text"
                  required
                  value={editingPos.name}
                  onChange={(e) => setEditingPos({ ...editingPos, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Thuộc nhóm</label>
                <select
                  value={editingPos.group}
                  onChange={(e) => setEditingPos({ ...editingPos, group: e.target.value as any })}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                >
                  <option value="ban_chu_nhiem">Ban chủ nhiệm</option>
                  <option value="ban_dieu_hanh">Ban điều hành</option>
                  <option value="ban_chap_hanh">Ban Chấp hành</option>
                  <option value="chi_doan">Chi đoàn</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground">Số lượng dự kiến</label>
                <select
                  value={String(editingPos.expected_count)}
                  onChange={(e) =>
                    setEditingPos({
                      ...editingPos,
                      expected_count:
                        e.target.value === 'Nhieu_nguoi' ? 'Nhieu_nguoi' : parseInt(e.target.value) || 1,
                    })
                  }
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
                  onClick={() => setEditingPos(null)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
