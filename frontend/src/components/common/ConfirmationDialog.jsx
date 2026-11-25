import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This operation cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-4">
        {isDestructive && (
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-rose-950/50 border border-red-100 dark:border-rose-900/60 flex items-center justify-center text-red-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-muted dark:text-[#CAD6B7] leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-warmgrey dark:border-[#273422]">
        <button type="button" onClick={onClose} className="btn-secondary text-xs" disabled={isLoading}>
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
            isDestructive
              ? 'bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-700'
              : 'bg-olive-500 hover:bg-olive-600'
          }`}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
