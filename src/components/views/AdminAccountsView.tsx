'use client';

// ==============================================================================
// QUẢN TRỊ TÀI KHOẢN, MẬT KHẨU & PHÂN QUYỀN ADMIN THEO KHỐI ĐƠN VỊ
// - Chỉ tài khoản được cấp quyền mới thấy nút & truy cập được Trang Quản trị
// - Ai được cấp quyền (menu) nào sẽ chỉ thấy đúng quyền (menu) đó
// - Hỗ trợ Khối quyền Admin quản lý theo từng Đơn vị (Đoàn trường / Hội SV / Cơ sở / CLB)
// ==============================================================================

import React, { useState } from 'react';
import {
  useApp,
  ADMIN_TAB_DEFINITIONS,
  DEFAULT_TABS_BY_ROLE,
  ALL_ADMIN_TABS,
  computeAllowedAdminTabs,
  isSuperAdminUser,
  AdminTab,
} from '@/context/AppContext';
import {
  Shield,
  Search,
  Filter,
  UserPlus,
  Lock,
  Unlock,
  X,
  Edit,
  Building2,
  CheckCircle2,
  Trash2,
  Crown,
  Key,
  Layers,
  Users,
  CheckSquare,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AppUser, UserRole } from '@/types';

const ROLE_OPTIONS: {
  id: UserRole;
  label: string;
  desc: string;
  color: string;
  defaultScope: 'all' | 'unit';
}[] = [
  {
    id: 'admin',
    label: 'Quản trị hệ thống Toàn trường (Admin Trường)',
    desc: 'Toàn quyền quản lý tài khoản, danh mục tổ chức, cấu hình hệ thống & tất cả 11 phân hệ quản trị',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    defaultScope: 'all',
  },
  {
    id: 'admin_don_vi',
    label: 'Admin Quản trị Đơn vị (Khối quyền theo Đơn vị)',
    desc: 'Quản trị toàn diện hồ sơ, chức vụ, quyết định, duyệt hồ sơ, đánh giá, báo cáo, thông báo trong phạm vi Đơn vị được giao',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultScope: 'unit',
  },
  {
    id: 'nguoi_duyet',
    label: 'Người duyệt nghiệp vụ (Ban Tổ chức - Kiểm tra)',
    desc: 'Duyệt yêu cầu cập nhật hồ sơ, quyết định nhân sự, chấm & duyệt đánh giá định kỳ',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultScope: 'unit',
  },
  {
    id: 'quan_ly_don_vi',
    label: 'Cán bộ Quản lý đơn vị (BCH / BCN cơ sở)',
    desc: 'Quản lý danh sách hồ sơ cán bộ đơn vị, xem tổ chức, đề xuất đánh giá định kỳ cơ sở',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    defaultScope: 'unit',
  },
  {
    id: 'lanh_dao',
    label: 'Lãnh đạo / Xem báo cáo & Giám sát',
    desc: 'Xem tổng hợp số liệu, hồ sơ, tổ chức, quyết định, đánh giá và xuất báo cáo Excel',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    defaultScope: 'all',
  },
  {
    id: 'can_bo_ca_nhan',
    label: 'Cán bộ cá nhân (Chỉ truy cập Trang người dùng)',
    desc: 'Xem lý lịch cá nhân, gửi yêu cầu sửa đổi thông tin, nộp tự đánh giá (Không vào được Trang Quản trị)',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    defaultScope: 'unit',
  },
];

