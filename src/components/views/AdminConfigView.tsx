'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Save,
  AlertCircle,
  CheckCircle2,
  X,
  Edit3,
} from 'lucide-react';

export const AdminConfigView: React.FC = () => {
  const {
    systemConfig,
    setSystemConfig,
    currentUser,
    positions,
    units,
    addAuditLog,
    setAdminTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'workflow' | 'categories' | 'evaluations' | 'attachments' | 'notifications'
  >('workflow');

  // Local state for configuration
  const [preventSelfApprovalProfile, setPreventSelfApprovalProfile] = useState(
    Array.isArray(systemConfig.profile_approval)
      ? Boolean(systemConfig.profile_approval[0]?.prevent_self_approval)
      : Boolean((systemConfig.profile_approval as any)?.prevent_self_approval ?? true)
  );
  const [profileScope, setProfileScope] = useState('Đoàn cơ sở');
  const [profileApproverRole, setProfileApproverRole] = useState('Bí thư Đoàn cơ sở');

  const [preventSelfApprovalDecision, setPreventSelfApprovalDecision] = useState(
    Array.isArray(systemConfig.decision_approval)
      ? Boolean(systemConfig.decision_approval[0]?.prevent_self_approval)
      : Boolean((systemConfig.decision_approval as any)?.prevent_self_approval ?? true)
  );
  const [decisionScope, setDecisionScope] = useState('Hội Sinh viên trường');
  const [decisionApproverRole, setDecisionApproverRole] = useState(
    'Chủ tịch Hội Sinh viên trường'
  );

  const [maxFileSize, setMaxFileSize] = useState(
    systemConfig.attachments?.max_size_mb || systemConfig.max_file_size_mb || 10
  );
  const [allowedTypes, setAllowedTypes] = useState(
    (
      systemConfig.attachments?.allowed_extensions ||
      systemConfig.allowed_file_formats || ['PDF', 'XLSX', 'DOCX', 'PNG', 'JPG']
    ).join(', ')
  );

  // Evaluation criteria state
  const [criteriaVersion, setCriteriaVersion] = useState(
    systemConfig.evaluation_criteria?.version || '1.0'
  );
  const [criteriaStatus, setCriteriaStatus] = useState<'pending' | 'approved'>(
    systemConfig.evaluation_criteria?.status || 'approved'
  );
  const [rulesA, setRulesA] = useState(
    systemConfig.evaluation_criteria?.rules_a ||
      'Hoàn thành xuất sắc 100% nhiệm vụ, có sáng kiến cải tiến hiệu quả hoạt động Đoàn - Hội.'
  );
  const [rulesB, setRulesB] = useState(
    systemConfig.evaluation_criteria?.rules_b ||
      'Hoàn thành đầy đủ các nhiệm vụ được giao đúng hạn, tham gia tích cực sinh hoạt định kỳ.'
  );
  const [rulesC, setRulesC] = useState(
    systemConfig.evaluation_criteria?.rules_c ||
      'Cơ bản hoàn thành nhiệm vụ được phân công nhưng còn trễ hạn hoặc cần nhắc nhở.'
  );
  const [rulesD, setRulesD] = useState(
    systemConfig.evaluation_criteria?.rules_d ||
      'Bỏ bê nhiệm vụ, vắng họp không lý do quá quy định hoặc vi phạm kỷ luật.'
  );

  // Notification channels config
  const [enableInAppNotif, setEnableInAppNotif] = useState(true);
  const [enableEmailNotif, setEnableEmailNotif] = useState(true);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');

  // Criteria Modal
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = () => {
    const extensions = allowedTypes
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const updated = {
      ...systemConfig,
      max_file_size_mb: maxFileSize,
      allowed_file_formats: extensions,
      profile_approval: Array.isArray(systemConfig.profile_approval)
        ? systemConfig.profile_approval.map((w: any) => ({
            ...w,
            prevent_self_approval: preventSelfApprovalProfile,
          }))
        : {
            ...(systemConfig.profile_approval as any),
            prevent_self_approval: preventSelfApprovalProfile,
          },
      decision_approval: Array.isArray(systemConfig.decision_approval)
        ? systemConfig.decision_approval.map((w: any) => ({
            ...w,
            prevent_self_approval: preventSelfApprovalDecision,
          }))
        : {
            ...(systemConfig.decision_approval as any),
            prevent_self_approval: preventSelfApprovalDecision,
          },
      evaluation_criteria: {
        version: criteriaVersion,
        status: criteriaStatus,
        created_date:
          systemConfig.evaluation_criteria?.created_date ||
          new Date().toLocaleDateString('vi-VN'),
        author_name: currentUser.full_name,
        author_mssv: currentUser.student_id,
        rules_a: rulesA,
        rules_b: rulesB,
        rules_c: rulesC,
        rules_d: rulesD,
      },
      attachments: {
        max_size_mb: maxFileSize,
        allowed_extensions: extensions,
      },
    };
    setSystemConfig(updated as any);

    addAuditLog({
      actor_name: currentUser.full_name,
      actor_code: currentUser.student_id,
      action_type: 'UPDATE',
      target_type: 'SYSTEM_CONFIG',
      target_id: 'GLOBAL-CONFIG',
      result: 'SUCCESS',
      description:
        'Cập nhật cấu hình hệ thống: Quy trình duyệt, tiêu chí A/B/C/D, giới hạn tệp và thông báo',
    });

    setSavedSuccess(true);
    setIsCriteriaModalOpen(false);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Thiết lập quy trình phê duyệt, bộ tiêu chí đánh giá A/B/C/D, giới hạn tệp đính kèm và kênh thông báo
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã lưu toàn bộ cấu hình hệ thống thành công!</span>
        </div>
      )}

      {/* 5 Tabs */}
      <div className="border-b border-slate-200 flex gap-8 text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
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
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
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
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'evaluations'
              ? 'text-[#005BAA] font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bộ tiêu chí Đánh giá
          {activeTab === 'evaluations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#005BAA]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
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
          className={`pb-3 relative transition-colors cursor-pointer whitespace-nowrap ${
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

      {/* Tab: Quy trình duyệt */}
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
                      <option value="Chủ tịch Hội Sinh viên trường">
                        Chủ tịch Hội Sinh viên trường
                      </option>
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
                      <option value="Chủ tịch Hội Sinh viên trường">
                        Chủ tịch Hội Sinh viên trường
                      </option>
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

            {/* Right 4 Cols: Bộ tiêu chí đánh giá Card */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Bộ tiêu chí đánh giá</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Phiên bản hiện tại</span>
                  <span className="font-semibold text-slate-900">v{criteriaVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Trạng thái</span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      criteriaStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {criteriaStatus === 'approved' ? 'Đang áp dụng' : 'Chờ phê duyệt'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ngày cập nhật</span>
                  <span className="font-medium text-slate-800">
                    {systemConfig.evaluation_criteria?.created_date || '01/10/2026'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Người thiết lập</span>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">{currentUser.full_name}</div>
                    <div className="text-[11px] text-slate-400">{currentUser.student_id}</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCriteriaModalOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-[#005BAA] border border-[#005BAA] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Thiết lập tiêu chí A B C D</span>
              </button>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Thiết lập, chỉnh sửa nội dung các tiêu chí xếp loại A, B, C, D hằng tháng cho cán bộ Đoàn – Hội.
              </p>
            </div>
          </div>

          {/* Bottom Card: Giới hạn tệp & Định dạng cho phép */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Giới hạn tệp & Định dạng đính kèm cho phép
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Giới hạn kích thước tệp đính kèm (MB)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Thiết lập dung lượng tối đa cho mỗi tệp khi người dùng tải lên.
                </p>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    className="w-24 text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-center font-bold bg-slate-50"
                  />
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                    MB
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Định dạng tệp cho phép (ngăn cách bởi dấu phẩy)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Các định dạng khác ngoài danh sách này sẽ bị từ chối khi tải lên.
                </p>
                <input
                  type="text"
                  value={allowedTypes}
                  onChange={(e) => setAllowedTypes(e.target.value)}
                  className="w-full text-sm font-mono font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Danh mục */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Quản lý danh mục dùng chung</h3>
              <p className="text-xs text-slate-500">
                Cấu hình 7 phân hệ nhân sự (P01 - P07), danh mục đơn vị ({units.length}), chức danh ({positions.length}) và trình độ lý luận chính trị.
              </p>
            </div>
            <button
              onClick={() => setAdminTab('to_chuc')}
              className="px-4 py-2 rounded-lg bg-[#005BAA] text-white text-xs font-semibold hover:bg-[#004785] cursor-pointer"
            >
              Mở quản lý Đơn vị & Chức danh &gt;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900">7 Phân hệ nhân sự</h4>
              <p className="text-xs text-slate-500 mt-1">
                P01 (BCH Đoàn trường) đến P07 (Bí thư chi đoàn)
              </p>
              <span className="inline-block mt-3 text-xs text-[#005BAA] font-semibold">
                Đang áp dụng ({units.length} đơn vị trực thuộc)
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900">Danh mục chức danh</h4>
              <p className="text-xs text-slate-500 mt-1">
                Phân biệt Ban điều hành (Đoàn) và Ban chủ nhiệm (Hội)
              </p>
              <span className="inline-block mt-3 text-xs text-[#005BAA] font-semibold">
                {positions.length} chức danh chuẩn hóa
              </span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-900">Trình độ LLCT</h4>
              <p className="text-xs text-slate-500 mt-1">
                Chưa có, Sơ cấp, Trung cấp, Cao cấp
              </p>
              <span className="inline-block mt-3 text-xs text-[#005BAA] font-semibold">
                4 bậc chuẩn quy định
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Bộ tiêu chí Đánh giá (EDITABLE INLINE) */}
      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thiết lập chi tiết Bộ tiêu chí đánh giá A, B, C, D
              </h3>
              <p className="text-xs text-slate-500">
                Chỉnh sửa trực tiếp nội dung tiêu chuẩn cho từng mức xếp loại hằng tháng.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div>
                <label className="text-slate-500 mr-1.5">Phiên bản:</label>
                <input
                  type="text"
                  value={criteriaVersion}
                  onChange={(e) => setCriteriaVersion(e.target.value)}
                  className="w-16 border border-slate-200 rounded px-2 py-1 font-bold text-center"
                />
              </div>
              <select
                value={criteriaStatus}
                onChange={(e) => setCriteriaStatus(e.target.value as any)}
                className="border border-slate-200 rounded px-2.5 py-1 font-semibold"
              >
                <option value="approved">Đang áp dụng</option>
                <option value="pending_approval">Chờ phê duyệt</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 border rounded-xl bg-emerald-50/40 border-emerald-200 space-y-1.5">
              <label className="font-bold text-emerald-900 block">
                Mức A – Hoàn thành xuất sắc nhiệm vụ
              </label>
              <textarea
                rows={2}
                value={rulesA}
                onChange={(e) => setRulesA(e.target.value)}
                className="w-full rounded-lg border border-emerald-200 bg-white p-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-4 border rounded-xl bg-blue-50/40 border-blue-200 space-y-1.5">
              <label className="font-bold text-[#005BAA] block">
                Mức B – Hoàn thành tốt nhiệm vụ
              </label>
              <textarea
                rows={2}
                value={rulesB}
                onChange={(e) => setRulesB(e.target.value)}
                className="w-full rounded-lg border border-blue-200 bg-white p-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-4 border rounded-xl bg-amber-50/40 border-amber-200 space-y-1.5">
              <label className="font-bold text-amber-900 block">
                Mức C – Hoàn thành nhiệm vụ
              </label>
              <textarea
                rows={2}
                value={rulesC}
                onChange={(e) => setRulesC(e.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-white p-2.5 text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-4 border rounded-xl bg-red-50/40 border-red-200 space-y-1.5">
              <label className="font-bold text-red-900 block">
                Mức D – Chưa hoàn thành nhiệm vụ
              </label>
              <textarea
                rows={2}
                value={rulesD}
                onChange={(e) => setRulesD(e.target.value)}
                className="w-full rounded-lg border border-red-200 bg-white p-2.5 text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tệp đính kèm */}
      {activeTab === 'attachments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Thiết lập lưu trữ tệp đính kèm</h3>
          <p className="text-xs text-slate-500">
            Kích thước tối đa, định dạng hợp lệ và thư mục lưu trữ minh chứng / quyết định.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-2xl text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Dung lượng tối đa mỗi tệp (MB)
              </label>
              <input
                type="number"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Định dạng cho phép
              </label>
              <input
                type="text"
                value={allowedTypes}
                onChange={(e) => setAllowedTypes(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono uppercase"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Thông báo */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Cấu hình kênh thông báo</h3>
          <p className="text-xs text-slate-500">
            Kênh thông báo nội bộ Web App và cấu hình máy chủ gửi Email (@hcmute.edu.vn).
          </p>
          <div className="space-y-3 max-w-md text-xs">
            <label className="flex justify-between items-center p-3 border rounded-lg cursor-pointer">
              <span className="font-semibold text-slate-800">Thông báo nội bộ Web App</span>
              <input
                type="checkbox"
                checked={enableInAppNotif}
                onChange={(e) => setEnableInAppNotif(e.target.checked)}
                className="rounded text-[#005BAA]"
              />
            </label>
            <label className="flex justify-between items-center p-3 border rounded-lg cursor-pointer">
              <span className="font-semibold text-slate-800">Gửi thông báo qua Email</span>
              <input
                type="checkbox"
                checked={enableEmailNotif}
                onChange={(e) => setEnableEmailNotif(e.target.checked)}
                className="rounded text-[#005BAA]"
              />
            </label>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Máy chủ SMTP</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THIẾT LẬP TIÊU CHÍ A B C D */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Thiết lập Bộ tiêu chí đánh giá A, B, C, D
                </h3>
                <p className="text-xs text-slate-500">
                  Áp dụng cho kỳ đánh giá hằng tháng của cán bộ Đoàn – Hội
                </p>
              </div>
              <button
                onClick={() => setIsCriteriaModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phiên bản bộ tiêu chí</label>
                <input
                  type="text"
                  value={criteriaVersion}
                  onChange={(e) => setCriteriaVersion(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng thái áp dụng</label>
                <select
                  value={criteriaStatus}
                  onChange={(e) => setCriteriaStatus(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-semibold"
                >
                  <option value="approved">Đang áp dụng chính thức</option>
                  <option value="pending_approval">Bản dự thảo / Chờ phê duyệt</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 text-xs max-h-[340px] overflow-y-auto pr-1">
              <div>
                <label className="font-bold text-emerald-800 block mb-1">
                  Tiêu chuẩn Mức A (Hoàn thành xuất sắc)
                </label>
                <textarea
                  rows={2}
                  value={rulesA}
                  onChange={(e) => setRulesA(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
              <div>
                <label className="font-bold text-[#005BAA] block mb-1">
                  Tiêu chuẩn Mức B (Hoàn thành tốt)
                </label>
                <textarea
                  rows={2}
                  value={rulesB}
                  onChange={(e) => setRulesB(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
              <div>
                <label className="font-bold text-amber-800 block mb-1">
                  Tiêu chuẩn Mức C (Hoàn thành)
                </label>
                <textarea
                  rows={2}
                  value={rulesC}
                  onChange={(e) => setRulesC(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
              <div>
                <label className="font-bold text-red-800 block mb-1">
                  Tiêu chuẩn Mức D (Không hoàn thành)
                </label>
                <textarea
                  rows={2}
                  value={rulesD}
                  onChange={(e) => setRulesD(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCriteriaModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-lg bg-[#005BAA] text-white text-xs font-semibold hover:bg-[#004785] cursor-pointer"
              >
                Lưu bộ tiêu chí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Lưu ý:</strong> Việc thay đổi cấu hình hệ thống không làm thay đổi dữ liệu đánh giá đã khóa của các kỳ trước.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveConfig}
            className="flex items-center gap-2 bg-[#005BAA] hover:bg-[#004785] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer"
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
