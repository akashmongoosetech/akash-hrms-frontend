import React, { useState, useEffect } from 'react';
import { X, Clock, Coffee, LogIn, LogOut } from 'lucide-react';
import { useLayout } from './Layout';
import API from '../../utils/api';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface DashboardPreferences {
  projects: boolean;
  teams: boolean;
  todos: boolean;
  tickets: boolean;
}

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

interface PunchRecord {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: string;
  };
  action: 'Punch In' | 'Punch Out';
  timestamp: string;
  date: string;
  addedBy?: {
    _id: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

interface ActivityItem {
  _id: string;
  type: 'break' | 'punch';
  action: string;
  reason?: string;
  timestamp: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const { dashboardPreferences, updateDashboardPreferences } = useLayout();
  const [activeTab, setActiveTab] = useState('setting');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const role = localStorage.getItem('role');

  const handleCheckboxChange = (item: keyof DashboardPreferences) => {
    const newCheckedItems = {
      ...dashboardPreferences,
      [item]: !dashboardPreferences[item]
    };

    updateDashboardPreferences(newCheckedItems);
  };

  useEffect(() => {
    if (activeTab === 'activities' && role === 'Employee') {
      fetchTodayActivities();
    }
  }, [activeTab, role]);

  const fetchTodayActivities = async () => {
    setLoadingActivities(true);
    try {
      const currentUserId = localStorage.getItem('userId');
      const today = new Date().toISOString().split('T')[0];

      // Fetch breaks
      const breakParams = new URLSearchParams({
        employeeId: currentUserId || '',
        fromDate: today,
        toDate: today
      });
      const breaksResponse = await API.get(`/breaks?${breakParams.toString()}`);

      // Fetch punches
      const punchParams = new URLSearchParams({
        employeeId: currentUserId || '',
        fromDate: today,
        toDate: today
      });
      const punchesResponse = await API.get(`/punches?${punchParams.toString()}`);

      // Transform punch data to match expected format
      const transformedPunches = punchesResponse.data.punchTimes.map((punch: any) => {
        const punchInActivity = {
          _id: punch._id + '_in',
          type: 'punch' as const,
          action: 'Punch In',
          timestamp: punch.punchInTime
        };

        const activities = [punchInActivity];

        if (punch.punchOutTime) {
          activities.push({
            _id: punch._id + '_out',
            type: 'punch' as const,
            action: 'Punch Out',
            timestamp: punch.punchOutTime
          });
        }

        return activities;
      }).flat();

      // Combine and sort activities
      const breakActivities: ActivityItem[] = breaksResponse.data.map((breakItem: BreakRecord) => ({
        _id: breakItem._id,
        type: 'break' as const,
        action: breakItem.action,
        reason: breakItem.reason,
        timestamp: breakItem.timestamp
      }));

      const punchActivities: ActivityItem[] = transformedPunches;

      const allActivities = [...breakActivities, ...punchActivities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 w-80 bg-white h-full border-l border-gray-200 z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-700">Settings</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b">
           <button
             className={`px-4 py-2 text-sm font-medium ${activeTab === 'setting' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
             onClick={() => setActiveTab('setting')}
           >
             Setting
           </button>
           {role === 'Employee' && (
             <button
               className={`px-4 py-2 text-sm font-medium ${activeTab === 'activities' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
               onClick={() => setActiveTab('activities')}
             >
               Activities
             </button>
           )}
         </div>

        {activeTab === 'setting' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Dashboard Items</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dashboardPreferences.projects}
                    onChange={() => handleCheckboxChange('projects')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Projects</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dashboardPreferences.teams}
                    onChange={() => handleCheckboxChange('teams')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Teams</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dashboardPreferences.todos}
                    onChange={() => handleCheckboxChange('todos')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Todos</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dashboardPreferences.tickets}
                    onChange={() => handleCheckboxChange('tickets')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">Tickets</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">General Settings</h3>

              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="ms-2 text-sm text-gray-700">Night Mode</span>&nbsp;&nbsp;
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full
                      peer dark:bg-gray-700
                      peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                      peer-checked:after:border-white
                      after:content-[''] after:absolute after:top-[1px] after:start-[1px]
                      after:bg-white after:border-gray-300 after:border after:rounded-full
                      after:h-3 after:w-3 after:transition-all
                      dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                  </div>
                </label>
              </div>

              <div>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="ms-2 text-sm text-gray-700">Header dark</span>&nbsp;&nbsp;
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full
                      peer dark:bg-gray-700
                      peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                      peer-checked:after:border-white
                      after:content-[''] after:absolute after:top-[1px] after:start-[1px]
                      after:bg-white after:border-gray-300 after:border after:rounded-full
                      after:h-3 after:w-3 after:transition-all
                      dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">Support</h3>
                <button
                  onClick={() => onNavigate("/settings/help")}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Help & Support
                </button>
                <button
                  onClick={() => onNavigate("/settings/about")}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  About
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && role === 'Employee' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Today's Activities</h3>
            {loadingActivities ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No activities today</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      (activity.type === 'break' && activity.action === 'Break In') || (activity.type === 'punch' && activity.action === 'Punch In') ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {activity.type === 'break' ? (
                        activity.action === 'Break In' ? (
                          <Coffee className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-red-600" />
                        )
                      ) : (
                        activity.action === 'Punch In' ? (
                          <LogIn className="w-4 h-4 text-green-600" />
                        ) : (
                          <LogOut className="w-4 h-4 text-red-600" />
                        )
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      {activity.reason && (
                        <p className="text-xs text-gray-600 mt-1">
                          Reason: {activity.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default SettingsSidebar;