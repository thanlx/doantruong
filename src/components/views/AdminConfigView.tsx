'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Settings, 
  ShieldCheck, 
  FileText, 
  Paperclip, 
  Bell, 
  Sliders, 
  Save, 
  AlertCircle, 
  Check, 
  Info,
  CheckCircle2,
  FolderTree,
  Award
} from 'lucide-react';

export const AdminConfigView: React.FC = () => {
  const { systemConfig, setSystemConfig, addAuditLog } = useApp();

  const [activeTab, setActiveTab] = useState<'workflow' | 'categories' | 'evaluations' | 'attachments' | 'notifications'>('workflow');

  // Local state for configuration
  const [preventSelfApprovalProfile, setPreventSelfApprovalProfile] = useState(
    Array.isArray(systemConfig.profile_approval)
      ? Boolean(systemConfig.profile_approval[0]?.prevent_self_approval)
      : Boolean(systemConfig.profile_approval?.prevent_self_approval)
  );
  const [profileScope, setProfileScope] = useState('Đoàn cơ sở');
  const [profileApproverRole, setProfileApproverRole] = useState('Bí thư Đoàn cơ sở');

  const [preventSelfApprovalDecision, setPreventSelfApprovalDecision] = useState(
    Array.isArray(systemConfig.decision_approval)
      ? Boolean(systemConfig.decision_approval[0]?.prevent_self_approval)
      : Boolean(systemConfig.decision_approval?.prevent_self_approval)
  );
  const [decisionScope, setDecisionScope] = useState('Hội Sinh viên trường');
  const [decisionApproverRole, setDecisionApproverRole] = useState('Chủ tịch Hội Sinh viên trường');

  const [maxFileSize, setMaxFileSize] = useState(
    systemConfig.attachments?.max_size_mb || systemConfig.max_file_size_mb || 10
  );
  const [allowedTypes, setAllowedTypes] = useState(
    (systemConfig.attachments?.allowed_extensions || systemConfig.allowed_file_formats || ['PDF', 'XLSX', 'DOCX']).join(', ')
  );
  const [criteriaVersion, setCriteriaVersion] = useState('1.0');
  const [criteriaStatus, setCriteriaStatus] = useState<'draft' | 'pending' | 'active'>('pending');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = () => {
    const updated = {
      ...systemConfig,
      max_file_size_mb: maxFileSize,
      allowed_file_formats: allowedTypes.split(',').map(s => s.trim().toUpperCase()),
      profile_approval: Array.isArray(systemConfig.profile_approval)
        ? systemConfig.profile_approval.map((w: any) => ({ ...w, prevent_self_approval: preventSelfApprovalProfile }))
        : { ...systemConfig.profile_approval, prevent_self_approval: preventSelfApprovalProfile },
      decision_approval: Array.isArray(systemConfig.decision_approval)
        ? systemConfig.decision_approval.map((w: any) => ({ ...w, prevent_self_approval: preventSelfApprovalDecision }))
        : { ...systemConfig.decision_approval, prevent_self_approval: preventSelfApprovalDecision },
      attachments: {
        max_size_mb: maxFileSize,
        allowed_extensions: allowedTypes.split(',').map(s => s.trim().toUpperCase())
      }
    };
    setSystemConfig(updated);

    addAuditLog({
      actor_name: 'Nguyễn Minh Anh',
      actor_code: '23110001',
      action_type: 'UPDATE',
      target_type: 'SYSTEM_CONFIG',
      target_id: 'GLOBAL-CONFIG',
      result: 'SUCCESS',
      description: 'Cập nhật cấu hình hệ thống: Quy trình duyệt, giới hạn tệp và phân quyền',
      ip_address: '10.0.0.1'
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu hình hệ thống</h1>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã lưu toàn bộ cấu hình hệ thống thành công!</span>
        </div>
      )}

      {/* 5 Tabs matching Screen 19 */}
      <div className="border-b border-slate-200 flex gap-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'categories'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Danh mục
          {activeTab === 'categories' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'workflow'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Quy trình duyệt
          {activeTab === 'workflow' && (
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
          onClick={() => setActiveTab('attachments')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'attachments'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tệp đính kèm
          {activeTab === 'attachments' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'notifications'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Thông báo
          {activeTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
      </div>

      {/* Tab: Quy trình duyệt (matching Image 3) */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: 2 Cards for Profile Approval & Decision Approval */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Duyệt cập nhật hồ sơ */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Duyệt cập nhật hồ sơ</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thiết lập quy trình duyệt các yêu cầu cập nhật thông tin hồ sơ cán bộ.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phạm vi áp dụng
                    </label>
                    <select
                      value={profileScope}
                      onChange={(e) => setProfileScope(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20"
                    >
                      <option value="Đoàn cơ sở">Đoàn cơ sở</option>
                      <option value="Toàn trường">Toàn trường</option>
                      <option value="Liên chi hội">Liên chi hội</option>
                      <option value="CLB Đội Nhóm">CLB Đội Nhóm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người duyệt nghiệp vụ
                    </label>
                    <select
                      value={profileApproverRole}
                      onChange={(e) => setProfileApproverRole(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20"
                    >
                      <option value="Bí thư Đoàn cơ sở">Bí thư Đoàn cơ sở</option>
                      <option value="Bí thư Đoàn trường">Bí thư Đoàn trường</option>
                      <option value="Chủ tịch Hội Sinh viên trường">Chủ tịch Hội Sinh viên trường</option>
                      <option value="Quản lý đơn vị">Quản lý đơn vị</option>
                    </select>
                  </div>
                </div>

                {/* Switch toggle: Không tự duyệt yêu cầu của mình */}
                <div className="pt-2 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setPreventSelfApprovalProfile(!preventSelfApprovalProfile)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preventSelfApprovalProfile ? 'bg-[#005BAA]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preventSelfApprovalProfile ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Không tự duyệt yêu cầu của mình
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Người tạo yêu cầu sẽ không nằm trong danh sách người duyệt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Duyệt quyết định nhân sự */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Duyệt quyết định nhân sự</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thiết lập quy trình duyệt các quyết định nhân sự (bổ nhiệm, miễn nhiệm, điều động, ...).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phạm vi áp dụng
                    </label>
                    <select
                      value={decisionScope}
                      onChange={(e) => setDecisionScope(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20"
                    >
                      <option value="Hội Sinh viên trường">Hội Sinh viên trường</option>
                      <option value="Toàn trường">Toàn trường</option>
                      <option value="Đoàn trường">Đoàn trường</option>
                      <option value="Đoàn cơ sở">Đoàn cơ sở</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Người duyệt nghiệp vụ
                    </label>
                    <select
                      value={decisionApproverRole}
                      onChange={(e) => setDecisionApproverRole(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#005BAA]/20"
                    >
                      <option value="Chủ tịch Hội Sinh viên trường">Chủ tịch Hội Sinh viên trường</option>
                      <option value="Bí thư Đoàn trường">Bí thư Đoàn trường</option>
                      <option value="Bí thư Đoàn cơ sở">Bí thư Đoàn cơ sở</option>
                    </select>
                  </div>
                </div>

                {/* Switch toggle: Không tự duyệt yêu cầu của mình */}
                <div className="pt-2 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setPreventSelfApprovalDecision(!preventSelfApprovalDecision)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preventSelfApprovalDecision ? 'bg-[#005BAA]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preventSelfApprovalDecision ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Không tự duyệt yêu cầu của mình
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Người tạo yêu cầu sẽ không nằm trong danh sách người duyệt.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Bộ tiêu chí đánh giá Card (Image 3) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Bộ tiêu chí đánh giá</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Phiên bản hiện tại</span>
                  <span className="font-semibold text-slate-900">{criteriaVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                    Chờ phê duyệt
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ngày tạo</span>
                  <span className="font-medium text-slate-800">01/10/2026</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Người tạo</span>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">Nguyễn Minh Anh</div>
                    <div className="text-[11px] text-slate-400">MSSV 23110001</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Mở bảng thiết lập chi tiết tiêu chí đánh giá A, B, C, D')}
                className="w-full py-2.5 px-4 text-xs font-bold text-[#005BAA] border border-[#005BAA] rounded-lg hover:bg-blue-50 transition-colors"
              >
                Thiết lập tiêu chí A B C D
              </button>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Thiết lập, chỉnh sửa các tiêu chí đánh giá hằng tháng cho cán bộ Đoàn – Hội.
              </p>
            </div>
          </div>

          {/* Bottom Card: Giới hạn tệp & Định dạng cho phép (Image 3) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex gap-4 border-b border-slate-200 text-xs font-semibold pb-2">
              <span className="text-[#005BAA] border-b-2 border-[#005BAA] pb-2 -mb-2.5">
                Giới hạn tệp
              </span>
              <span className="text-slate-500 cursor-pointer">Định dạng cho phép</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Giới hạn kích thước tệp đính kèm
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Thiết lập dung lượng tối đa cho mỗi tệp khi người dùng tải lên.
                </p>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    className="w-24 text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-center font-bold bg-slate-50"
                  />
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                    MB
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-900 mb-1">Định dạng tệp cho phép</div>
                <div className="text-sm font-mono font-bold text-slate-800 tracking-wider">
                  {allowedTypes}
                </div>
                <div className="text-xs text-slate-500 mt-1">Các định dạng khác sẽ bị từ chối.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Danh mục */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Quản lý danh mục dùng chung</h3>
          <p className="text-xs text-slate-500">
            Cấu hình 7 phân hệ nhân sự (P01 - P07), danh mục chức danh, trình độ lý luận chính trị và nhiệm kỳ.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900">7 Phân hệ nhân sự</h4>
              <p className="text-xs text-slate-500 mt-1">P01 (BCH Đoàn trường) đến P07 (Bí thư chi đoàn)</p>
              <span className="inline-block mt-3 text-xs text-[#005BAA] font-semibold">Đang áp dụng (7 phân hệ)</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900">Danh mục chức danh</h4>
              <p className="text-xs text-slate-500 mt-1">Phân biệt Ban điều hành và Ban chủ nhiệm</p>
              <span className="inline-block mt-3 text-xs text-[#005BAA] font-semibold">18 chức danh chuẩn hóa</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900">Trình độ LLCT</h4>
              <p className="text-xs text-slate-500 mt-1">Sơ cấp, Trung cấp, Cao cấp, Cử nhân</p>
              <span className="inline-block mt-3 text-xs text-[#005BAA] font-semibold">4 bậc chuẩn quy định</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Đánh giá */}
      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Cấu hình thang điểm và tiêu chí đánh giá</h3>
          <p className="text-xs text-slate-500">
            Quy tắc phân loại A, B, C, D và giới hạn tỷ lệ xuất sắc (tối đa 20% mức A theo quy chế).
          </p>
          <div className="space-y-3 max-w-xl text-xs">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50/50 border-emerald-100">
              <span className="font-bold text-emerald-800">Mức A - Hoàn thành xuất sắc nhiệm vụ</span>
              <span className="text-slate-600">Khống chế tối đa 20%</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 border-blue-100">
              <span className="font-bold text-[#005BAA]">Mức B - Hoàn thành tốt nhiệm vụ</span>
              <span className="text-slate-600">Không giới hạn</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50 border-amber-100">
              <span className="font-bold text-amber-800">Mức C - Hoàn thành nhiệm vụ</span>
              <span className="text-slate-600">Không giới hạn</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50/50 border-red-100">
              <span className="font-bold text-red-800">Mức D - Chưa hoàn thành nhiệm vụ</span>
              <span className="text-slate-600">Không giới hạn</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tệp đính kèm */}
      {activeTab === 'attachments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Thiết lập lưu trữ tệp</h3>
          <p className="text-xs text-slate-500">Kích thước tối đa, mã hóa dữ liệu và quyền truy cập theo đối tượng chứa tệp.</p>
          <div className="text-xs text-slate-600 space-y-2">
            <div>• Kích thước tối đa mỗi tệp: <strong>{maxFileSize} MB</strong></div>
            <div>• Định dạng được chấp thuận: <strong>{allowedTypes}</strong></div>
            <div>• Thư mục lưu trữ: <code>/storage/decisions</code> và <code>/storage/evaluations</code></div>
          </div>
        </div>
      )}

      {/* Tab: Thông báo */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Cấu hình kênh thông báo</h3>
          <p className="text-xs text-slate-500">Kênh nội bộ hệ thống và cấu hình máy chủ gửi Email SMTP.</p>
          <div className="space-y-3 max-w-md text-xs">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span>Thông báo nội bộ Web App</span>
              <span className="text-emerald-600 font-bold">Đang bật</span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span>Gửi thông báo qua Email</span>
              <span className="text-slate-400 font-medium">Chưa cấu hình SMTP</span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar (Image 3) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Lưu ý:</strong> Việc thay đổi cấu hình hệ thống không làm thay đổi dữ liệu đánh giá đã khóa của các kỳ trước.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Dữ liệu minh họa</span>
          <button
            type="button"
            onClick={handleSaveConfig}
            className="flex items-center gap-2 bg-[#005BAA] hover:bg-[#004785] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigView;
