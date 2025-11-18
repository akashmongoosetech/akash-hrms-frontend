import React from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface ImageModalProps {
  showImageModal: boolean;
  setShowImageModal: (show: boolean) => void;
  selectedImage: { url: string; userId: string } | null;
  handleDownload: (url: string) => void;
  canDelete: (userId: string) => boolean;
  setDeleteItem: (item: { userId: string; url: string } | null) => void;
  setShowDeleteModal: (show: boolean) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  showImageModal,
  setShowImageModal,
  selectedImage,
  handleDownload,
  canDelete,
  setDeleteItem,
  setShowDeleteModal,
}) => {
  if (!showImageModal || !selectedImage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">View Image</h2>
          <button
            onClick={() => setShowImageModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <img
            src={selectedImage.url}
            alt="Selected image"
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => handleDownload(selectedImage.url)}
            className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          {canDelete(selectedImage.userId) && (
            <Button
              onClick={() => {
                setDeleteItem({ userId: selectedImage.userId, url: selectedImage.url });
                setShowDeleteModal(true);
              }}
              className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;