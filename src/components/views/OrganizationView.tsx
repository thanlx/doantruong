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
    profiles,
    selectedUnitId,
    setSelectedUnitId,
  } = useApp();

  // Filters
  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemId>('P06'); // Default to Đơn vị trực thuộc Hội Sinh viên
  const [unitFilter, setUnitFilter] = useState<string>('unit_clb_truyen_thong');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [targetDate, setTargetDate] = useState<string>('2026-10-13');
  const [timeMode, setTimeMode] = useState<'current' | 'history'>('current');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Profile Modal state
  const [viewingProfile, setViewingProfile] = useState<OfficerProfile | null>(null);

  // Sync unitFilter with selectedUnitId & auto-sync subsystem
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setUnitFilter(unitId);
    if (unitId !== 'all') {
      const targetU = units.find((u) => u.id === unitId);
      if (targetU?.subsystem_id) {
        setSelectedSubsystem(targetU.subsystem_id);
      }
    }
  };

  // Find currently active unit
  const activeUnit = units.find((u) => u.id === unitFilter) || units.find((u) => u.id === 'unit_clb_truyen_thong') || units[0];

  // Tập hợp ID của đơn vị đang chọn và các phân hệ con trực thuộc
  const unitAndChildrenIds = useMemo(() => {
    if (!unitFilter || unitFilter === 'all') return null;
    const set = new Set<string>([unitFilter]);
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
  }, [unitFilter, units]);

  const dcsSubUnits = useMemo(
    () => units.filter((u) => u.parent_id === 'unit_doan_co_so' && u.type === 'doan_co_so'),
    [units]
  );

  const lchSubUnits = useMemo(
    () => units.filter((u) => u.parent_id === 'unit_lien_chi_hoi' && u.type === 'lien_chi_hoi'),
    [units]
  );

  const clbUnits = useMemo(
    () => units.filter((u) => u.parent_id === 'unit_hoi_sinh_vien' && u.type === 'clb_doi_nhom'),
    [units]
  );

  // Filter officers based on criteria and Section 1 time rules!
  const filteredOfficers = useMemo(() => {
    return profiles.flatMap((p) => {
      // Find matching roles for this officer
      const matchingRoles = p.roles.filter((r) => {
        // Subsystem match if not all
        if (selectedSubsystem && r.subsystem_id !== selectedSubsystem) return false;

        // Unit match if specified (including child sub-units when a parent block is selected)
        if (unitAndChildrenIds && !unitAndChildrenIds.has(r.unit_id)) return false;

        // Position title filter
        if (positionFilter !== 'all' && !r.position_title.toLowerCase().includes(positionFilter.toLowerCase())) {
          return false;
        }

        // Time evaluation according to Section 1:
        // A role is displayed as current when target date is between start_date and end_date (or end_date is null)
        const checkDate = targetDate || '2026-10-13';
        if (r.start_date > checkDate) return false; // Future
        if (r.end_date && r.end_date < checkDate) {
          if (timeMode === 'current') return false; // Past ended role, only show in history mode
        }

        return true;
      });

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.full_name.toLowerCase().includes(query);
        const matchesMssv = p.student_id?.toLowerCase().includes(query);
        const matchesRole = matchingRoles.some((r) => r.position_title.toLowerCase().includes(query));
        if (!matchesName && !matchesMssv && !matchesRole) return [];
      }

      return matchingRoles.map((role) => ({
        profile: p,
        role,
      }));
    });
  }, [profiles, selectedSubsystem, unitAndChildrenIds, positionFilter, targetDate, timeMode, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Tra cứu tổ chức và cán bộ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi cơ cấu 7 phân hệ nhân sự và danh sách cán bộ theo mốc thời gian
          </p>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
          Dữ liệu minh họa
        </span>
      </div>

      {/* 2. 7 PILL TABS OF SUBSYSTEMS (MỤC 1 & SCREEN 1 MOCKUP) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {subsystems.map((sub) => {
          const isActive = selectedSubsystem === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubsystem(sub.id);
                // Also adjust default unit for subsystem
                const defaultUnit = units.find((u) => u.subsystem_id === sub.id);
                if (defaultUnit) handleSelectUnit(defaultUnit.id);
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
              onChange={(e) => setSelectedSubsystem(e.target.value as SubsystemId)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
            >
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
              <option value="all">Tất cả đơn vị</option>
              {units.map((u) => (
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
              <option value="all">Tất cả</option>
              <option value="Chủ nhiệm">Chủ nhiệm</option>
              <option value="Phó chủ nhiệm">Phó chủ nhiệm</option>
              <option value="Bí thư">Bí thư</option>
              <option value="Ủy viên">Ủy viên</option>
              <option value="Thành viên">Thành viên</option>
            </select>
          </div>

          {/* Thời điểm tra cứu (Date picker) */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Thời điểm</label>
            <div className="relative mt-1">
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground pr-8 focus:border-primary focus:outline-hidden"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom row: Time toggle & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
          {/* Hiện tại / Lịch sử Toggle */}
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

          {/* Search bar & Search button */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo họ tên, chức vụ..."
                className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer shrink-0">
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
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cơ cấu tổ chức</h3>

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
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">{activeUnit.name}</h2>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {activeUnit.type === 'clb_doi_nhom'
                    ? 'Ban chủ nhiệm'
                    : activeUnit.type === 'don_vi_chuc_nang'
                    ? 'Ban điều hành'
                    : 'Ban Chấp hành'}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                Dữ liệu minh họa
              </span>
            </div>

            {/* Table of Members */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Chức vụ</th>
                    <th className="py-3 px-3">Thời gian đảm nhiệm</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Không tìm thấy cán bộ nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((item, idx) => (
                      <tr key={item.role.id + idx} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3 text-center text-muted-foreground font-semibold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground block">{item.profile.full_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            MSSV: {item.profile.student_id || item.profile.staff_id}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {item.role.position_title}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {item.role.start_date.substring(0, 7)} –{' '}
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
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-lg">
                  {viewingProfile.full_name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{viewingProfile.full_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    MSSV: {viewingProfile.student_id} • {viewingProfile.major}
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
                <span className="text-[10px] text-muted-foreground block font-bold">Tình trạng Đoàn</span>
                <span className="font-semibold text-foreground">
                  {viewingProfile.is_union_member ? 'Đoàn viên' : 'Chưa kết nạp'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Quê quán</span>
                <span className="font-semibold text-foreground">{viewingProfile.hometown}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <span className="text-[10px] text-muted-foreground block font-bold">Nơi ở hiện nay</span>
                <span className="font-semibold text-foreground">{viewingProfile.current_residence}</span>
              </div>
            </div>

            {/* Roles list */}
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Các chức vụ đang đảm nhiệm ({viewingProfile.roles.length})
              </p>
              <div className="space-y-2">
                {viewingProfile.roles.map((r) => (
                  <div key={r.id} className="p-2.5 rounded-xl border border-border bg-background text-xs">
                    <p className="font-bold text-foreground">{r.position_title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.unit_name} • Từ {r.start_date} đến {r.end_date || 'Hiện tại'}
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
