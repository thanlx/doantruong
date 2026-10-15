'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Send, 
  Clock, 
  CheckCircle, 
  FileText, 
  Search, 
  Filter, 
  RotateCw, 
  MoreVertical, 
  Info, 
  X, 
  Check, 
  ExternalLink,
  Mail,
  AlertTriangle
} from 'lucide-react';

export const AdminNotificationsView: React.FC = () => {
  const { notifications, units, addNotification, addAuditLog } = useApp();

  const [title, setTitle] = useState('Nhắc hạn tự đánh giá tháng 10');
  const [content, setContent] = useState(
    'Đề nghị các cán bộ hoàn thành Phiếu tự đánh giá tháng 10 trước ngày 25/10/2026. Đây là căn cứ để tổng hợp, đánh giá kết quả công tác trong tháng. Xin cảm ơn!'
  );
  const [targetType, setTargetType] = useState<'unit' | 'all' | 'role'>('unit');
  const [targetUnit, setTargetUnit] = useState('Đoàn cơ sở');
  const [targetRole, setTargetRole] = useState('Cán bộ cá nhân');
  const [linkedDoc, setLinkedDoc] = useState<string | null>('Phiếu tự đánh giá tháng 10');
  const [sendTimeMode, setSendTimeMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('2026-10-13');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // History state
  const [sentHistory, setSentHistory] = useState([
    {
      id: '1',
      title: 'Nhắc hạn tự đánh giá tháng 10',
      target: 'Đoàn cơ sở (20 người)',
      channel: 'Trong hệ thống',
      sentAt: '13/10/2026 10:00',
      status: 'Đã gửi',
      readCount: '12/20'
    },
    {
      id: '2',
      title: 'Quyết định kiện toàn Ban chủ nhiệm CLB Truyền thông',
      target: 'CLB Truyền thông (15 người)',
      channel: 'Trong hệ thống',
      sentAt: '01/10/2026 09:30',
      status: 'Đã gửi',
      readCount: '15/15'
    },
    {
      id: '3',
      title: 'Kỳ đánh giá tháng 10/2026 đã chính thức mở',
      target: 'Toàn trường (248 cán bộ)',
      channel: 'Trong hệ thống',
      sentAt: '01/10/2026 08:00',
      status: 'Đã gửi',
      readCount: '210/248'
    }
  ]);

  const handleSendNotification = () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    addNotification({
      user_id: 'ALL',
      title: title.trim(),
      message: content.trim(),
      type: 'EVALUATION',
      action_link: '/evaluations'
    });

    const newRecord = {
      id: Date.now().toString(),
      title: title.trim(),
      target: targetType === 'unit' ? `${targetUnit} (20 người)` : 'Toàn trường (248 người)',
      channel: channelInApp ? 'Trong hệ thống' : 'Email',
      sentAt: '13/10/2026 10:00',
      status: 'Đã gửi',
      readCount: '0/20'
    };

    setSentHistory([newRecord, ...sentHistory]);

    addAuditLog({
      actor_name: 'Nguyễn Minh Anh',
      actor_code: '23110001',
      action_type: 'CREATE',
      target_type: 'NOTIFICATION',
      target_id: newRecord.id,
      result: 'SUCCESS',
      description: `Gửi thông báo: "${title}" tới ${newRecord.target}`,
      ip_address: '10.0.0.1'
    });

    setSuccessMsg('Gửi thông báo thành công!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Trang chủ</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">Thông báo</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý thông báo</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tạo, gửi và theo dõi các thông báo đến cán bộ Đoàn – Hội.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
          <span>Dữ liệu minh họa</span>
          <span className="text-slate-300">|</span>
          <span>Cập nhật: 13/10/2026</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Section: Form on Left + Live Preview on Right (Screen 14) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Tạo thông báo
          </h2>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{title.length}/120</span>
            </div>
            <input
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20 focus:border-[#005BAA]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">{content.length}/500</span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung chi tiết..."
              className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20 focus:border-[#005BAA]"
            />
          </div>

          {/* Row of 3 Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Đối tượng nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50/50"
              >
                <option value="unit">Theo đơn vị</option>
                <option value="all">Toàn trường</option>
                <option value="role">Theo chức vụ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50/50"
              >
                <option value="Đoàn cơ sở">Đoàn cơ sở</option>
                <option value="Hội Sinh viên trường">Hội Sinh viên trường</option>
                <option value="Liên chi hội">Liên chi hội</option>
                <option value="CLB Truyền thông">CLB Truyền thông</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Chức vụ
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50/50"
              >
                <option value="Cán bộ cá nhân">Cán bộ cá nhân</option>
                <option value="Ủy viên BCH">Ủy viên BCH</option>
                <option value="Chủ nhiệm">Chủ nhiệm</option>
                <option value="Tất cả chức vụ">Tất cả chức vụ</option>
              </select>
            </div>
          </div>

          {/* Info pill */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 text-xs text-[#005BAA] flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Tổng số người nhận: 20 người chưa gửi phiếu tự đánh giá.</span>
          </div>

          {/* Liên kết */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Liên kết (tùy chọn)
            </label>
            {linkedDoc ? (
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                <FileText className="w-3.5 h-3.5 text-[#005BAA]" />
                <span>{linkedDoc}</span>
                <button
                  type="button"
                  onClick={() => setLinkedDoc(null)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLinkedDoc('Phiếu tự đánh giá tháng 10')}
                className="text-xs text-[#005BAA] hover:underline flex items-center gap-1 font-medium"
              >
                + Đính kèm liên kết tác vụ
              </button>
            )}
          </div>

          {/* Thời gian gửi */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Thời gian gửi <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="sendTime"
                  checked={sendTimeMode === 'now'}
                  onChange={() => setSendTimeMode('now')}
                  className="text-[#005BAA]"
                />
                <span>Gửi ngay</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="radio"
                  name="sendTime"
                  checked={sendTimeMode === 'scheduled'}
                  onChange={() => setSendTimeMode('scheduled')}
                  className="text-[#005BAA]"
                />
                <span>Hẹn giờ</span>
              </label>

              {sendTimeMode === 'scheduled' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50"
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-slate-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Kênh gửi */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Kênh gửi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5 cursor-pointer bg-slate-50/50">
                <input
                  type="checkbox"
                  checked={channelInApp}
                  onChange={(e) => setChannelInApp(e.target.checked)}
                  className="mt-0.5 rounded text-[#005BAA]"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">Trong hệ thống</div>
                  <div className="text-[11px] text-slate-500">
                    Thông báo sẽ hiển thị trong trang người dùng.
                  </div>
                </div>
              </label>

              <div className="border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5 bg-slate-50/30 opacity-70">
                <input
                  type="checkbox"
                  disabled
                  checked={channelEmail}
                  className="mt-0.5 rounded text-slate-400"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">Email</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                      Chưa cấu hình
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Chưa cấu hình máy chủ email. Vui lòng liên hệ quản trị viên.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Xem trước
            </button>
            <button
              type="button"
              onClick={handleSendNotification}
              className="px-5 py-2 text-xs font-medium text-white bg-[#005BAA] hover:bg-[#004785] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi thông báo
            </button>
          </div>
        </div>

        {/* Right Preview: 5 cols (Screen 14) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Xem trước thông báo</h2>
            <p className="text-xs text-slate-500">Hiển thị như người dùng nhận được trong hệ thống.</p>
          </div>

          {/* Mock notification card matching user perspective */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Thông báo mới</span>
              <span className="text-[#005BAA] hover:underline cursor-pointer">Đánh dấu đã đọc</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {title || 'Tiêu đề thông báo'}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">13/10/2026 10:00</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-4">
                {content || 'Nội dung thông báo sẽ hiển thị ở đây...'}
              </p>

              {linkedDoc && (
                <div className="pl-4 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-[#005BAA] font-medium">
                    <FileText className="w-3.5 h-3.5 text-[#005BAA]" />
                    {linkedDoc}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="w-full py-2 bg-[#005BAA] text-white rounded-lg text-xs font-semibold hover:bg-[#004785] transition-colors"
              >
                Mở phiếu đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Lịch sử thông báo đã gửi (Screen 14) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-sm">Lịch sử thông báo đã gửi</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tiêu đề..."
                className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-48 bg-slate-50 focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" />
              Bộ lọc
            </button>
            <button className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg bg-white">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Đối tượng nhận</th>
                <th className="px-4 py-3">Kênh gửi</th>
                <th className="px-4 py-3">Ngày gửi ↓</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Đã đọc</th>
                <th className="px-4 py-3 text-center w-12">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sentHistory
                .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{row.title}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{row.target}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{row.channel}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{row.sentAt}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-700 font-medium">{row.readCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsView;
