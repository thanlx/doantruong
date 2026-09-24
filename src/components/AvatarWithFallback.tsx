'use client';

// ==============================================================================
// AVATAR WITH RESILIENT FALLBACK: HANDLES BROKEN IMAGES & RENDERS INITIALS
// ==============================================================================

import React, { useState } from 'react';

interface AvatarWithFallbackProps {
  src?: string | null;
  name?: string;
  alt?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
}

const COLOR_PALETTE = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-cyan-600 text-white',
  'bg-purple-600 text-white',
  'bg-teal-600 text-white',
];

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'BTV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COLOR_PALETTE.length;
}

export default function AvatarWithFallback({
  src,
  name = 'BTV',
  alt,
  className = 'w-8 h-8 rounded-full',
  size = 'md',
}: AvatarWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const initials = getInitials(name);
  const colorClass = COLOR_PALETTE[getColorIndex(name)];

  // Nếu không có src hoặc src là file nội bộ không tồn tại (/avatars/...)
  const isInvalidInitialSrc = !src || src.startsWith('/avatars/');

  if (hasError || isInvalidInitialSrc) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold select-none shrink-0 rounded-full border border-border shadow-2xs ${colorClass} ${className}`}
        title={name}
        aria-label={alt || name}
      >
        <span className="text-[0.7em] leading-none">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      className={`object-cover shrink-0 rounded-full border border-border/80 shadow-2xs ${className}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
