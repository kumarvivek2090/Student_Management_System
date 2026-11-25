import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative w-full ${maxWidth} my-8 bg-white dark:bg-[#182216] rounded-2xl shadow-2xl border border-warmgrey dark:border-[#283623] overflow-hidden transform transition-all text-left text-[#242820] dark:text-[#E8EDE4] z-10`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-warmgrey/70 dark:border-[#283623] flex items-center justify-between bg-cream/40 dark:bg-[#131A12]">
            <h3 className="text-base font-semibold text-charcoal dark:text-[#F3F6F0]">{title}</h3>
            <button
              onClick={onClose}
              className="text-muted dark:text-[#A8B49E] hover:text-charcoal dark:hover:text-white p-1 rounded-lg hover:bg-cream dark:hover:bg-[#222E1E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
