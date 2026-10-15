'use client';

import React, { useState, useMemo } from 'react';
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
  Download,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminReportsView: React.FC = () => {
  const {
    profiles,
    units,
    decisions,
    evaluations,
    currentUser,
    getUniqueOfficerCount,
    getTotalRoleCount,
    addAuditLog,
    setAdminTab,
    setSelectedProfileId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'current' | 'changes' | 'evaluations' | 'missing'>('current');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Scope & sensitive field options
  const [exportFields, setExportFields] = useState({
    name: true,
    mssv: true,
    unit: true,
    position: true,
    tenure: true,
  });
  const [sensitiveFields, setSensitiveFields] = useState({
    phone: false,
    email: false,
    address: false,
  });

  const uniqueCount = getUniqueOfficerCount(reportDate);
  const totalRoles = getTotalRoleCount(reportDate);

  // Filtered profiles based on filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (subsystemFilter !== 'all' && !p.roles.some((r) => r.subsystem_id === subsystemFilter)) {
        return false;
      }
      if (unitFilter !== 'all' && !p.roles.some((r) => r.unit_id === unitFilter)) {
        return false;
      }
      if (termFilter !== 'all' && !p.roles.some((r) => r.term.includes(termFilter))) {
        return false;
      }
      return true;
    });
  }, [profiles, subsystemFilter, unitFilter, termFilter]);

  // Live unit breakdown statistics
  const unitStats = useMemo(() => {
    return units
      .filter((u) => unitFilter === 'all' || u.id === unitFilter)
      .map((u) => {
        const officersInUnit = new Set<string>();
        let roleCount = 0;
        filteredProfiles.forEach((p) => {
          p.roles.forEach((r) => {
            if (r.unit_id === u.id || r.unit_name === u.name) {
              officersInUnit.add(p.id);
              roleCount += 1;
            }
          });
        });
        return {
          unit: u,
          uniqueCount: officersInUnit.size,
          roleCount,
        };
      });
  }, [units, filteredProfiles, unitFilter]);

  // Live evaluation grade distribution
  const evalStats = useMemo(() => {
    const total = evaluations.length || 1;
    const countA = evaluations.filter((e) => (e.approved_grade || e.proposed_grade) === 'A').length;
    const countB = evaluations.filter((e) => (e.approved_grade || e.proposed_grade) === 'B').length;
    const countC = evaluations.filter((e) => (e.approved_grade || e.proposed_grade) === 'C').length;
    const countD = evaluations.filter((e) => (e.approved_grade || e.proposed_grade) === 'D').length;
    return {
      total: evaluations.length,
      countA,
      pctA: Math.round((countA / total) * 100),
      countB,
      pctB: Math.round((countB / total) * 100),
      countC,
      pctC: Math.round((countC / total) * 100),
      countD,
      pctD: Math.round((countD / total) * 100),
    };
  }, [evaluations]);

  // Live profiles with missing data
  const missingDataProfiles = useMemo(() => {
    return profiles
      .map((p) => {
        const missing: string[] = [];
        if (!p.union_join_date) missing.push('Thiếu ngày vào Đoàn');
        if (!p.political_theory || p.political_theory === 'Chưa có') missing.push('Chưa có trình độ LLCT');
        if (!p.current_residence) missing.push('Thiếu nơi ở hiện nay');
        if (!p.phone) missing.push('Thiếu số điện thoại');
        if (!p.date_of_birth) missing.push('Thiếu ngày sinh');
        return { profile: p, missing };
      })
      .filter((item) => item.missing.length > 0);
  }, [profiles]);

  // Multi-sheet Excel export using SheetJS
  const handleExportExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Nhân sự hiện tại
      const currentOfficerRows = filteredProfiles.map((p, idx) => {
        const roleStr = p.roles.map((r) => r.position_title).join('; ') || 'Chưa phân công';
        const unitStr = p.roles.map((r) => r.unit_name).join('; ') || 'Chưa phân công';
        const tenureStr =
          p.roles.map((r) => `${r.start_date} -> ${r.end_date || 'Hiện tại'}`).join('; ') || '';

        const row: Record<string, any> = {
          STT: idx + 1,
          'Mã hồ sơ': p.profile_code,
        };
        if (exportFields.name) row['Họ và tên'] = p.full_name;
        if (exportFields.mssv) row['MSSV / Mã CB'] = p.student_id || p.staff_id || '';
        if (exportFields.unit) row['Đơn vị'] = unitStr;
        if (exportFields.position) row['Chức vụ'] = roleStr;
        if (exportFields.tenure) row['Thời gian đảm nhiệm'] = tenureStr;

        if (sensitiveFields.phone) row['Số điện thoại'] = p.phone || '';
        if (sensitiveFields.email) row['Email'] = p.email || '';
        if (sensitiveFields.address) row['Nơi ở hiện nay'] = p.current_residence || '';

        return row;
      });
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(currentOfficerRows),
        'Nhan_su_hien_tai'
      );

      // Sheet 2: Biến động quyết định
      const decisionRows = decisions.map((d, idx) => ({
        STT: idx + 1,
        'Số quyết định': d.decision_number,
        'Nội dung': d.title,
        'Loại quyết định': d.decision_type,
        'Đơn vị': d.unit_name || '',
        'Ngày ban hành': d.issue_date,
        'Ngày hiệu lực': d.effective_date,
        'Người ký': d.signer_name,
        'Trạng thái': d.status === 'approved' ? 'Đã ban hành' : 'Bản nháp',
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(decisionRows),
        'Bien_dong_nhan_su'
      );

      // Sheet 3: Kết quả đánh giá
      const evalRows = evaluations.map((e, idx) => ({
        STT: idx + 1,
        'Kỳ đánh giá': e.month_year,
        'Họ và tên': e.profile_name,
        'MSSV': e.student_id,
        'Đơn vị': e.unit_name,
        'Chức vụ': e.position_title,
        'Mức đề xuất': e.proposed_grade || '',
        'Mức phê duyệt': e.approved_grade || '',
        'Trạng thái': e.status,
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(evalRows),
        'Ket_qua_danh_gia'
      );

      XLSX.writeFile(workbook, `Bao_cao_tong_hop_Doan_Hoi_${reportDate.replace(/-/g, '')}.xlsx`);

      addAuditLog({
        actor_name: currentUser.full_name,
        actor_code: currentUser.student_id,
        action_type: 'EXPORT',
        target_type: 'REPORT',
        target_id: 'EXCEL-REPORT',
        result: 'SUCCESS',
        description: `Xuất file Excel báo cáo tổng hợp nhân sự ngày ${reportDate}`,
      });

      setToastMsg('Đã xuất báo cáo Excel tổng hợp thành công!');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xuất tệp Excel.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
    addAuditLog({
      actor_name: currentUser.full_name,
      actor_code: currentUser.student_id,
      action_type: 'EXPORT',
      target_type: 'REPORT',
      target_id: 'PDF-REPORT',
      result: 'SUCCESS',
      description: `In báo cáo PDF ngày ${reportDate}`,
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
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            Dữ liệu trực tuyến ({profiles.length} hồ sơ)
          </span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 4 Tabs */}
      <div className="border-b border-slate-200 flex gap-8 text-sm font-medium print:hidden overflow-x-auto">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'current'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Nhân sự hiện tại ({filteredProfiles.length})
          {activeTab === 'current' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('changes')}
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'changes'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Biến động nhân sự ({decisions.length})
          {activeTab === 'changes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'evaluations'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Đánh giá ({evaluations.length})
          {activeTab === 'evaluations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('missing')}
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'missing'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Hồ sơ thiếu thông tin ({missingDataProfiles.length})
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
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
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
              <option value="2026">Nhiệm kỳ 2026 - 2027</option>
              <option value="2025">Nhiệm kỳ 2025 - 2026</option>
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
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-[#005BAA] hover:bg-[#004785] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất báo cáo Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-red-600" />
            In / Xuất PDF
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Top 2 Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F0F7FF] rounded-xl border border-blue-100 p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-[#005BAA] shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-600">Tổng số cán bộ (unique)</div>
                <div className="text-4xl font-black text-[#005BAA] my-1">{uniqueCount}</div>
                <div className="text-xs text-slate-500">
                  Số người đang đảm nhiệm chức vụ tại thời điểm{' '}
                  {new Date(reportDate).toLocaleDateString('vi-VN')}
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
                  Tổng số chức vụ đang được đảm nhiệm tại thời điểm{' '}
                  {new Date(reportDate).toLocaleDateString('vi-VN')}
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
                      <th className="px-4 py-3 text-center">Mã đơn vị</th>
                      <th className="px-4 py-3 text-center">Số người (unique)</th>
                      <th className="px-4 py-3 text-center">Lượt chức vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unitStats.map((item, idx) => (
                      <tr key={item.unit.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{item.unit.name}</td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">
                          {item.unit.code}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">
                          {item.uniqueCount}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">
                          {item.roleCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-slate-900">
                        Tổng cộng toàn hệ thống
                      </td>
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
                Tùy chọn trường thông tin xuất Excel
              </h3>

              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">Trường thông tin cơ bản</div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportFields.name}
                      onChange={(e) => setExportFields((prev) => ({ ...prev, name: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]"
                    />
                    <span>Họ và tên</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportFields.mssv}
                      onChange={(e) => setExportFields((prev) => ({ ...prev, mssv: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]"
                    />
                    <span>MSSV / Mã cán bộ</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportFields.unit}
                      onChange={(e) => setExportFields((prev) => ({ ...prev, unit: e.target.checked }))}
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]"
                    />
                    <span>Đơn vị</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportFields.position}
                      onChange={(e) =>
                        setExportFields((prev) => ({ ...prev, position: e.target.checked }))
                      }
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]"
                    />
                    <span>Chức vụ</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportFields.tenure}
                      onChange={(e) =>
                        setExportFields((prev) => ({ ...prev, tenure: e.target.checked }))
                      }
                      className="rounded text-[#005BAA] focus:ring-[#005BAA]"
                    />
                    <span>Thời gian đảm nhiệm</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  Trường thông tin nhạy cảm (chỉ xuất khi chọn)
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sensitiveFields.phone}
                      onChange={(e) =>
                        setSensitiveFields((prev) => ({ ...prev, phone: e.target.checked }))
                      }
                      className="rounded text-[#005BAA]"
                    />
                    <span>Số điện thoại</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sensitiveFields.email}
                      onChange={(e) =>
                        setSensitiveFields((prev) => ({ ...prev, email: e.target.checked }))
                      }
                      className="rounded text-[#005BAA]"
                    />
                    <span>Email liên hệ</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sensitiveFields.address}
                      onChange={(e) =>
                        setSensitiveFields((prev) => ({ ...prev, address: e.target.checked }))
                      }
                      className="rounded text-[#005BAA]"
                    />
                    <span>Địa chỉ liên hệ</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Dữ liệu xuất khớp với bộ lọc hiện tại.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Biến động nhân sự (LIVE DECISIONS) */}
      {activeTab === 'changes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Báo cáo biến động nhân sự</h3>
              <p className="text-xs text-slate-500">
                Các quyết định bổ nhiệm, miễn nhiệm, điều động và thay thế trong kỳ
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-[#005BAA] rounded font-medium">
              {decisions.length} quyết định
            </span>
          </div>

          {decisions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Chưa có quyết định biến động nhân sự nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Số Quyết định</th>
                    <th className="px-4 py-3">Loại biến động</th>
                    <th className="px-4 py-3">Nội dung quyết định</th>
                    <th className="px-4 py-3">Đơn vị</th>
                    <th className="px-4 py-3">Ngày hiệu lực</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {decisions.map((dec) => (
                    <tr key={dec.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {dec.decision_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {dec.decision_type === 'bo_nhiem'
                            ? 'Bổ nhiệm'
                            : dec.decision_type === 'mien_nhiem'
                            ? 'Miễn nhiệm'
                            : dec.decision_type === 'thay_the'
                            ? 'Thay thế nhân sự'
                            : 'Kiện toàn'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{dec.title}</td>
                      <td className="px-4 py-3 text-slate-600">{dec.unit_name || 'Đoàn - Hội'}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{dec.effective_date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                          {dec.status === 'approved' ? 'Đang hiệu lực' : 'Bản nháp'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Đánh giá (LIVE EVALUATIONS) */}
      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">
                Báo cáo xếp loại đánh giá ({evaluations.length} phiếu)
              </h3>
              <p className="text-xs text-slate-500">
                Phân bố mức xếp loại A, B, C, D trực tiếp từ dữ liệu đánh giá hiện hành
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Xuất kết quả
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-emerald-800">Mức A (Xuất sắc)</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{evalStats.countA}</div>
              <div className="text-xs text-emerald-700 mt-0.5">{evalStats.pctA}% tổng số</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-blue-800">Mức B (Tốt)</div>
              <div className="text-2xl font-bold text-[#005BAA] mt-1">{evalStats.countB}</div>
              <div className="text-xs text-blue-700 mt-0.5">{evalStats.pctB}% tổng số</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-amber-800">Mức C (Hoàn thành)</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{evalStats.countC}</div>
              <div className="text-xs text-amber-700 mt-0.5">{evalStats.pctC}% tổng số</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-red-800">Mức D (Chưa hoàn thành)</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{evalStats.countD}</div>
              <div className="text-xs text-red-700 mt-0.5">{evalStats.pctD}% tổng số</div>
            </div>
          </div>

          {evaluations.length > 0 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Kỳ</th>
                    <th className="px-3 py-2.5">Cán bộ</th>
                    <th className="px-3 py-2.5">MSSV</th>
                    <th className="px-3 py-2.5">Đơn vị</th>
                    <th className="px-3 py-2.5">Chức vụ</th>
                    <th className="px-3 py-2.5 text-center">Mức xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono">{ev.month_year}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{ev.profile_name}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">{ev.student_id}</td>
                      <td className="px-3 py-2.5 text-slate-600">{ev.unit_name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{ev.position_title}</td>
                      <td className="px-3 py-2.5 text-center font-black text-[#005BAA]">
                        {ev.approved_grade || ev.proposed_grade || 'Chưa chấm'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Hồ sơ thiếu thông tin (LIVE MISSING DATA CHECK) */}
      {activeTab === 'missing' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Danh sách hồ sơ cần bổ sung dữ liệu</h3>
              <p className="text-xs text-slate-500">
                Các hồ sơ chưa hoàn thiện thông tin Đoàn - Đảng, nơi ở, số điện thoại hoặc trình độ LLCT
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
              {missingDataProfiles.length} hồ sơ cần kiểm tra
            </span>
          </div>

          {missingDataProfiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-200">
              Tất cả {profiles.length} hồ sơ cán bộ đều đã có đầy đủ thông tin chuẩn.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Mã CB</th>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">MSSV</th>
                    <th className="px-4 py-3">Đơn vị</th>
                    <th className="px-4 py-3">Thông tin còn thiếu</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {missingDataProfiles.map(({ profile, missing }) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        {profile.profile_code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{profile.full_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {profile.student_id || profile.staff_id}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {profile.roles[0]?.unit_name || 'Chưa phân công'}
                      </td>
                      <td className="px-4 py-3 text-amber-700 font-medium">{missing.join(', ')}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProfileId(profile.id);
                            setAdminTab('ho_so');
                          }}
                          className="px-2.5 py-1 rounded bg-blue-50 text-[#005BAA] font-semibold hover:bg-blue-100 cursor-pointer"
                        >
                          Bổ sung ngay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportsView;
