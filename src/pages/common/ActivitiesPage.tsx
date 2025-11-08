import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import socket from '../../utils/socket';
import toast from 'react-hot-toast';
import ActivitiesAdminModal from '../../components/activities/ActivitiesAdminModal';
import ActivitiesFilters from '../../components/activities/ActivitiesFilters';
import ActivitiesTimeline from '../../components/activities/ActivitiesTimeline';

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
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [breakReason, setBreakReason] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [adminAction, setAdminAction] = useState<'Break In' | 'Break Out'>('Break In');
  const [adminReason, setAdminReason] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterLoading, setFilterLoading] = useState(false);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchBreaks();
    fetchPunchStatus();
    if (role === 'Admin' || role === 'SuperAdmin') {
      fetchEmployees();
    }

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

    // Listen for punch events
    socket.on('punch-in', (data) => {
      const currentUserId = localStorage.getItem('userId');
      if (data.employee._id === currentUserId) {
        setIsPunchedIn(true);
      }
    });

    socket.on('punch-out', (data) => {
      const currentUserId = localStorage.getItem('userId');
      if (data.employee._id === currentUserId) {
        setIsPunchedIn(false);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('newBreak');
      socket.off('punch-in');
      socket.off('punch-out');
    };
  }, []);

  const fetchBreaks = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEmployee) params.append('employeeId', filterEmployee);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const response = await API.get(`/breaks?${params.toString()}`);
      setBreaks(response.data);
      // Determine if currently on break by checking the last action
      const lastBreak = response.data[0];
      if (lastBreak && lastBreak.action === 'Break In') {
        setIsOnBreak(true);
      }
    } catch (error) {
      console.error('Error fetching breaks:', error);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setFilterLoading(true);
    fetchBreaks();
  };

  const fetchPunchStatus = async () => {
    try {
      const response = await API.get('/punches/status');
      setIsPunchedIn(response.data.isPunchedIn);
    } catch (error) {
      console.error('Error fetching punch status:', error);
    }
  };

  const handleBreakAction = async () => {
    if (!isPunchedIn) {
      toast.error('Please Punch In before taking a break.');
      return;
    }
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

      <ActivitiesAdminModal
        showAdminModal={showAdminModal}
        setShowAdminModal={setShowAdminModal}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        adminAction={adminAction}
        setAdminAction={setAdminAction}
        adminReason={adminReason}
        setAdminReason={setAdminReason}
        adminLoading={adminLoading}
        handleAdminBreakAction={handleAdminBreakAction}
      />

      <ActivitiesFilters
        role={role}
        employees={employees}
        filterEmployee={filterEmployee}
        setFilterEmployee={setFilterEmployee}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        filterLoading={filterLoading}
        handleApplyFilters={handleApplyFilters}
      />

      <ActivitiesTimeline breaks={breaks} />

    </div>
  );
}