import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red styling plus a trash icon for irreversible actions. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  busy = false,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={title}
    icon={destructive ? Trash2 : AlertTriangle}
    iconClassName={
      destructive
        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600'
        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600'
    }
    closeOnOverlayClick={!busy}
    footer={
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button
          onClick={onCancel}
          disabled={busy}
          className="sm:flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={`sm:flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 ${
            destructive
              ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          }`}
        >
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    }
  >
    <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
  </Modal>
);

export default ConfirmDialog;
