import React, { useState, useEffect } from 'react';
import { formatDate, formatDateTime } from '../../Common/Commonfunction';
import socket from '../../utils/socket';

interface PunchTime {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  punchInTime: string;
  punchOutTime?: string;
  totalDuration?: number;
  createdAt: string;
}

export default function PunchTimeTable() {
  const [punchTimes, setPunchTimes] = useState<PunchTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchPunchTimes();
    fetchCurrentUser();

    // Socket listeners for real-time updates
    socket.on('punch-in', (data) => {
      // Refresh data when someone punches in
      fetchPunchTimes();
    });

    socket.on('punch-out', (data) => {
      // Refresh data when someone punches out
      fetchPunchTimes();
    });

    return () => {
      socket.off('punch-in');
      socket.off('punch-out');
    };
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

  const fetchPunchTimes = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/punches`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPunchTimes(data.punchTimes);
      } else {
        setError('Failed to fetch punch times');
      }
    } catch (err) {
      setError('Error fetching punch times');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if user has access (Admin or SuperAdmin)
  if (currentUser && currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          You don't have permission to view this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading punch times...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Punch Times</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {punchTimes.map((punchTime) => (
              <tr key={punchTime._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {punchTime.employee ? `${punchTime.employee.firstName} ${punchTime.employee.lastName}` : 'Unknown Employee'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(punchTime.punchInTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {punchTime.punchOutTime
                    ? new Date(punchTime.punchOutTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })
                    : 'Not punched out'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {punchTime.totalDuration ? formatDuration(punchTime.totalDuration) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(punchTime.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {punchTimes.length === 0 && (
        <div className="text-center py-8 text-gray-500">No punch times found</div>
      )}
    </div>
  );
}