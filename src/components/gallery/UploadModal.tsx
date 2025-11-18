import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

interface UploadModalProps {
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  userRole: string;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  users: User[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const UploadModal: React.FC<UploadModalProps> = ({
  showUploadModal,
  setShowUploadModal,
  userRole,
  selectedUserId,
  setSelectedUserId,
  users,
  handleFileUpload,
  uploading,
  fileInputRef,
}) => {
  if (!showUploadModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upload Profile Picture</h2>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {userRole !== "Employee" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an employee...</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowUploadModal(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || (userRole !== "Employee" && !selectedUserId)}
            loading={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;