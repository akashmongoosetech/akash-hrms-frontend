import * as React from 'react';
import { toast } from 'react-hot-toast';

export interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'primary' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const notify = (options: ToastOptions) => {
    return toast(options.title, Object.assign({}, options, {
        description: options.description,
        style: {
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--foreground)',
          ...(options.variant === 'success' && {
            borderColor: 'var(--primary)',
            background: 'var(--primary)',
            color: 'var(--primary-foreground)'
          }),
          ...(options.variant === 'destructive' && {
            borderColor: 'var(--destructive)',
            background: 'var(--destructive)',
            color: 'var(--destructive-foreground)'
          }),
          ...(options.variant === 'warning' && {
            borderColor: 'var(--accent)',
            background: 'var(--accent)',
            color: 'var(--accent-foreground)'
          })
        }
      })
    );
  };

  return { notify };
};

/* ==========================================
   Standard Toast Components
   ========================================== */

export const PrimaryToast = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) => {
  const { notify } = useToast();

  return (
    <div>
      <button
        onClick={() => notify({ title, description, variant: 'default' })}
        className="px-4 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        Show Default Toast
      </button>
      <button
        onClick={() => notify({ title, description, variant: 'success' })}
        className="mt-2 px-4 py-2 rounded-md text-sm font-medium text-primary/90 bg-primary/10 hover:bg-primary/80 transition-colors"
      >
        Show Success Toast
      </button>
      <button
        onClick={() => notify({ title, description, variant: 'destructive' })}
        className="mt-2 px-4 py-2 rounded-md text-sm font-medium text-destructive/90 bg-destructive/10 hover:bg-destructive/80 transition-colors"
      >
        Show Destructive Toast
      </button>
    </div>
  );
};

/* ==========================================
   Confirmation Modal
   ========================================== */

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  const { notify } = useToast();

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-zsm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-6 transform scale-95 opacity-0 transition-all duration-300">
          <DialogHeader className="flex items-center justify-between pb-3 border-b border-border opacity-50">
            <DialogTitle className="text-lg font-medium text-foreground">{title}</DialogTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted/20 transition-colors"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </DialogHeader>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {confirmText}
            </button>
          </DialogFooter>
        </div>
      </div>
    </div>
  );
};