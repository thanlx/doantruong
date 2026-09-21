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
} from 'lucide-react';
import { Member, MemberRole, Campaign } from '@/types';

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
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'members' | 'campaigns' | 'tasks' | 'cleanup'>('members');

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

  return (
    <div className="space-y-6 pb-16">
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
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
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

      {/* Tab Điều hướng Admin */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-thin text-xs">
        <button
          onClick={() => setActiveAdminTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'members'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Thành viên & Phân quyền ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'campaigns'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Mục lục Mảng việc & Dự án ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'tasks'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Quản lý Tất cả Công việc ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('cleanup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeAdminTab === 'cleanup'
              ? 'bg-destructive text-destructive-foreground shadow-xs'
              : 'text-destructive hover:bg-destructive/10'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Dọn dẹp & Xóa Danh sách Ảo {dummyTasksCount > 0 && `(${dummyTasksCount})`}</span>
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

          {/* Bảng Danh sách Thành viên */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Đồng chí</th>
                    <th className="py-3 px-3">Vai trò chức danh</th>
                    <th className="py-3 px-3">Mảng phụ trách</th>
                    <th className="py-3 px-3">Liên hệ</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={m.full_name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0"
                          />
                          <div>
                            <div className="font-bold text-foreground">{m.full_name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{m.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground capitalize">
                          {m.mang_phu_trach ? m.mang_phu_trach.replace('_', ' ') : 'Chung'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3" />
                          <span>{m.phone || 'Chưa cập nhật'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {m.busy_from && m.busy_to ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            Bận ({m.busy_reason || 'Công tác'})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Sẵn sàng nhận việc
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => startEditMember(m)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ma trận phân quyền 4 vai trò */}
          <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-foreground">Ma trận Phân quyền 4 Vai trò Ban Thường vụ</h4>
                <p className="text-[11px] text-muted-foreground">Quy định thẩm quyền duyệt việc, đôn đốc và giao việc theo điều lệ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-2">
                <div className="font-bold text-destructive flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  <span>Bí thư Đoàn trường</span>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Toàn quyền chỉ đạo và điều hành</li>
                  <li>Duyệt việc chuyên môn & chủ trương</li>
                  <li>Duyệt việc hành chính & văn bản</li>
                  <li>Đôn đốc công việc toàn hệ thống</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span>Phó Bí thư Đoàn trường</span>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Chỉ đạo mảng công tác được phân công</li>
                  <li>Duyệt việc chuyên môn & hành chính</li>
                  <li>Giao việc và phân bổ nhiệm vụ</li>
                  <li>Đôn đốc công việc thuộc mảng</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Chánh Văn phòng</span>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Quản trị Sổ văn bản đến 8 cột</li>
                  <li><b>Duyệt việc hành chính</b> (hậu cần, báo cáo)</li>
                  <li>Điều phối tiến độ và gửi đôn đốc</li>
                  <li>Không duyệt việc chuyên môn/chủ trương</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Ủy viên Ban Thường vụ</span>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Nhận việc và cập nhật tiến độ</li>
                  <li>Nộp duyệt hoàn thành nhiệm vụ</li>
                  <li>Tham gia kênh Chat BTV & Thảo luận</li>
                  <li>Tự tạo việc cá nhân để quản lý</li>
                </ul>
              </div>
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
            <div className="overflow-x-auto">
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
