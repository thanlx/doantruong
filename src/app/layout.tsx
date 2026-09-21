import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Hệ thống Quản lý Công việc BTV Đoàn trường - ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)',
  description: 'Nền tảng quản trị công việc, sổ văn bản đến và điều phối tiến độ chuyên biệt cho 9 đồng chí Ban Thường vụ Đoàn trường HCMUTE.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/huy-hieu-doan.png',
    apple: '/images/huy-hieu-doan.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0056b3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
