'use client';

// ==============================================================================
// MAIN APP PAGE: ĐIỀU PHỐI LAYOUT CHÍNH (HỆ THỐNG QUẢN LÝ CÁN BỘ ĐOÀN - HỘI HCMUTE)
// Đồng bộ 2 phân vùng: Cán bộ cá nhân (User) & Quản trị hệ thống (Admin)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import MobileNavigation from '@/components/MobileNavigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// User Views
import DashboardView from '@/components/views/DashboardView';
import MyProfileView from '@/components/views/MyProfileView';
import OrganizationView from '@/components/views/OrganizationView';
import MyEvaluationView from '@/components/views/MyEvaluationView';
import DecisionsAndHistoryView from '@/components/views/DecisionsAndHistoryView';
import NotificationsView from '@/components/views/NotificationsView';
import MyAccountView from '@/components/views/MyAccountView';

// Admin Views
import AdminDashboardView from '@/components/views/AdminDashboardView';
import AdminProfilesView from '@/components/views/AdminProfilesView';
import AdminOrganizationView from '@/components/views/AdminOrganizationView';
import AdminDecisionsView from '@/components/views/AdminDecisionsView';
import AdminApprovalView from '@/components/views/AdminApprovalView';
import AdminEvaluationsView from '@/components/views/AdminEvaluationsView';
import AdminReportsView from '@/components/views/AdminReportsView';
import AdminNotificationsView from '@/components/views/AdminNotificationsView';
import AdminAccountsView from '@/components/views/AdminAccountsView';
import AdminConfigView from '@/components/views/AdminConfigView';
import AdminAuditLogsView from '@/components/views/AdminAuditLogsView';

import LoginPage from '@/components/LoginPage';
import { Loader2 } from 'lucide-react';

// Modals
import TestScenarioModal from '@/components/modals/TestScenarioModal';

export default function Home() {
  const {
    portalMode,
    userTab,
    adminTab,
    authUser,
    isAuthLoading,
  } = useApp();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // 1. Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-dvh flex flex-col bg-background text-foreground items-center justify-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
        <h2 className="text-base font-bold text-foreground">Hệ thống Quản lý Cán bộ Đoàn - Hội HCMUTE</h2>
        <p className="text-xs text-muted-foreground mt-1">Đang kiểm tra phiên làm việc bảo mật...</p>
      </div>
    );
  }

  // 2. Auth Gate: Nếu chưa đăng nhập, chỉ hiển thị trang Đăng nhập
  if (!authUser) {
    return <LoginPage />;
  }

  // Render view tương ứng theo portalMode và Tab hiện tại
  const renderCurrentView = () => {
    if (portalMode === 'admin') {
      switch (adminTab) {
        case 'tong_quan':
          return <AdminDashboardView />;
        case 'ho_so':
          return <AdminProfilesView />;
        case 'to_chuc':
          return <AdminOrganizationView />;
        case 'quyet_dinh':
          return <AdminDecisionsView />;
        case 'duyet_ho_so':
          return <AdminApprovalView />;
        case 'danh_gia':
          return <AdminEvaluationsView />;
        case 'bao_cao':
          return <AdminReportsView />;
        case 'thong_bao':
          return <AdminNotificationsView />;
        case 'phan_quyen':
          return <AdminAccountsView />;
        case 'cau_hinh':
          return <AdminConfigView />;
        case 'nhat_ky':
          return <AdminAuditLogsView />;
        default:
          return <AdminDashboardView />;
      }
    }

    // Portal User
    switch (userTab) {
      case 'trang_chu':
        return <DashboardView />;
      case 'ho_so':
        return <MyProfileView />;
      case 'to_chuc':
        return <OrganizationView />;
      case 'danh_gia':
        return <MyEvaluationView />;
      case 'quyet_dinh':
        return <DecisionsAndHistoryView />;
      case 'thong_bao':
        return <NotificationsView />;
      case 'tai_khoan':
        return <MyAccountView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-shell flex flex-col h-dvh overflow-hidden text-foreground bg-background">
      <a href="#main-content" className="skip-link">Đến nội dung chính</a>

      {/* Brand banner logo trường HCMUTE */}
      <div className="brand-banner" aria-label="Đoàn trường HCMUTE — Tuổi trẻ hôm nay, kiến tạo ngày mai">
        <img
          src="/images/header-brand.png"
          alt="Đoàn trường HCMUTE — Tuổi trẻ hôm nay, kiến tạo ngày mai"
          width={1536}
          height={92}
          className="brand-banner-image"
        />
      </div>

      {/* KHUNG ỨNG DỤNG CHÍNH */}
      <div className="app-frame flex flex-1 min-h-0 overflow-hidden relative">
        {/* 1. SIDEBAR DESKTOP */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar onNavigate={() => setIsMobileDrawerOpen(false)} />
        </div>

        {/* 2. DRAWER SIDEBAR CHO MOBILE */}
        {isMobileDrawerOpen && <MobileNavigation onClose={() => setIsMobileDrawerOpen(false)} />}

        {/* 3. KHU VỰC NỘI DUNG CHÍNH */}
        <div className="app-workspace flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Header trên đỉnh */}
          <Header
            onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
            onOpenTestModal={() => setIsTestModalOpen(true)}
          />

          {/* Thân cuộn trang */}
          <main
            id="main-content"
            tabIndex={-1}
            className="app-main flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 pt-4 pb-24 md:pb-6 scrollbar-thin"
          >
            <div
              className="view-content w-full max-w-[1600px] mx-auto"
              data-view={portalMode === 'admin' ? adminTab : userTab}
            >
              {renderCurrentView()}
            </div>
          </main>
        </div>
      </div>

      {/* 4. BOTTOM NAVIGATION CHO MOBILE */}
      <BottomNav onOpenTestModal={() => setIsTestModalOpen(true)} />

      {/* 5. MODAL 12 KỊCH BẢN NGHIỆM THU */}
      <TestScenarioModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
