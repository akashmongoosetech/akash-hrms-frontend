import React from 'react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

interface ActivitiesAdminModalProps {
  showAdminModal: boolean;
  setShowAdminModal: (show: boolean) => void;
  employees: Employee[];
  selectedEmployee: string;
  setSelectedEmployee: (id: string) => void;
  adminAction: 'Break In' | 'Break Out';
  setAdminAction: (action: 'Break In' | 'Break Out') => void;
  adminReason: string;
  setAdminReason: (reason: string) => void;
  adminLoading: boolean;
  handleAdminBreakAction: () => void;
}

const ActivitiesAdminModal: React.FC<ActivitiesAdminModalProps> = ({
  showAdminModal,
  setShowAdminModal,
  employees,
  selectedEmployee,
  setSelectedEmployee,
  adminAction,
  setAdminAction,
  adminReason,
  setAdminReason,
  adminLoading,
  handleAdminBreakAction,
}) => {
  if (!showAdminModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Break</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={adminAction}
              onChange={(e) => setAdminAction(e.target.value as 'Break In' | 'Break Out')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Break In">Break In</option>
              <option value="Break Out">Break Out</option>
            </select>
          </div>
          {adminAction === 'Break In' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                placeholder="Enter reason for break in"
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleAdminBreakAction}
            disabled={adminLoading || !selectedEmployee || (adminAction === 'Break In' && !adminReason.trim())}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
              adminLoading || !selectedEmployee || (adminAction === 'Break In' && !adminReason.trim())
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {adminLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setShowAdminModal(false)}
            className="flex-1 px-4 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesAdminModal;