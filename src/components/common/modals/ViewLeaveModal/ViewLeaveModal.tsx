import React from 'react';
import { X } from 'lucide-react';
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

interface ViewLeaveModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedLeave: Leave | null;
}

const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ showModal, onClose, selectedLeave }) => {
  if (!showModal || !selectedLeave) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">View Leave Request</h2>
          <button onClick={onClose} className="hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Employee Information</h3>
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
                {selectedLeave.employee.firstName[0]}{selectedLeave.employee.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {selectedLeave.employee.firstName} {selectedLeave.employee.lastName}
                </p>
                <p className="text-sm text-gray-500">{selectedLeave.employee.email}</p>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Leave Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedLeave.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedLeave.endDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Leave Type</p>
                <p className="font-medium text-gray-900">{selectedLeave.leaveType}</p>
              </div>
              <div>
                <p className="text-gray-500">Days Requested</p>
                <p className="font-medium text-gray-900">{selectedLeave.daysRequested}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Reason</p>
                <p className="font-medium text-gray-900">{selectedLeave.reason}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Status</h3>
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

          {/* Comments */}
          {selectedLeave.comments && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">Admin Comment</h3>
              <p className="text-red-700 text-sm">{selectedLeave.comments}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveModal;