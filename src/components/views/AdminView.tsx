'use client';

// ==============================================================================
// ADMIN VIEW: TRANG QUẢN TRỊ DỰ ÁN TOÀN DIỆN - BAN THƯỜNG VỤ ĐOÀN TRƯỜNG HCMUTE
// Quản lý thành viên, phân quyền 4 vai trò, mục lục mảng việc và xóa danh sách ảo
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldAlert,
  Users,
  FolderGit2,
  ListTodo,
  Trash2,
  Plus,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  Palette,
  Calendar,
  Layers,
  Search,
  Camera,
  Sliders,
  RotateCcw,
  Shield,
  UserCheck,
  Key,
} from 'lucide-react';
import { Member, MemberRole, Campaign, PermissionKey } from '@/types';
import { SYSTEM_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/mockData';
import AvatarWithFallback from '@/components/AvatarWithFallback';

export default function AdminView() {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    tasks,
    deleteTask,
    clearDummyData,
    incomingDocs,
    currentMember,
    setCurrentMemberId,
    setIsCreateTaskModalOpen,
    setIsCreateDocModalOpen,
    setIsCreateCampaignModalOpen,
    rolePermissions,
    updateRolePermissions,
    updateMemberCustomPermissions,
    resetRolePermissionsToDefault,
    hasPermission,
    openAvatarModal,
  } = useApp();

  // Kiểm tra phân quyền truy cập trang Admin
  const canAccessAdmin = hasPermission('access_admin_portal');

  const [activeAdminTab, setActiveAdminTab] = useState<'members' | 'roles' | 'logs' | 'campaigns' | 'tasks' | 'cleanup'>('members');

  // Sub-tabs trong mục Vai trò & Phân quyền
  const [rolesSubTab, setRolesSubTab] = useState<'roles_matrix' | 'member_override'>('roles_matrix');
  const [selectedMemberForPerms, setSelectedMemberForPerms] = useState<string>(members[0]?.id || '');

  // State thêm / sửa thành viên
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberRole, setMemberRole] = useState<MemberRole>('uy_vien');
  const [memberMang, setMemberMang] = useState('tuyen_giao');

  // State thêm / sửa mảng việc
  const [isAddingCampaign, setIsAddingCampaign] = useState(false);
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campColor, setCampColor] = useState('#0284c7');

  // State tìm kiếm công việc
  const [taskSearch, setTaskSearch] = useState('');

  // State thông báo
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Xử lý bật/tắt quyền theo vai trò
  const handleToggleRolePermission = (role: MemberRole, permKey: PermissionKey) => {
    if (role === 'bi_thu') {
      alert('Đồng chí Bí thư Đoàn trường luôn có toàn quyền tuyệt đối theo Quy chế Đoàn!');
      return;
    }

    const currentKeys = rolePermissions[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
    const isAssigned = currentKeys.includes(permKey);
    const updatedKeys = isAssigned
      ? currentKeys.filter((k) => k !== permKey)
      : [...currentKeys, permKey];

    updateRolePermissions(role, updatedKeys);
    showToast(
      `Đã ${isAssigned ? 'thu hồi' : 'cấp'} quyền "${SYSTEM_PERMISSIONS.find((p) => p.key === permKey)?.label}" cho vai trò ${
        role === 'pho_bi_thu' ? 'Phó Bí thư' : role === 'chanh_van_phong' ? 'Chánh VP' : 'Ủy viên BTV'
      }`
    );
  };

  // Xử lý bật/tắt quyền riêng cho từng thành viên
  const handleToggleMemberPermission = (memberId: string, permKey: PermissionKey) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    if (target.role === 'bi_thu') {
      alert('Đồng chí Bí thư Đoàn trường luôn có toàn quyền tuyệt đối theo Quy chế Đoàn!');
      return;
    }

    const currentKeys =
      target.custom_permissions && target.custom_permissions.length > 0
        ? target.custom_permissions
        : [...(rolePermissions[target.role] || DEFAULT_ROLE_PERMISSIONS[target.role] || [])];

    const isAssigned = currentKeys.includes(permKey);
    const updated = isAssigned
      ? currentKeys.filter((k) => k !== permKey)
      : [...currentKeys, permKey];

    updateMemberCustomPermissions(memberId, updated);
    showToast(
      `Đã ${isAssigned ? 'thu hồi' : 'cấp'} quyền riêng "${SYSTEM_PERMISSIONS.find((p) => p.key === permKey)?.label}" cho đ/c ${target.full_name}`
    );
  };

  // Khôi phục quyền thành viên theo chức vụ
  const handleResetMemberCustomPerms = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    updateMemberCustomPermissions(memberId, undefined);
    showToast(`Đã khôi phục quyền của đ/c ${target.full_name} theo chức vụ ${target.role}`);
  };

  // Cấp toàn bộ 10 quyền cho thành viên
  const handleGrantAllPermsToMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    const allKeys = SYSTEM_PERMISSIONS.map((p) => p.key);
    updateMemberCustomPermissions(memberId, allKeys);
    showToast(`Đã cấp toàn bộ 10 quyền hệ thống cho đ/c ${target.full_name}`);
  };

  // Đếm số lượng task ảo mẫu
  const dummyTasksCount = tasks.filter(
    (t) => t.id.startsWith('a1') || t.id.startsWith('a2') || t.id.startsWith('a3') ||
           t.id.startsWith('a4') || t.id.startsWith('a5') || t.id.startsWith('a6')
  ).length;

  const dummyDocsCount = incomingDocs.filter(
    (d) => d.id.startsWith('d1') || d.id.startsWith('d2') || d.id.startsWith('d3') || d.id.startsWith('d4')
  ).length;

  // Xử lý lưu thành viên
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) {
      alert('Vui lòng điền Họ tên và Email thành viên!');
      return;
    }

    if (editingMemberId) {
      updateMember(editingMemberId, {
        full_name: memberName.trim(),
        email: memberEmail.trim(),
        phone: memberPhone.trim(),
        role: memberRole,
        mang_phu_trach: memberMang,
      });
      showToast('Đã cập nhật thông tin thành viên thành công!');
      setEditingMemberId(null);
    } else {
      addMember({
        full_name: memberName.trim(),
        email: memberEmail.trim(),
        phone: memberPhone.trim(),
        role: memberRole,
        mang_phu_trach: memberMang,
      });
      showToast('Đã thêm đồng chí mới vào Ban Thường vụ!');
      setIsAddingMember(false);
    }

    setMemberName('');
    setMemberEmail('');
    setMemberPhone('');
  };

  const startEditMember = (m: Member) => {
    setEditingMemberId(m.id);
    setMemberName(m.full_name);
    setMemberEmail(m.email);
    setMemberPhone(m.phone || '');
    setMemberRole(m.role);
    setMemberMang(m.mang_phu_trach || 'tuyen_giao');
    setIsAddingMember(true);
  };

  // Xử lý lưu mảng việc
  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;

    addCampaign({
      name: campName.trim(),
      description: campDesc.trim(),
      color: campColor,
      status: 'dang_chay',
    });

    showToast('Đã tạo mảng việc mới thành công!');
    setCampName('');
    setCampDesc('');
    setIsAddingCampaign(false);
  };

  // Xóa danh sách ảo
  const handleClearDummy = async () => {
    if (confirm('Đồng chí có chắc chắn muốn xóa toàn bộ danh sách công việc và văn bản ảo mẫu năm 2025 không? Thao tác này sẽ làm sạch hệ thống để sẵn sàng làm việc thực tế.')) {
      await clearDummyData();
      showToast('Đã xóa sạch toàn bộ danh sách ảo thành công! Hệ thống đã sẵn sàng cho dữ liệu thực.');
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(taskSearch.toLowerCase()))
  );

  if (!canAccessAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card rounded-3xl border border-destructive/20 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Không có quyền truy cập Trang Quản trị</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Đồng chí <b>{currentMember.full_name}</b> với vai trò hiện tại không có thẩm quyền truy cập Phân hệ Quản trị Hệ thống (Admin Portal). Chỉ Thường trực Đoàn trường, Chánh văn phòng hoặc các đồng chí được phân quyền riêng <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px]">access_admin_portal</code> mới có quyền thực hiện.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Toast thông báo */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Trang Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Khu vực Quản trị Hệ thống (Admin Portal)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            Quản trị Tác vụ & Phân quyền BTV
          </h2>
          <p className="text-xs text-muted-foreground">
            Quản lý thành viên, ma trận quyền hạn 4 vai trò, mục lục mảng việc và bảo trì dữ liệu
          </p>
        </div>

        {/* Nút hành động nhanh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span>Giao việc mới</span>
          </button>
          <button
            onClick={() => setIsCreateDocModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-teal-700"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp nhận VB</span>
          </button>
        </div>
      </div>

      {/* Tab Điều hướng Admin theo thiết kế 11-admin-permissions.png */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none snap-x -mx-1 px-1 text-xs">
        <button
          onClick={() => setActiveAdminTab('members')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'members'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/70'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Thành viên ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'roles'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/70'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vai trò & Phân quyền</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'logs'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/70'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Nhật ký hoạt động</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('campaigns')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'campaigns'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/70'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Mảng việc & Dự án ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('tasks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'tasks'
              ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE] shadow-2xs'
              : 'text-muted-foreground hover:text-foreground bg-card border border-border/70'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Tất cả Công việc ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('cleanup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'cleanup'
              ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-2xs'
              : 'text-[#DC2626] hover:bg-[#FEF2F2] bg-card border border-rose-200'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Dọn dẹp ảo {dummyTasksCount > 0 && `(${dummyTasksCount})`}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THÀNH VIÊN & PHÂN QUYỀN */}
      {/* ========================================================================= */}
      {activeAdminTab === 'members' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Quản lý Thành viên */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Danh sách Ban Thường vụ ({members.length} Đồng chí)</h3>
              <p className="text-[11px] text-muted-foreground">Thêm bớt, phân vai trò, gán mảng công tác và cập nhật hồ sơ</p>
            </div>
            <button
              onClick={() => {
                setEditingMemberId(null);
                setMemberName('');
                setMemberEmail('');
                setMemberPhone('');
                setIsAddingMember(!isAddingMember);
              }}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAddingMember ? 'Đóng form' : '+ Thêm Thành viên'}</span>
            </button>
          </div>

          {/* Form thêm / sửa thành viên */}
          {isAddingMember && (
            <form onSubmit={handleSaveMember} className="bg-card p-5 rounded-2xl border border-primary/30 shadow-md space-y-4 animate-in slide-in-from-top-2 duration-150 text-xs">
              <div className="font-bold text-sm text-primary flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{editingMemberId ? 'Chỉnh sửa thông tin thành viên' : 'Thêm đồng chí mới vào BTV'}</span>
              </div>

              {/* Avatar Preview & Upload Action */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border">
                <AvatarWithFallback
                  src={
                    editingMemberId
                      ? members.find((m) => m.id === editingMemberId)?.avatar_url
                      : undefined
                  }
                  name={memberName || 'BTV'}
                  className="w-12 h-12 rounded-full ring-2 ring-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground text-xs">Ảnh đại diện thành viên</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Tải ảnh từ máy tính (nén chuẩn &lt;50KB), chọn mẫu Đoàn thanh niên hoặc dán link ảnh
                  </div>
                </div>
                {editingMemberId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = members.find((m) => m.id === editingMemberId);
                      if (target) openAvatarModal(target);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Đổi ảnh đại diện</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic shrink-0">
                    (Có thể đổi avatar sau khi tạo)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Họ và tên (*)</label>
                  <input
                    type="text"
                    placeholder="VD: Lê Xuân Thân"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Email trường (*)</label>
                  <input
                    type="email"
                    placeholder="VD: thanlx@hcmute.edu.vn"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="VD: 0901234567"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Vai trò trong BTV (*)</label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as MemberRole)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  >
                    <option value="bi_thu">Bí thư Đoàn trường (Toàn quyền)</option>
                    <option value="pho_bi_thu">Phó Bí thư Đoàn trường (Điều hành & Duyệt chuyên môn)</option>
                    <option value="chanh_van_phong">Chánh văn phòng (Điều phối & Duyệt hành chính)</option>
                    <option value="uy_vien">Ủy viên BTV (Thực hiện nhiệm vụ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Mảng công tác phụ trách</label>
                  <select
                    value={memberMang}
                    onChange={(e) => setMemberMang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  >
                    <option value="tuyen_giao">Tuyên giáo & Truyền thông</option>
                    <option value="to_chuc">Tổ chức - Xây dựng Đoàn</option>
                    <option value="phong_trao">Phong trào & Tình nguyện</option>
                    <option value="kiem_tra">Kiểm tra - Giám sát</option>
                    <option value="van_phong">Văn phòng - Quản trị nội bộ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-semibold text-muted-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMemberId ? 'Lưu thay đổi' : 'Tạo thành viên'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Bảng Danh sách Thành viên chuẩn thiết kế 11-admin-permissions.png */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-3 text-center w-12">#</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Họ và tên</th>
                    <th className="py-3.5 px-3 min-w-[160px]">Vai trò / Chức danh</th>
                    <th className="py-3.5 px-3 min-w-[170px]">Đơn vị / Ban chuyên môn</th>
                    <th className="py-3.5 px-3 min-w-[130px]">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m, idx) => {
                    const deptLabel =
                      m.role === 'bi_thu' || m.role === 'pho_bi_thu'
                        ? 'Thường trực Đoàn trường'
                        : m.role === 'chanh_van_phong'
                        ? 'Văn phòng Đoàn trường'
                        : m.mang_phu_trach === 'tuyen_giao'
                        ? 'Ban Tuyên giáo – Truyền thông'
                        : m.mang_phu_trach === 'to_chuc'
                        ? 'Ban Tổ chức – Kiểm tra'
                        : m.mang_phu_trach === 'phong_trao'
                        ? 'Ban Phong trào – Tình nguyện'
                        : 'Ban Chuyên môn';

                    return (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-3 text-center font-bold text-muted-foreground font-mono">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="relative group cursor-pointer shrink-0"
                              onClick={() => openAvatarModal(m)}
                              title="Bấm để thay đổi ảnh đại diện"
                            >
                              <AvatarWithFallback
                                src={m.avatar_url}
                                name={m.full_name}
                                className="w-9 h-9 rounded-full ring-1 ring-border group-hover:ring-primary transition-all"
                              />
                              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-foreground text-xs flex items-center gap-1.5 flex-wrap">
                                <span>{m.full_name}</span>
                                {m.custom_permissions && m.custom_permissions.length > 0 && (
                                  <span
                                    className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20"
                                    title={`Đang áp dụng ${m.custom_permissions.length} quyền riêng`}
                                  >
                                    Quyền riêng ({m.custom_permissions.length})
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">{m.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              m.role === 'bi_thu'
                                ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                                : m.role === 'pho_bi_thu'
                                ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]'
                                : m.role === 'chanh_van_phong'
                                ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                                : 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                            }`}
                          >
                            {m.role === 'bi_thu'
                              ? 'Bí thư Đoàn trường'
                              : m.role === 'pho_bi_thu'
                              ? 'Phó Bí thư'
                              : m.role === 'chanh_van_phong'
                              ? 'Chánh văn phòng'
                              : 'Ủy viên BTV'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-medium text-foreground text-xs">{deptLabel}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            <span>Đang hoạt động</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openAvatarModal(m)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors"
                              title="Thay đổi ảnh đại diện"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMemberForPerms(m.id);
                                setRolesSubTab('member_override');
                                setActiveAdminTab('roles');
                              }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-indigo-600 transition-colors"
                              title="Phân quyền riêng cho đồng chí này"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEditMember(m)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#0B5CFF] transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Đồng chí có chắc muốn xóa thành viên ${m.full_name}?`)) {
                                  deleteMember(m.id);
                                  showToast(`Đã xóa ${m.full_name} khỏi danh sách BTV.`);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Xóa thành viên"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View cho Điện thoại */}
            <div className="md:hidden divide-y divide-border">
              {members.map((m) => (
                <div key={m.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => openAvatarModal(m)}
                        title="Bấm để thay đổi ảnh đại diện"
                      >
                        <AvatarWithFallback
                          src={m.avatar_url}
                          name={m.full_name}
                          className="w-10 h-10 rounded-full ring-2 ring-border shrink-0"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 flex-wrap">
                          <span>{m.full_name}</span>
                          {m.custom_permissions && m.custom_permissions.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                              Quyền riêng ({m.custom_permissions.length})
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-mono">{m.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAvatarModal(m)}
                        className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-emerald-600"
                        title="Đổi avatar"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMemberForPerms(m.id);
                          setRolesSubTab('member_override');
                          setActiveAdminTab('roles');
                        }}
                        className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-indigo-600"
                        title="Phân quyền riêng"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditMember(m)}
                        className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary"
                        title="Sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Đồng chí có chắc muốn xóa ${m.full_name}?`)) {
                            deleteMember(m.id);
                            showToast(`Đã xóa ${m.full_name}.`);
                          }
                        }}
                        className="p-2 rounded-xl bg-destructive/10 text-destructive"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.role === 'bi_thu'
                          ? 'bg-destructive/10 text-destructive border border-destructive/20'
                          : m.role === 'pho_bi_thu'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : m.role === 'chanh_van_phong'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {m.role === 'bi_thu'
                        ? 'Bí thư'
                        : m.role === 'pho_bi_thu'
                        ? 'Phó Bí thư'
                        : m.role === 'chanh_van_phong'
                        ? 'Chánh văn phòng'
                        : 'Ủy viên BTV'}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span>Hoạt động</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: VAI TRÒ & PHÂN QUYỀN (QUẢN TRỊ MA TRẬN & PHÂN QUYỀN RIÊNG BIỆT) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Sub-nav: Chọn Chế độ Phân quyền */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card rounded-3xl border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0B5CFF]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-foreground">
                  Hệ thống Phân quyền Truy cập & Thẩm quyền Ban Thường vụ (RBAC)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Điều chỉnh linh hoạt quyền hạn theo 4 vai trò chính hoặc tùy biến phân quyền riêng cho từng đồng chí
                </p>
              </div>
            </div>

            <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/80 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setRolesSubTab('roles_matrix')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  rolesSubTab === 'roles_matrix'
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Ma trận 4 Chức vụ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRolesSubTab('member_override');
                  if (!selectedMemberForPerms && members.length > 0) {
                    setSelectedMemberForPerms(members[0].id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  rolesSubTab === 'member_override'
                    ? 'bg-card text-foreground shadow-xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Tùy biến Từng Thành viên</span>
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* CHẾ ĐỘ 1: MA TRẬN PHÂN QUYỀN 4 VAI TRÒ */}
          {/* --------------------------------------------------------------------- */}
          {rolesSubTab === 'roles_matrix' && (
            <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Ma trận Thẩm quyền 4 Vai trò Ban Thường vụ
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Bấm trực tiếp vào các ô để bật/tắt quyền hạn theo chức vụ. Thay đổi được tự động lưu vĩnh viễn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Đồng chí có chắc muốn khôi phục lại toàn bộ Ma trận phân quyền mặc định theo Quy chế Đoàn 2026 không?')) {
                      resetRolePermissionsToDefault();
                      showToast('Đã khôi phục ma trận phân quyền về mặc định!');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục mặc định</span>
                </button>
              </div>

              {/* 4 Card tóm tắt vai trò */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                  <div className="font-bold text-[#DC2626] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                      <span>Bí thư Đoàn trường</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">10/10 quyền</span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Toàn quyền chỉ đạo và điều hành</li>
                    <li>Duyệt việc chuyên môn & chủ trương</li>
                    <li>Duyệt việc hành chính & văn bản</li>
                    <li>Đôn đốc công việc toàn hệ thống</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF2FF] border border-[#BFDBFE] space-y-2">
                  <div className="font-bold text-[#0B5CFF] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0B5CFF]" />
                      <span>Phó Bí thư Đoàn trường</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      {(rolePermissions.pho_bi_thu || []).length}/10 quyền
                    </span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Chỉ đạo mảng công tác được giao</li>
                    <li>Duyệt việc chuyên môn & hành chính</li>
                    <li>Giao việc và phân bổ nhiệm vụ</li>
                    <li>Đôn đốc công việc thuộc mảng</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-2">
                  <div className="font-bold text-[#D97706] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      <span>Chánh Văn phòng</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      {(rolePermissions.chanh_van_phong || []).length}/10 quyền
                    </span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Quản trị Sổ văn bản đến 8 cột</li>
                    <li>Duyệt việc hành chính & hậu cần</li>
                    <li>Điều phối tiến độ và gửi đôn đốc</li>
                    <li>Hạn chế duyệt chủ trương cấp cao</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <div className="font-bold text-foreground flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Ủy viên BTV</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {(rolePermissions.uy_vien || []).length}/10 quyền
                    </span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Nhận việc và cập nhật tiến độ</li>
                    <li>Nộp duyệt hoàn thành nhiệm vụ</li>
                    <li>Tham gia kênh Chat BTV & Thảo luận</li>
                    <li>Tự tạo việc cá nhân để quản lý</li>
                  </ul>
                </div>
              </div>

              {/* Bảng Ma trận Quyền hạn Tương tác Thông minh */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border border-border rounded-2xl overflow-hidden">
                  <thead>
                    <tr className="bg-muted/70 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                      <th className="py-3 px-4 min-w-[280px]">Quyền hạn / Chức năng Hệ thống</th>
                      <th className="py-3 px-3 text-center min-w-[120px]">
                        <span className="text-red-600 font-bold">Bí thư</span>
                        <div className="text-[9px] text-muted-foreground normal-case font-normal">(Cố định toàn quyền)</div>
                      </th>
                      <th className="py-3 px-3 text-center min-w-[120px]">
                        <span className="text-blue-600 font-bold">Phó Bí thư</span>
                        <div className="text-[9px] text-muted-foreground normal-case font-normal">(Bấm để đổi)</div>
                      </th>
                      <th className="py-3 px-3 text-center min-w-[120px]">
                        <span className="text-amber-600 font-bold">Chánh VP</span>
                        <div className="text-[9px] text-muted-foreground normal-case font-normal">(Bấm để đổi)</div>
                      </th>
                      <th className="py-3 px-3 text-center min-w-[120px]">
                        <span className="text-foreground font-bold">Ủy viên BTV</span>
                        <div className="text-[9px] text-muted-foreground normal-case font-normal">(Bấm để đổi)</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {SYSTEM_PERMISSIONS.map((perm) => {
                      const isPbtHas = (rolePermissions.pho_bi_thu || []).includes(perm.key);
                      const isCvpHas = (rolePermissions.chanh_van_phong || []).includes(perm.key);
                      const isUvHas = (rolePermissions.uy_vien || []).includes(perm.key);

                      const categoryBadge =
                        perm.category === 'cong_viec'
                          ? { label: 'Công việc', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' }
                          : perm.category === 'van_ban'
                          ? { label: 'Văn bản', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
                          : perm.category === 'dieu_hanh'
                          ? { label: 'Điều hành', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' }
                          : { label: 'Hệ thống', bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };

                      return (
                        <tr key={perm.key} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-xs">{perm.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${categoryBadge.bg}`}>
                                  {categoryBadge.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">{perm.description}</p>
                            </div>
                          </td>

                          {/* Bí thư: Luôn có toàn quyền (disabled) */}
                          <td className="py-3.5 px-3 text-center bg-red-500/5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 cursor-not-allowed font-bold"
                              title="Bí thư Đoàn trường luôn có toàn quyền tuyệt đối theo Quy chế"
                            >
                              ✔
                            </span>
                          </td>

                          {/* Phó Bí thư */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRolePermission('pho_bi_thu', perm.key)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                isPbtHas
                                  ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600 font-bold'
                                  : 'bg-muted/80 text-muted-foreground/40 hover:bg-muted hover:text-foreground'
                              }`}
                              title={isPbtHas ? 'Bấm để thu hồi quyền này' : 'Bấm để cấp quyền này cho Phó Bí thư'}
                            >
                              {isPbtHas ? '✔' : '—'}
                            </button>
                          </td>

                          {/* Chánh Văn phòng */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRolePermission('chanh_van_phong', perm.key)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                isCvpHas
                                  ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600 font-bold'
                                  : 'bg-muted/80 text-muted-foreground/40 hover:bg-muted hover:text-foreground'
                              }`}
                              title={isCvpHas ? 'Bấm để thu hồi quyền này' : 'Bấm để cấp quyền này cho Chánh văn phòng'}
                            >
                              {isCvpHas ? '✔' : '—'}
                            </button>
                          </td>

                          {/* Ủy viên BTV */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRolePermission('uy_vien', perm.key)}
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                isUvHas
                                  ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600 font-bold'
                                  : 'bg-muted/80 text-muted-foreground/40 hover:bg-muted hover:text-foreground'
                              }`}
                              title={isUvHas ? 'Bấm để thu hồi quyền này' : 'Bấm để cấp quyền này cho Ủy viên BTV'}
                            >
                              {isUvHas ? '✔' : '—'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* CHẾ ĐỘ 2: TÙY BIẾN PHÂN QUYỀN RIÊNG TỪNG THÀNH VIÊN */}
          {/* --------------------------------------------------------------------- */}
          {rolesSubTab === 'member_override' && (
            <div className="space-y-5">
              {/* Thanh chọn Thành viên */}
              <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Chọn Đồng chí trong Ban Thường vụ để Thiết lập Quyền riêng
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tùy biến quyền vượt cấp hoặc giới hạn thẩm quyền cho từng cá nhân độc lập với chức vụ
                    </p>
                  </div>

                  <select
                    value={selectedMemberForPerms}
                    onChange={(e) => setSelectedMemberForPerms(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-muted/60 border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.role === 'bi_thu' ? 'Bí thư' : m.role === 'pho_bi_thu' ? 'Phó Bí thư' : m.role === 'chanh_van_phong' ? 'Chánh VP' : 'Ủy viên BTV'})
                        {m.custom_permissions && m.custom_permissions.length > 0 ? ' [Có quyền riêng]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Danh sách Avatar nhanh */}
                <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
                  {members.map((m) => {
                    const isSelected = m.id === selectedMemberForPerms;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMemberForPerms(m.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
                        }`}
                      >
                        <AvatarWithFallback
                          src={m.avatar_url}
                          name={m.full_name}
                          className="w-5 h-5 rounded-full ring-1 ring-border shrink-0"
                        />
                        <span>{m.full_name.split(' ').slice(-2).join(' ')}</span>
                        {m.custom_permissions && m.custom_permissions.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin & Danh sách quyền của Thành viên được chọn */}
              {(() => {
                const targetMember = members.find((m) => m.id === selectedMemberForPerms) || members[0];
                if (!targetMember) return null;

                const hasCustom = Boolean(
                  targetMember.custom_permissions && targetMember.custom_permissions.length > 0
                );
                const effectivePerms = targetMember.role === 'bi_thu'
                  ? SYSTEM_PERMISSIONS.map((p) => p.key)
                  : hasCustom
                  ? targetMember.custom_permissions!
                  : (rolePermissions[targetMember.role] || DEFAULT_ROLE_PERMISSIONS[targetMember.role] || []);

                return (
                  <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-6">
                    {/* Header thông tin đồng chí */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative group cursor-pointer shrink-0"
                          onClick={() => openAvatarModal(targetMember)}
                          title="Bấm để đổi ảnh đại diện cho đồng chí này"
                        >
                          <AvatarWithFallback
                            src={targetMember.avatar_url}
                            name={targetMember.full_name}
                            className="w-12 h-12 rounded-full ring-2 ring-border shrink-0 group-hover:ring-primary transition-all"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-foreground">{targetMember.full_name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                targetMember.role === 'bi_thu'
                                  ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                                  : targetMember.role === 'pho_bi_thu'
                                  ? 'bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]'
                                  : targetMember.role === 'chanh_van_phong'
                                  ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                                  : 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]'
                              }`}
                            >
                              {targetMember.role === 'bi_thu'
                                ? 'Bí thư Đoàn trường'
                                : targetMember.role === 'pho_bi_thu'
                                ? 'Phó Bí thư'
                                : targetMember.role === 'chanh_van_phong'
                                ? 'Chánh văn phòng'
                                : 'Ủy viên BTV'}
                            </span>
                            {hasCustom ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Đang áp dụng Quyền riêng ({effectivePerms.length}/10 quyền)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                Đang thừa hưởng theo Chức danh ({effectivePerms.length}/10 quyền)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {targetMember.email} • {targetMember.phone || 'Chưa cập nhật SĐT'}
                          </div>
                        </div>
                      </div>

                      {/* Các nút thao tác nhanh */}
                      <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <button
                          type="button"
                          onClick={() => openAvatarModal(targetMember)}
                          className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đổi Avatar</span>
                        </button>

                        {targetMember.role !== 'bi_thu' && (
                          <>
                            {hasCustom && (
                              <button
                                type="button"
                                onClick={() => handleResetMemberCustomPerms(targetMember.id)}
                                className="px-3 py-1.5 rounded-xl border border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                title="Xóa toàn bộ tùy biến, quay lại quyền mặc định theo vai trò"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Khôi phục theo chức vụ</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleGrantAllPermsToMember(targetMember.id)}
                              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-primary/90 transition-colors"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Cấp Toàn quyền (10/10)</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Danh sách 10 Quyền hạn và Switch Bật / Tắt */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SYSTEM_PERMISSIONS.map((perm) => {
                        const isGranted = effectivePerms.includes(perm.key);
                        const isLockedBiThu = targetMember.role === 'bi_thu';

                        return (
                          <div
                            key={perm.key}
                            onClick={() => {
                              if (!isLockedBiThu) {
                                handleToggleMemberPermission(targetMember.id, perm.key);
                              }
                            }}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              isLockedBiThu
                                ? 'bg-muted/20 border-border cursor-not-allowed opacity-90'
                                : isGranted
                                ? 'bg-primary/5 border-primary/40 hover:border-primary cursor-pointer shadow-2xs'
                                : 'bg-card border-border hover:border-muted-foreground/30 cursor-pointer'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-xs">{perm.label}</span>
                                {isGranted ? (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    Đang kích hoạt
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-muted text-muted-foreground border border-border">
                                    Không được phép
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {perm.description}
                              </p>
                            </div>

                            {/* Nút Toggle Switch */}
                            <button
                              type="button"
                              disabled={isLockedBiThu}
                              className={`w-11 h-6 rounded-full p-1 transition-colors shrink-0 flex items-center ${
                                isGranted ? 'bg-emerald-600 justify-end' : 'bg-muted-foreground/30 justify-start'
                              } ${isLockedBiThu ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: NHẬT KÝ HOẠT ĐỘNG (AUDIT LOG - THEO THIẾT KẾ 11-ADMIN-PERMISSIONS.PNG) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'logs' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0B5CFF]" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">
                    Nhật ký Hoạt động Hệ thống (Audit Log)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ghi lại các thao tác giao việc, duyệt hoàn thành, đôn đốc và cập nhật tiến độ
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
                Tự động ghi nhận
              </span>
            </div>

            {/* Bảng Nhật ký hoạt động */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                    <th className="py-3 px-3 min-w-[120px]">Thời gian</th>
                    <th className="py-3 px-4 min-w-[180px]">Người thực hiện</th>
                    <th className="py-3 px-3 min-w-[140px]">Hành động</th>
                    <th className="py-3 px-4 min-w-[260px]">Nội dung tác vụ</th>
                    <th className="py-3 px-3 text-center min-w-[100px]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      time: '22/09/2026 10:30',
                      actor: 'Nguyễn Thị Mai',
                      role: 'Bí thư Đoàn trường',
                      action: 'Duyệt hoàn thành',
                      badge: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
                      target: 'Tổ chức Lễ khai mạc Chào Tân sinh viên 2026 (Chấm điểm: 9.5)',
                      status: 'Thành công',
                    },
                    {
                      time: '22/09/2026 09:15',
                      actor: 'Trần Minh Quân',
                      role: 'Chánh Văn phòng',
                      action: 'Giao việc mới',
                      badge: 'bg-[#EBF2FF] text-[#0B5CFF] border-[#BFDBFE]',
                      target: 'Xử lý Công văn 124-KH/ĐTN của Thành Đoàn TP.HCM',
                      status: 'Thành công',
                    },
                    {
                      time: '22/09/2026 08:00',
                      actor: 'Lê Xuân Thân',
                      role: 'Phó Bí thư',
                      action: 'Phát lệnh đôn đốc',
                      badge: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
                      target: 'Đôn đốc gửi danh sách sinh viên khen thưởng phong trào',
                      status: 'Đã gửi Push',
                    },
                    {
                      time: '21/09/2026 16:45',
                      actor: 'Đặng Thị Thu Trang',
                      role: 'Ủy viên BTV',
                      action: 'Nộp duyệt hoàn thành',
                      badge: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
                      target: 'Kế hoạch truyền thông chuỗi sự kiện Tháng 9/2026',
                      status: 'Chờ duyệt',
                    },
                    {
                      time: '21/09/2026 14:20',
                      actor: 'Hoàng Minh Đức',
                      role: 'Ủy viên BTV',
                      action: 'Cập nhật tiến độ',
                      badge: 'bg-[#EBF2FF] text-[#0B5CFF] border-[#BFDBFE]',
                      target: 'Khảo sát sân khấu & gian hàng Tân sinh viên (80%)',
                      status: 'Thành công',
                    },
                    {
                      time: '20/09/2026 11:00',
                      actor: 'Trần Minh Quân',
                      role: 'Chánh Văn phòng',
                      action: 'Tiếp nhận văn bản',
                      badge: 'bg-purple-50 text-purple-600 border-purple-200',
                      target: 'Tiếp nhận Công văn 45-TB/ĐTN về rà soát hồ sơ đoàn viên',
                      status: 'Đã lưu sổ',
                    },
                  ].map((log, lIdx) => (
                    <tr key={lIdx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                        {log.time}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground text-xs">{log.actor}</div>
                        <div className="text-[10px] text-muted-foreground">{log.role}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${log.badge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {log.target}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MỤC LỤC MẢNG VIỆC & CHIẾN DỊCH */}
      {/* ========================================================================= */}
      {activeAdminTab === 'campaigns' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Danh mục Mảng việc & Chiến dịch ({campaigns.length})</h3>
              <p className="text-[11px] text-muted-foreground">Phân loại các nhiệm vụ theo chuỗi hoạt động và chiến dịch lớn</p>
            </div>
            <button
              onClick={() => setIsAddingCampaign(!isAddingCampaign)}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingCampaign ? 'Đóng form' : '+ Tạo Mảng việc mới'}</span>
            </button>
          </div>

          {isAddingCampaign && (
            <form onSubmit={handleSaveCampaign} className="bg-card p-5 rounded-2xl border border-primary/30 shadow-md space-y-4 text-xs">
              <div className="font-bold text-sm text-primary">Tạo Mảng việc / Dự án trọng tâm</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Tên mảng việc / Dự án (*)</label>
                  <input
                    type="text"
                    placeholder="VD: Chiến dịch Tình nguyện hè 2026..."
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Mô tả mục tiêu</label>
                  <input
                    type="text"
                    placeholder="VD: Chuỗi hoạt động Mùa hè xanh và Tiếp sức mùa thi..."
                    value={campDesc}
                    onChange={(e) => setCampDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingCampaign(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-semibold text-muted-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu mảng việc</span>
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map((c) => {
              const campTasksCount = tasks.filter((t) => t.campaign_id === c.id).length;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-card border border-border shadow-xs hover:shadow-md transition-all space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: c.color || '#0284c7' }} />
                      <h4 className="font-bold text-xs text-foreground leading-snug">{c.name}</h4>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa mảng việc "${c.name}"?`)) {
                          deleteCampaign(c.id);
                          showToast(`Đã xóa mảng việc "${c.name}".`);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      title="Xóa mảng việc"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {c.description || 'Chưa có mô tả chi tiết'}
                  </p>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{campTasksCount} công việc trực thuộc</span>
                    <span className="font-bold text-primary capitalize">{c.status.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUẢN LÝ TOÀN BỘ CÔNG VIỆC */}
      {/* ========================================================================= */}
      {activeAdminTab === 'tasks' && (
        <div className="space-y-4 animate-in fade-in duration-150 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Toàn bộ Công việc trong Hệ thống ({tasks.length})</h3>
              <p className="text-[11px] text-muted-foreground">Tìm kiếm, lọc trạng thái và quản trị các đầu việc</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Tên công việc</th>
                    <th className="py-3 px-3">Phụ trách chính</th>
                    <th className="py-3 px-3">Hạn chót</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3">Phạm vi duyệt</th>
                    <th className="py-3 px-4 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTasks.map((t) => {
                    const owner = members.find((m) => m.id === t.owner_id);
                    return (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground max-w-xs truncate">
                          {t.title}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {owner?.full_name || 'Chưa gán'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                          {t.due_at ? t.due_at.slice(0, 10) : 'Không có'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] font-semibold text-primary">
                          {t.approval_scope === 'chuyen_mon' ? 'Chuyên môn' : 'Hành chính'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Xóa công việc "${t.title}"?`)) {
                                deleteTask(t.id);
                                showToast(`Đã xóa công việc.`);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Tasks List */}
            <div className="md:hidden divide-y divide-border">
              {filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Không tìm thấy công việc nào.
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const owner = members.find((m) => m.id === t.owner_id);
                  return (
                    <div key={t.id} className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-foreground text-xs leading-snug line-clamp-2">
                          {t.title}
                        </h4>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa công việc "${t.title}"?`)) {
                              deleteTask(t.id);
                              showToast(`Đã xóa công việc.`);
                            }
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive shrink-0"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Phụ trách: <strong className="text-foreground font-medium">{owner?.full_name || 'Chưa gán'}</strong></span>
                        <span className="font-mono text-[10px]">Hạn: {t.due_at ? t.due_at.slice(0, 10) : 'Linh hoạt'}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                          {t.status}
                        </span>
                        <span className="text-[10px] font-semibold text-primary">
                          {t.approval_scope === 'chuyen_mon' ? 'Duyệt Chuyên môn' : 'Duyệt Hành chính'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DỌN DẸP & XÓA DANH SÁCH ẢO */}
      {/* ========================================================================= */}
      {activeAdminTab === 'cleanup' && (
        <div className="bg-card rounded-3xl p-6 border border-destructive/30 shadow-md space-y-6 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Dọn dẹp & Xóa sạch Danh sách Ảo</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hệ thống khởi tạo ban đầu có các công việc và văn bản mẫu giả định năm 2025 để hỗ trợ kiểm thử giao diện. Tính năng này giúp đồng chí làm sạch toàn bộ dữ liệu mẫu này cả ở LocalStorage và trên Supabase Database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Công việc mẫu cần xóa</span>
              <div className="text-2xl font-black text-destructive">{dummyTasksCount} công việc</div>
              <p className="text-[10px] text-muted-foreground">Các công việc demo quá hạn năm 2025</p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Văn bản đến mẫu</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{dummyDocsCount} văn bản</div>
              <p className="text-[10px] text-muted-foreground">Các văn bản đến giả định demo Excel</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              ⚠️ Sau khi xóa, chỉ các công việc và văn bản thật do đồng chí tạo mới được lưu giữ.
            </div>
            <button
              onClick={handleClearDummy}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-destructive text-destructive-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-destructive/90 transition-all shadow-md active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa Toàn bộ Danh sách Ảo Ngay</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
