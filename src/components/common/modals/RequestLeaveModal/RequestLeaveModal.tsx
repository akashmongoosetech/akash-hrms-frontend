import React from 'react';

interface RequestLeaveModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  requestForm: {
    startDate: string;
    endDate: string;
    leaveType: 'Vacation' | 'Sick' | 'Personal';
    reason: string;
  };
  setRequestForm: React.Dispatch<React.SetStateAction<{
    startDate: string;
    endDate: string;
    leaveType: 'Vacation' | 'Sick' | 'Personal';
    reason: string;
  }>>;
}

const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ showModal, onClose, onSubmit, requestForm, setRequestForm }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Request Leave</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              required
              value={requestForm.startDate}
              onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              required
              value={requestForm.endDate}
              onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select
              required
              value={requestForm.leaveType}
              onChange={(e) => setRequestForm({ ...requestForm, leaveType: e.target.value as 'Vacation' | 'Sick' | 'Personal' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Vacation">Vacation</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              required
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestLeaveModal;