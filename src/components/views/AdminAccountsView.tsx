'use client';

// ==============================================================================
// QUẢN TRỊ TÀI KHOẢN VÀ PHÂN QUYỀN (ADMIN ACCOUNTS & ROLES MANAGEMENT)
// Hỗ trợ Super Admin (thanlx@hcmute.edu.vn) thêm, phân quyền Admin & bảo vệ hệ thống
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Shield,
  Search,
  Filter,
  UserPlus,
  Lock,
  Unlock,
  Check,
  X,
  Edit,
  AlertTriangle,
  Building,
  CheckCircle2,
  Trash2,
  Crown,
  Key,
} from 'lucide-react';
import { AppUser, UserRole } from '@/types';

const ROLE_OPTIONS: { id: UserRole; label: string; desc: string; color: string }[] = [
  {
    id: 'admin',
    label: 'Quản trị hệ thống (Admin)',
    desc: 'Quản lý tài khoản, danh mục tổ chức, cấu hình & xem nhật ký kiểm toán',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'lanh_dao',
    label: 'Lãnh đạo / Xem báo cáo',
    desc: 'Xem tổng hợp số liệu toàn trường, chỉ đọc và xuất báo cáo nghiệp vụ',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    id: 'nguoi_duyet',
    label: 'Người duyệt nghiệp vụ',
    desc: 'Duyệt cập nhật hồ sơ, đề xuất bổ nhiệm, ký quyết định nhân sự',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'quan_ly_don_vi',
    label: 'Quản lý đơn vị',
    desc: 'Nhập hồ sơ cán bộ đơn vị, đề xuất quyết định, đánh giá định kỳ cơ sở',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'can_bo_ca_nhan',
    label: 'Cán bộ cá nhân',
    desc: 'Xem lý lịch cá nhân, gửi yêu cầu sửa đổi thông tin, nộp tự đánh giá',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  },
];

