import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';

interface BreakRecord {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: string;
  };
  action: 'Break In' | 'Break Out';
  reason?: string;
  timestamp: string;
  date: string;
  addedBy?: {
    _id: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function ActivitiesPage() {
  const [breaks, setBreaks] = useState<BreakRecord[]>([]);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [breakReason, setBreakReason] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [adminAction, setAdminAction] = useState<'Break In' | 'Break Out'>('Break In');
  const [adminReason, setAdminReason] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchBreaks();

    // Listen for new break events
    socket.on('newBreak', (newBreak: BreakRecord) => {
      setBreaks(prevBreaks => [newBreak, ...prevBreaks]);
      // Update isOnBreak state if it's the current user's break
      const currentUserId = localStorage.getItem('userId'); // Assuming userId is stored
      if (newBreak.employee._id === currentUserId && newBreak.action === 'Break In') {
        setIsOnBreak(true);
      } else if (newBreak.employee._id === currentUserId && newBreak.action === 'Break Out') {
        setIsOnBreak(false);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('newBreak');
    };
  }, []);

  const fetchBreaks = async () => {
    try {
      const response = await API.get('/breaks');
      setBreaks(response.data);
      // Determine if currently on break by checking the last action
      const lastBreak = response.data[0];
      if (lastBreak && lastBreak.action === 'Break In') {
        setIsOnBreak(true);
      }
    } catch (error) {
      console.error('Error fetching breaks:', error);
    }
  };

  const handleBreakAction = async () => {
    if (!isOnBreak && !breakReason.trim()) {
      toast.error('Please enter a reason for break in.');
      return;
    }
    setLoading(true);
    try {
      const action = isOnBreak ? 'Break Out' : 'Break In';
      const payload = action === 'Break In' ? { action, reason: breakReason } : { action };
      await API.post('/breaks', payload);
      setIsOnBreak(!isOnBreak);
      setShowReasonInput(false);
      setBreakReason('');
      fetchBreaks(); // Refresh the list
      toast.success('Break recorded successfully!');
    } catch (error: any) {
      console.error('Error recording break:', error);
      toast.error(error.response?.data?.message || 'Error recording break');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await API.get('/breaks/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleAdminBreakAction = async () => {
    if (adminAction === 'Break In' && !adminReason.trim()) {
      toast.error('Please enter a reason for break in.');
      return;
    }
    if (!selectedEmployee) {
      toast.error('Please select an employee.');
      return;
    }
    setAdminLoading(true);
    try {
      const payload = adminAction === 'Break In' ? { employeeId: selectedEmployee, action: adminAction, reason: adminReason } : { employeeId: selectedEmployee, action: adminAction };
      await API.post('/breaks/admin', payload);
      setShowAdminModal(false);
      setSelectedEmployee('');
      setAdminReason('');
      fetchBreaks(); // Refresh the list
      toast.success('Break recorded successfully by admin!');
    } catch (error: any) {
      console.error('Error recording break by admin:', error);
      toast.error(error.response?.data?.message || 'Error recording break');
    } finally {
      setAdminLoading(false);
    }
  };

  const openAdminModal = () => {
    fetchEmployees();
    setShowAdminModal(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <div className="flex space-x-4">
          {/* Admin Add Button */}
          {(role === 'Admin' || role === 'SuperAdmin') && (
            <button
              onClick={openAdminModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          )}
          {/* Break Button */}
          {role === 'Employee' && (
            <div className="flex justify-end">
              {!isOnBreak && showReasonInput ? (
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    placeholder="Enter reason for break in"
                    value={breakReason}
                    onChange={(e) => setBreakReason(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={handleBreakAction}
                      disabled={loading || !breakReason.trim()}
                      className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                        loading || !breakReason.trim()
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {loading ? 'Recording...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setShowReasonInput(false)}
                      className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!isOnBreak) {
                      setShowReasonInput(true);
                    } else {
                      handleBreakAction();
                    }
                  }}
                  disabled={loading}
                  className={`px-3 py-1 rounded-lg font-semibold text-white transition-colors ${
                    isOnBreak
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Recording...' : isOnBreak ? 'Break Out' : 'Break In'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Modal */}
      {showAdminModal && (
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
      )}

      {/* Timeline */}
      {/* Timeline */}
<div className="bg-white shadow-md rounded-lg overflow-hidden">
  {/* Header */}
  <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <i className="fa fa-stream text-blue-500"></i> Timeline Activity
    </h3>
  </div>

  <div className="relative p-6">
    {/* Vertical Line */}
    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-gray-200 to-transparent"></div>

    {breaks.length > 0 ? (
      breaks.map((activity, index) => {
        // --- Date Separator Logic ---
        let showSeparator = false;
        let displayDate = '';
        const currentDateStr = activity.date;
        if (index === 0 || currentDateStr !== breaks[index - 1].date) {
          showSeparator = true;
        }

        if (showSeparator && currentDateStr) {
          const dateObj = new Date(currentDateStr);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dateNoTime = stripTime(dateObj);
          const todayNoTime = stripTime(today);
          const yesterdayNoTime = stripTime(yesterday);

          if (dateNoTime.getTime() === todayNoTime.getTime()) {
            displayDate = 'Today';
          } else if (dateNoTime.getTime() === yesterdayNoTime.getTime()) {
            displayDate = 'Yesterday';
          } else {
            displayDate = dateObj.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            });
          }
        }

        const key = activity._id || index;
        const type = activity.action === 'Break In' ? 'Break_in' : 'Break_out';
        const time = formatTime(activity.timestamp);
        const description = activity.reason || '';

        return (
          <React.Fragment key={key}>
            {/* Date Separator */}
            {showSeparator && displayDate && (
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="mx-3 px-4 py-1 border border-gray-300 rounded-full bg-gray-50 text-gray-600 text-sm font-medium shadow-sm">
                  <i className="fa fa-calendar-alt mr-1 text-gray-400"></i>
                  {displayDate}
                </div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            )}

            {/* Timeline Item */}
            <div className="relative pl-14 mb-8 group">
              {/* Node circle */}
              <div className="absolute left-5 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform"></div>

              <div className="flex items-start gap-4">
                {/* Profile Image */}
                {activity.employee.photo ? (
                  <img
                    src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${activity.employee.photo}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 text-blue-600 font-semibold">
                    {activity.employee.firstName[0]}
                    {activity.employee.lastName[0]}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">
                      {activity.employee.firstName} {activity.employee.lastName}
                      <span className="mx-2 text-gray-400">|</span>
                      <span
                        className={`${
                          type === 'Break_in' ? 'text-green-600' : 'text-red-500'
                        } font-medium`}
                      >
                        {type === 'Break_in' ? 'Break In' : 'Break Out'}
                      </span>
                    </span>
                    <small className="text-gray-500">{time}</small>
                  </div>

                  {description && (
                    <p className="text-sm text-gray-700 leading-snug">
                      {description}
                    </p>
                  )}

                  {activity.addedBy && (
                    <small className="block text-blue-600 mt-1">
                      Added by {activity.addedBy.firstName} {activity.addedBy.lastName} ({activity.addedBy.role})
                    </small>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })
    ) : (
      <div className="text-center text-gray-500 py-6">No activities found</div>
    )}
  </div>
</div>

    </div>
  );
}