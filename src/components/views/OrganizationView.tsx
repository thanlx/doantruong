'use client';

// ==============================================================================
// TRA CỨU TỔ CHỨC VÀ CÁN BỘ (ORGANIZATION & STAFF LOOKUP - SCREEN 1 & 15)
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  SubsystemId,
  OfficerProfile,
  Unit,
} from '@/types';
import {
  Search,
  Calendar,
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Eye,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';

export default function OrganizationView() {
  const {
    subsystems,
    units,
    allUnits,
    profiles,
    allProfiles,
    selectedUnitId,
    setSelectedUnitId,
  } = useApp();

  const directoryUnits = allUnits && allUnits.length > 0 ? allUnits : units;
  const directoryProfiles = allProfiles && allProfiles.length > 0 ? allProfiles : profiles;

  // Filters: Mặc định hiển thị Tất cả phân hệ & Tất cả đơn vị để mọi cán bộ nhập từ Admin hiển thị ngay lập tức
  const [selectedSubsystem, setSelectedSubsystem] = useState<'all' | SubsystemId>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [targetDate, setTargetDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [timeMode, setTimeMode] = useState<'current' | 'history'>('current');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Profile Modal state
  const [viewingProfile, setViewingProfile] = useState<OfficerProfile | null>(null);

  // Sync unitFilter with selectedUnitId & auto-sync subsystem
  const handleSelectUnit = (unitId: string) => {
    setUnitFilter(unitId);
    if (unitId === 'all') {
      setSelectedSubsystem('all');
      return;
    }
    setSelectedUnitId(unitId);
    // Nếu chọn đơn vị cha có nhiều phân hệ con (Đoàn trường, Hội SV, Đoàn cơ sở, Liên chi hội) thì để phân hệ = 'all' để không lọc mất các phân hệ con
    const hasChildren = directoryUnits.some((u) => u.parent_id === unitId);
    if (hasChildren) {
      setSelectedSubsystem('all');
    } else {
      const targetU = directoryUnits.find((u) => u.id === unitId);
      if (targetU?.subsystem_id) {
        setSelectedSubsystem(targetU.subsystem_id);
      }
    }
  };

  // Find currently active unit
  const activeUnit =
    unitFilter === 'all'
      ? null
      : directoryUnits.find((u) => u.id === unitFilter) || directoryUnits[0];

  // Tập hợp ID của đơn vị đang chọn và các phân hệ con trực thuộc
  const unitAndChildrenIds = useMemo(() => {
    if (!unitFilter || unitFilter === 'all') return null;
    const set = new Set<string>([unitFilter]);
    let added = true;
    while (added) {
      added = false;
      directoryUnits.forEach((u) => {
        if (u.parent_id && set.has(u.parent_id) && !set.has(u.id)) {
          set.add(u.id);
          added = true;
        }
      });
    }
    return set;
  }, [unitFilter, directoryUnits]);

  const dcsSubUnits = useMemo(
    () => directoryUnits.filter((u) => u.parent_id === 'unit_doan_co_so' && u.type === 'doan_co_so'),
    [directoryUnits]
  );

  const lchSubUnits = useMemo(
    () => directoryUnits.filter((u) => u.parent_id === 'unit_lien_chi_hoi' && u.type === 'lien_chi_hoi'),
    [directoryUnits]
  );

  const clbUnits = useMemo(
    () => directoryUnits.filter((u) => u.parent_id === 'unit_hoi_sinh_vien' && u.type === 'clb_doi_nhom'),
    [directoryUnits]
  );

  // Filter officers based on criteria and Section 1 time rules!
  const filteredOfficers = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkDate = targetDate || todayStr;

    return directoryProfiles.flatMap((p) => {
      const primaryUnitObj = directoryUnits.find((u) => u.id === p.primary_unit_id);
      const effectiveRoles =
        p.roles && p.roles.length > 0
          ? p.roles
          : [
              {
                id: `role_fallback_${p.id}`,
                profile_id: p.id,
                unit_id: p.primary_unit_id || 'unit_doan_truong',
                unit_name: primaryUnitObj?.name || 'Đoàn trường',
                subsystem_id: (primaryUnitObj?.subsystem_id || p.primary_subsystem_id || 'P03') as SubsystemId,
                position_title: 'Cán bộ Đoàn - Hội',
                term: '2025 - 2027',
                start_date: p.created_at || todayStr,
                end_date: null,
                status: 'active' as const,
              },
            ];

      // Find matching roles for this officer
      const matchingRoles = effectiveRoles.filter((r) => {
        const roleUnitObj = directoryUnits.find((u) => u.id === r.unit_id);
        const resolvedSubsystem = roleUnitObj?.subsystem_id || r.subsystem_id || p.primary_subsystem_id;

        // Subsystem match if not all
        if (
          selectedSubsystem !== 'all' &&
          resolvedSubsystem !== selectedSubsystem &&
          r.subsystem_id !== selectedSubsystem &&
          p.primary_subsystem_id !== selectedSubsystem
        ) {
          return false;
        }

        // Unit match if specified (including child sub-units when a parent block is selected)
        if (unitAndChildrenIds) {
          const matchesUnitId =
            unitAndChildrenIds.has(r.unit_id) ||
            (p.primary_unit_id && unitAndChildrenIds.has(p.primary_unit_id));
          const matchesUnitName =
            activeUnit &&
            r.unit_name &&
            r.unit_name.toLowerCase() === activeUnit.name.toLowerCase();
          if (!matchesUnitId && !matchesUnitName) return false;
        }

        // Position title filter
        if (
          positionFilter !== 'all' &&
          !r.position_title.toLowerCase().includes(positionFilter.toLowerCase())
        ) {
          return false;
        }

        // Time evaluation:
        // Ở chế độ Hiện tại ('current'), hiển thị toàn bộ chức vụ đang hoạt động (status !== 'ended') và chưa hết hạn trước thời điểm tra cứu
        if (timeMode === 'current') {
          if (r.status === 'ended') return false;
          if (r.end_date && r.end_date < checkDate) return false;
          // Chỉ ẩn chức vụ tương lai nếu người dùng chọn ngày tra cứu nhỏ hơn ngày bắt đầu và status === 'future'
          if (r.status === 'future' && r.start_date > checkDate) return false;
        } else {
          // Chế độ Lịch sử ('history'): hiển thị tất cả chức vụ đã bắt đầu tính đến thời điểm tra cứu
          if (checkDate && r.start_date > checkDate && checkDate < todayStr) return false;
        }

        return true;
      });

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.full_name.toLowerCase().includes(query);
        const matchesMssv =
          p.student_id?.toLowerCase().includes(query) || p.staff_id?.toLowerCase().includes(query);
        const matchesEmail = p.email?.toLowerCase().includes(query);
        const matchesUnit = matchingRoles.some((r) => r.unit_name?.toLowerCase().includes(query));
        const matchesRole = matchingRoles.some((r) => r.position_title.toLowerCase().includes(query));
        if (!matchesName && !matchesMssv && !matchesEmail && !matchesUnit && !matchesRole) return [];
      }

      return matchingRoles.map((role) => ({
        profile: p,
        role: {
          ...role,
          unit_name:
            directoryUnits.find((u) => u.id === role.unit_id)?.name || role.unit_name || 'Đoàn trường',
        },
      }));
    });
  }, [
    directoryProfiles,
    directoryUnits,
    selectedSubsystem,
    unitAndChildrenIds,
    activeUnit,
    positionFilter,
    targetDate,
    timeMode,
    searchQuery,
  ]);

  const uniqueMatchedOfficerCount = useMemo(
    () => new Set(filteredOfficers.map((item) => item.profile.id)).size,
    [filteredOfficers]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Tra cứu tổ chức và cán bộ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi cơ cấu 7 phân hệ nhân sự và danh sách cán bộ toàn trường đồng bộ trực tiếp từ trang Quản trị
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
            Tổng hệ thống: {directoryProfiles.length} cán bộ • {directoryUnits.length} đơn vị
          </span>
        </div>
      </div>

      {/* 2. PILL TABS OF SUBSYSTEMS (MỤC 1 & SCREEN 1 MOCKUP) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedSubsystem('all');
            setUnitFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
            selectedSubsystem === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          }`}
        >
          Tất cả phân hệ ({directoryProfiles.length})
        </button>
        {subsystems.map((sub) => {
          const isActive = selectedSubsystem === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubsystem(sub.id);
                setUnitFilter('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* 3. FILTER BOX CARD */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phân hệ */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Phân hệ</label>
            <select
              value={selectedSubsystem}
              onChange={(e) => {
                const val = e.target.value as 'all' | SubsystemId;
                setSelectedSubsystem(val);
                if (val !== 'all') {
                  setUnitFilter('all');
                }
              }}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Tất cả phân hệ (7 phân hệ)</option>
              {subsystems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Đơn vị */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Đơn vị</label>
            <select
              value={unitFilter}
              onChange={(e) => handleSelectUnit(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Tất cả đơn vị ({directoryUnits.length} đơn vị)</option>
              {directoryUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chức vụ */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Chức vụ</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Tất cả chức vụ</option>
              <option value="Bí thư">Bí thư / Phó Bí thư</option>
              <option value="Chủ tịch">Chủ tịch / Phó Chủ tịch</option>
              <option value="Liên chi hội trưởng">Liên chi hội trưởng / Phó</option>
              <option value="Chủ nhiệm">Chủ nhiệm / Phó chủ nhiệm</option>
              <option value="Ủy viên">Ủy viên BCH / BTV</option>
              <option value="Thành viên">Thành viên</option>
            </select>
          </div>

          {/* Thời điểm tra cứu (Date picker) */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Thời điểm</label>
            <div className="relative mt-1">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Bottom row: Time toggle & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
          {/* Hiện tại / Lịch sử Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-border p-1 bg-muted/40 shrink-0">
              <button
                onClick={() => setTimeMode('current')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeMode === 'current'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hiện tại
              </button>
              <button
                onClick={() => setTimeMode('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeMode === 'history'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lịch sử
              </button>
            </div>

            {(selectedSubsystem !== 'all' || unitFilter !== 'all' || positionFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedSubsystem('all');
                  setUnitFilter('all');
                  setPositionFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Search bar & Search button */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo họ tên, MSSV, email, chức vụ, đơn vị..."
                className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => setSearchQuery((q) => q.trim())}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer shrink-0"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN SECTION: TREE VIEW (1/3) & MEMBERS TABLE (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (1/3): CƠ CẤU TỔ CHỨC TREE */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cơ cấu tổ chức</h3>
              <button
                onClick={() => handleSelectUnit('all')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  unitFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Toàn trường ({directoryProfiles.length})
              </button>
            </div>

            {/* Tree nodes */}
            <div className="space-y-2 text-xs max-h-[560px] overflow-y-auto pr-1">
              {/* Branch 1: Đoàn trường */}
              <div className="space-y-1">
                <button
                  onClick={() => handleSelectUnit('unit_doan_truong')}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                    unitFilter === 'unit_doan_truong'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Đoàn trường</span>
                </button>

                <div className="pl-4 space-y-1 border-l-2 border-border ml-3">
                  {/* Đoàn cơ sở + 15 phân hệ con */}
                  <div className="space-y-1">
                    <button
                      onClick={() => handleSelectUnit('unit_doan_co_so')}
                      className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                        unitFilter === 'unit_doan_co_so'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Đoàn cơ sở</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[9px] font-bold">
                        {dcsSubUnits.length}
                      </span>
                    </button>

                    {dcsSubUnits.length > 0 && (
                      <div className="pl-3 ml-3 border-l-2 border-emerald-500/30 space-y-0.5 py-0.5">
                        {dcsSubUnits.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectUnit(sub.id)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                              unitFilter === sub.id
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

                  <button
                    onClick={() => handleSelectUnit('unit_chi_doan')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      unitFilter === 'unit_chi_doan'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Chi đoàn</span>
                  </button>

                  <button
                    onClick={() => handleSelectUnit('unit_chuc_nang_doan')}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                      unitFilter === 'unit_chuc_nang_doan'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5 text-amber-600" />
                    <span>Đơn vị chức năng</span>
                  </button>
                </div>
              </div>

              {/* Branch 2: Hội Sinh viên trường */}
              <div className="space-y-1 pt-2">
                <button
                  onClick={() => handleSelectUnit('unit_hoi_sinh_vien')}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl font-bold transition-colors text-left cursor-pointer ${
                    unitFilter === 'unit_hoi_sinh_vien'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Hội Sinh viên trường</span>
                </button>

                <div className="pl-4 space-y-1 border-l-2 border-border ml-3">
                  {/* Liên chi hội + 14 phân hệ con */}
                  <div className="space-y-1">
                    <button
                      onClick={() => handleSelectUnit('unit_lien_chi_hoi')}
                      className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                        unitFilter === 'unit_lien_chi_hoi'
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-purple-600" />
                        <span>Liên chi hội</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 text-[9px] font-bold">
                        {lchSubUnits.length}
                      </span>
                    </button>

                    {lchSubUnits.length > 0 && (
                      <div className="pl-3 ml-3 border-l-2 border-purple-500/30 space-y-0.5 py-0.5">
                        {lchSubUnits.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectUnit(sub.id)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer ${
                              unitFilter === sub.id
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

                  {clbUnits.map((clb) => (
                    <button
                      key={clb.id}
                      onClick={() => handleSelectUnit(clb.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                        unitFilter === clb.id
                          ? 'bg-primary/15 text-primary font-bold shadow-2xs border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 text-cyan-600" />
                      <span>{clb.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/3): UNIT DETAIL & MEMBERS TABLE */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
            {/* Header of Unit Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  {activeUnit ? activeUnit.name : 'Danh sách cán bộ Đoàn – Hội toàn trường'}
                </h2>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {activeUnit
                    ? activeUnit.type === 'clb_doi_nhom'
                      ? 'Ban chủ nhiệm'
                      : activeUnit.type === 'don_vi_chuc_nang'
                      ? 'Ban điều hành'
                      : 'Ban Chấp hành & Cán bộ trực thuộc'
                    : selectedSubsystem === 'all'
                    ? 'Tất cả 7 phân hệ tổ chức Đoàn TNCS Hồ Chí Minh & Hội Sinh viên Trường'
                    : subsystems.find((s) => s.id === selectedSubsystem)?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  {uniqueMatchedOfficerCount} cán bộ • {filteredOfficers.length} chức vụ
                </span>
              </div>
            </div>

            {/* Table of Members */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Đơn vị</th>
                    <th className="py-3 px-3">Chức vụ</th>
                    <th className="py-3 px-3">Thời gian đảm nhiệm</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Không tìm thấy cán bộ nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((item, idx) => (
                      <tr key={item.role.id + '_' + idx} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3 text-center text-muted-foreground font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground block">{item.profile.full_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            MSSV/Mã CB: {item.profile.student_id || item.profile.staff_id || item.profile.profile_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground font-medium">
                          {item.role.unit_name}
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {item.role.position_title}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {(item.role.start_date || '').substring(0, 7)} –{' '}
                          {item.role.end_date ? item.role.end_date.substring(0, 7) : 'Hiện tại'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setViewingProfile(item.profile)}
                            className="px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Xem hồ sơ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. VIEW PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-lg">
                  {viewingProfile.full_name.split(' ').slice(-1)[0]?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{viewingProfile.full_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    MSSV/Mã CB: {viewingProfile.student_id || viewingProfile.staff_id} •{' '}
                    {viewingProfile.major || viewingProfile.qualification || 'HCMUTE'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProfile(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Mã hồ sơ</span>
                <span className="font-mono font-bold text-foreground">{viewingProfile.profile_code}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Email liên hệ</span>
                <span className="font-semibold text-foreground break-all">{viewingProfile.email || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Số điện thoại</span>
                <span className="font-semibold text-foreground">{viewingProfile.phone || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Ngày sinh & Giới tính</span>
                <span className="font-semibold text-foreground">
                  {viewingProfile.date_of_birth || '—'} ({viewingProfile.gender || 'Nam'})
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Tình trạng Đoàn / Đảng</span>
                <span className="font-semibold text-foreground">
                  {viewingProfile.is_union_member ? 'Đoàn viên' : 'Hội viên'}{' '}
                  {viewingProfile.is_party_member ? '• Đảng viên' : ''}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Chuyên môn / Lý luận CT</span>
                <span className="font-semibold text-foreground">
                  {viewingProfile.qualification || 'Sinh viên'} • {viewingProfile.political_theory || 'Sơ cấp'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Quê quán</span>
                <span className="font-semibold text-foreground">{viewingProfile.hometown || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Nơi ở hiện nay</span>
                <span className="font-semibold text-foreground">{viewingProfile.current_residence || '—'}</span>
              </div>
            </div>

            {/* Roles list */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Các chức vụ đảm nhiệm ({viewingProfile.roles.length})
              </p>
              <div className="space-y-2">
                {viewingProfile.roles.map((r) => (
                  <div key={r.id} className="p-2.5 rounded-xl border border-border bg-background text-xs">
                    <p className="font-bold text-foreground">{r.position_title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {directoryUnits.find((u) => u.id === r.unit_id)?.name || r.unit_name} • Nhiệm kỳ{' '}
                      {r.term || '2025 - 2027'} • Từ {r.start_date} đến {r.end_date || 'Hiện tại'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingProfile(null)}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
