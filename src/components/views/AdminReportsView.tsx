'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  FileText, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  Lock, 
  Info,
  TrendingUp,
  Award,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminReportsView: React.FC = () => {
  const { 
    profiles, 
    units, 
    roles, 
    evaluations, 
    evaluationPeriods, 
    getUniqueOfficerCount, 
    getTotalRoleCount,
    addAuditLog 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'current' | 'changes' | 'evaluations' | 'missing'>('current');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [reportDate, setReportDate] = useState<string>('2026-10-13');

  // Scope & sensitive field options
  const [exportFields, setExportFields] = useState({
    name: true,
    mssv: true,
    unit: true,
    position: true,
    tenure: true
  });
  const [sensitiveFields, setSensitiveFields] = useState({
    phone: false,
    email: false,
    address: false
  });

  const uniqueCount = getUniqueOfficerCount();
  const totalRoles = getTotalRoleCount();

  // Excel export using SheetJS
  const handleExportExcel = () => {
    try {
      const exportData: Record<string, any>[] = [];

      profiles.forEach((p, idx) => {
        const userRoles = roles.filter(r => r.officer_id === p.id && r.is_active);
        const roleStr = userRoles.map(r => r.position_title).join(', ') || 'Chưa phân công';
        const unitNames = userRoles.map(r => {
          const u = units.find(unit => unit.id === r.unit_id);
          return u ? u.name : '';
        }).filter(Boolean).join(', ') || 'Chưa phân công';

        const row: Record<string, any> = {
          'STT': idx + 1,
        };

        if (exportFields.name) row['Họ và tên'] = p.full_name;
        if (exportFields.mssv) row['MSSV / Mã CB'] = p.student_id;
        if (exportFields.unit) row['Đơn vị'] = unitNames;
        if (exportFields.position) row['Chức vụ'] = roleStr;
        if (exportFields.tenure) row['Thời gian đảm nhiệm'] = '01/09/2026 - Hiện tại';

        if (sensitiveFields.phone) row['Số điện thoại (Nhạy cảm)'] = p.phone || '';
        if (sensitiveFields.email) row['Email (Nhạy cảm)'] = p.email || '';
        if (sensitiveFields.address) row['Địa chỉ (Nhạy cảm)'] = p.current_address || '';

        exportData.push(row);
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo nhân sự');
      XLSX.writeFile(workbook, `Bao_cao_nhan_su_${reportDate.replace(/-/g, '')}.xlsx`);

      addAuditLog({
        actor_name: 'Nguyễn Minh Anh',
        actor_code: '23110001',
        action_type: 'EXPORT',
        target_type: 'REPORT',
        target_id: 'EXCEL-REPORT',
        result: 'SUCCESS',
        description: `Xuất file Excel báo cáo nhân sự ngày ${reportDate}`,
        ip_address: '10.0.0.1'
      });
      alert('Đã xuất báo cáo Excel thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xuất tệp Excel.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
    addAuditLog({
      actor_name: 'Nguyễn Minh Anh',
      actor_code: '23110001',
      action_type: 'EXPORT',
      target_type: 'REPORT',
      target_id: 'PDF-REPORT',
      result: 'SUCCESS',
      description: `In báo cáo PDF ngày ${reportDate}`,
      ip_address: '10.0.0.1'
    });
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Báo cáo</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo và thống kê</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Dữ liệu minh họa
          </span>
        </div>
      </div>

      {/* 4 Tabs */}
      <div className="border-b border-slate-200 flex gap-8 text-sm font-medium print:hidden">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'current'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Nhân sự hiện tại
          {activeTab === 'current' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('changes')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'changes'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Biến động nhân sự
          {activeTab === 'changes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'evaluations'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Đánh giá
          {activeTab === 'evaluations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('missing')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'missing'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Hồ sơ thiếu thông tin
          {activeTab === 'missing' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phân hệ</label>
            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20 focus:border-[#005BAA]"
            >
              <option value="all">Tất cả</option>
              <option value="P01">BCH Đoàn trường (P01)</option>
              <option value="P02">UBKT Đoàn trường (P02)</option>
              <option value="P03">BCH Đoàn cơ sở (P03)</option>
              <option value="P04">BCH Liên chi hội (P04)</option>
              <option value="P05">Đơn vị trực thuộc Đoàn trường (P05)</option>
              <option value="P06">Đơn vị trực thuộc Hội Sinh viên (P06)</option>
              <option value="P07">Bí thư chi đoàn (P07)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20 focus:border-[#005BAA]"
            >
              <option value="all">Tất cả</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nhiệm kỳ</label>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20 focus:border-[#005BAA]"
            >
              <option value="all">Tất cả</option>
              <option value="2026-2027">Nhiệm kỳ 2026 - 2027</option>
              <option value="2025-2026">Nhiệm kỳ 2025 - 2026</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày tra cứu</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20 focus:border-[#005BAA]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 bg-[#005BAA] hover:bg-[#004785] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Xem báo cáo
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Xuất Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4 text-red-600" />
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Top 2 Stat Cards (matching Screen 11) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F0F7FF] rounded-xl border border-blue-100 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-[#005BAA] shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Tổng số cán bộ (unique)</div>
                <div className="text-4xl font-black text-[#005BAA] my-1">{uniqueCount}</div>
                <div className="text-xs text-slate-500">
                  Số người đang đảm nhiệm chức vụ tại thời điểm {new Date(reportDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="bg-[#FFF5F5] rounded-xl border border-red-100 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Tổng số lượt chức vụ</div>
                <div className="text-4xl font-black text-red-600 my-1">{totalRoles}</div>
                <div className="text-xs text-slate-500">
                  Tổng số chức vụ đang được đảm nhiệm tại thời điểm {new Date(reportDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Table + Right Options Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Unit breakdown table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 text-sm">Thống kê theo đơn vị</h3>
                <span className="text-xs text-slate-500">Thời điểm: {reportDate}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">STT</th>
                      <th className="px-4 py-3">Đơn vị</th>
                      <th className="px-4 py-3 text-center">Số người (unique)</th>
                      <th className="px-4 py-3 text-center">Lượt chức vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center text-slate-500">1</td>
                      <td className="px-4 py-3 font-medium text-slate-800">Đoàn cơ sở</td>
                      <td className="px-4 py-3 text-center text-slate-700">120</td>
                      <td className="px-4 py-3 text-center text-slate-700">152</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center text-slate-500">2</td>
                      <td className="px-4 py-3 font-medium text-slate-800">Liên chi hội</td>
                      <td className="px-4 py-3 text-center text-slate-700">80</td>
                      <td className="px-4 py-3 text-center text-slate-700">98</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center text-slate-500">3</td>
                      <td className="px-4 py-3 font-medium text-slate-800">CLB Đội Nhóm</td>
                      <td className="px-4 py-3 text-center text-slate-700">48</td>
                      <td className="px-4 py-3 text-center text-slate-700">62</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-slate-900">Tổng cộng</td>
                      <td className="px-4 py-3 text-center text-[#005BAA]">{uniqueCount}</td>
                      <td className="px-4 py-3 text-center text-red-600">{totalRoles}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Right 1 Col: Phạm vi báo cáo & Export Checklist */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <h3 className="font-semibold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Phạm vi báo cáo
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Phạm vi</label>
                  <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50">
                    <option>Toàn trường</option>
                    <option>Đoàn cơ sở</option>
                    <option>Liên chi hội</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Trạng thái hồ sơ</label>
                  <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50/50">
                    <option>Đã phê duyệt</option>
                    <option>Tất cả</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Ngày tra cứu</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="date" 
                      value={reportDate} 
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">Trường thông tin xuất</div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.name}
                      onChange={(e) => setExportFields(prev => ({ ...prev, name: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]" 
                    />
                    <span>Họ và tên</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.mssv}
                      onChange={(e) => setExportFields(prev => ({ ...prev, mssv: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]" 
                    />
                    <span>MSSV</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.unit}
                      onChange={(e) => setExportFields(prev => ({ ...prev, unit: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]" 
                    />
                    <span>Đơn vị</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.position}
                      onChange={(e) => setExportFields(prev => ({ ...prev, position: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]" 
                    />
                    <span>Chức vụ</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.tenure}
                      onChange={(e) => setExportFields(prev => ({ ...prev, tenure: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]" 
                    />
                    <span>Thời gian đảm nhiệm</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  Trường thông tin nhạy cảm (không xuất)
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sensitiveFields.phone}
                      onChange={(e) => setSensitiveFields(prev => ({ ...prev, phone: e.target.checked }))}
                      className="rounded text-[#005BAA]" 
                    />
                    <span>Số điện thoại</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sensitiveFields.email}
                      onChange={(e) => setSensitiveFields(prev => ({ ...prev, email: e.target.checked }))}
                      className="rounded text-[#005BAA]" 
                    />
                    <span>Email</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sensitiveFields.address}
                      onChange={(e) => setSensitiveFields(prev => ({ ...prev, address: e.target.checked }))}
                      className="rounded text-[#005BAA]" 
                    />
                    <span>Địa chỉ liên hệ</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Dữ liệu xuất khớp bộ lọc hiện tại.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Biến động nhân sự */}
      {activeTab === 'changes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Báo cáo biến động nhân sự</h3>
              <p className="text-xs text-slate-500">Các quyết định bổ nhiệm, miễn nhiệm, điều động và thay thế trong kỳ</p>
            </div>
            <span className="text-xs px-2 py-1 bg-blue-50 text-[#005BAA] rounded font-medium">3 quyết định gần đây</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Số Quyết định</th>
                  <th className="px-4 py-3">Loại biến động</th>
                  <th className="px-4 py-3">Cán bộ</th>
                  <th className="px-4 py-3">Đơn vị</th>
                  <th className="px-4 py-3">Chức vụ mới / Thay thế</th>
                  <th className="px-4 py-3">Ngày hiệu lực</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">156-QĐ/HSV</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">Thay thế nhân sự</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">Lê Thu Hà (thay Trần Hoàng Nam)</td>
                  <td className="px-4 py-3 text-slate-600">CLB Truyền thông</td>
                  <td className="px-4 py-3 text-slate-600">Chủ nhiệm</td>
                  <td className="px-4 py-3 text-slate-600 font-medium text-amber-700">01/11/2026 (Tương lai)</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">Sắp hiệu lực</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">145-QĐ/HSV</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Kiện toàn</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">Nguyễn Minh Anh</td>
                  <td className="px-4 py-3 text-slate-600">CLB Truyền thông</td>
                  <td className="px-4 py-3 text-slate-600">Thành viên Ban chủ nhiệm</td>
                  <td className="px-4 py-3 text-slate-600">01/10/2026</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Đang hiệu lực</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">123-QĐ/ĐTN</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">Bổ nhiệm</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">Nguyễn Minh Anh</td>
                  <td className="px-4 py-3 text-slate-600">Đoàn cơ sở</td>
                  <td className="px-4 py-3 text-slate-600">Ủy viên BCH</td>
                  <td className="px-4 py-3 text-slate-600">01/09/2026</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">Đang hiệu lực</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Đánh giá */}
      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Báo cáo xếp loại đánh giá tháng 10/2026</h3>
              <p className="text-xs text-slate-500">Phân bố mức xếp loại A, B, C, D theo từng đơn vị</p>
            </div>
            <button 
              onClick={handleExportExcel}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium"
            >
              <Download className="w-3.5 h-3.5" /> Xuất kết quả
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-emerald-800">Mức A (Xuất sắc)</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">28</div>
              <div className="text-xs text-emerald-700 mt-0.5">35% tổng số</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-blue-800">Mức B (Tốt)</div>
              <div className="text-2xl font-bold text-[#005BAA] mt-1">36</div>
              <div className="text-xs text-blue-700 mt-0.5">45% tổng số</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-amber-800">Mức C (Hoàn thành)</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">12</div>
              <div className="text-xs text-amber-700 mt-0.5">15% tổng số</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-red-800">Mức D (Chưa hoàn thành)</div>
              <div className="text-2xl font-bold text-red-600 mt-1">4</div>
              <div className="text-xs text-red-700 mt-0.5">5% tổng số</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hồ sơ thiếu thông tin */}
      {activeTab === 'missing' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Danh sách hồ sơ cần bổ sung dữ liệu</h3>
              <p className="text-xs text-slate-500">Các hồ sơ chưa hoàn thiện thông tin Đoàn - Đảng, nơi ở hoặc trình độ</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
              1 hồ sơ cần kiểm tra
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã CB</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">MSSV</th>
                  <th className="px-4 py-3">Đơn vị</th>
                  <th className="px-4 py-3">Thông tin còn thiếu</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900">CB-0003</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Lê Thu Hà</td>
                  <td className="px-4 py-3 text-slate-600">23110003</td>
                  <td className="px-4 py-3 text-slate-600">Liên chi hội</td>
                  <td className="px-4 py-3 text-amber-700 font-medium">
                    Thiếu ngày vào Đoàn, chưa có Trình độ lý luận chính trị
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                      Chờ bổ sung
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsView;
