'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileNavigation({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={dialogRef} aria-label="Menu điều hướng" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="mobile-navigation">
      <div className="relative h-full">
        <button autoFocus onClick={onClose} aria-label="Đóng menu" className="absolute top-1 right-1 z-10 rounded-full p-2 text-white hover:bg-white/20"><X size={16} /></button>
        <Sidebar onNavigate={onClose} />
      </div>
    </dialog>
  );
}
