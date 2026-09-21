// ==============================================================================
// LOGO HUY HIỆU ĐOÀN THANH NIÊN CỘNG SẢN HỒ CHÍ MINH
// Chuẩn nhận diện chính thức Đoàn TNCS Hồ Chí Minh
// ==============================================================================

import React from 'react';
import Image from 'next/image';

interface DoanLogoProps {
  size?: number;
  className?: string;
}

export default function DoanLogo({ size = 44, className = '' }: DoanLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: Math.round(size * 1.1) }}
    >
      <Image
        src="/images/huy-hieu-doan.png"
        alt="Huy hiệu Đoàn TNCS Hồ Chí Minh"
        width={120}
        height={132}
        priority
        className="w-full h-full object-contain filter drop-shadow-xs"
      />
    </div>
  );
}

