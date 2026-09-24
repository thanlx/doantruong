'use client';

// ==============================================================================
// MAIN APP PAGE: ĐIỀU PHỐI LAYOUT CHÍNH (DESKTOP & PWA MOBILE CHO 9 Đ/C BTV)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import MobileNavigation from '@/components/MobileNavigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import LoginPage from '@/components/LoginPage';

// Các màn hình nghiệp vụ
import DashboardView from '@/components/views/DashboardView';
import TasksView from '@/components/views/TasksView';
import MyTasksView from '@/components/views/MyTasksView';
import CalendarView from '@/components/views/CalendarView';
import CampaignsView from '@/components/views/CampaignsView';
import IncomingDocsView from '@/components/views/IncomingDocsView';
import CoordinatorView from '@/components/views/CoordinatorView';
import ChatView from '@/components/views/ChatView';
import MembersView from '@/components/views/MembersView';
import ReportsView from '@/components/views/ReportsView';
import IosGuideView from '@/components/views/IosGuideView';
import SettingsView from '@/components/views/SettingsView';
import AdminView from '@/components/views/AdminView';
import FeatureShowcase from '@/components/FeatureShowcase';

// Modals
import TaskDetailModal from '@/components/modals/TaskDetailModal';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import CreateIncomingDocModal from '@/components/modals/CreateIncomingDocModal';
import CreateCampaignModal from '@/components/modals/CreateCampaignModal';
import InactivityLockModal from '@/components/InactivityLockModal';
import PdfViewerModal from '@/components/modals/PdfViewerModal';
import WeeklyCheckinModal from '@/components/modals/WeeklyCheckinModal';
import AvatarPickerModal from '@/components/modals/AvatarPickerModal';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    isAuthenticated,
    isMounted,
    hasPermission,
    isCreateDocModalOpen,
    setIsCreateDocModalOpen,
    isCreateCampaignModalOpen,
    setIsCreateCampaignModalOpen,
    isPdfModalOpen,
    closePdfViewer,
    selectedPdfUrl,
    selectedPdfTitle,
    selectedPdfDoc,
    isWeeklyCheckinModalOpen,
    setIsWeeklyCheckinModalOpen,
  } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Tránh flash khi chưa mount
  if (!isMounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Đang tải hệ thống BTV Đoàn trường...</p>
        </div>
      </div>
    );
  }

  // AUTH GATE: Chặn truy cập trực tiếp khi chưa đăng nhập
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Chọn view tương ứng với tab
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'trang_chu':
        return <DashboardView />;
      case 'cong_viec':
        return <TasksView />;
      case 'viec_cua_toi':
        return <MyTasksView />;
      case 'lich':
        return <CalendarView />;
      case 'du_an':
        return <CampaignsView />;
      case 'van_ban_den':
        return <IncomingDocsView />;
      case 'dieu_phoi':
        if (!hasPermission('access_coordinator')) {
          return (
            <div className="bg-card rounded-3xl p-8 border border-border text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Giới hạn Bảng điều phối</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Bảng điều phối và ma trận đôn đốc tiến độ chỉ dành cho Thường trực Đoàn trường và Chánh văn phòng.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('trang_chu')}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                Về Bảng tin Tổng quan
              </button>
            </div>
          );
        }
        return <CoordinatorView />;
      case 'chat':
        return <ChatView />;
      case 'thanh_vien':
        return <MembersView />;
      case 'admin':
        if (!hasPermission('access_admin_portal')) {
          return (
            <div className="bg-card rounded-3xl p-8 border border-border text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Khu vực Giới hạn Quyền Quản trị</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Khu vực Quản trị Admin chỉ dành cho Thường trực Đoàn trường và các đồng chí được cấp quyền quản trị hệ thống.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('trang_chu')}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                Quay về Bảng điều khiển chính
              </button>
            </div>
          );
        }
        return <AdminView />;
      case 'bao_cao':
        return <ReportsView />;
      case 'huong_dan_ios':
        return <IosGuideView />;
      case 'thiet_ke':
        return <FeatureShowcase />;
      case 'cai_dat':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-shell flex flex-col h-dvh overflow-hidden text-foreground">
      <a href="#main-content" className="skip-link">Đến nội dung chính</a>
      <div className="brand-banner" aria-label="Đoàn trường HCMUTE — Tuổi trẻ hôm nay, kiến tạo ngày mai">
        <img src="/images/header-brand.png" alt="Đoàn trường HCMUTE — Tuổi trẻ hôm nay, kiến tạo ngày mai" width={1536} height={92} className="brand-banner-image" />
      </div>

      {/* KHUNG ỨNG DỤNG CHÍNH */}
      <div className="app-frame flex flex-1 min-h-0 overflow-hidden relative">
        {/* 1. SIDEBAR DESKTOP (Ẩn trên mobile) */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar />
        </div>

        {/* 2. DRAWER SIDEBAR CHO MOBILE (Khi bấm nút menu trên mobile header) */}
        {isMobileDrawerOpen && <MobileNavigation onClose={() => setIsMobileDrawerOpen(false)} />}

        {/* 3. KHU VỰC NỘI DUNG CHÍNH */}
        <div className="app-workspace flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Header trên đỉnh */}
          <Header onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

          {/* Thân cuộn trang chuẩn spacing Section 3.1 & 3.4 */}
          <main id="main-content" tabIndex={-1} className="app-main flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 pt-4 pb-24 md:pb-6 scrollbar-thin">
            <div className="view-content w-full max-w-[1600px] mx-auto" data-view={activeTab}>
              {renderCurrentView()}
            </div>
          </main>
        </div>
      </div>

      {/* 4. BOTTOM NAVIGATION CHO MOBILE (Khớp 100% 5 màn hình mẫu) */}
      <BottomNav />

      {/* 5. CÁC MODAL HỆ THỐNG */}
      <InactivityLockModal />
      <TaskDetailModal />
      <CreateTaskModal />
      <CreateIncomingDocModal
        isOpen={isCreateDocModalOpen}
        onClose={() => setIsCreateDocModalOpen(false)}
      />
      <CreateCampaignModal
        isOpen={isCreateCampaignModalOpen}
        onClose={() => setIsCreateCampaignModalOpen(false)}
      />
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={closePdfViewer}
        pdfUrl={selectedPdfUrl}
        title={selectedPdfTitle || undefined}
        doc={selectedPdfDoc}
      />
      <WeeklyCheckinModal
        isOpen={isWeeklyCheckinModalOpen}
        onClose={() => setIsWeeklyCheckinModalOpen(false)}
      />
      <AvatarPickerModal />
    </div>
  );
}
