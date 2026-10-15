'use client';

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
  Key, 
  AlertTriangle,
  Building,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { AppUser } from '@/types';

export const AdminAccountsView: React.FC = () => {
  const { users, setUsers, units, profiles, addAuditLog } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newRoles, setNewRoles] = useState<string[]>(['OFFICER']);
  const [newScopeUnit, setNewScopeUnit] = useState('UNIT-03');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.username ? u.username.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
                          (u.student_id && u.student_id.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter as any);
    return matchesSearch && matchesRole;
  });

  const handleToggleLock = (user: AppUser) => {
    const updatedUsers = users.map(u => {
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
      actor_name: 'Nguyễn Minh Anh',
      actor_code: '23110001',
      action_type: 'UPDATE',
      target_type: 'ACCOUNT',
      target_id: user.id,
      result: 'SUCCESS',
      description: `${user.is_active ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.username} (${user.full_name})`,
      ip_address: '10.0.0.1'
    });

    setActionNotice(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} tài khoản ${user.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSaveRoles = (updatedRoles: string[], updatedScope: string | null) => {
    if (!selectedUser) return;
    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, roles: updatedRoles as any, scope_unit_id: updatedScope };
      }
      return u;
    });
    setUsers(updatedUsers);
    setSelectedUser({ ...selectedUser, roles: updatedRoles as any, scope_unit_id: updatedScope });
    setIsEditing(false);

    addAuditLog({
      actor_name: 'Nguyễn Minh Anh',
      actor_code: '23110001',
      action_type: 'UPDATE',
      target_type: 'ACCOUNT',
      target_id: selectedUser.id,
      result: 'SUCCESS',
      description: `Cập nhật phân quyền và phạm vi cho ${selectedUser.username}`,
      ip_address: '10.0.0.1'
    });

    setActionNotice(`Đã cập nhật vai trò cho ${selectedUser.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFullName) {
      alert('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }

    const newUser: AppUser = {
      id: `USER-${Date.now()}`,
      profile_id: `prof_${Date.now()}`,
      username: newUsername.trim(),
      full_name: newFullName.trim(),
      email: newEmail.trim() || `${newUsername}@example.com`,
      student_id: newStudentId.trim() || newUsername.trim(),
      avatar_code: newFullName.trim().slice(0, 2).toUpperCase(),
      roles: newRoles as any,
      current_role: (newRoles[0] as any) || 'can_bo_ca_nhan',
      scope_unit_id: newScopeUnit === 'ALL' ? null : newScopeUnit,
      scope_unit_name: newScopeUnit === 'ALL' ? 'Toàn trường' : (units.find(u => u.id === newScopeUnit)?.name || 'Đơn vị'),
      portal_mode: 'admin',
      is_active: true
    };

    setUsers([...users, newUser]);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    setNewStudentId('');

    addAuditLog({
      actor_name: 'Nguyễn Minh Anh',
      actor_code: '23110001',
      action_type: 'CREATE',
      target_type: 'ACCOUNT',
      target_id: newUser.id,
      result: 'SUCCESS',
      description: `Tạo tài khoản mới: ${newUser.username} (${newUser.full_name})`,
      ip_address: '10.0.0.1'
    });

    setActionNotice(`Đã tạo tài khoản thành công cho ${newUser.full_name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span key={role} className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">Quản trị viên</span>;
      case 'LEADER':
        return <span key={role} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">Lãnh đạo</span>;
      case 'APPROVER':
        return <span key={role} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#005BAA] font-medium">Người duyệt</span>;
      case 'UNIT_MANAGER':
        return <span key={role} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Quản lý đơn vị</span>;
      default:
        return <span key={role} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">Cán bộ cá nhân</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Tài khoản và phân quyền</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tài khoản và phân quyền</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản người dùng, phân vai trò và phạm vi dữ liệu áp dụng.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#005BAA] hover:bg-[#004785] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            Tạo tài khoản mới
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên, MSSV, tên đăng nhập..."
              className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ADMIN">Quản trị hệ thống</option>
              <option value="APPROVER">Người duyệt</option>
              <option value="UNIT_MANAGER">Quản lý đơn vị</option>
              <option value="LEADER">Lãnh đạo</option>
              <option value="OFFICER">Cán bộ cá nhân</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Hiển thị {filteredUsers.length} tài khoản
        </div>
      </div>

      {/* Main Layout: Accounts Table + Detail / Permission Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table 8 cols or full width if none selected */}
        <div className={`${selectedUser ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Tài khoản / MSSV</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Phạm vi đơn vị</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const scopeUnit = units.find(unit => unit.id === u.scope_unit_id);
                  const isSelected = selectedUser?.id === u.id;

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{u.full_name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-700 font-medium">
                          {u.username}
                        </span>
                        {u.student_id && (
                          <div className="text-[11px] text-slate-400">MSSV: {u.student_id}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map(r => getRoleBadge(r))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {scopeUnit ? scopeUnit.name : 'Toàn trường'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium">
                            <Lock className="w-3 h-3" />
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleLock(u)}
                          title={u.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          className={`p-1.5 rounded border transition-colors ${
                            u.is_active 
                              ? 'text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50' 
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {u.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
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
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Chi tiết tài khoản & Phân quyền</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#005BAA] font-bold flex items-center justify-center text-lg">
                {selectedUser.full_name.slice(-2)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{selectedUser.full_name}</h4>
                <div className="text-xs text-slate-500">Tài khoản: {selectedUser.username} | MSSV: {selectedUser.student_id || 'N/A'}</div>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <span className={`font-semibold ${selectedUser.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                  {selectedUser.is_active ? 'Đang hoạt động' : 'Tài khoản đã bị khóa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phạm vi dữ liệu:</span>
                <span className="font-medium text-slate-800">
                  {units.find(u => u.id === selectedUser.scope_unit_id)?.name || 'Toàn trường'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-700">{selectedUser.email}</span>
              </div>
            </div>

            {/* Roles Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Vai trò phân bổ</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-[#005BAA] font-medium hover:underline flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Chỉnh sửa vai trò
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 p-3 border border-blue-200 rounded-lg bg-blue-50/20">
                  <div className="space-y-2">
                    {[
                      { id: 'OFFICER', label: 'Cán bộ cá nhân', desc: 'Xem hồ sơ, gửi cập nhật, tự đánh giá' },
                      { id: 'UNIT_MANAGER', label: 'Quản lý đơn vị', desc: 'Nhập hồ sơ, đề xuất quyết định, đánh giá đơn vị' },
                      { id: 'APPROVER', label: 'Người duyệt nghiệp vụ', desc: 'Duyệt cập nhật hồ sơ, quyết định nhân sự' },
                      { id: 'LEADER', label: 'Lãnh đạo', desc: 'Xem tổng hợp, chỉ đọc và xuất báo cáo' },
                      { id: 'ADMIN', label: 'Quản trị hệ thống', desc: 'Quản lý tài khoản, danh mục, cấu hình hệ thống' }
                    ].map(r => {
                      const checked = selectedUser.roles.includes(r.id as any);
                      return (
                        <label key={r.id} className="flex items-start gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const newR = e.target.checked
                                ? [...selectedUser.roles, r.id as any]
                                : selectedUser.roles.filter(role => role !== r.id);
                              setSelectedUser({ ...selectedUser, roles: newR });
                            }}
                            className="mt-0.5 rounded text-[#005BAA]"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{r.label}</div>
                            <div className="text-[11px] text-slate-500">{r.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Phạm vi đơn vị phụ trách
                    </label>
                    <select
                      value={selectedUser.scope_unit_id || 'ALL'}
                      onChange={(e) => {
                        const val = e.target.value === 'ALL' ? null : e.target.value;
                        setSelectedUser({ ...selectedUser, scope_unit_id: val });
                      }}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                    >
                      <option value="ALL">Toàn trường</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveRoles(selectedUser.roles, selectedUser.scope_unit_id || null)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#005BAA] rounded-lg hover:bg-[#004785]"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.roles.map(r => getRoleBadge(r))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleToggleLock(selectedUser)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedUser.is_active
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {selectedUser.is_active ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Khóa tài khoản này
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    Mở khóa tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Tạo tài khoản người dùng mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Họ và tên cán bộ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Văn An"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="hvanan"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mã số sinh viên (nếu có)
                  </label>
                  <input
                    type="text"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="23110099"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="hvanan@example.com"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Phạm vi đơn vị
                </label>
                <select
                  value={newScopeUnit}
                  onChange={(e) => setNewScopeUnit(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                >
                  <option value="ALL">Toàn trường</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#005BAA] rounded-lg hover:bg-[#004785]"
                >
                  Tạo tài khoản
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
