import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Check, X, Eye } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import { formatDate } from '../../Common/Commonfunction';
import RequestLeaveModal from './modals/RequestLeaveModal/RequestLeaveModal';
import UpdateStatusModal from './modals/UpdateStatusModal/UpdateStatusModal';
import ViewLeaveModal from './modals/ViewLeaveModal/ViewLeaveModal';

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

export default function LeaveTable() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLeaveId, setDeleteLeaveId] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'Vacation' as 'Vacation' | 'Sick' | 'Personal',
    reason: ''
  });
  const [statusForm, setStatusForm] = useState({
    status: 'Approved' as 'Approved' | 'Rejected',
    comments: ''
  });
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchLeaves();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Error fetching current user');
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves);
      } else {
        setError('Failed to fetch leaves');
      }
    } catch (err) {
      setError('Error fetching leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestForm)
      });

      if (response.ok) {
        fetchLeaves();
        setShowRequestModal(false);
        setRequestForm({ startDate: '', endDate: '', leaveType: 'Vacation', reason: '' });
      } else {
        setError('Failed to request leave');
      }
    } catch (err) {
      setError('Error requesting leave');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves/${selectedLeave._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(statusForm)
      });

      if (response.ok) {
        fetchLeaves();
        setShowStatusModal(false);
        setSelectedLeave(null);
        setStatusForm({ status: 'Approved', comments: '' });
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      setError('Error updating status');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteLeaveId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteLeaveId) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves/${deleteLeaveId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchLeaves();
        setShowDeleteModal(false);
        setDeleteLeaveId(null);
      } else {
        setError('Failed to delete leave');
      }
    } catch (err) {
      setError('Error deleting leave');
    }
  };

  const openStatusModal = (leave: Leave) => {
    setSelectedLeave(leave);
    setStatusForm({ status: 'Approved', comments: '' });
    setShowStatusModal(true);
  };

  const openViewModal = (leave: Leave) => {
    setSelectedLeave(leave);
    setShowViewModal(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaves...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Leave Requests</h3>
        {role !== 'Admin' && role !== 'SuperAdmin' && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Request Leave</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {role !== 'Employee' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr key={leave._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {leave.employee.firstName} {leave.employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(leave.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(leave.endDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {leave.reason.split(" ").length > 6
                    ? `${leave.reason.split(" ").slice(0, 6).join(" ")}...`
                    : leave.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openViewModal(leave)}
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin') && leave.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => openStatusModal(leave)}
                          className="p-2 rounded hover:bg-gray-100 text-green-600"
                          title="Approve/Reject"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {currentUser && currentUser.role === 'SuperAdmin' && (
                      <button
                        onClick={() => handleDelete(leave._id)}
                        className="p-2 rounded hover:bg-gray-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leaves.length === 0 && (
        <div className="text-center py-8 text-gray-500">No leave requests found</div>
      )}

      <RequestLeaveModal
        showModal={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestLeave}
        requestForm={requestForm}
        setRequestForm={setRequestForm}
      />

      <UpdateStatusModal
        showModal={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleUpdateStatus}
        statusForm={statusForm}
        setStatusForm={setStatusForm}
      />

      <ViewLeaveModal
        showModal={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedLeave={selectedLeave}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request? This action cannot be undone."
      />
    </div>
  );
}