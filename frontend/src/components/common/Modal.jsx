import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-elevated border border-warmgrey overflow-hidden transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-warmgrey/70 flex items-center justify-between bg-cream/40">
            <h3 className="text-base font-semibold text-charcoal">{title}</h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-charcoal p-1 rounded-lg hover:bg-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
