'use client';

// ==============================================================================
// AVATAR PICKER MODAL: THAY ĐỔI ẢNH ĐẠI DIỆN BTV ĐOÀN TRƯỜNG HCMUTE
// Hỗ trợ: Tải ảnh từ máy (tự nén Canvas), Bộ preset Đoàn trường, Nhập URL
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Link as LinkIcon,
  Check,
  Camera,
  RefreshCw,
} from 'lucide-react';
import AvatarWithFallback from '@/components/AvatarWithFallback';
import { formatRole } from '@/lib/formatters';

const PRESET_AVATARS = [
  {
    id: 'doan-nam-1',
    label: 'Nam Cán bộ Đoàn (Áo sơ mi)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
    tag: 'Chính quy',
  },
  {
    id: 'doan-nu-1',
    label: 'Nữ Cán bộ Đoàn (Áo sơ mi)',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
    tag: 'Chính quy',
  },
  {
    id: 'doan-nam-2',
    label: 'Nam Thanh niên Xanh',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80',
    tag: 'Năng động',
  },
  {
    id: 'doan-nu-2',
    label: 'Nữ Thanh niên Tình nguyện',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&auto=format&fit=crop&q=80',
    tag: 'Nhiệt huyết',
  },
  {
    id: 'doan-polo-1',
    label: 'Áo Polo Xanh Đoàn',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
    tag: 'Phong trào',
  },
  {
    id: 'doan-polo-2',
    label: 'Nữ Cán bộ Phong trào',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=80',
    tag: 'Phong trào',
  },
  {
    id: 'huy-hieu-doan',
    label: 'Huy hiệu Đoàn TNCS HCM',
    url: 'https://upload.wikimedia.org/wikipedia/vi/a/a7/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.png',
    tag: 'Biểu trưng',
  },
  {
    id: 'chibi-doan-vien',
    label: 'Tuổi trẻ Sáng tạo HCMUTE',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&auto=format&fit=crop&q=80',
    tag: 'Biểu trưng',
  },
];

export default function AvatarPickerModal() {
  const {
    isAvatarModalOpen,
    closeAvatarModal,
    avatarModalTargetMember,
    currentMember,
    updateMemberAvatar,
  } = useApp();

  const target = avatarModalTargetMember || currentMember;

  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [selectedPreview, setSelectedPreview] = useState<string>(target?.avatar_url || '');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (target?.avatar_url) {
      setSelectedPreview(target.avatar_url);
    }
  }, [target]);

  if (!isAvatarModalOpen) return null;

  // Xử lý nén ảnh tự động qua HTML5 Canvas
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp hình ảnh (.jpg, .png, .webp)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Kích thước ảnh tối đa là 10MB');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setSelectedPreview(dataUrl);
          }
        } catch (err) {
          console.warn('Lỗi nén ảnh canvas:', err);
          setSelectedPreview(event.target?.result as string);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc file ảnh. Vui lòng thử lại.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!selectedPreview || !target) return;
    updateMemberAvatar(target.id, selectedPreview);
    closeAvatarModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Thay đổi Ảnh Đại diện BTV
              </h3>
              <p className="text-xs text-muted-foreground">
                Cập nhật cho: <b className="text-foreground">{target?.full_name}</b> ({formatRole(target?.role)})
              </p>
            </div>
          </div>
          <button
            onClick={closeAvatarModal}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Preview Avatar Nổi bật */}
          <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-muted/30 border border-border/80">
            <div className="relative group">
              <AvatarWithFallback
                src={selectedPreview}
                name={target?.full_name || 'BTV'}
                className="w-24 h-24 rounded-full ring-4 ring-primary/20 shadow-md object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Chọn ảnh từ máy"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Ảnh xem trước (Hiển thị thực tế trên hệ thống)
            </span>
          </div>

          {/* 3 Tabs chọn nguồn ảnh */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 text-xs font-bold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-card text-foreground shadow-2xs font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải từ máy</span>
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'preset'
                  ? 'bg-card text-foreground shadow-2xs font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kho mẫu BTV</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-card text-foreground shadow-2xs font-extrabold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Đường dẫn URL</span>
            </button>
          </div>

          {/* Tab 1: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Nhấn vào đây để tải ảnh đại diện từ máy tính
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hỗ trợ PNG, JPG, WEBP (Tự động nén tối ưu hiển thị)
                  </p>
                </div>
              </div>

              {uploadError && (
                <p className="text-xs text-destructive font-semibold text-center">{uploadError}</p>
              )}
            </div>
          )}

          {/* Tab 2: Preset */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Chọn hình đại diện theo phong cách Đoàn trường:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_AVATARS.map((p) => {
                  const isChosen = selectedPreview === p.url;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPreview(p.url)}
                      className={`p-2 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        isChosen
                          ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/30'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <AvatarWithFallback
                        src={p.url}
                        name={p.label}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="w-full">
                        <div className="text-[11px] font-bold text-foreground truncate">
                          {p.label}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground font-semibold">
                          {p.tag}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Dán đường dẫn ảnh đại diện (Image URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setSelectedPreview(customUrlInput.trim());
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shrink-0 hover:bg-primary/90"
                  >
                    Xem thử
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Mẹo: Bạn có thể sao chép liên kết ảnh từ Facebook, Google Drive công khai hoặc cổng thông tin nhà trường.
              </p>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between bg-muted/30">
          <button
            type="button"
            onClick={closeAvatarModal}
            className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-semibold text-xs text-muted-foreground"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing || !selectedPreview}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Lưu ảnh đại diện</span>
          </button>
        </div>
      </div>
    </div>
  );
}
