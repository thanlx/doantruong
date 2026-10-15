'use client';

// ==============================================================================
// HỒ SƠ CỦA TÔI (MY PROFILE VIEW - SCREEN 3 & 18 MOCKUPS)
// Hỗ trợ xem 5 nhóm thông tin, gửi đề xuất cập nhật (diff view), lưu nháp, gửi duyệt
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CheckCircle2,
  Lock,
  Edit3,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  Send,
  Eye,
  Save,
  FileText,
  User,
  GraduationCap,
  Flag,
  Briefcase,
  History,
} from 'lucide-react';

export default function MyProfileView() {
  const {
    currentUser,
    profiles,
    updateRequests,
    submitProfileUpdateRequest,
  } = useApp();

  const profile = profiles.find((p) => p.id === currentUser.profile_id) || profiles[0];

  const [activeTab, setActiveTab] = useState<'ca_nhan' | 'chuyen_mon' | 'doan_dang' | 'chuc_vu' | 'lich_su'>('ca_nhan');
  const [isEditing, setIsEditing] = useState(false);

  // Form states for proposal
  const [residence, setResidence] = useState(profile.current_residence || 'TP. Hồ Chí Minh');
  const [phone, setPhone] = useState(profile.phone || '0900000000');
  const [email, setEmail] = useState(profile.email || 'minhanh@example.com');
  const [hometown, setHometown] = useState(profile.hometown || 'TP. Hồ Chí Minh');
  const [proposalReason, setProposalReason] = useState(
    'Đề nghị cập nhật thông tin nơi ở hiện nay theo địa chỉ mới.'
  );

  // Submission feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Active user's request tracking
  const userRequests = updateRequests.filter((r) => r.profile_id === profile.id);
  const activeRequest = userRequests[0];

  const handleSubmitProposal = () => {
    const res = submitProfileUpdateRequest(
      profile.id,
      {
        current_residence: residence,
        phone,
        email,
        hometown,
      },
      proposalReason
    );

    if (res.success) {
      setFeedbackMessage(res.message);
      setIsEditing(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & PROPOSAL ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Hồ sơ của tôi</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý thông tin định danh, chuyên môn, Đoàn - Đảng và quá trình công tác
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>{isEditing ? 'Đóng chế độ đề xuất' : 'Đề xuất cập nhật'}</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 2. PROFILE HERO CARD */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-black shadow-inner border border-primary/20">
            {currentUser.avatar_code}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-foreground">{profile.full_name}</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Đã xác thực
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              MSSV: <strong className="text-foreground">{profile.student_id}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Sinh viên ngành {profile.major || 'Công nghệ thông tin'}
            </p>
            <p className="text-[11px] text-muted-foreground/80 italic">
              Đoàn trường – Hội Sinh viên trường (dữ liệu minh họa)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 text-right">
          <span className="text-[11px] text-muted-foreground">
            Mã hồ sơ hệ thống:{' '}
            <strong className="text-foreground font-mono">{profile.profile_code}</strong>
          </span>
          <span className="text-[11px] text-muted-foreground">
            Phiên bản hiện hành: <strong>v{profile.version}.0</strong>
          </span>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px">
        {[
          { id: 'ca_nhan', label: 'Cá nhân', icon: User },
          { id: 'chuyen_mon', label: 'Chuyên môn', icon: GraduationCap },
          { id: 'doan_dang', label: 'Đoàn và Đảng', icon: Flag },
          { id: 'chuc_vu', label: 'Chức vụ', icon: Briefcase },
          { id: 'lich_su', label: 'Lịch sử cập nhật', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. MAIN CONTENT GRID (FORM + RIGHT CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT ~8 COLS: FORM VIEW & PROPOSAL DIFF */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'ca_nhan' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ tên */}
                <div>
                  <label className="text-xs font-bold text-foreground">Họ và tên *</label>
                  <input
                    type="text"
                    disabled
                    value={profile.full_name}
                    className="mt-1.5 w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs font-semibold text-foreground cursor-not-allowed"
                  />
                </div>

                {/* MSSV (Locked) */}
                <div>
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Mã số sinh viên *</span>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      disabled
                      value={profile.student_id || ''}
                      className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2 text-xs font-semibold text-foreground pr-8 cursor-not-allowed"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="text-xs font-bold text-foreground">Ngày sinh *</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      disabled={!isEditing}
                      defaultValue={profile.date_of_birth}
                      className={`w-full rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground ${
                        isEditing ? 'bg-background' : 'bg-muted/40 cursor-not-allowed'
                      }`}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Quê quán */}
                <div>
                  <label className="text-xs font-bold text-foreground">Quê quán *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground ${
                      isEditing ? 'bg-background focus:border-primary' : 'bg-muted/40 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Nơi ở hiện nay */}
                <div>
                  <label className="text-xs font-bold text-foreground">Nơi ở hiện nay *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground ${
                      isEditing
                        ? 'bg-background border-primary ring-1 ring-primary'
                        : 'bg-muted/40 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-foreground">Email *</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground ${
                      isEditing ? 'bg-background focus:border-primary' : 'bg-muted/40 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* Điện thoại */}
                <div>
                  <label className="text-xs font-bold text-foreground">Điện thoại *</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground ${
                      isEditing ? 'bg-background focus:border-primary' : 'bg-muted/40 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* NỘI DUNG ĐỀ XUẤT THAY ĐỔI (DIFF COMPARISON - SECTION 2) */}
              {isEditing && (
                <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Nội dung đề xuất thay đổi
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      Chờ duyệt
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-foreground">Nội dung đề xuất *</label>
                      <textarea
                        rows={3}
                        value={proposalReason}
                        onChange={(e) => setProposalReason(e.target.value)}
                        placeholder="Nêu rõ lý do và căn cứ điều chỉnh..."
                        className="mt-1 w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {proposalReason.length}/500 ký tự
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-card space-y-2">
                      <p className="text-[11px] font-bold text-foreground">
                        Thay đổi thông tin nơi ở hiện nay
                      </p>
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex-1 p-2 rounded bg-muted text-muted-foreground text-[11px]">
                          <span className="block font-bold text-foreground">Giá trị hiện tại:</span>
                          {profile.current_residence}
                        </div>
                        <span className="text-muted-foreground">→</span>
                        <div className="flex-1 p-2 rounded bg-primary/10 text-primary text-[11px] font-semibold">
                          <span className="block font-bold text-foreground">Giá trị đề xuất mới:</span>
                          {residence}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS & NOTICE BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-destructive font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Thay đổi chỉ có hiệu lực sau khi được phê duyệt.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Lưu nháp
                  </button>
                  <button
                    onClick={() => alert('Đang mở bản xem trước thay đổi hồ sơ.')}
                    className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Xem trước
                  </button>
                  <button
                    onClick={handleSubmitProposal}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Gửi duyệt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHUYÊN MÔN */}
          {activeTab === 'chuyen_mon' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Trình độ & Chuyên môn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Trình độ chuyên môn</label>
                  <input
                    type="text"
                    disabled
                    value={profile.qualification || 'Đang học Đại học'}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Ngành học</label>
                  <input
                    type="text"
                    disabled
                    value={profile.major || 'Công nghệ thông tin'}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Trình độ lý luận chính trị</label>
                  <input
                    type="text"
                    disabled
                    value={profile.political_theory || 'Sơ cấp'}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ĐOÀN VÀ ĐẢNG */}
          {activeTab === 'doan_dang' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Thông tin Đoàn – Đảng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">Tình trạng đoàn viên</label>
                  <input
                    type="text"
                    disabled
                    value={profile.is_union_member ? 'Đoàn viên TNCS Hồ Chí Minh' : 'Chưa kết nạp'}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Ngày vào Đoàn</label>
                  <input
                    type="text"
                    disabled
                    value={profile.union_join_date || '26/03/2020'}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Tình trạng đảng viên</label>
                  <input
                    type="text"
                    disabled
                    value={profile.is_party_member ? 'Đảng viên' : 'Chưa kết nạp'}
                    className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                  />
                </div>
                {profile.is_party_member && (
                  <div>
                    <label className="text-xs font-bold text-foreground">Ngày vào Đảng</label>
                    <input
                      type="text"
                      disabled
                      value={profile.party_join_date || ''}
                      className="mt-1 w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs text-foreground cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHỨC VỤ */}
          {activeTab === 'chuc_vu' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Danh sách chức vụ đảm nhiệm
              </h3>
              <div className="space-y-3">
                {profile.roles.map((role) => (
                  <div
                    key={role.id}
                    className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{role.position_title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {role.unit_name} • Nhiệm kỳ: {role.term}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Thời gian: Từ {role.start_date} đến {role.end_date || 'Hiện tại'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {role.status === 'active' ? 'Đang hiệu lực' : 'Đã kết thúc'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LỊCH SỬ CẬP NHẬT */}
          {activeTab === 'lich_su' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Lịch sử yêu cầu cập nhật hồ sơ
              </h3>
              <div className="space-y-3">
                {userRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border bg-card space-y-2 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{req.id}</span>
                        <span className="text-xs text-muted-foreground">({req.created_at})</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-700'
                            : req.status === 'returned'
                            ? 'bg-rose-500/10 text-rose-700'
                            : 'bg-amber-500/10 text-amber-700'
                        }`}
                      >
                        {req.status === 'approved'
                          ? 'Đã duyệt'
                          : req.status === 'returned'
                          ? 'Trả lại'
                          : 'Chờ duyệt'}
                      </span>
                    </div>
                    <p className="text-xs text-foreground font-medium">{req.reason}</p>
                    {req.reviewer_comment && (
                      <div className="p-2.5 rounded-lg bg-muted text-[11px] text-muted-foreground">
                        <strong>Ý kiến xử lý ({req.reviewer_name}):</strong> {req.reviewer_comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ~4 COLS: REQUEST TRACKING & CURRENT ROLES */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Theo dõi yêu cầu (Matching Mockup Screen 3) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Theo dõi yêu cầu</h3>
              <button
                onClick={() => setActiveTab('lich_su')}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            {activeRequest ? (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Mã yêu cầu</span>
                    <strong className="font-mono text-foreground">{activeRequest.id}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Ngày gửi</span>
                    <span className="font-semibold text-foreground">{activeRequest.created_at.split(' ')[0]}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block mb-1">Trạng thái</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                      Đã gửi
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Chờ duyệt
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground block">Nội dung</span>
                  <p className="text-xs text-foreground font-medium line-clamp-2 mt-0.5">
                    {activeRequest.reason}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('lich_su')}
                  className="w-full text-right text-xs font-bold text-primary hover:underline flex items-center justify-end gap-1 cursor-pointer pt-1"
                >
                  <span>Xem chi tiết</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                Hiện tại không có yêu cầu nào đang chờ xử lý.
              </p>
            )}
          </div>

          {/* Card: Chức vụ hiện tại (Matching Mockup Screen 3) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Chức vụ hiện tại</h3>
              <span className="text-[10px] text-muted-foreground italic">Dữ liệu minh họa</span>
            </div>

            <div className="space-y-3">
              {profile.roles.map((role) => (
                <div
                  key={role.id}
                  className="p-3.5 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {role.position_title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">{role.unit_name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Từ {role.start_date.substring(5, 7)}/{role.start_date.substring(0, 4)} đến nay
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
