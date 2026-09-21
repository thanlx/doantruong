'use client';

// ==============================================================================
// MAIN APP PAGE: ĐIỀU PHỐI LAYOUT CHÍNH (DESKTOP & PWA MOBILE CHO 9 Đ/C BTV)
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

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

// Modals
import TaskDetailModal from '@/components/modals/TaskDetailModal';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import CreateIncomingDocModal from '@/components/modals/CreateIncomingDocModal';
import CreateCampaignModal from '@/components/modals/CreateCampaignModal';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    isCreateDocModalOpen,
    setIsCreateDocModalOpen,
    isCreateCampaignModalOpen,
    setIsCreateCampaignModalOpen,
  } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
        return <CoordinatorView />;
      case 'chat':
        return <ChatView />;
      case 'thanh_vien':
        return <MembersView />;
      case 'admin':
        return <AdminView />;
      case 'bao_cao':
        return <ReportsView />;
      case 'huong_dan_ios':
        return <IosGuideView />;
      case 'cai_dat':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* 1. SIDEBAR DESKTOP (Ẩn trên mobile) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* 2. DRAWER SIDEBAR CHO MOBILE (Khi bấm nút menu trên mobile header) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs h-full bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <Sidebar />
          </div>
        </div>
      )}

      {/* 3. KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header trên đỉnh */}
        <Header onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

        {/* Thân cuộn trang */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* 4. BOTTOM NAVIGATION CHO MOBILE (Khớp 100% 5 màn hình mẫu) */}
      <BottomNav />

      {/* 5. CÁC MODAL HỆ THỐNG */}
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
    </div>
  );
}
