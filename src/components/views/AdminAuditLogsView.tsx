'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Lock, 
  ArrowRight, 
  RotateCcw, 
  User, 
  Tag, 
  Building, 
  ChevronRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { AuditLog } from '@/types';

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs, users, units } = useApp();

  const [actorFilter, setActorFilter] = useState('all');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-13');

  // Selected log for the right panel (defaults to the first log)
  const [selectedLog, setSelectedLog] = useState<AuditLog>(auditLogs[0]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesActor = actorFilter === 'all' || log.actor_code === actorFilter;
    const matchesType = actionTypeFilter === 'all' || log.action_type === actionTypeFilter;
    return matchesActor && matchesType;
  });

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'APPROVE': return 'Duyệt hồ sơ';
      case 'REJECT': return 'Trả lại hồ sơ';
      case 'CREATE': return 'Gửi quyết định';
      case 'UPDATE': return 'Cập nhật thông tin';
      case 'EXPORT': return 'Xuất báo cáo';
      default: return type;
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
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi lịch sử thao tác của người dùng trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Dữ liệu minh họa
          </span>
        </div>
      </div>

      {/* Filter Bar (matching Image 1) */}
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
                <option value="23110001">Nguyễn Minh Anh (23110001)</option>
                <option value="23110002">Trần Hoàng Nam (23110002)</option>
                <option value="23110003">Lê Thu Hà (23110003)</option>
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
                <option value="all">Tất cả</option>
                <option value="APPROVE">Duyệt hồ sơ</option>
                <option value="CREATE">Gửi quyết định / Tạo mới</option>
                <option value="EXPORT">Xuất báo cáo</option>
                <option value="UPDATE">Cập nhật</option>
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
                <option value="Đoàn cơ sở">Đoàn cơ sở</option>
                <option value="Liên chi hội">Liên chi hội</option>
                <option value="CLB Truyền thông">CLB Truyền thông</option>
              </select>
            </div>
          </div>

          {/* Từ ngày */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Từ ngày</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Đến ngày & Nút tìm kiếm */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Đến ngày</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50/50"
                />
              </div>
            </div>
            <button
              onClick={() => {}}
              className="mt-5 flex items-center justify-center gap-1.5 bg-[#005BAA] hover:bg-[#004785] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Table (7 cols) + Right Detail Panel (5 cols) (Image 1) */}
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
                {filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {log.created_at}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-slate-900">{log.actor_name}</div>
                        <div className="text-[11px] text-slate-400">{log.actor_code}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-800">
                        {getActionLabel(log.action_type)}
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
                          <span className="truncate">{log.description}</span>
                          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hiển thị 1–{filteredLogs.length} của {filteredLogs.length} bản ghi</span>
            <div className="flex items-center gap-1">
              <button disabled className="px-2 py-1 border border-slate-200 rounded text-slate-400">&lt;</button>
              <button className="px-2.5 py-1 bg-[#005BAA] text-white rounded font-medium">1</button>
              <button disabled className="px-2 py-1 border border-slate-200 rounded text-slate-400">&gt;</button>
            </div>
          </div>
        </div>

        {/* Right Panel: Lịch sử thay đổi (Chỉ đọc) (Image 1) */}
        {selectedLog && (
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Lịch sử thay đổi</h3>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                Chỉ đọc
              </span>
            </div>

            {/* Meta card */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Đối tượng:</span>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{selectedLog.target_id}</div>
                  <div className="text-[11px] text-slate-400">Hồ sơ cán bộ</div>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-slate-500">Người thực hiện:</span>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{selectedLog.actor_name}</div>
                  <div className="text-[11px] text-slate-400">{selectedLog.actor_code}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian:</span>
                <span className="text-slate-800 font-medium">{selectedLog.created_at}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Thao tác:</span>
                <span className="text-slate-800 font-medium">{getActionLabel(selectedLog.action_type)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phiên bản:</span>
                <span className="font-mono text-xs font-bold text-[#005BAA] bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                  1.2 <ArrowRight className="w-3 h-3" /> 1.3
                </span>
              </div>
            </div>

            {/* Chi tiết thay đổi Table (Image 1) */}
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
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-800">Địa chỉ thường trú</td>
                      <td className="px-3 py-2 text-slate-500">TP. Hồ Chí Minh</td>
                      <td className="px-3 py-2 font-medium text-emerald-700 bg-emerald-50/40">
                        Phường Linh Xuân, TP. Hồ Chí Minh
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1 font-semibold">Ghi chú:</span>
              <p className="text-slate-700 leading-relaxed">
                {selectedLog.description || 'Phê duyệt cập nhật thông tin địa chỉ theo hồ sơ đề nghị của cán bộ.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsView;
