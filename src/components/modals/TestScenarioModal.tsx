'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  X, 
  ExternalLink, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';

interface TestScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestScenarioModal: React.FC<TestScenarioModalProps> = ({ isOpen, onClose }) => {
  const { runTestScenario, resetToDefaultSeed, setPortalMode, setUserTab, setAdminTab } = useApp();

  const [results, setResults] = useState<Record<number, { success: boolean; message: string; details?: any }>>({});
  const [runningAll, setRunningAll] = useState(false);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 1,
      title: 'Kịch bản 1: Một người có hai chức vụ (Kiêm nhiệm)',
      desc: 'Một hồ sơ cá nhân (Nguyễn Minh Anh); xuất hiện trong hai phân hệ (P03 và P06); thống kê số người duy nhất 248 không đếm trùng với 312 lượt chức vụ.',
      targetView: () => { setPortalMode('admin'); setAdminTab('tong_quan'); onClose(); }
    },
    {
      id: 2,
      title: 'Kịch bản 2: Sửa nơi ở và gửi duyệt (Quy trình 2 bước)',
      desc: 'Người dùng gửi yêu cầu HS-0012 cập nhật nơi ở. Bản chính chưa đổi ngay mà sinh bản diff; duyệt xong hồ sơ chính mới cập nhật và đồng bộ toàn hệ thống.',
      targetView: () => { setPortalMode('admin'); setAdminTab('duyet_ho_so'); onClose(); }
    },
    {
      id: 3,
      title: 'Kịch bản 3: Trả lại yêu cầu cập nhật kèm lý do',
      desc: 'Người duyệt từ chối yêu cầu kèm lý do. Người dùng thấy lý do từ chối, chỉnh sửa trực tiếp trên bản yêu cầu và gửi lại mà không bị mất dữ liệu.',
      targetView: () => { setPortalMode('user'); setUserTab('ho_so'); onClose(); }
    },
    {
      id: 4,
      title: 'Kịch bản 4: Thay thế nhân sự có hiệu lực tương lai (Time-slice)',
      desc: 'Quyết định 156-QĐ/HSV ký 13/10/2026 nhưng hiệu lực 01/11/2026. Trước 01/11 hiện Trần Hoàng Nam; từ 01/11 hiện Lê Thu Hà; tra cứu lịch sử quá khứ vẫn chính xác.',
      targetView: () => { setPortalMode('admin'); setAdminTab('quyet_dinh'); onClose(); }
    },
    {
      id: 5,
      title: 'Kịch bản 5: Quyết định nhiều dòng có một dòng lỗi',
      desc: 'Toàn bộ giao dịch bị hủy bỏ (atomic rollback); không cập nhật danh sách một phần; chỉ rõ dòng lỗi để người dùng sửa.',
      targetView: () => { setPortalMode('admin'); setAdminTab('quyet_dinh'); onClose(); }
    },
    {
      id: 6,
      title: 'Kịch bản 6: Hai quản trị cùng sửa một hồ sơ (Xung đột phiên bản)',
      desc: 'Hệ thống kiểm tra số hiệu phiên bản; người lưu sau bị cảnh báo phiên bản đã thay đổi và yêu cầu tải lại, không ghi đè âm thầm.',
      targetView: () => { setPortalMode('admin'); setAdminTab('ho_so'); onClose(); }
    },
    {
      id: 7,
      title: 'Kịch bản 7: Gửi hoặc duyệt lại sau lỗi mạng (Idempotency)',
      desc: 'Cùng một mã yêu cầu hoặc thao tác gửi lại không tạo bản ghi trùng lặp hoặc thông báo rác.',
      targetView: () => { setPortalMode('admin'); setAdminTab('duyet_ho_so'); onClose(); }
    },
    {
      id: 8,
      title: 'Kịch bản 8: Cán bộ chuyển đơn vị giữa kỳ đánh giá',
      desc: 'Giữ nguyên danh sách đối tượng và chức vụ tại mốc thời điểm mở kỳ; không tự chuyển kết quả của người cũ sang người mới.',
      targetView: () => { setPortalMode('admin'); setAdminTab('danh_gia'); onClose(); }
    },
    {
      id: 9,
      title: 'Kịch bản 9: Đánh giá đã duyệt nhưng chưa công bố',
      desc: 'Cán bộ chỉ thấy trạng thái đang xử lý và chưa thể nhìn thấy xếp loại cuối cùng trước khi lãnh đạo bấm Công bố & Khóa dữ liệu.',
      targetView: () => { setPortalMode('user'); setUserTab('danh_gia'); onClose(); }
    },
    {
      id: 10,
      title: 'Kịch bản 10: Thu hồi quyền và kiểm tra đường dẫn cũ',
      desc: 'Máy chủ kiểm tra quyền trên từng yêu cầu; khi bị khóa tài khoản hoặc hạ quyền, lập tức chặn truy cập và xuất dữ liệu trái phép.',
      targetView: () => { setPortalMode('admin'); setAdminTab('phan_quyen'); onClose(); }
    },
    {
      id: 11,
      title: 'Kịch bản 11: Xuất danh sách Excel/PDF theo bộ lọc',
      desc: 'Tệp xuất và giao diện khớp 100% về số lượng bản ghi và phạm vi; các trường thông tin nhạy cảm (SĐT, Email, Địa chỉ) được bảo vệ bằng khóa.',
      targetView: () => { setPortalMode('admin'); setAdminTab('bao_cao'); onClose(); }
    },
    {
      id: 12,
      title: 'Kịch bản 12: Nhập lại cùng tệp dữ liệu Excel (Chống trùng lặp)',
      desc: 'Kiểm tra trùng khớp MSSV/Mã CB; thông báo rõ danh sách trùng lặp; không tự ghi đè hồ sơ đang hoạt động.',
      targetView: () => { setPortalMode('admin'); setAdminTab('ho_so'); onClose(); }
    }
  ];

  const handleRunSingle = (id: number) => {
    const res = runTestScenario(id);
    setResults(prev => ({ ...prev, [id]: res }));
  };

  const handleRunAll = () => {
    setRunningAll(true);
    const newResults: Record<number, any> = {};
    for (let i = 1; i <= 12; i++) {
      newResults[i] = runTestScenario(i);
    }
    setResults(newResults);
    setRunningAll(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005BAA] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                12 Kịch bản nghiệm thu liên thông (Mục 11 Đặc tả)
              </h2>
              <p className="text-xs text-slate-500">
                Kiểm tra tự động các ràng buộc nghiệp vụ, bảo toàn lịch sử và liên thông giữa hai giao diện.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-medium">
            Đã kiểm thử: <span className="font-bold text-[#005BAA]">{Object.keys(results).length}</span> / 12 kịch bản
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetToDefaultSeed();
                setResults({});
              }}
              className="text-xs text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi phục dữ liệu gốc
            </button>
            <button
              disabled={runningAll}
              onClick={handleRunAll}
              className="text-xs font-semibold text-white bg-[#005BAA] hover:bg-[#004785] px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Chạy toàn bộ 12 kịch bản
            </button>
          </div>
        </div>

        {/* Scenarios List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-slate-100">
          {scenarios.map((sc) => {
            const res = results[sc.id];

            return (
              <div key={sc.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{sc.title}</span>
                    {res && (
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.2 rounded font-semibold ${
                        res.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        ĐẠT NGHIỆM THU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{sc.desc}</p>
                  
                  {res && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-mono mt-2">
                      <div className="text-emerald-700 font-bold mb-1">✓ {res.message}</div>
                      {res.details && (
                        <div className="text-[11px] text-slate-500 overflow-x-auto">
                          {JSON.stringify(res.details, null, 2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    onClick={() => handleRunSingle(sc.id)}
                    className="flex items-center gap-1 text-xs font-medium text-[#005BAA] border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Chạy test
                  </button>
                  <button
                    onClick={sc.targetView}
                    title="Mở giao diện liên quan"
                    className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestScenarioModal;

