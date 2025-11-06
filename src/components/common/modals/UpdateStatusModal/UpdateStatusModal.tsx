import React from 'react';

interface UpdateStatusModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  statusForm: {
    status: 'Approved' | 'Rejected';
    comments: string;
  };
  setStatusForm: React.Dispatch<React.SetStateAction<{
    status: 'Approved' | 'Rejected';
    comments: string;
  }>>;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ showModal, onClose, onSubmit, statusForm, setStatusForm }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update Leave Status</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as 'Approved' | 'Rejected' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Comments (Optional)</label>
            <textarea
              value={statusForm.comments}
              onChange={(e) => setStatusForm({ ...statusForm, comments: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;