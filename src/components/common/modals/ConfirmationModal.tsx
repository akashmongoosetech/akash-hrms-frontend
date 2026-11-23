import * as React from 'react';
import { useToast } from '../../ui/toast';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const { notify } = useToast();

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    notify({
      title: 'Action Completed',
      description: `${title} has been processed`,
      variant: 'success',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md transform scale-95 opacity-0 transition-all duration-300">
        {/* Modal Header */}
        <div className="p-5 border-b border-border opacity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-medium text-gray-900">{title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Confirmation Description */}
        <div className="p-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-border">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-md text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
