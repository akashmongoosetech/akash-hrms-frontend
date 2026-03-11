import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Clock, Coffee, LogIn, LogOut } from 'lucide-react';
import { BaseSkeleton } from '../ui/skeleton';
import { formatDateTime } from '../../Common/Commonfunction';

interface Activity {
  type: 'punch-in' | 'punch-out' | 'break-in' | 'break-out';
  employeeName: string;
  employeePhoto?: string;
  timestamp: string;
  reason?: string;
}

export default function DashboardActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Activities updated:', activities.length);
  }, [activities]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const today = new Date();
        const fromDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const toDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Next day

        // Fetch punches
        const punchesResponse = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/punches?fromDate=${fromDate}&toDate=${toDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Fetch breaks
        const breaksResponse = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/breaks?fromDate=${fromDate}&toDate=${toDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const punchesData = punchesResponse.ok ? await punchesResponse.json() : { punchTimes: [] };
        const breaksData = breaksResponse.ok ? await breaksResponse.json() : [];

        // Transform punches
        const punchActivities: Activity[] = punchesData.punchTimes.flatMap((punch: any) => {
          const activities: Activity[] = [];
          if (punch.punchInTime) {
            activities.push({
              type: 'punch-in',
              employeeName: punch.employee ? `${punch.employee.firstName} ${punch.employee.lastName}` : 'Unknown Employee',
              employeePhoto: punch.employee?.photo,
              timestamp: punch.punchInTime
            });
          }
          if (punch.punchOutTime) {
            activities.push({
              type: 'punch-out',
              employeeName: punch.employee ? `${punch.employee.firstName} ${punch.employee.lastName}` : 'Unknown Employee',
              employeePhoto: punch.employee?.photo,
              timestamp: punch.punchOutTime
            });
          }
          return activities;
        });

        // Transform breaks
        const breakActivities: Activity[] = breaksData.map((breakRecord: any) => ({
          type: breakRecord.action === 'Break In' ? 'break-in' : 'break-out',
          employeeName: breakRecord.employee ? `${breakRecord.employee.firstName} ${breakRecord.employee.lastName}` : 'Unknown Employee',
          employeePhoto: breakRecord.employee?.photo,
          timestamp: breakRecord.timestamp,
          reason: breakRecord.reason
        }));

        // Combine and sort by timestamp descending
        const allActivities = [...punchActivities, ...breakActivities].sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Refetch activities every 30 seconds as fallback for live updates
    const interval = setInterval(fetchActivities, 30000);

    // Set up socket connection for live updates
    const socket = io(((import.meta as any).env.VITE_API_URL || 'http://localhost:5000').replace('/api', ''), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('punch-in', (data: { employee: any; punchTime: any }) => {
      console.log('Received punch-in event:', data);
      const activity: Activity = {
        type: 'punch-in',
        employeeName: data.employee ? `${data.employee.firstName} ${data.employee.lastName}` : 'Unknown Employee',
        employeePhoto: data.employee?.photo,
        timestamp: data.punchTime.punchInTime
      };
      setActivities(prev => [activity, ...prev]);
    });

    socket.on('punch-out', (data: { employee: any; punchTime: any }) => {
      console.log('Received punch-out event:', data);
      const activity: Activity = {
        type: 'punch-out',
        employeeName: data.employee ? `${data.employee.firstName} ${data.employee.lastName}` : 'Unknown Employee',
        employeePhoto: data.employee?.photo,
        timestamp: data.punchTime.punchOutTime
      };
      setActivities(prev => [activity, ...prev]);
    });

    socket.on('newBreak', (breakRecord: any) => {
      console.log('Received newBreak event:', breakRecord);
      const activity: Activity = {
        type: breakRecord.action === 'Break In' ? 'break-in' : 'break-out',
        employeeName: breakRecord.employee ? `${breakRecord.employee.firstName} ${breakRecord.employee.lastName}` : 'Unknown Employee',
        employeePhoto: breakRecord.employee?.photo,
        timestamp: breakRecord.timestamp,
        reason: breakRecord.reason
      };
      setActivities(prev => [activity, ...prev]);
    });

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'punch-in':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'punch-out':
        return <LogOut className="h-4 w-4 text-red-500" />;
      case 'break-in':
        return <Coffee className="h-4 w-4 text-blue-500" />;
      case 'break-out':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'punch-in':
        return 'Punched In';
      case 'punch-out':
        return 'Punched Out';
      case 'break-in':
        return 'Break In';
      case 'break-out':
        return 'Break Out';
      default:
        return 'Activity';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <BaseSkeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg">
              <BaseSkeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <BaseSkeleton className="h-4 w-32 mb-1" />
                <BaseSkeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 max-h-[500px] overflow-auto scrollbar-hide">
      <style dangerouslySetInnerHTML={{__html: `.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } .scrollbar-hide::-webkit-scrollbar { display: none; }`}} />
      <h3 className="text-lg font-semibold mb-4">Today's Activities</h3>
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No activities today</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.employeeName}
                  </p>
                  <span className="text-xs text-gray-500">
                    {getActivityText(activity.type)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                {activity.reason && (
                  <p className="text-xs text-gray-600 mt-1">Reason: {activity.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}