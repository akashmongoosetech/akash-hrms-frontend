import React from 'react';

interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Vacation' | 'Personal';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  rejectedBy?: {
    firstName: string;
    lastName: string;
  };
  comments?: string;
  daysRequested: number;
  createdAt: string;
}

interface EditLeaveModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editForm: {
    startDate: string;
    endDate: string;
    leaveType: 'Casual' | 'Sick' | 'Earned' | 'Vacation' | 'Personal';
    reason: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    startDate: string;
    endDate: string;
    leaveType: 'Casual' | 'Sick' | 'Earned' | 'Vacation' | 'Personal';
    reason: string;
  }>>;
  selectedLeave: Leave | null;
}

const EditLeaveModal: React.FC<EditLeaveModalProps> = ({ showModal, onClose, onSubmit, editForm, setEditForm, selectedLeave }) => {
  if (!showModal || !selectedLeave) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Leave Request</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              required
              value={editForm.startDate}
              onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              required
              value={editForm.endDate}
              onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select
              required
              value={editForm.leaveType}
              onChange={(e) => setEditForm({ ...editForm, leaveType: e.target.value as 'Casual' | 'Sick' | 'Earned' | 'Vacation' | 'Personal' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
              <option value="Vacation">Vacation</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              required
              value={editForm.reason}
              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
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

export default EditLeaveModal;