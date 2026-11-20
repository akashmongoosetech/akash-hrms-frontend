import React, { useState, useEffect } from 'react';
import socket, { connectSocket } from '../../utils/socket';
import { formatDate } from '../../Common/Commonfunction';
import { BaseSkeleton } from '../ui/skeleton';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  } | null;
  startDate: string;
  endDate: string;
  leaveType: string;
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

export default function DashboardLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();

    // Use the shared, authenticated socket (the server already placed us in our
    // own room). Never disconnect it here: other components share this socket.
    connectSocket();

    const handleLeaveCreated = (newLeave: Leave) => {
      setLeaves(prev => [newLeave, ...prev].slice(0, 100)); // Add to top, keep limit
    };

    const handleLeaveUpdated = (updatedLeave: Leave) => {
      setLeaves(prev => prev.map(leave => leave._id === updatedLeave._id ? updatedLeave : leave));
    };

    const handleLeaveDeleted = (leaveId: string) => {
      setLeaves(prev => prev.filter(leave => leave._id !== leaveId));
    };

    socket.on('leave-created', handleLeaveCreated);
    socket.on('leave-updated', handleLeaveUpdated);
    socket.on('leave-deleted', handleLeaveDeleted);

    return () => {
      socket.off('leave-created', handleLeaveCreated);
      socket.off('leave-updated', handleLeaveUpdated);
      socket.off('leave-deleted', handleLeaveDeleted);
    };
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves?limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
      } else {
        setError('Failed to fetch leaves');
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Error fetching leaves');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600 bg-green-100';
      case 'Rejected':
        return 'text-red-600 bg-red-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
        <BaseSkeleton className="h-6 w-64 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <BaseSkeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <style dangerouslySetInnerHTML={{__html: `.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } .scrollbar-hide::-webkit-scrollbar { display: none; }`}} />
      <h1 className="text-lg font-semibold mb-4">Employee Leaves Overview</h1>

      {leaves.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No leaves found
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-hide">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <TableRow key={leave._id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {leave.employee?.photo ? (
                          <img
                            src={leave.employee.photo.startsWith('http')
                              ? leave.employee.photo
                              : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${leave.employee.photo}`}
                            alt={`${leave.employee.firstName} ${leave.employee.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-semibold">
                            {leave.employee ? `${leave.employee.firstName.charAt(0)}${leave.employee.lastName.charAt(0)}` : 'U'}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {leave.employee?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leave.leaveType}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{leave.daysRequested}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs" title={leave.reason}>
                      {leave.reason}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}