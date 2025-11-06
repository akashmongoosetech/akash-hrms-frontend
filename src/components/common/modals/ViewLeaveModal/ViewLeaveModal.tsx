import React from 'react';
import { formatDate } from '../../../../Common/Commonfunction';

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
  leaveType: 'Vacation' | 'Sick' | 'Personal';
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

interface ViewLeaveModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedLeave: Leave | null;
}

const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ showModal, onClose, selectedLeave }) => {
  if (!showModal || !selectedLeave) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-semibold mb-4">View Leave Request</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <p className="mt-1 text-sm text-gray-900">
              {selectedLeave.employee.firstName} {selectedLeave.employee.lastName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLeave.startDate)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedLeave.endDate)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <p className="mt-1 text-sm text-gray-900">{selectedLeave.reason}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <p className="mt-1 text-sm text-gray-900">{selectedLeave.leaveType}</p>
          </div>

          {selectedLeave.comments && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Comment</label>
              <p className="mt-1 text-sm text-gray-900">{selectedLeave.comments}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${selectedLeave.status === 'Approved'
                  ? 'bg-green-100 text-green-800'
                  : selectedLeave.status === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
            >
              {selectedLeave.status}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-6 sticky bottom-0 bg-white pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveModal;