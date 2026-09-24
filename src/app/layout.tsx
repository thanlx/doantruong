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
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0056b3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('hcmute_theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
