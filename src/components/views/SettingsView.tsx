'use client';

// ==============================================================================
// SETTINGS VIEW: CÀI ĐẶT HỆ THỐNG & CẤU HÌNH SUPABASE / ALLOWLIST
// ==============================================================================

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Settings, UserCheck, Database, ShieldCheck, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SettingsView() {
  const { currentMember, members, setCurrentMemberId } = useApp();

  const handleResetData = () => {
    if (confirm('Đồng chí có chắc chắn muốn khôi phục dữ liệu ban đầu không?')) {
      localStorage.removeItem('btv_tasks');
      localStorage.removeItem('btv_docs');
      localStorage.removeItem('btv_current_member_id');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Cài đặt Hệ thống</h2>
        <p className="text-xs text-muted-foreground">
          Cấu hình môi trường, xác thực Allowlist Google và kết nối Supabase
        </p>
      </div>

      {/* Bộ chuyển đổi tài khoản kiểm thử 9 người */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <UserCheck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Chuyển đổi Tài khoản BTV (Kiểm thử phân quyền 4 vai trò)</h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Đang đăng nhập với tư cách: <b className="text-primary">{currentMember.full_name}</b> ({currentMember.role})
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {members.map((m) => {
            const isSelected = m.id === currentMember.id;
            return (
              <button
                key={m.id}
                onClick={() => setCurrentMemberId(m.id)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 font-semibold text-primary shadow-xs'
                    : 'border-border hover:bg-muted text-foreground'
                }`}
              >
                <img src={m.avatar_url} alt={m.full_name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate font-bold">{m.full_name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{m.role.replace('_', ' ')}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thông tin kết nối Supabase */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-foreground">Cơ sở dữ liệu Supabase & Edge Function</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Trạng thái kết nối</span>
            <div className="font-bold flex items-center gap-2 text-foreground">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isSupabaseConfigured ? 'Đã kết nối Supabase Cloud' : 'Chế độ Demo Nội bộ (Offline Ready)'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Allowlist bảo mật</span>
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Chỉ 9 email @hcmute.edu.vn được truy cập</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-3.5 rounded-2xl border border-border">
          💡 <b>Hướng dẫn kết nối Supabase Production:</b> Thêm biến môi trường vào file <code>.env.local</code>:
          <pre className="mt-1.5 font-mono text-[10px] bg-secondary text-secondary-foreground p-2.5 rounded-xl overflow-x-auto border border-border">
            NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
          </pre>
          File migration đầy đủ đã được tạo sẵn tại <code className="text-primary font-semibold">supabase/migrations/20260921000000_init_schema.sql</code>.
        </div>
      </div>

      {/* Khôi phục dữ liệu mẫu */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">Khôi phục dữ liệu mẫu ban đầu</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Xóa bộ nhớ tạm và nạp lại toàn bộ công việc, văn bản mẫu gốc</p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Khôi phục mẫu</span>
        </button>
      </div>
    </div>
  );
}
