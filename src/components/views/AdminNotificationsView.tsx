'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  CheckCircle,
  FileText,
  Search,
  Info,
  X,
  Trash2,
} from 'lucide-react';

export const AdminNotificationsView: React.FC = () => {
  const {
    notifications,
    units,
    profiles,
    currentUser,
    addNotification,
    deleteNotification,
  } = useApp();

  const [title, setTitle] = useState('Nhắc hạn tự đánh giá tháng 10/2026');
  const [content, setContent] = useState(
    'Đề nghị các cán bộ hoàn thành Phiếu tự đánh giá tháng 10 trước ngày 25/10/2026. Đây là căn cứ để tổng hợp, đánh giá kết quả công tác trong tháng. Xin cảm ơn!'
  );
  const [category, setCategory] = useState<'danh_gia' | 'ho_so' | 'quyet_dinh' | 'he_thong'>('danh_gia');
  const [targetType, setTargetType] = useState<'unit' | 'all' | 'role'>('all');
  const [targetUnit, setTargetUnit] = useState(units[0]?.name || 'Đoàn trường');
  const [targetRole, setTargetRole] = useState('Tất cả chức vụ');
  const [linkedDoc, setLinkedDoc] = useState<string | null>('Phiếu tự đánh giá tháng 10');
  const [sendTimeMode, setSendTimeMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendNotification = () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    if (!channelInApp && !channelEmail) {
      alert('Vui lòng chọn ít nhất 1 kênh gửi thông báo.');
      return;
    }

    const targetScopeStr =
      targetType === 'all'
        ? `Toàn trường (${profiles.length} cán bộ)`
        : targetType === 'unit'
        ? `${targetUnit}`
        : `Nhóm chức vụ: ${targetRole}`;

    const channelVal =
      channelInApp && channelEmail ? 'both' : channelEmail ? 'email' : 'in_app';

    addNotification({
      title: title.trim(),
      content: content.trim(),
      category,
      sender_name: currentUser.full_name || 'Ban Tổ chức - Kiểm tra',
      target_scope: targetScopeStr,
      channel: channelVal,
      link_type: category === 'he_thong' ? undefined : category,
      link_label:
        category === 'danh_gia'
          ? 'Mở phiếu đánh giá'
          : category === 'ho_so'
          ? 'Xem hồ sơ của tôi'
          : category === 'quyet_dinh'
          ? 'Xem quyết định'
          : undefined,
    });

    setSuccessMsg(`Đã gửi thông báo "${title.trim()}" tới ${targetScopeStr} thành công!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteNotif = (id: string, notifTitle: string) => {
    if (!confirm(`Xóa thông báo "${notifTitle}" khỏi lịch sử?`)) return;
    deleteNotification(id);
    setSuccessMsg(`Đã xóa thông báo "${notifTitle}" khỏi lịch sử.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filteredNotifications = notifications.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-sm text-slate-500 mt-0.5">
            Tạo, gửi và theo dõi các thông báo đến toàn bộ cán bộ Đoàn – Hội.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
          <span>Tổng số đã gửi: <strong>{notifications.length}</strong></span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Section: Form on Left + Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Tạo thông báo mới
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
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
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Phân loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50/50"
              >
                <option value="danh_gia">Đánh giá định kỳ</option>
                <option value="quyet_dinh">Quyết định nhân sự</option>
                <option value="ho_so">Hồ sơ cán bộ</option>
                <option value="he_thong">Thông báo chung</option>
              </select>
            </div>
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
                <option value="all">Toàn trường</option>
                <option value="unit">Theo đơn vị</option>
                <option value="role">Theo chức vụ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Đơn vị
              </label>
              <select
                value={targetUnit}
                disabled={targetType !== 'unit'}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50/50 disabled:opacity-50"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Chức vụ
              </label>
              <select
                value={targetRole}
                disabled={targetType !== 'role'}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50/50 disabled:opacity-50"
              >
                <option value="Tất cả chức vụ">Tất cả chức vụ</option>
                <option value="Bí thư / Chủ nhiệm">Bí thư / Chủ nhiệm</option>
                <option value="Ủy viên BCH">Ủy viên BCH</option>
                <option value="Cán bộ cá nhân">Cán bộ cá nhân</option>
              </select>
            </div>
          </div>

          {/* Info pill */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 text-xs text-[#005BAA] flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Thông báo sẽ được gửi tức thời tới hộp thư thông báo của{' '}
              <strong>
                {targetType === 'all' ? `toàn bộ ${profiles.length} cán bộ` : targetType === 'unit' ? targetUnit : targetRole}
              </strong>.
            </span>
          </div>

          {/* Liên kết */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Liên kết đính kèm (tùy chọn)
            </label>
            {linkedDoc ? (
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                <FileText className="w-3.5 h-3.5 text-[#005BAA]" />
                <span>{linkedDoc}</span>
                <button
                  type="button"
                  onClick={() => setLinkedDoc(null)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLinkedDoc('Phiếu tự đánh giá tháng 10')}
                className="text-xs text-[#005BAA] hover:underline flex items-center gap-1 font-medium cursor-pointer"
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

          {/* Kênh gửi (ENABLED EMAIL CHECKBOX) */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Kênh gửi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5 cursor-pointer bg-slate-50/50 hover:border-[#005BAA]/40">
                <input
                  type="checkbox"
                  checked={channelInApp}
                  onChange={(e) => setChannelInApp(e.target.checked)}
                  className="mt-0.5 rounded text-[#005BAA]"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">Trong hệ thống (Web App)</div>
                  <div className="text-[11px] text-slate-500">
                    Thông báo hiển thị ngay tại chuông thông báo của người dùng.
                  </div>
                </div>
              </label>

              <label className="border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5 cursor-pointer bg-slate-50/50 hover:border-[#005BAA]/40">
                <input
                  type="checkbox"
                  checked={channelEmail}
                  onChange={(e) => setChannelEmail(e.target.checked)}
                  className="mt-0.5 rounded text-[#005BAA]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800">Email (@hcmute.edu.vn)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 font-semibold rounded">
                      Sẵn sàng
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Đồng thời gửi bản sao thông báo qua địa chỉ thư điện tử sinh viên.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setContent('');
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Xóa trắng
            </button>
            <button
              type="button"
              onClick={handleSendNotification}
              className="px-5 py-2 text-xs font-medium text-white bg-[#005BAA] hover:bg-[#004785] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi thông báo ngay
            </button>
          </div>
        </div>

        {/* Right Preview: 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Xem trước thông báo</h2>
            <p className="text-xs text-slate-500">Hiển thị như người dùng nhận được trong hệ thống.</p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-700">Thông báo mới</span>
              <span className="text-[#005BAA] font-medium">Đánh dấu đã đọc</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {title || 'Tiêu đề thông báo'}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">Vừa xong</span>
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
                {category === 'danh_gia'
                  ? 'Mở phiếu đánh giá'
                  : category === 'ho_so'
                  ? 'Xem hồ sơ'
                  : 'Xem chi tiết'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Lịch sử thông báo đã gửi (LIVE NOTIFICATIONS) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-sm">
            Lịch sử thông báo hệ thống ({filteredNotifications.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tiêu đề, nội dung..."
                className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 w-60 bg-slate-50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3">Tiêu đề & Nội dung</th>
                <th className="px-4 py-3">Đối tượng nhận</th>
                <th className="px-4 py-3">Kênh gửi</th>
                <th className="px-4 py-3">Thời gian gửi</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                    Chưa có thông báo nào trong lịch sử.
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-semibold text-slate-900 text-xs">{row.title}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{row.content}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {(row as any).target_scope ||
                        (row.target_type === 'all'
                          ? `Toàn trường (${profiles.length} cán bộ)`
                          : row.role_filter || 'Theo đơn vị')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {(row.channel as string) === 'both'
                        ? 'Hệ thống + Email'
                        : row.channel === 'email'
                        ? 'Email'
                        : 'Trong hệ thống'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{row.created_at}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        Đã gửi ({row.read_by_user_ids?.length || 1}/{profiles.length})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteNotif(row.id, row.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsView;