export const AdminAccountsView: React.FC = () => {
  const { users, setUsers, units, currentUser, addAuditLog } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New user form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newRoles, setNewRoles] = useState<UserRole[]>(['can_bo_ca_nhan']);
  const [newScopeUnit, setNewScopeUnit] = useState('ALL');

  const isSuperAdminAccount = (u: AppUser) => {
    const email = (u.email || '').toLowerCase().trim();
    return (
      email === 'thanlx@hcmute.edu.vn' ||
      email === 'lexuanthanspkt@gmail.com' ||
      u.id === 'user_thanlx' ||
      u.profile_id === 'prof_thanlx'
    );
  };

  const normalizeRole = (r: string): UserRole => {
    switch (r.toUpperCase()) {
      case 'ADMIN':
        return 'admin';
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username ? u.username.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (u.email ? u.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const normalizedRoles = (u.roles || []).map((r) => normalizeRole(r));
    const matchesRole =
      roleFilter === 'all' ||
      normalizedRoles.includes(roleFilter as UserRole) ||
      (u.roles || []).includes(roleFilter as any);

    return matchesSearch && matchesRole;
  });

  const handleToggleLock = (user: AppUser) => {
    if (isSuperAdminAccount(user)) {
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
      description: `${user.is_active ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.username || user.email} (${user.full_name})`,
      ip_address: '10.0.0.1',
    });

    setActionNotice(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản ${user.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (isSuperAdminAccount(user)) {
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

    setActionNotice(`Đã xóa tài khoản ${user.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSaveRoles = (updatedRoles: UserRole[], updatedScope: string | null) => {
    if (!selectedUser) return;

    if (isSuperAdminAccount(selectedUser) && !updatedRoles.includes('admin')) {
      alert('Tài khoản Super Admin bắt buộc phải giữ quyền Quản trị hệ thống (Admin)!');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          roles: updatedRoles,
          current_role: updatedRoles[0] || 'can_bo_ca_nhan',
          scope_unit_id: updatedScope,
          scope_unit_name: updatedScope ? units.find((un) => un.id === updatedScope)?.name || 'Đơn vị' : 'Toàn trường',
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    setSelectedUser({
      ...selectedUser,
      roles: updatedRoles,
      current_role: updatedRoles[0] || 'can_bo_ca_nhan',
      scope_unit_id: updatedScope,
      scope_unit_name: updatedScope ? units.find((un) => un.id === updatedScope)?.name || 'Đơn vị' : 'Toàn trường',
    });
    setIsEditing(false);

    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'UPDATE',
      target_type: 'ACCOUNT',
      target_id: selectedUser.id,
      result: 'SUCCESS',
      description: `Cập nhật phân quyền cho ${selectedUser.full_name} (${selectedUser.email}): [${updatedRoles.join(', ')}]`,
      ip_address: '10.0.0.1',
    });

    setActionNotice(`Đã cập nhật vai trò phân quyền cho ${selectedUser.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      alert('Vui lòng điền Họ tên và Email tài khoản.');
      return;
    }

    const emailTrimmed = newEmail.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === emailTrimmed);
    if (existing) {
      alert(`Email ${emailTrimmed} đã tồn tại trong danh sách tài khoản!`);
      return;
    }

    const assignedRoles: UserRole[] = newRoles.length > 0 ? newRoles : ['can_bo_ca_nhan'];
    const chosenScopeId = newScopeUnit === 'ALL' ? null : newScopeUnit;
    const chosenScopeName = chosenScopeId ? units.find((u) => u.id === chosenScopeId)?.name || 'Đơn vị' : 'Toàn trường';

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      profile_id: `prof_${Date.now()}`,
      username: (newUsername.trim() || emailTrimmed.split('@')[0]).toLowerCase(),
      full_name: newFullName.trim(),
      email: emailTrimmed,
      student_id: newStudentId.trim() || (newUsername.trim() || 'CB-HCMUTE'),
      avatar_code: newFullName.trim().slice(0, 2).toUpperCase(),
      roles: assignedRoles,
      current_role: assignedRoles[0],
      scope_unit_id: chosenScopeId,
      scope_unit_name: chosenScopeName,
      portal_mode: assignedRoles.includes('admin') ? 'admin' : 'user',
      is_active: true,
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewUsername('');
    setNewStudentId('');
    setNewRoles(['can_bo_ca_nhan']);
    setNewScopeUnit('ALL');

    addAuditLog({
      actor_name: currentUser.full_name || 'Lê Xuân Thân',
      actor_code: currentUser.student_id || 'CB-HCMUTE',
      action_type: 'CREATE',
      target_type: 'ACCOUNT',
      target_id: newUser.id,
      result: 'SUCCESS',
      description: `Tạo tài khoản mới: ${newUser.email} (${newUser.full_name}) với các quyền [${assignedRoles.join(', ')}]`,
      ip_address: '10.0.0.1',
    });

    setActionNotice(`Đã tạo tài khoản thành công cho ${newUser.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const getRoleBadge = (role: string) => {
    const norm = normalizeRole(role);
    const found = ROLE_OPTIONS.find((r) => r.id === norm);
    if (!found) {
      return (
        <span key={role} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Quản trị hệ thống</span>
            <span>&gt;</span>
            <span className="text-foreground font-semibold">Tài khoản và phân quyền</span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Quản lý Tài khoản & Phân quyền Admin</span>
            <Shield className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phân quyền quản trị viên, người duyệt, quản lý đơn vị và tài khoản người dùng Google.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm tài khoản / Phân quyền Admin</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
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
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị hệ thống (Admin)</option>
              <option value="lanh_dao">Lãnh đạo</option>
              <option value="nguoi_duyet">Người duyệt nghiệp vụ</option>
              <option value="quan_ly_don_vi">Quản lý đơn vị</option>
              <option value="can_bo_ca_nhan">Cán bộ cá nhân</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-semibold">
          Tổng số: <span className="text-foreground font-bold">{filteredUsers.length}</span> tài khoản
        </div>
      </div>

      {/* Main Layout: Accounts Table + Detail / Permission Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table 8 cols or full width if none selected */}
        <div className={`${selectedUser ? 'lg:col-span-7' : 'lg:col-span-12'} bg-card rounded-2xl border border-border shadow-xs overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[11px] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Họ và tên / Email</th>
                  <th className="px-4 py-3">Tài khoản / MSSV</th>
                  <th className="px-4 py-3">Vai trò phân quyền</th>
                  <th className="px-4 py-3">Phạm vi đơn vị</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const scopeUnit = units.find((unit) => unit.id === u.scope_unit_id);
                  const isSelected = selectedUser?.id === u.id;
                  const isSuper = isSuperAdminAccount(u);

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
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
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] text-foreground font-semibold">
                          {u.username || u.email?.split('@')[0]}
                        </span>
                        {u.student_id && (
                          <div className="text-[10px] text-muted-foreground">MSSV: {u.student_id}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(u.roles || []).map((r) => getRoleBadge(r))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {scopeUnit ? scopeUnit.name : 'Toàn trường'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[11px] font-bold border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[11px] font-bold border border-destructive/20">
                            <Lock className="w-3 h-3" />
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            disabled={isSuper}
                            onClick={() => handleToggleLock(u)}
                            title={isSuper ? 'Không thể khóa Super Admin' : u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
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
                <span>Chi tiết & Phân quyền tài khoản</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsEditing(false);
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
                  {isSuperAdminAccount(selectedUser) && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 text-[10px] font-bold border border-rose-500/20 shrink-0">
                      Super Admin
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{selectedUser.email}</div>
                <div className="text-[10px] text-primary font-semibold">
                  MSSV: {selectedUser.student_id || 'CB-HCMUTE'}
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-muted/40 rounded-xl p-3 border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className={`font-bold ${selectedUser.is_active ? 'text-emerald-600' : 'text-destructive'}`}>
                  {selectedUser.is_active ? 'Đang hoạt động' : 'Tài khoản đã bị khóa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phạm vi dữ liệu:</span>
                <span className="font-semibold text-foreground">
                  {units.find((u) => u.id === selectedUser.scope_unit_id)?.name || 'Toàn trường'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cổng mặc định:</span>
                <span className="font-semibold text-foreground">
                  {selectedUser.portal_mode === 'admin' ? 'Trang quản trị (Admin)' : 'Trang cán bộ (User)'}
                </span>
              </div>
            </div>

            {/* Roles Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">Vai trò & Quyền hạn phân bổ</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> Chỉnh sửa quyền
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 p-3.5 border border-primary/30 rounded-xl bg-primary/5">
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((r) => {
                      const isChecked = (selectedUser.roles || [])
                        .map((role) => normalizeRole(role))
                        .includes(r.id);
                      return (
                        <label key={r.id} className="flex items-start gap-2.5 text-xs cursor-pointer p-1.5 rounded-lg hover:bg-background/80 transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const currentNormalized = (selectedUser.roles || []).map((x) => normalizeRole(x));
                              const newRoles = e.target.checked
                                ? Array.from(new Set([...currentNormalized, r.id]))
                                : currentNormalized.filter((role) => role !== r.id);
                              setSelectedUser({ ...selectedUser, roles: newRoles });
                            }}
                            className="mt-0.5 rounded text-primary"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-foreground">{r.label}</div>
                            <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Phạm vi đơn vị phụ trách
                    </label>
                    <select
                      value={selectedUser.scope_unit_id || 'ALL'}
                      onChange={(e) => {
                        const val = e.target.value === 'ALL' ? null : e.target.value;
                        setSelectedUser({ ...selectedUser, scope_unit_id: val });
                      }}
                      className="w-full text-xs border border-border rounded-xl p-2 bg-background font-medium"
                    >
                      <option value="ALL">Toàn trường (Tất cả đơn vị Đoàn - Hội)</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
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
                      onClick={() =>
                        handleSaveRoles(
                          (selectedUser.roles || []).map((r) => normalizeRole(r)),
                          selectedUser.scope_unit_id || null
                        )
                      }
                      className="px-3.5 py-1.5 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 shadow-sm cursor-pointer"
                    >
                      Lưu phân quyền
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(selectedUser.roles || []).map((r) => getRoleBadge(r))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={isSuperAdminAccount(selectedUser)}
                onClick={() => handleToggleLock(selectedUser)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSuperAdminAccount(selectedUser)
                    ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                    : selectedUser.is_active
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
                    <span>Mở khóa tài khoản</span>
                  </>
                )}
              </button>

              {!isSuperAdminAccount(selectedUser) && (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="py-2 px-3 text-xs font-bold rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-black text-foreground text-base">Thêm tài khoản & Phân quyền Admin</h3>
                <p className="text-xs text-muted-foreground">
                  Cấp quyền Quản trị viên hoặc quyền quản lý cho cán bộ theo email Google.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Họ và tên cán bộ <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Thầy Lê Xuân Thân, Nguyễn Văn A..."
                  className="w-full text-xs border border-border rounded-xl px-3.5 py-2.5 bg-background focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Email Google Workspace (@hcmute.edu.vn hoặc Gmail) <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="canbo@hcmute.edu.vn"
                  className="w-full text-xs border border-border rounded-xl px-3.5 py-2.5 bg-background focus:outline-hidden focus:border-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Khi người dùng này đăng nhập bằng Google, hệ thống sẽ tự động cấp các quyền hạn được chọn bên dưới.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ví dụ: thanlx, nva..."
                    className="w-full text-xs border border-border rounded-xl px-3.5 py-2.5 bg-background focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Mã số sinh viên / Mã CB
                  </label>
                  <input
                    type="text"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="23110099 hoặc CB-01"
                    className="w-full text-xs border border-border rounded-xl px-3.5 py-2.5 bg-background focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* Roles selection checkboxes */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Phân vai trò truy cập <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2 p-3 rounded-2xl bg-muted/40 border border-border">
                  {ROLE_OPTIONS.map((r) => {
                    const isChecked = newRoles.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-start gap-2.5 text-xs cursor-pointer p-1 rounded-lg hover:bg-background/80 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRoles([...newRoles, r.id]);
                            } else {
                              setNewRoles(newRoles.filter((item) => item !== r.id));
                            }
                          }}
                          className="mt-0.5 rounded text-primary"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{r.label}</span>
                            {r.id === 'admin' && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 text-[10px] font-bold">
                                Toàn quyền
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Phạm vi đơn vị phụ trách
                </label>
                <select
                  value={newScopeUnit}
                  onChange={(e) => setNewScopeUnit(e.target.value)}
                  className="w-full text-xs border border-border rounded-xl px-3.5 py-2.5 bg-background font-medium focus:outline-hidden focus:border-primary"
                >
                  <option value="ALL">Toàn trường (Tất cả đơn vị Đoàn - Hội)</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
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
