'use client';

// ==============================================================================
// QUẢN LÝ HỒ SƠ CÁN BỘ (ADMIN PROFILES VIEW - SCREEN 8 MOCKUP)
// Hỗ trợ tìm kiếm, lọc, xem chi tiết, thêm cán bộ, và nhập Excel kiểm tra trùng!
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Lock,
  Building2,
  UserCheck,
  ChevronRight,
  MoreVertical,
  X,
  Upload,
} from 'lucide-react';
import { OfficerProfile } from '@/types';

export default function AdminProfilesView() {
  const {
    profiles,
    subsystems,
    units,
    addProfile,
  } = useApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [subsystemFilter, setSubsystemFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected profile for right-side drawer
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles[0]?.id || 'prof_minh_anh');
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const [activeDetailTab, setActiveDetailTab] = useState<'ca_nhan' | 'chuc_vu' | 'lich_su'>('ca_nhan');

  // Create Profile Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUnitId, setNewUnitId] = useState('unit_doan_co_so');
  const [newPosition, setNewPosition] = useState('Ủy viên BCH');
  const [createError, setCreateError] = useState<string | null>(null);

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.full_name.toLowerCase().includes(q);
      const matchMssv = p.student_id?.toLowerCase().includes(q) || p.staff_id?.toLowerCase().includes(q);
      if (!matchName && !matchMssv) return false;
    }
    if (subsystemFilter !== 'all' && p.primary_subsystem_id !== subsystemFilter) return false;
    if (unitFilter !== 'all' && p.primary_unit_id !== unitFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified' && p.verification_status !== 'verified') return false;
      if (statusFilter === 'pending' && p.verification_status !== 'pending_update') return false;
    }
    return true;
  });

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newFullName.trim() || !newStudentId.trim()) {
      setCreateError('Vui lòng nhập Họ tên và MSSV/Mã cán bộ.');
      return;
    }

    const selectedUnitObj = units.find((u) => u.id === newUnitId);

    const res = addProfile({
      profile_code: '',
      full_name: newFullName,
      officer_type: 'sinh_vien',
      student_id: newStudentId,
      date_of_birth: '2005-01-01',
      gender: 'Nam',
      hometown: 'TP. Hồ Chí Minh',
      current_residence: 'TP. Hồ Chí Minh',
      ethnicity: 'Kinh',
      religion: 'Không',
      email: newEmail || `${newStudentId}@email.vn`,
      phone: newPhone || '0901234567',
      verification_status: 'verified',
      primary_subsystem_id: selectedUnitObj?.subsystem_id || 'P03',
      primary_unit_id: newUnitId,
      is_union_member: true,
      is_party_member: false,
      roles: [
        {
          id: 'role_' + Date.now(),
          profile_id: '',
          unit_id: newUnitId,
          unit_name: selectedUnitObj?.name || 'Đoàn cơ sở',
          subsystem_id: selectedUnitObj?.subsystem_id || 'P03',
          position_title: newPosition,
          term: '2026 - 2027',
          start_date: '2026-09-01',
          end_date: null,
          status: 'active',
        },
      ],
    });

    if (!res.success) {
      setCreateError(res.message);
    } else {
      setIsCreateModalOpen(false);
      setNewFullName('');
      setNewStudentId('');
      setNewEmail('');
      setNewPhone('');
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Quản lý hồ sơ cán bộ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách nhân sự, tìm kiếm trùng lặp và đồng bộ chức vụ kiêm nhiệm
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() =>
              alert(
                'Chức năng Nhập danh sách cán bộ từ Excel đang mở với 8 dòng hợp lệ, 2 dòng cần kiểm tra trùng lặp (Màn hình 8).'
              )
            }
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Nhập Excel</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm cán bộ</span>
          </button>
        </div>
      </div>

      {/* 2. FILTERS BAR */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Họ tên hoặc MSSV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Phân hệ: Tất cả</option>
              {subsystems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Đơn vị: Tất cả</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
            >
              <option value="all">Trạng thái: Tất cả</option>
              <option value="verified">Đã xác thực</option>
              <option value="pending">Chờ bổ sung</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (TABLE 7 COLS + DETAIL DRAWER 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: STAFF TABLE + IMPORT EXCEL CARD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-bold">
                    <th className="py-3 px-3">Họ tên</th>
                    <th className="py-3 px-3">MSSV</th>
                    <th className="py-3 px-3">Đơn vị</th>
                    <th className="py-3 px-3">Chức vụ</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProfiles.map((p) => {
                    const isSelected = selectedProfile?.id === p.id;
                    const primaryRole = p.roles[0]?.position_title || 'Thành viên';
                    const unitName = p.roles[0]?.unit_name || 'Đoàn cơ sở';

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`hover:bg-muted/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground block">{p.full_name}</span>
                          <span className="text-[10px] text-muted-foreground">{p.profile_code}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{p.student_id}</td>
                        <td className="py-3 px-3 text-muted-foreground">{unitName}</td>
                        <td className="py-3 px-3 font-medium text-foreground">{primaryRole}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.verification_status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-700'
                                : 'bg-amber-500/10 text-amber-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                p.verification_status === 'verified' ? 'bg-emerald-600' : 'bg-amber-600'
                              }`}
                            />
                            {p.verification_status === 'verified' ? 'Đã xác thực' : 'Chờ bổ sung'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProfileId(p.id);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Xem chi tiết
                            </button>
                            <button className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
              <span>
                Hiển thị 1 - {filteredProfiles.length} của {profiles.length} cán bộ
              </span>
              <div className="flex items-center gap-1">
                <button className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer">
                  &lt;
                </button>
                <span className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <button className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer">
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* CARD: NHẬP DANH SÁCH CÁN BỘ TỪ EXCEL (MATCHING SCREEN 8 MOCKUP) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Nhập danh sách cán bộ từ Excel
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Dữ liệu minh họa
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-foreground block">
                    danh_sach_can_bo_thang_10_2026.xlsx
                  </strong>
                  <span className="text-[11px] text-muted-foreground">Đã kiểm tra trùng lặp</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                    Kiểm tra trùng trước khi nhập
                  </span>
                  <span className="text-[10px] text-muted-foreground">Hoàn tất kiểm tra (100%)</span>
                </div>
              </div>
            </div>

            {/* Stat boxes 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="font-black text-sm">+ 8</span>
                  <span className="text-xs font-bold">hợp lệ</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Sẵn sàng để nhập</p>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <span className="font-black text-sm">2</span>
                  <span className="text-xs font-bold">cần kiểm tra</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Có thể trùng thông tin</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-black text-sm">0</span>
                  <span className="text-xs font-bold">không hợp lệ</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Không đủ dữ liệu bắt buộc</p>
              </div>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() =>
                  alert('Bản xem trước dữ liệu nhập: 8 hồ sơ mới sẽ được tạo, 2 hồ sơ trùng MSSV sẽ được cập nhật chức vụ.')
                }
                className="px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Xem bản xem trước</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL PROFILE DRAWER (MATCHING SCREEN 8) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5 sticky top-20">
            {/* Header of Drawer */}
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-black shadow-xs">
                {selectedProfile.full_name.split(' ').slice(-1)[0][0]}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-foreground">{selectedProfile.full_name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                    Đã xác thực
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-semibold">
                  MSSV: {selectedProfile.student_id}
                </p>
                <p className="text-xs text-muted-foreground">Đoàn cơ sở</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border text-xs font-bold">
              {[
                { id: 'ca_nhan', label: 'Cá nhân' },
                { id: 'chuc_vu', label: 'Chức vụ' },
                { id: 'lich_su', label: 'Lịch sử' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id as any)}
                  className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
                    activeDetailTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section: Thông tin định danh */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Thông tin định danh</span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Mã cán bộ (duy nhất):</span>
                  <strong className="font-mono text-foreground">{selectedProfile.profile_code}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Họ và tên:</span>
                  <span className="text-foreground font-semibold">{selectedProfile.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">MSSV:</span>
                  <span className="font-mono text-foreground">{selectedProfile.student_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Ngày sinh:</span>
                  <span className="text-foreground">{selectedProfile.date_of_birth}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Giới tính:</span>
                  <span className="text-foreground">{selectedProfile.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{selectedProfile.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span className="text-foreground">{selectedProfile.phone}</span>
                </div>
              </div>
            </div>

            {/* Section: Chức vụ hiện tại */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground">
                Chức vụ hiện tại ({selectedProfile.roles.length})
              </h4>
              <div className="space-y-2">
                {selectedProfile.roles.map((r) => (
                  <div key={r.id} className="p-2.5 rounded-xl border border-border bg-background text-xs">
                    <p className="font-bold text-foreground">• {r.position_title} ({r.unit_name})</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Từ {r.start_date} – {r.end_date || 'Hiện tại'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => alert(`Mở đề xuất chỉnh sửa cho ${selectedProfile.full_name}`)}
                className="flex-1 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
              >
                Đề xuất chỉnh sửa
              </button>
              <button
                onClick={() => alert(`Xem chi tiết toàn bộ hồ sơ của ${selectedProfile.full_name}`)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                Xem toàn bộ hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PROFILE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-black text-foreground">Thêm mới hồ sơ cán bộ</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground">Họ và tên cán bộ *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">MSSV / Mã cán bộ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 23110999"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 0901234567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="canbo@email.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Đơn vị quản lý</label>
                  <select
                    value={newUnitId}
                    onChange={(e) => setNewUnitId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-foreground">Chức danh ban đầu</label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground font-bold hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
