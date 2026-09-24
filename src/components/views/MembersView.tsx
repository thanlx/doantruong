'use client';

// ==============================================================================
// MEMBERS VIEW: DANH SÁCH THÀNH VIÊN BTV & CƠ SỞ (KHỚP 100% MÀN HÌNH 4 MOBILE)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import AvatarWithFallback from '@/components/AvatarWithFallback';

export default function MembersView() {
  const { members, tasks, currentMember, setCurrentMemberId, openAvatarModal } = useApp();

  const [activeTab, setActiveTab] = useState<'btv' | 'don_vi'>('btv');
  const [searchQuery, setSearchQuery] = useState('');

  // 12 Đơn vị Đoàn cơ sở trực thuộc Đoàn trường HCMUTE
  const donViCoSo = [
    { name: 'Đoàn Khoa Cơ khí Chế tạo máy', secretary: 'Đ/c Nguyễn Văn An', count: 1200 },
    { name: 'Đoàn Khoa Điện - Điện tử', secretary: 'Đ/c Trần Thị Bích', count: 1450 },
    { name: 'Đoàn Khoa Công nghệ Thông tin', secretary: 'Đ/c Lê Hoàng Cường', count: 1800 },
    { name: 'Đoàn Khoa Cơ khí Động lực', secretary: 'Đ/c Phạm Văn Dũng', count: 950 },
    { name: 'Đoàn Khoa In & Truyền thông', secretary: 'Đ/c Đặng Ngọc Hải', count: 650 },
    { name: 'Đoàn Khoa Xây dựng', secretary: 'Đ/c Vũ Minh Hùng', count: 800 },
    { name: 'Đoàn Khoa Kinh tế', secretary: 'Đ/c Hoàng Thị Kim', count: 1600 },
    { name: 'Đoàn Khoa Công nghệ Hóa học & Thực phẩm', secretary: 'Đ/c Bùi Quốc Long', count: 750 },
    { name: 'Đoàn Khoa Ngoại ngữ', secretary: 'Đ/c Phan Thùy Linh', count: 700 },
    { name: 'Đoàn Khoa Thời trang & Du lịch', secretary: 'Đ/c Đỗ Mai Phương', count: 600 },
    { name: 'Đoàn Khoa Khoa học Ứng dụng', secretary: 'Đ/c Ngô Thành Tài', count: 500 },
    { name: 'Đoàn Khối Cán bộ - Giảng viên trẻ', secretary: 'Đ/c ThS. Nguyễn Đức Tiến', count: 320 },
  ];

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.mang_phu_trach?.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'bi_thu':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            Bí thư Đoàn trường
          </span>
        );
      case 'pho_bi_thu':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF2FF] text-[#0B5CFF] border border-[#BFDBFE]">
            Phó Bí thư
          </span>
        );
      case 'chanh_van_phong':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Chánh văn phòng
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
            Ủy viên BTV
          </span>
        );
    }
  };

  const getDepartmentLabel = (code?: string) => {
    switch (code) {
      case 'to_chuc': return 'Ban Tổ chức - Kiểm tra';
      case 'tuyen_giao': return 'Ban Tuyên giáo - Truyền thông';
      case 'phong_trao': return 'Ban Phong trào - Tình nguyện';
      case 'kiem_tra': return 'Ban Kiểm tra';
      case 'van_phong': return 'Văn phòng Đoàn trường';
      default: return 'BTV Đoàn trường';
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            Tổ chức & Thành viên Đoàn trường
          </h2>
          <p className="text-xs text-muted-foreground">
            Danh sách Ban Thường vụ Khóa mới và các cơ sở Đoàn trực thuộc HCMUTE
          </p>
        </div>
      </div>

      {/* Tabs chuyển đổi: BTV Đoàn trường / Các đơn vị (Khớp Màn hình 4 Mobile) */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl w-fit border border-border">
        <button
          onClick={() => setActiveTab('btv')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'btv' ? 'bg-card text-primary shadow-xs border border-border/50' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          BTV Đoàn trường (9 Đ/c)
        </button>
        <button
          onClick={() => setActiveTab('don_vi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'don_vi' ? 'bg-card text-primary shadow-xs border border-border/50' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Các đơn vị cơ sở (12 Khoa)
        </button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm thành viên, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-input text-foreground outline-none focus:ring-2 focus:ring-ring shadow-xs"
        />
      </div>

      {activeTab === 'btv' ? (
        /* DANH SÁCH 9 THÀNH VIÊN BTV */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredMembers.map((m) => {
            const memberTasks = tasks.filter((t) => t.owner_id === m.id && t.status !== 'hoan_thanh');
            const isMe = m.id === currentMember.id;

            return (
              <div
                key={m.id}
                className={`bg-card rounded-3xl p-5 border shadow-xs hover:shadow-md transition-all space-y-3 relative ${
                  isMe ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                {isMe && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-2xs">
                    Đang đăng nhập
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => openAvatarModal(m)}
                    title="Bấm để thay đổi ảnh đại diện"
                  >
                    <AvatarWithFallback
                      src={m.avatar_url}
                      name={m.full_name}
                      className="w-14 h-14 rounded-2xl ring-2 ring-border group-hover:ring-primary shrink-0 text-base transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate leading-snug">{m.full_name}</h4>
                    <div className="mt-1">{getRoleBadge(m.role)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{getDepartmentLabel(m.mang_phu_trach)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{m.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                    <span className="font-mono text-[11px]">{m.phone || '090xxxxxxx'}</span>
                  </div>
                </div>

                {/* Trạng thái bận nếu có */}
                {m.busy_from && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 space-y-0.5">
                    <div className="font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Lịch bận: {m.busy_from} đến {m.busy_to}</span>
                    </div>
                    <p className="italic text-muted-foreground">{m.busy_reason}</p>
                  </div>
                )}

                {/* Chân thẻ: Số việc & Nút chuyển quyền kiểm thử */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground text-[11px]">
                    Đang phụ trách: <b className="text-primary">{memberTasks.length} việc</b>
                  </span>

                  {!isMe && (
                    <button
                      onClick={() => setCurrentMemberId(m.id)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Đăng nhập vị trí này &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DANH SÁCH 12 CƠ SỞ ĐOÀN KHOA */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {donViCoSo.map((dv, idx) => (
            <div
              key={idx}
              className="bg-card rounded-3xl p-5 border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground leading-snug">{dv.name}</h4>
                  <span className="text-[10px] text-muted-foreground font-mono">Bí thư: {dv.secretary}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Quy mô đoàn viên:</span>
                <span className="font-bold text-primary font-mono">{dv.count} sinh viên</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
