'use client';

// ==============================================================================
// THÔNG BÁO NGƯỜI DÙNG (NOTIFICATIONS VIEW - SCREEN 9 MOCKUP)
// Hỗ trợ xem danh sách, lọc theo nhóm, xem chi tiết và mở trực tiếp đối tượng liên quan
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  Award,
  ExternalLink,
  Clock,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { NotificationItem } from '@/types';

export default function NotificationsView() {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setUserTab,
    setSelectedRequestId,
    setSelectedDecisionId,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'ho_so' | 'danh_gia' | 'quyet_dinh'>('all');
  const [selectedNotifId, setSelectedNotifId] = useState<string>(notifications[0]?.id || 'notif_1');

  // Filter notifications
  const filteredNotifs = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.is_read;
    if (activeFilter === 'ho_so') return item.category === 'ho_so';
    if (activeFilter === 'danh_gia') return item.category === 'danh_gia';
    if (activeFilter === 'quyet_dinh') return item.category === 'quyet_dinh';
    return true;
  });

  const activeNotif = notifications.find((n) => n.id === selectedNotifId) || notifications[0];

  const handleSelectNotif = (notif: NotificationItem) => {
    setSelectedNotifId(notif.id);
    if (!notif.is_read) {
      markNotificationAsRead(notif.id);
    }
  };

  const handleOpenLinkedItem = (notif: NotificationItem) => {
    if (notif.link_type === 'danh_gia') {
      setUserTab('danh_gia');
    } else if (notif.link_type === 'ho_so') {
      setUserTab('ho_so');
      if (notif.link_id) setSelectedRequestId(notif.link_id);
    } else if (notif.link_type === 'quyet_dinh') {
      setUserTab('quyet_dinh');
      if (notif.link_id) setSelectedDecisionId(notif.link_id);
    } else {
      setUserTab('trang_chu');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Thông báo</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xem và quản lý các thông báo liên quan đến công tác Đoàn – Hội.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
        >
          <CheckCheck className="h-4 w-4 text-primary" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* 2. FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'unread', label: 'Chưa đọc' },
          { id: 'ho_so', label: 'Hồ sơ' },
          { id: 'danh_gia', label: 'Đánh giá' },
          { id: 'quyet_dinh', label: 'Quyết định' },
        ].map((pill) => {
          const isActive = activeFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN 2-COLUMN SECTION (LIST 5 COLS + DETAIL PANE 7 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIST OF NOTIFICATIONS */}
        <div className="lg:col-span-5 space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
              Không có thông báo nào trong mục này.
            </div>
          ) : (
            filteredNotifs.map((item) => {
              const isSelected = activeNotif?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectNotif(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.category === 'danh_gia'
                          ? 'bg-purple-500/10 text-purple-600'
                          : item.category === 'ho_so'
                          ? 'bg-amber-500/10 text-amber-600'
                          : item.category === 'quyet_dinh'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.category === 'danh_gia' ? (
                        <Award className="h-5 w-5" />
                      ) : item.category === 'ho_so' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          {!item.is_read && (
                            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                          )}
                          <h3 className="text-xs font-bold text-foreground truncate">{item.title}</h3>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{item.created_at}</span>
                      </div>

                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.sender_name}</p>
                      <p className="text-[11px] text-foreground font-medium mt-1 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 px-1">
            <span>Hiển thị {filteredNotifs.length} thông báo</span>
            <span className="italic">Dữ liệu minh họa</span>
          </div>
        </div>

        {/* RIGHT COLUMN: NOTIFICATION DETAIL PANE (MATCHING SCREEN 9) */}
        <div className="lg:col-span-7">
          {activeNotif ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6 sticky top-20">
              {/* Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-border">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    activeNotif.category === 'danh_gia'
                      ? 'bg-purple-500/10 text-purple-600'
                      : activeNotif.category === 'ho_so'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">{activeNotif.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeNotif.sender_name} • {activeNotif.created_at}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-4 text-xs leading-relaxed text-foreground">
                <p>
                  Xin chào <strong>{currentUser.full_name}</strong>,
                </p>
                <p>{activeNotif.content}</p>

                {/* Metadata Card (Matching Screen 9 mockup) */}
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Chức vụ liên quan:</span>
                    <strong className="text-foreground">Ủy viên BCH Đoàn cơ sở</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Thời gian đánh giá:</span>
                    <span className="text-foreground font-semibold">Tháng 10/2026</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-medium">Hạn hoàn thành:</span>
                    <strong className="text-rose-600 font-bold">Trước ngày 25/10/2026</strong>
                  </div>
                </div>

                <p className="text-muted-foreground">
                  Bạn vui lòng đăng nhập hệ thống, kiểm tra các nội dung đánh giá và hoàn thành phiếu tự đánh giá.
                  Sau thời hạn trên, hệ thống sẽ khóa phiếu.
                </p>
                <p className="font-semibold">Trân trọng.</p>
              </div>

              {/* Action Button */}
              {activeNotif.link_label && (
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => handleOpenLinkedItem(activeNotif)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{activeNotif.link_label}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
              Chọn thông báo bên trái để xem nội dung chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
