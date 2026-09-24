'use client';

// ==============================================================================
// IOS GUIDE VIEW: HƯỚNG DẪN CÀI ĐẶT DÀNH CHO IPHONE (ADD TO HOME SCREEN & PUSH)
// Khắc phục rào cản kỹ thuật của iOS Safari theo yêu cầu bắt buộc Phần 0.2 & 4
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function IosGuideView() {
  const [isIosDevice, setIsIosDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>('default'); // 'default' | 'granted' | 'denied'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(userAgent);
      setIsIosDevice(isIos);

      // Kiểm tra xem đã chạy ở chế độ Standalone (Home Screen) chưa
      const isInStandaloneMode =
        ('standalone' in window.navigator && (window.navigator as any).standalone) ||
        window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(Boolean(isInStandaloneMode));

      if ('Notification' in window) {
        setPushStatus(Notification.permission);
      }
    }
  }, []);

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Trình duyệt này không hỗ trợ Web Push Notification.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission === 'granted') {
        new Notification('Đoàn trường HCMUTE', {
          body: 'Đã kích hoạt thành công thông báo đẩy nhắc việc!',
          icon: '/images/hcmute-campus.jpg',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      {/* Tiêu đề */}
      <div>
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-primary" />
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            Hướng dẫn cài đặt ứng dụng cho iPhone (iOS)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Quy trình bắt buộc của Apple để nhận thông báo đẩy Web Push nhắc việc tự động trên iOS
        </p>
      </div>

      {/* Trạng thái thiết bị */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Trạng thái thiết bị hiện tại:</span>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isStandalone
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {isStandalone ? '✓ Đã cài vào Home Screen' : '⚡ Đang mở trong Trình duyệt'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50 text-xs">
          <div>
            Thiết bị phát hiện:{' '}
            <b className="text-foreground">{isIosDevice ? 'Apple iOS (iPhone/iPad)' : 'Máy tính / Android'}</b>
          </div>
          <div>
            Quyền nhận thông báo:{' '}
            <b className={pushStatus === 'granted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {pushStatus === 'granted' ? 'Đã bật' : pushStatus === 'denied' ? 'Bị chặn' : 'Chưa bật'}
            </b>
          </div>
        </div>
      </div>

      {/* 3 BƯỚC CÀI ĐẶT CHI TIẾT KÈM HÌNH ẢNH MÔ TẢ */}
      <div className="space-y-4">
        {/* Bước 1 */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-xs flex items-start gap-4 text-card-foreground">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0">
            1
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Bấm nút Chia sẻ (Share) trên Safari</span>
              <Share className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mở liên kết hệ thống bằng trình duyệt <b>Safari</b> trên iPhone. Nhìn xuống thanh công cụ dưới đáy màn hình và bấm vào biểu tượng hình vuông có mũi tên trỏ lên (<b>Nút Chia sẻ</b>).
            </p>
          </div>
        </div>

        {/* Bước 2 */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-xs flex items-start gap-4 text-card-foreground">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0">
            2
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Chọn "Thêm vào Màn hình chính" (Add to Home Screen)</span>
              <PlusSquare className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cuộn menu chia sẻ xuống dưới, tìm và chọn dòng có dấu cộng: <b>"Thêm vào MH chính"</b> (hoặc <i>"Add to Home Screen"</i>). Sau đó bấm nút <b>Thêm</b> (Add) ở góc trên bên phải màn hình.
            </p>
          </div>
        </div>

        {/* Bước 3 */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-xs flex items-start gap-4 text-card-foreground">
          <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center shrink-0">
            3
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Mở app từ Màn hình chính và Bật thông báo</span>
              <Bell className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quay ra màn hình chính điện thoại, mở biểu tượng <b>Đoàn HCMUTE</b> vừa được tạo. Sau đó bấm vào nút bên dưới để cấp quyền nhận thông báo đẩy.
            </p>

            <div className="pt-2">
              <button
                onClick={requestPushPermission}
                className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <Bell className="w-4 h-4" />
                <span>Bật thông báo Web Push trên máy này</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lưu ý kỹ thuật của hệ thống */}
      <div className="bg-muted/40 rounded-3xl p-5 border border-border text-xs space-y-2 text-muted-foreground leading-relaxed">
        <h4 className="font-bold text-foreground flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Lưu ý kỹ thuật đặc thù cho BTV Đoàn trường:</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-[11px]">
          <li>
            <b>Nếu dùng trình duyệt khác (Chrome, Zalo):</b> Vui lòng sao chép link và dán sang <b>Safari</b> để có thể Thêm vào MH chính.
          </li>
          <li>
            <b>Kênh Email dự phòng:</b> Toàn bộ 9 đồng chí BTV đều được gửi song song qua Gmail trường khi đến hạn, quá hạn và leo thang.
          </li>
          <li>
            <b>Giờ yên tĩnh:</b> Hệ thống tự động dồn thông báo không khẩn cấp vào lúc 06:00 sáng, không làm phiền từ 22:00 đến 06:00.
          </li>
        </ul>
      </div>
    </div>
  );
}
