'use client';

// ==============================================================================
// REPORTS VIEW: BÁO CÁO & THỐNG KÊ TIẾN ĐỘ (CHUẨN QUY TẮC ĐẶC TẢ PHẦN 5.3)
// ==============================================================================

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  BarChart3,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export default function ReportsView() {
  const { getReportData, currentMember } = useApp();

  const { totalCompleted, beforeDeadline, onTime, afterDeadline, memberStats } = getReportData();

  const isLeader = currentMember.role === 'bi_thu' || currentMember.role === 'pho_bi_thu';

  const handleExportStatsExcel = () => {
    const summaryData = [
      { 'CHỈ SỐ TIẾN ĐỘ': 'Tổng số công việc đã hoàn thành', 'SỐ LƯỢNG': totalCompleted, 'TỶ LỆ': '100%' },
      { 'CHỈ SỐ TIẾN ĐỘ': 'Hoàn thành trước hạn', 'SỐ LƯỢNG': beforeDeadline, 'TỶ LỆ': `${Math.round((beforeDeadline / (totalCompleted || 1)) * 100)}%` },
      { 'CHỈ SỐ TIẾN ĐỘ': 'Hoàn thành đúng hạn', 'SỐ LƯỢNG': onTime, 'TỶ LỆ': `${Math.round((onTime / (totalCompleted || 1)) * 100)}%` },
      { 'CHỈ SỐ TIẾN ĐỘ': 'Hoàn thành trễ hạn', 'SỐ LƯỢNG': afterDeadline, 'TỶ LỆ': `${Math.round((afterDeadline / (totalCompleted || 1)) * 100)}%` },
    ];

    const memberData = memberStats.map((ms, idx) => ({
      STT: idx + 1,
      'HỌ VÀ TÊN': ms.member.full_name,
      'CHỨC VỤ': ms.member.role,
      'MẢNG PHỤ TRÁCH': ms.member.mang_phu_trach || '',
      'TỔNG ĐƯỢC GIAO': ms.totalAssigned,
      'ĐÚNG HẠN': ms.completedOnTime,
      'TRỄ HẠN': ms.completedLate,
      'ĐANG THỰC HIỆN': ms.inProgress,
      'QUÁ HẠN HIỆN TẠI': ms.overdue,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'TONG_HOP_TIEN_DO');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(memberData), 'THONG_KE_CAN_BO');
    XLSX.writeFile(wb, `THONG_KE_TIEN_DO_BTV_HCMUTE_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Báo cáo & Thống kê Tiến độ
          </h2>
          <p className="text-xs text-muted-foreground">
            Tổng hợp dữ liệu phục vụ báo cáo định kỳ Đảng ủy trường và Thành Đoàn TP.HCM
          </p>
        </div>

        <button
          onClick={handleExportStatsExcel}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Excel Báo cáo</span>
        </button>
      </div>

      {/* 3 Thẻ chỉ số chất lượng hoàn thành (Trước hạn, Đúng hạn, Trễ hạn) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Trước hạn */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Hoàn thành Trước hạn</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{beforeDeadline}</div>
          <p className="text-[11px] text-muted-foreground">
            Chiếm {Math.round((beforeDeadline / (totalCompleted || 1)) * 100)}% tổng số việc đã chốt
          </p>
        </div>

        {/* Đúng hạn */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Hoàn thành Đúng hạn</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-primary">{onTime}</div>
          <p className="text-[11px] text-muted-foreground">
            Chiếm {Math.round((onTime / (totalCompleted || 1)) * 100)}% tổng số việc đã chốt
          </p>
        </div>

        {/* Trễ hạn */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Hoàn thành Trễ hạn</span>
            <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-destructive">{afterDeadline}</div>
          <p className="text-[11px] text-muted-foreground">
            Chiếm {Math.round((afterDeadline / (totalCompleted || 1)) * 100)}% tổng số việc đã chốt
          </p>
        </div>
      </div>

      {/* Bảng thống kê theo từng cán bộ (Nguyên tắc: Thường trực xem toàn thể, Ủy viên xem chỉ số chính mình) */}
      <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Bảng theo dõi tiến độ từng thành viên BTV</h3>
          <p className="text-xs text-muted-foreground">
            Dữ liệu ghi nhận tự động từ hạn chót và thời điểm phê duyệt hoàn thành
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">Cán bộ BTV</th>
                <th className="py-3 px-3">Mảng phụ trách</th>
                <th className="py-3 px-3 text-center">Tổng được giao</th>
                <th className="py-3 px-3 text-center text-emerald-600 dark:text-emerald-400">Đúng hạn</th>
                <th className="py-3 px-3 text-center text-destructive">Trễ hạn</th>
                <th className="py-3 px-3 text-center text-primary">Đang làm</th>
                <th className="py-3 px-3 text-center text-destructive">Quá hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {memberStats.map((ms) => {
                const isMe = ms.member.id === currentMember.id;
                return (
                  <tr
                    key={ms.member.id}
                    className={`hover:bg-muted/40 transition-colors ${
                      isMe ? 'bg-primary/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ms.member.avatar_url}
                          alt={ms.member.full_name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-border"
                        />
                        <div>
                          <div className="font-bold text-foreground">{ms.member.full_name}</div>
                          <div className="text-[10px] text-muted-foreground capitalize">
                            {ms.member.role.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground capitalize">
                      {ms.member.mang_phu_trach || 'BTV'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-foreground">{ms.totalAssigned}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{ms.completedOnTime}</td>
                    <td className="py-3 px-3 text-center font-bold text-destructive">{ms.completedLate}</td>
                    <td className="py-3 px-3 text-center font-bold text-primary">{ms.inProgress}</td>
                    <td className="py-3 px-3 text-center font-bold text-destructive">
                      {ms.overdue > 0 ? (
                        <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full text-[10px]">
                          {ms.overdue}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