export const AdminAccountsView: React.FC = () => {
  const {
    users,
    setUsers,
    allUnits,
    allProfiles,
    subsystems,
    currentUser,
    addAuditLog,
    adminResetPassword,
  } = useApp();

  const [activeViewTab, setActiveViewTab] = useState<'danh_sach' | 'khoi_don_vi'>('danh_sach');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit drawer state for granular permissions & unit scope
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [editAllowedTabs, setEditAllowedTabs] = useState<AdminTab[]>([]);
  const [editScopeMode, setEditScopeMode] = useState<'ALL' | 'UNIT'>('ALL');
  const [editManagedUnits, setEditManagedUnits] = useState<string[]>([]);

  // Admin reset password state
  const [resetPwValue, setResetPwValue] = useState('');
  const [showResetPwBox, setShowResetPwBox] = useState(false);

  // New user form state
  const [selectedOfficerProfileId, setSelectedOfficerProfileId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('Hcmute@2026');
  const [newRoles, setNewRoles] = useState<UserRole[]>(['admin_don_vi']);
  const [newAllowedTabs, setNewAllowedTabs] = useState<AdminTab[]>(DEFAULT_TABS_BY_ROLE.admin_don_vi);
  const [newScopeMode, setNewScopeMode] = useState<'ALL' | 'UNIT'>('UNIT');
  const [newManagedUnits, setNewManagedUnits] = useState<string[]>([allUnits[0]?.id || 'unit_doan_truong']);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const normalizeRole = (r: string): UserRole => {
    switch (r.toUpperCase()) {
      case 'ADMIN':
        return 'admin';
      case 'ADMIN_DON_VI':
      case 'UNIT_ADMIN':
        return 'admin_don_vi';
      case 'LEADER':
      case 'LANH_DAO':
        return 'lanh_dao';
      case 'APPROVER':
      case 'NGUOI_DUYET':
        return 'nguoi_duyet';
      case 'UNIT_MANAGER':
      case 'QUAN_LY_DON_VI':
        return 'quan_ly_don_vi';
      default:
        return 'can_bo_ca_nhan';
    }
  };

  // Start editing a selected user
  const startEditingUser = (u: AppUser) => {
    const normalized = (u.roles || ['can_bo_ca_nhan']).map((r) => normalizeRole(r));
    setEditRoles(normalized);
    setEditAllowedTabs(computeAllowedAdminTabs(u));
    const hasGlobal =
      isSuperAdminUser(u) ||
      ((!u.scope_unit_id || u.scope_unit_id === 'all' || u.scope_unit_id === 'ALL') &&
        (!u.managed_unit_ids || u.managed_unit_ids.length === 0) &&
        (normalized.includes('admin') || normalized.includes('lanh_dao')));
    setEditScopeMode(hasGlobal ? 'ALL' : 'UNIT');
    const unitList = Array.from(
      new Set([
        ...(u.managed_unit_ids || []),
        ...(u.scope_unit_id && u.scope_unit_id !== 'all' && u.scope_unit_id !== 'ALL' && u.scope_unit_id !== 'managed_all'
          ? [u.scope_unit_id]
          : []),
      ])
    );
    setEditManagedUnits(unitList.length > 0 ? unitList : [allUnits[0]?.id || 'unit_doan_truong']);
    setIsEditing(true);
  };

  // Helper: compute union of default tabs for a list of roles
  const getUnionTabsForRoles = (roleList: UserRole[]): AdminTab[] => {
    const set = new Set<AdminTab>();
    roleList.forEach((r) => {
      (DEFAULT_TABS_BY_ROLE[r] || []).forEach((t) => set.add(t));
    });
    return ALL_ADMIN_TABS.filter((t) => set.has(t));
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username ? u.username.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (u.email ? u.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const normalizedRoles = (u.roles || []).map((r) => normalizeRole(r));
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'has_admin_access' && computeAllowedAdminTabs(u).length > 0) ||
      (roleFilter === 'user_only' && computeAllowedAdminTabs(u).length === 0) ||
      normalizedRoles.includes(roleFilter as UserRole);

    const userUnitIds = [
      ...(u.managed_unit_ids || []),
      ...(u.scope_unit_id ? [u.scope_unit_id] : []),
    ];
    const matchesUnit =
      unitFilter === 'all' ||
      (unitFilter === 'GLOBAL' && (!u.scope_unit_id || u.scope_unit_id === 'all' || u.scope_unit_id === 'ALL')) ||
      userUnitIds.includes(unitFilter);

    return matchesSearch && matchesRole && matchesUnit;
  });

  const handleToggleLock = (user: AppUser) => {
    if (isSuperAdminUser(user)) {
      alert('Không thể khóa tài khoản Quản trị viên cấp cao nhất (Super Admin)!');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, is_active: !u.is_active };
      }
      return u;
    });
    setUsers(updatedUsers);

    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...selectedUser, is_active: !user.is_active });
    }

    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'UPDATE',
      target_type: 'ACCOUNT',
      target_id: user.id,
      result: 'SUCCESS',
      description: `${user.is_active ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.email} (${user.full_name})`,
      ip_address: '10.0.0.1',
    });

    showToast(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản ${user.full_name}`);
  };

  const handleRevokeAdminAccess = (user: AppUser) => {
    if (isSuperAdminUser(user)) {
      alert('Không thể thu hồi quyền của Super Admin tối cao (thanlx@hcmute.edu.vn)!');
      return;
    }
    const updatedUsers = users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          roles: ['can_bo_ca_nhan'] as UserRole[],
          current_role: 'can_bo_ca_nhan' as UserRole,
          allowed_admin_tabs: [],
          portal_mode: 'user' as const,
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    if (selectedUser?.id === user.id) {
      setSelectedUser({
        ...selectedUser,
        roles: ['can_bo_ca_nhan'],
        current_role: 'can_bo_ca_nhan',
        allowed_admin_tabs: [],
        portal_mode: 'user',
      });
      setIsEditing(false);
    }
    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'UPDATE',
      target_type: 'ACCOUNT',
      target_id: user.id,
      result: 'SUCCESS',
      description: `Thu hồi toàn bộ quyền truy cập Trang Quản trị của ${user.full_name} (${user.email}) -> Chuyển về Cán bộ cá nhân`,
      ip_address: '10.0.0.1',
    });
    showToast(`Đã thu hồi quyền Quản trị của ${user.full_name}. Tài khoản này chỉ còn thấy Trang Cá nhân.`);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (isSuperAdminUser(user)) {
      alert('Không thể xóa tài khoản Quản trị viên cấp cao nhất!');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.full_name} (${user.email}) khỏi hệ thống?`)) {
      return;
    }

    const updated = users.filter((u) => u.id !== user.id);
    setUsers(updated);
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    }

    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'DELETE',
      target_type: 'ACCOUNT',
      target_id: user.id,
      result: 'SUCCESS',
      description: `Xóa tài khoản: ${user.email} (${user.full_name})`,
      ip_address: '10.0.0.1',
    });

    showToast(`Đã xóa tài khoản ${user.full_name}`);
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;

    if (isSuperAdminUser(selectedUser)) {
      alert('Tài khoản Super Admin (thanlx@hcmute.edu.vn) luôn giữ toàn quyền hệ thống!');
      setIsEditing(false);
      return;
    }

    const finalRoles: UserRole[] =
      editAllowedTabs.length === 0
        ? ['can_bo_ca_nhan']
        : editRoles.filter((r) => r !== 'can_bo_ca_nhan').length > 0
        ? editRoles
        : ['admin_don_vi'];

    const isAllScope = editScopeMode === 'ALL';
    const primaryUnitId = isAllScope ? 'all' : editManagedUnits[0] || allUnits[0]?.id || 'unit_doan_truong';
    const scopeName = isAllScope
      ? 'Toàn trường'
      : editManagedUnits.length > 1
      ? `${allUnits.find((u) => u.id === primaryUnitId)?.name || 'Đơn vị'} (+${editManagedUnits.length - 1} đơn vị)`
      : allUnits.find((u) => u.id === primaryUnitId)?.name || 'Đơn vị';

    const updatedObj: AppUser = {
      ...selectedUser,
      roles: finalRoles,
      current_role: finalRoles[0] || 'can_bo_ca_nhan',
      allowed_admin_tabs: editAllowedTabs,
      scope_unit_id: primaryUnitId,
      scope_unit_name: scopeName,
      managed_unit_ids: isAllScope ? [] : editManagedUnits,
      portal_mode: editAllowedTabs.length > 0 ? 'admin' : 'user',
    };

    const updatedUsers = users.map((u) => (u.id === selectedUser.id ? updatedObj : u));
    setUsers(updatedUsers);
    setSelectedUser(updatedObj);
    setIsEditing(false);

    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'UPDATE',
      target_type: 'ACCOUNT',
      target_id: selectedUser.id,
      result: 'SUCCESS',
      description: `Cập nhật phân quyền cho ${selectedUser.full_name} (${selectedUser.email}): Vai trò [${finalRoles.join(', ')}], Menu Quản trị [${editAllowedTabs.join(', ')}], Phạm vi [${scopeName}]`,
      ip_address: '10.0.0.1',
    });

    showToast(`Đã lưu phân quyền cho ${selectedUser.full_name} (${editAllowedTabs.length} chức năng quản trị)`);
  };

  const handleAdminResetPw = () => {
    if (!selectedUser) return;
    const res = adminResetPassword(selectedUser.id, resetPwValue.trim());
    if (!res.success) {
      alert(res.message);
      return;
    }
    setSelectedUser({ ...selectedUser, password: resetPwValue.trim() });
    setShowResetPwBox(false);
    setResetPwValue('');
    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'doi_mat_khau',
      target_type: 'ACCOUNT',
      target_id: selectedUser.id,
      result: 'SUCCESS',
      description: `Quản trị viên đặt lại mật khẩu đăng nhập cho tài khoản ${selectedUser.email} (${selectedUser.full_name}).`,
      ip_address: '10.0.0.1',
    });
    showToast(res.message);
  };

  // Mở modal cấp quyền nhanh cho 1 Đơn vị cụ thể
  const openAssignUnitAdminModal = (unitId: string) => {
    setSelectedOfficerProfileId('');
    setNewFullName('');
    setNewEmail('');
    setNewUsername('');
    setNewStudentId('');
    setNewPassword('Hcmute@2026');
    setNewRoles(['admin_don_vi']);
    setNewAllowedTabs(DEFAULT_TABS_BY_ROLE.admin_don_vi);
    setNewScopeMode('UNIT');
    setNewManagedUnits([unitId]);
    setShowAddModal(true);
  };

  const handleSelectOfficerFromProfile = (profileId: string) => {
    setSelectedOfficerProfileId(profileId);
    const prof = allProfiles.find((p) => p.id === profileId);
    if (!prof) return;
    setNewFullName(prof.full_name);
    setNewEmail(prof.email || `${prof.student_id || 'cb'}@student.hcmute.edu.vn`);
    setNewStudentId(prof.student_id || prof.profile_code || '');
    setNewUsername((prof.email?.split('@')[0] || prof.student_id || '').toLowerCase());
    if (prof.primary_unit_id) {
      setNewScopeMode('UNIT');
      setNewManagedUnits([prof.primary_unit_id]);
    }
  };

  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      alert('Vui lòng điền Họ tên và Email tài khoản.');
      return;
    }

    const emailTrimmed = newEmail.trim().toLowerCase();
    const assignedRoles: UserRole[] =
      newAllowedTabs.length === 0
        ? ['can_bo_ca_nhan']
        : newRoles.length > 0
        ? newRoles
        : ['admin_don_vi'];

    const isAllScope = newScopeMode === 'ALL';
    const primaryUnitId = isAllScope ? 'all' : newManagedUnits[0] || allUnits[0]?.id || 'unit_doan_truong';
    const chosenScopeName = isAllScope
      ? 'Toàn trường'
      : newManagedUnits.length > 1
      ? `${allUnits.find((u) => u.id === primaryUnitId)?.name || 'Đơn vị'} (+${newManagedUnits.length - 1} đơn vị)`
      : allUnits.find((u) => u.id === primaryUnitId)?.name || 'Đơn vị';

    const existing = users.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (existing) {
      // Nếu tài khoản đã tồn tại, cập nhật nâng cấp quyền Admin luôn!
      const upgraded: AppUser = {
        ...existing,
        full_name: newFullName.trim() || existing.full_name,
        student_id: newStudentId.trim() || existing.student_id,
        username: (newUsername.trim() || existing.username || emailTrimmed.split('@')[0]).toLowerCase(),
        password: newPassword.trim() || existing.password || 'Hcmute@2026',
        roles: assignedRoles,
        current_role: assignedRoles[0],
        allowed_admin_tabs: newAllowedTabs,
        scope_unit_id: primaryUnitId,
        scope_unit_name: chosenScopeName,
        managed_unit_ids: isAllScope ? [] : newManagedUnits,
        portal_mode: newAllowedTabs.length > 0 ? 'admin' : 'user',
        is_active: true,
      };
      setUsers(users.map((u) => (u.id === existing.id ? upgraded : u)));
      setSelectedUser(upgraded);
      setShowAddModal(false);
      showToast(`Đã cập nhật cấp quyền Admin cho tài khoản hiện có: ${upgraded.full_name} (${chosenScopeName})`);
      return;
    }

    const matchedProf = allProfiles.find(
      (p) => p.id === selectedOfficerProfileId || p.email?.toLowerCase() === emailTrimmed
    );

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      profile_id: matchedProf?.id || `prof_${Date.now()}`,
      username: (newUsername.trim() || emailTrimmed.split('@')[0]).toLowerCase(),
      password: newPassword.trim() || 'Hcmute@2026',
      full_name: newFullName.trim(),
      email: emailTrimmed,
      student_id: newStudentId.trim() || matchedProf?.student_id || 'CB-HCMUTE',
      avatar_code: newFullName
        .trim()
        .split(' ')
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      roles: assignedRoles,
      current_role: assignedRoles[0],
      scope_unit_id: primaryUnitId,
      scope_unit_name: chosenScopeName,
      managed_unit_ids: isAllScope ? [] : newManagedUnits,
      allowed_admin_tabs: newAllowedTabs,
      portal_mode: newAllowedTabs.length > 0 ? 'admin' : 'user',
      is_active: true,
    };

    setUsers([...users, newUser]);
    setSelectedUser(newUser);
    setShowAddModal(false);

    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'CREATE',
      target_type: 'ACCOUNT',
      target_id: newUser.id,
      result: 'SUCCESS',
      description: `Cấp tài khoản & phân quyền: ${newUser.email} (${newUser.full_name}) - Vai trò [${assignedRoles.join(', ')}], Phạm vi [${chosenScopeName}], Menu [${newAllowedTabs.length} quyền]`,
      ip_address: '10.0.0.1',
    });

    showToast(`Đã tạo tài khoản & cấp quyền thành công cho ${newUser.full_name} (${chosenScopeName})`);
  };

  const getRoleBadge = (role: string) => {
    const norm = normalizeRole(role);
    const found = ROLE_OPTIONS.find((r) => r.id === norm);
    if (!found) {
      return (
        <span
          key={role}
          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200"
        >
          Cán bộ cá nhân
        </span>
      );
    }
    return (
      <span key={role} className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${found.color}`}>
        {found.label.split('(')[0].trim()}
      </span>
    );
  };

  // Thống kê nhanh
  const totalAdminUsers = users.filter((u) => computeAllowedAdminTabs(u).length > 0).length;
  const totalUnitAdmins = users.filter(
    (u) =>
      computeAllowedAdminTabs(u).length > 0 &&
      !isSuperAdminUser(u) &&
      ((u.managed_unit_ids && u.managed_unit_ids.length > 0) ||
        (u.scope_unit_id && u.scope_unit_id !== 'all' && u.scope_unit_id !== 'ALL'))
  ).length;
  const totalPersonalOnlyUsers = users.filter((u) => computeAllowedAdminTabs(u).length === 0).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Quản trị hệ thống</span>
            <span>&gt;</span>
            <span className="text-foreground font-semibold">Tài khoản, Phân quyền & Khối Admin Đơn vị</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Quản lý Tài khoản, Phân quyền Chi tiết & Khối Admin Đơn vị</span>
            <Shield className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chỉ những tài khoản được cấp quyền tại đây mới thấy nút và truy cập được Trang Quản trị. Ai được cấp phân hệ nào sẽ chỉ thấy đúng phân hệ đó.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOfficerProfileId('');
              setNewFullName('');
              setNewEmail('');
              setNewUsername('');
              setNewStudentId('');
              setNewPassword('Hcmute@2026');
              setNewRoles(['admin_don_vi']);
              setNewAllowedTabs(DEFAULT_TABS_BY_ROLE.admin_don_vi);
              setNewScopeMode('UNIT');
              setNewManagedUnits([allUnits[0]?.id || 'unit_doan_truong']);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm tài khoản / Cấp quyền Admin</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase">Tổng tài khoản</p>
            <p className="text-2xl font-black text-foreground mt-1">{users.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Toàn hệ thống Đoàn - Hội</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-purple-200 dark:border-purple-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">Có quyền vào Quản trị</p>
            <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">{totalAdminUsers}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Thấy nút &quot;Trang quản trị&quot;</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-emerald-200 dark:border-emerald-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Admin theo Đơn vị</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{totalUnitAdmins}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Quản lý trong phạm vi đơn vị</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase">Chỉ xem Trang Cá nhân</p>
            <p className="text-2xl font-black text-foreground mt-1">{totalPersonalOnlyUsers}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Chặn hoàn toàn Trang Quản trị</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Switch Sub-tabs: Danh sách tài khoản vs Khối quyền Admin theo Đơn vị */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveViewTab('danh_sach')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeViewTab === 'danh_sach'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Danh sách Tài khoản & Phân quyền Menu ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveViewTab('khoi_don_vi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeViewTab === 'khoi_don_vi'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Khối quyền Admin Quản lý theo từng Đơn vị ({allUnits.length} đơn vị)</span>
        </button>
      </div>

      {/* TAB 2: KHỐI QUYỀN ADMIN THEO TỪNG ĐƠN VỊ */}
      {activeViewTab === 'khoi_don_vi' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Cơ chế Khối quyền Admin Quản lý theo từng Đơn vị (Đoàn Thanh niên & Hội Sinh viên)</span>
              </h3>
              <p className="text-[11px] text-blue-900/80 dark:text-blue-300">
                Mỗi đơn vị (Đoàn cơ sở, Liên chi hội, Đơn vị chức năng, CLB/Đội/Nhóm, Chi đoàn) có khối quyền Admin riêng. Người được gắn quyền Admin tại đơn vị nào sẽ chỉ quản lý hồ sơ, quyết định, duyệt lý lịch và đánh giá của đúng đơn vị đó (cùng các đơn vị trực thuộc con).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allUnits.map((unit) => {
              const subInfo = subsystems.find((s) => s.id === unit.subsystem_id);
              const unitOfficersCount = allProfiles.filter(
                (p) => p.primary_unit_id === unit.id || (p.roles || []).some((r) => r.unit_id === unit.id)
              ).length;

              // Những tài khoản được phân quyền quản lý trực tiếp đơn vị này
              const unitAdmins = users.filter((u) => {
                if (isSuperAdminUser(u)) return false;
                if (computeAllowedAdminTabs(u).length === 0) return false;
                const managed = [
                  ...(u.managed_unit_ids || []),
                  ...(u.scope_unit_id ? [u.scope_unit_id] : []),
                ];
                return managed.includes(unit.id);
              });

              return (
                <div
                  key={unit.id}
                  className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary mb-1">
                          {unit.code} • {subInfo?.name || unit.subsystem_id}
                        </span>
                        <h4 className="text-sm font-black text-foreground flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-primary shrink-0" />
                          <span>Khối Admin: {unit.name}</span>
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-muted text-foreground shrink-0">
                        {unitOfficersCount} CB
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {unit.description || `Phạm vi quản lý nhân sự, chức vụ và đánh giá thuộc ${unit.name}.`}
                    </p>

                    <div className="pt-2 border-t border-border">
                      <div className="text-[11px] font-bold text-foreground mb-2 flex items-center justify-between">
                        <span>Admin / Cán bộ quản lý đơn vị ({unitAdmins.length}):</span>
                      </div>

                      {unitAdmins.length === 0 ? (
                        <div className="p-3 rounded-xl bg-muted/40 border border-dashed border-border text-[11px] text-muted-foreground text-center">
                          Chưa có Admin phụ trách riêng (Hiện do Super Admin quản lý)
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {unitAdmins.map((ua) => {
                            const tabs = computeAllowedAdminTabs(ua);
                            return (
                              <div
                                key={ua.id}
                                onClick={() => {
                                  setSelectedUser(ua);
                                  startEditingUser(ua);
                                  setActiveViewTab('danh_sach');
                                }}
                                className="p-2 rounded-xl bg-muted/50 hover:bg-primary/10 border border-border flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-foreground truncate">{ua.full_name}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{ua.email}</div>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold shrink-0">
                                  {tabs.length} quyền menu
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAssignUnitAdminModal(unit.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Cấp quyền Admin {unit.name}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: DANH SÁCH TÀI KHOẢN & PHÂN QUYỀN CHI TIẾT */}
      {activeViewTab === 'danh_sach' && (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên, email Google, MSSV, tên đăng nhập..."
                  className="w-full text-xs border border-border rounded-xl pl-9 pr-3 py-2 bg-background focus:outline-hidden focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs border border-border rounded-xl px-3 py-2 bg-background focus:outline-hidden focus:border-primary font-medium"
                >
                  <option value="all">Tất cả vai trò ({users.length})</option>
                  <option value="has_admin_access">Có quyền vào Trang Quản trị ({totalAdminUsers})</option>
                  <option value="user_only">Chỉ xem Trang Cá nhân ({totalPersonalOnlyUsers})</option>
                  <option value="admin">Quản trị Toàn trường (Admin)</option>
                  <option value="admin_don_vi">Admin Quản trị Đơn vị</option>
                  <option value="nguoi_duyet">Người duyệt nghiệp vụ</option>
                  <option value="quan_ly_don_vi">Cán bộ Quản lý đơn vị</option>
                  <option value="lanh_dao">Lãnh đạo / Xem báo cáo</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="text-xs border border-border rounded-xl px-3 py-2 bg-background focus:outline-hidden focus:border-primary font-medium"
                >
                  <option value="all">Tất cả phạm vi đơn vị</option>
                  <option value="GLOBAL">Phạm vi Toàn trường</option>
                  {allUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Đơn vị: {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-semibold">
              Hiển thị: <span className="text-foreground font-bold">{filteredUsers.length}</span> tài khoản
            </div>
          </div>

          {/* Main Layout: Accounts Table + Detail / Permission Drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table */}
            <div
              className={`${
                selectedUser ? 'lg:col-span-7' : 'lg:col-span-12'
              } bg-card rounded-2xl border border-border shadow-xs overflow-hidden`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[11px] border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Họ và tên / Email</th>
                      <th className="px-4 py-3">Vai trò & Quyền Quản trị</th>
                      <th className="px-4 py-3">Khối Đơn vị quản lý</th>
                      <th className="px-4 py-3 text-center">Quyền vào Admin</th>
                      <th className="px-4 py-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      const isSuper = isSuperAdminUser(u);
                      const grantedTabs = computeAllowedAdminTabs(u);
                      const canEnterAdmin = grantedTabs.length > 0;

                      return (
                        <tr
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsEditing(false);
                            setShowResetPwBox(false);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10' : 'hover:bg-muted/40'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                <span>{u.full_name}</span>
                                {isSuper && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 text-[10px] font-black border border-rose-500/20">
                                    <Crown className="w-3 h-3 text-rose-600" />
                                    Super Admin
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{u.email}</div>
                            {u.student_id && (
                              <div className="text-[10px] text-primary font-semibold">MSSV/Mã: {u.student_id}</div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 mb-1">
                              {(u.roles || []).map((r) => getRoleBadge(r))}
                            </div>
                            {canEnterAdmin ? (
                              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                Được mở {grantedTabs.length}/11 menu quản trị
                              </div>
                            ) : (
                              <div className="text-[10px] text-muted-foreground">
                                Không có quyền vào Trang Quản trị
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                                isSuper || !u.scope_unit_id || u.scope_unit_id === 'all' || u.scope_unit_id === 'ALL'
                                  ? 'bg-purple-500/10 text-purple-700 border border-purple-500/20'
                                  : 'bg-blue-500/10 text-primary border border-primary/20'
                              }`}
                            >
                              <Building2 className="w-3 h-3" />
                              <span>{isSuper ? 'Toàn trường' : u.scope_unit_name || 'Toàn trường'}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {!u.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold border border-destructive/20">
                                <Lock className="w-3 h-3" />
                                Đã khóa
                              </span>
                            ) : canEnterAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Có quyền Admin ({grantedTabs.length})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                                Chỉ trang Cá nhân
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  startEditingUser(u);
                                }}
                                title="Phân quyền Menu & Đơn vị"
                                className="p-1.5 rounded-lg border border-border text-primary hover:bg-primary/10 transition-all cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={isSuper}
                                onClick={() => handleToggleLock(u)}
                                title={
                                  isSuper
                                    ? 'Không thể khóa Super Admin'
                                    : u.is_active
                                    ? 'Khóa tài khoản'
                                    : 'Mở khóa'
                                }
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isSuper
                                    ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                                    : u.is_active
                                    ? 'text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10'
                                    : 'text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30'
                                }`}
                              >
                                {u.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                              {!isSuper && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Xóa tài khoản"
                                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Detail / Edit Panel: 5 cols */}
            {selectedUser && (
              <div className="lg:col-span-5 bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-primary" />
                    <span>Chi tiết Phân quyền Menu & Khối Đơn vị</span>
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setIsEditing(false);
                      setShowResetPwBox(false);
                    }}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-base">
                      {selectedUser.avatar_code}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-foreground text-sm truncate">{selectedUser.full_name}</h4>
                      {isSuperAdminUser(selectedUser) && (
                        <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 text-[10px] font-bold border border-rose-500/20 shrink-0">
                          Super Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{selectedUser.email}</div>
                    <div className="text-[10px] text-primary font-semibold">
                      MSSV / Mã CB: {selectedUser.student_id || 'CB-HCMUTE'}
                    </div>
                  </div>
                </div>

                {/* Account Status Card */}
                <div className="bg-muted/40 rounded-xl p-3 border border-border text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quyền vào Trang Quản trị:</span>
                    {computeAllowedAdminTabs(selectedUser).length > 0 ? (
                      <span className="font-bold text-emerald-600">
                        Được phép truy cập ({computeAllowedAdminTabs(selectedUser).length}/11 phân hệ)
                      </span>
                    ) : (
                      <span className="font-bold text-slate-600">
                        Không (Chỉ thấy Trang người dùng cá nhân)
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Khối Đơn vị phụ trách:</span>
                    <span className="font-bold text-foreground">
                      {isSuperAdminUser(selectedUser)
                        ? 'Toàn trường (Tất cả đơn vị)'
                        : selectedUser.scope_unit_name || 'Toàn trường'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mật khẩu đăng nhập:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPwBox(!showResetPwBox);
                        setResetPwValue(selectedUser.password || 'Hcmute@2026');
                      }}
                      className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Đổi / Cấp lại mật khẩu</span>
                    </button>
                  </div>
                </div>

                {/* Box đổi mật khẩu trực tiếp */}
                {showResetPwBox && (
                  <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 space-y-2.5 animate-in fade-in">
                    <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                      <span>Đặt mật khẩu mới cho {selectedUser.full_name}</span>
                      <button
                        type="button"
                        onClick={() => setShowResetPwBox(false)}
                        className="text-amber-700 hover:text-amber-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={resetPwValue}
                        onChange={(e) => setResetPwValue(e.target.value)}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                        className="flex-1 text-xs border border-amber-300 rounded-lg px-3 py-1.5 bg-white font-mono text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAdminResetPw}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shrink-0"
                      >
                        Lưu mật khẩu
                      </button>
                    </div>
                  </div>
                )}

                {/* Roles & Granular Tabs Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Phân quyền Vai trò, Menu & Đơn vị</span>
                    {!isEditing && !isSuperAdminUser(selectedUser) && (
                      <button
                        onClick={() => startEditingUser(selectedUser)}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Chỉnh sửa phân quyền
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 p-4 border border-primary/30 rounded-2xl bg-primary/5">
                      {/* 1. Chọn khối vai trò */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">
                          1. Chọn Khối Vai trò (Tự động gợi ý các menu tương ứng)
                        </label>
                        <div className="space-y-1.5">
                          {ROLE_OPTIONS.map((r) => {
                            const isChecked = editRoles.includes(r.id);
                            return (
                              <label
                                key={r.id}
                                className="flex items-start gap-2.5 text-xs cursor-pointer p-2 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    let nextRoles: UserRole[];
                                    if (r.id === 'can_bo_ca_nhan' && e.target.checked) {
                                      nextRoles = ['can_bo_ca_nhan'];
                                      setEditAllowedTabs([]);
                                    } else {
                                      const filtered = editRoles.filter((x) => x !== 'can_bo_ca_nhan');
                                      nextRoles = e.target.checked
                                        ? Array.from(new Set([...filtered, r.id]))
                                        : filtered.filter((x) => x !== r.id);
                                      if (nextRoles.length === 0) nextRoles = ['can_bo_ca_nhan'];
                                      setEditAllowedTabs(getUnionTabsForRoles(nextRoles));
                                    }
                                    setEditRoles(nextRoles);
                                    if (r.id === 'admin_don_vi' && e.target.checked) {
                                      setEditScopeMode('UNIT');
                                    } else if (r.id === 'admin' && e.target.checked) {
                                      setEditScopeMode('ALL');
                                    }
                                  }}
                                  className="mt-0.5 rounded text-primary"
                                />
                                <div className="flex-1">
                                  <div className="font-bold text-foreground">{r.label}</div>
                                  <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Chọn phạm vi Đơn vị quản lý */}
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">
                          2. Khối Đơn vị được phép quản lý
                        </label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setEditScopeMode('ALL')}
                            className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                              editScopeMode === 'ALL'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-foreground border-border'
                            }`}
                          >
                            Toàn trường (Tất cả đơn vị)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditScopeMode('UNIT')}
                            className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                              editScopeMode === 'UNIT'
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-foreground border-border'
                            }`}
                          >
                            Theo Đơn vị cụ thể
                          </button>
                        </div>

                        {editScopeMode === 'UNIT' && (
                          <div className="p-2.5 rounded-xl bg-card border border-border max-h-44 overflow-y-auto space-y-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                              Tích chọn 1 hoặc nhiều đơn vị phụ trách:
                            </div>
                            {allUnits.map((u) => {
                              const checked = editManagedUnits.includes(u.id);
                              return (
                                <label
                                  key={u.id}
                                  className="flex items-center gap-2 text-xs py-1 px-1.5 rounded-lg hover:bg-muted cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setEditManagedUnits(Array.from(new Set([...editManagedUnits, u.id])));
                                      } else {
                                        const next = editManagedUnits.filter((id) => id !== u.id);
                                        setEditManagedUnits(next.length > 0 ? next : [u.id]);
                                      }
                                    }}
                                    className="rounded text-primary"
                                  />
                                  <span className="font-semibold text-foreground">{u.name}</span>
                                  <span className="text-[10px] text-muted-foreground">({u.code})</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 3. Chọn chi tiết từng Menu Trang Quản trị ("Ai được cấp quyền nào sẽ thấy quyền đó") */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-foreground">
                            3. Các Menu Trang Quản trị được phép thấy ({editAllowedTabs.length}/11)
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditAllowedTabs(ALL_ADMIN_TABS)}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Chọn hết
                            </button>
                            <span className="text-muted-foreground">|</span>
                            <button
                              type="button"
                              onClick={() => setEditAllowedTabs([])}
                              className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Bỏ hết (Chỉ Cá nhân)
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-card border border-border space-y-1 max-h-56 overflow-y-auto">
                          {ADMIN_TAB_DEFINITIONS.map((tab) => {
                            const isChecked = editAllowedTabs.includes(tab.id);
                            return (
                              <label
                                key={tab.id}
                                className="flex items-start gap-2 text-xs p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditAllowedTabs(
                                        ALL_ADMIN_TABS.filter((t) => [...editAllowedTabs, tab.id].includes(t))
                                      );
                                    } else {
                                      setEditAllowedTabs(editAllowedTabs.filter((t) => t !== tab.id));
                                    }
                                  }}
                                  className="mt-0.5 rounded text-primary"
                                />
                                <div>
                                  <div className="font-bold text-foreground">{tab.label}</div>
                                  <div className="text-[10px] text-muted-foreground">{tab.desc}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 text-xs text-muted-foreground bg-card border border-border rounded-xl hover:bg-muted font-semibold cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePermissions}
                          className="px-4 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 shadow-sm cursor-pointer"
                        >
                          Lưu phân quyền
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedUser.roles || []).map((r) => getRoleBadge(r))}
                      </div>

                      {/* Danh sách các menu quản trị mà tài khoản này đang nhìn thấy */}
                      <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                        <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-primary" />
                          <span>
                            Menu Quản trị được phép truy cập ({computeAllowedAdminTabs(selectedUser).length}/11):
                          </span>
                        </div>
                        {computeAllowedAdminTabs(selectedUser).length === 0 ? (
                          <div className="text-[11px] text-muted-foreground italic">
                            Tài khoản này KHÔNG có quyền truy cập Trang Quản trị (Nút &quot;Trang quản trị&quot; đã bị ẩn).
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {computeAllowedAdminTabs(selectedUser).map((tabId) => {
                              const def = ADMIN_TAB_DEFINITIONS.find((d) => d.id === tabId);
                              return (
                                <span
                                  key={tabId}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold"
                                >
                                  ✓ {def?.label || tabId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {!isSuperAdminUser(selectedUser) && (
                  <div className="pt-3 border-t border-border space-y-2">
                    {computeAllowedAdminTabs(selectedUser).length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRevokeAdminAccess(selectedUser)}
                        className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-amber-400/50 bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Thu hồi toàn bộ quyền Quản trị (Chuyển về Cá nhân)</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLock(selectedUser)}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selectedUser.is_active
                            ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                            : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                      >
                        {selectedUser.is_active ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Khóa tài khoản</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Mở khóa</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(selectedUser)}
                        className="py-2 px-3 text-xs font-bold rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add / Assign Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-border space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-black text-foreground text-base">
                  Thêm Tài khoản & Phân quyền Admin (Toàn trường / Theo Đơn vị)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Chọn nhanh từ danh sách Cán bộ hoặc nhập Email mới, chọn Khối Đơn vị và tích các Menu Quản trị được phép truy cập.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
              {/* Chọn nhanh từ hồ sơ cán bộ đã nhập */}
              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20">
                <label className="block text-xs font-bold text-primary mb-1">
                  Chọn nhanh từ danh sách Hồ sơ Cán bộ hiện có (Tùy chọn)
                </label>
                <select
                  value={selectedOfficerProfileId}
                  onChange={(e) => handleSelectOfficerFromProfile(e.target.value)}
                  className="w-full text-xs border border-border rounded-xl px-3 py-2 bg-background font-medium"
                >
                  <option value="">-- Hoặc tự nhập thông tin tài khoản mới bên dưới --</option>
                  {allProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} — MSSV: {p.student_id || p.profile_code} ({p.email || 'Chưa có email'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Họ và tên cán bộ <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A..."
                    className="w-full text-xs border border-border rounded-xl px-3.5 py-2 bg-background focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Email đăng nhập (Google / HCMUTE) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="canbo@hcmute.edu.vn"
                    className="w-full text-xs border border-border rounded-xl px-3.5 py-2 bg-background focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="nguyenvana"
                    className="w-full text-xs border border-border rounded-xl px-3 py-2 bg-background focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">MSSV / Mã CB</label>
                  <input
                    type="text"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="23110099"
                    className="w-full text-xs border border-border rounded-xl px-3 py-2 bg-background focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Mật khẩu khởi tạo</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Hcmute@2026"
                    className="w-full text-xs border border-border rounded-xl px-3 py-2 bg-background font-mono focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* 1. Chọn Khối Vai trò */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  1. Chọn Khối Vai trò truy cập <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-muted/40 border border-border">
                  {ROLE_OPTIONS.map((r) => {
                    const isChecked = newRoles.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2 text-xs cursor-pointer p-2 rounded-xl border transition-colors ${
                          isChecked ? 'bg-primary/10 border-primary/40' : 'bg-card border-border hover:bg-background/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let nextRoles: UserRole[];
                            if (r.id === 'can_bo_ca_nhan' && e.target.checked) {
                              nextRoles = ['can_bo_ca_nhan'];
                              setNewAllowedTabs([]);
                            } else {
                              const cleaned = newRoles.filter((x) => x !== 'can_bo_ca_nhan');
                              nextRoles = e.target.checked
                                ? Array.from(new Set([...cleaned, r.id]))
                                : cleaned.filter((item) => item !== r.id);
                              if (nextRoles.length === 0) nextRoles = ['can_bo_ca_nhan'];
                              setNewAllowedTabs(getUnionTabsForRoles(nextRoles));
                            }
                            setNewRoles(nextRoles);
                            if (r.id === 'admin' && e.target.checked) {
                              setNewScopeMode('ALL');
                            } else if (r.id === 'admin_don_vi' && e.target.checked) {
                              setNewScopeMode('UNIT');
                            }
                          }}
                          className="mt-0.5 rounded text-primary"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-foreground">{r.label}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-2">{r.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Chọn Khối Đơn vị phụ trách */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  2. Phạm vi Khối Đơn vị quản lý
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewScopeMode('ALL')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newScopeMode === 'ALL'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border'
                    }`}
                  >
                    Toàn trường (Tất cả đơn vị Đoàn - Hội)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewScopeMode('UNIT')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newScopeMode === 'UNIT'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border'
                    }`}
                  >
                    Quản lý theo Đơn vị cụ thể
                  </button>
                </div>

                {newScopeMode === 'UNIT' && (
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto">
                    {allUnits.map((u) => {
                      const checked = newManagedUnits.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center gap-2 text-xs p-1.5 rounded-lg bg-card border border-border hover:border-primary/40 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewManagedUnits(Array.from(new Set([...newManagedUnits, u.id])));
                              } else {
                                const next = newManagedUnits.filter((id) => id !== u.id);
                                setNewManagedUnits(next.length > 0 ? next : [u.id]);
                              }
                            }}
                            className="rounded text-primary"
                          />
                          <span className="font-semibold text-foreground truncate">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground">({u.code})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Chọn chi tiết Menu Quản trị được phép nhìn thấy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-foreground">
                    3. Phân quyền Menu Trang Quản trị được phép thấy ({newAllowedTabs.length}/11 phân hệ)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAllowedTabs(ALL_ADMIN_TABS)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Chọn tất cả (11)
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={() => setNewAllowedTabs(DEFAULT_TABS_BY_ROLE.admin_don_vi)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Bộ Admin Đơn vị (8)
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={() => setNewAllowedTabs([])}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Bỏ chọn hết (0)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-3 rounded-2xl bg-muted/30 border border-border max-h-52 overflow-y-auto">
                  {ADMIN_TAB_DEFINITIONS.map((tab) => {
                    const checked = newAllowedTabs.includes(tab.id);
                    return (
                      <label
                        key={tab.id}
                        className="flex items-start gap-2 text-xs p-2 rounded-xl bg-card border border-border hover:border-primary/40 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAllowedTabs(
                                ALL_ADMIN_TABS.filter((t) => [...newAllowedTabs, tab.id].includes(t))
                              );
                            } else {
                              setNewAllowedTabs(newAllowedTabs.filter((t) => t !== tab.id));
                            }
                          }}
                          className="mt-0.5 rounded text-primary"
                        />
                        <div>
                          <div className="font-bold text-foreground">{tab.label}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1">{tab.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-muted-foreground border border-border rounded-xl hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 shadow-md cursor-pointer"
                >
                  Lưu & Cấp quyền tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountsView;
