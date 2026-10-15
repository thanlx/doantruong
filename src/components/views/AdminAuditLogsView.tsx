'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Lock,
  ArrowRight,
  User,
  Tag,
  Building,
  ChevronRight,
} from 'lucide-react';
import { AuditLog } from '@/types';

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs, users, units } = useApp();

  const [actorFilter, setActorFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Selected log for the right panel (defaults to the first log)
  const [selectedLogId, setSelectedLogId] = useState<string>(auditLogs[0]?.id || '');

  const filteredLogs = auditLogs.filter((log) => {
    const actorCode = log.user_mssv || log.actor_code || '';
    const actorName = log.user_name || log.actor_name || '';
    const detailsText = log.details || log.description || '';
    const matchesActor = actorFilter === 'all' || actorCode === actorFilter;
    const matchesType = actionTypeFilter === 'all' || log.action_type === actionTypeFilter;
    const matchesUnit =
      unitFilter === 'all' ||
      detailsText.toLowerCase().includes(unitFilter.toLowerCase()) ||
      (log.target_name || '').toLowerCase().includes(unitFilter.toLowerCase());
    const matchesSearch =
      !searchText.trim() ||
      detailsText.toLowerCase().includes(searchText.toLowerCase()) ||
      actorName.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.target_id || '').toLowerCase().includes(searchText.toLowerCase());
    return matchesActor && matchesType && matchesUnit && matchesSearch;
  });

  const selectedLog: AuditLog | undefined =
    filteredLogs.find((l) => l.id === selectedLogId) || filteredLogs[0];

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'APPROVE':
      case 'duyet_ho_so':
        return 'Duyệt hồ sơ';
      case 'REJECT':
      case 'tra_lai_ho_so':
        return 'Trả lại hồ sơ';
      case 'CREATE':
      case 'gui_quyet_dinh':
      case 'tao_ho_so':
        return 'Ban hành / Tạo mới';
      case 'UPDATE':
      case 'sua_ho_so':
        return 'Cập nhật dữ liệu';
      case 'nhap_excel':
        return 'Nhập danh sách Excel';
      case 'doi_mat_khau':
        return 'Đổi mật khẩu';
      case 'EXPORT':
      case 'xuat_bao_cao':
        return 'Xuất báo cáo';
      case 'cong_bo_danh_gia':
        return 'Công bố đánh giá';
      case 'mo_lai_ky':
        return 'Mở lại kỳ đánh giá';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Nhật ký</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nhật ký hoạt động</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi lịch sử thao tác trực tuyến của toàn bộ tài khoản trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-blue-50 text-[#005BAA] border border-blue-200 font-semibold">
            Tổng số: {auditLogs.length} bản ghi
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          {/* Người thực hiện */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Người thực hiện</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50"
              >
                <option value="all">Tất cả người dùng</option>
                {users.map((u) => (
                  <option key={u.id} value={u.student_id}>
                    {u.full_name} ({u.student_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loại thao tác */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Loại thao tác</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50"
              >
                <option value="all">Tất cả thao tác</option>
                <option value="duyet_ho_so">Duyệt hồ sơ</option>
                <option value="gui_quyet_dinh">Ban hành quyết định</option>
                <option value="tao_ho_so">Tạo / Sửa hồ sơ</option>
                <option value="nhap_excel">Nhập Excel</option>
                <option value="doi_mat_khau">Đổi mật khẩu</option>
                <option value="xuat_bao_cao">Xuất báo cáo</option>
              </select>
            </div>
          </div>

          {/* Đơn vị */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50"
              >
                <option value="all">Tất cả đơn vị</option>
                {units.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Từ khóa */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tìm kiếm nội dung thao tác
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Nhập mã đối tượng, nội dung thay đổi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Table (7 cols) + Right Detail Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table 7 Cols */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Thao tác</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3">Kết quả</th>
                  <th className="px-4 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                      Không tìm thấy bản ghi nhật ký nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSelected = selectedLog?.id === log.id;
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          {log.timestamp || log.created_at}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-slate-900">
                            {log.user_name || log.actor_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {log.user_mssv || log.actor_code}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-800">
                          {log.action_label || getActionLabel(log.action_type)}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-medium text-slate-700">
                          {log.target_id}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                            Thành công
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <div className="flex items-center gap-1 text-xs text-slate-500 max-w-xs truncate">
                            <span className="truncate">{log.details || log.description}</span>
                            <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị 1–{filteredLogs.length} của {filteredLogs.length} bản ghi
            </span>
          </div>
        </div>

        {/* Right Panel: Lịch sử thay đổi (Chỉ đọc) */}
        {selectedLog && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Chi tiết bản ghi nhật ký</h3>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                Chỉ đọc (Bất biến)
              </span>
            </div>

            {/* Meta card */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Mã đối tượng:</span>
                <div className="text-right">
                  <div className="font-bold font-mono text-slate-900">{selectedLog.target_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {selectedLog.target_name || selectedLog.target_type}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-slate-500">Người thực hiện:</span>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">
                    {selectedLog.user_name || selectedLog.actor_name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedLog.user_mssv || selectedLog.actor_code}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian:</span>
                <span className="text-slate-800 font-medium">
                  {selectedLog.timestamp || selectedLog.created_at}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Thao tác:</span>
                <span className="text-slate-800 font-medium">
                  {selectedLog.action_label || getActionLabel(selectedLog.action_type)}
                </span>
              </div>

              {selectedLog.version_from && selectedLog.version_to && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Phiên bản:</span>
                  <span className="font-mono text-xs font-bold text-[#005BAA] bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                    {selectedLog.version_from} <ArrowRight className="w-3 h-3" />{' '}
                    {selectedLog.version_to}
                  </span>
                </div>
              )}
            </div>

            {/* Chi tiết thay đổi Table */}
            {selectedLog.field_changes && selectedLog.field_changes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Chi tiết thay đổi</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Trường dữ liệu</th>
                        <th className="px-3 py-2">Giá trị cũ</th>
                        <th className="px-3 py-2">Giá trị mới</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedLog.field_changes.map((fc, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-medium text-slate-800">{fc.field_name}</td>
                          <td className="px-3 py-2 text-slate-500">{fc.old_value}</td>
                          <td className="px-3 py-2 font-medium text-emerald-700 bg-emerald-50/40">
                            {fc.new_value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ghi chú */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1 font-semibold">Nội dung chi tiết:</span>
              <p className="text-slate-700 leading-relaxed">
                {selectedLog.details || selectedLog.description || selectedLog.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsView;
