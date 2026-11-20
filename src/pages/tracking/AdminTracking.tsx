import { useState, useEffect } from 'react';
import EmployeeMap from '../../components/tracking/EmployeeMap';
import GeoFenceManager from '../../components/tracking/GeoFenceManager';
import {
  getLiveLocations,
  getGeoFences,
  getUnreadAlertCount,
  getEmployeesForTracking,
  EmployeeLocation,
  GeoFenceData
} from '../../utils/locationApi';
import { MapPin, Users, AlertTriangle, Settings, Search, RefreshCw } from 'lucide-react';

interface DropdownEmployee {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeePhoto?: string;
  isOnline: boolean;
  accuracy?: number;
  timestamp?: string;
}

const AdminTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'geofences'>('map');
  const [liveLocations, setLiveLocations] = useState<EmployeeLocation[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceData[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employees, setEmployees] = useState<DropdownEmployee[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  // Fetch live locations from backend
  const fetchLiveLocations = async () => {
    try {
      const response = await getLiveLocations();
      if (response.success) {
        setLiveLocations(response.data);
      }
    } catch (err) {
      console.error('Error fetching live locations:', err);
    }
  };

  // Fetch employees for dropdown from backend
  const fetchEmployees = async () => {
    setDropdownLoading(true);
    setError(null);
    try {
      const response = await getEmployeesForTracking();
      if (response.success && response.data) {
        // Transform the data for dropdown display
        const dropdownEmployees = response.data.map((emp: any) => ({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName || emp.firstName || 'Unknown',
          employeeEmail: emp.employeeEmail || emp.email || '',
          employeePhoto: emp.employeePhoto || emp.photo,
          isOnline: emp.isOnline !== undefined ? emp.isOnline : true,
          accuracy: emp.accuracy,
          timestamp: emp.timestamp
        }));
        setEmployees(dropdownEmployees);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
      setError('Failed to load employees');
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveLocations();
    fetchEmployees();
    
    // Set up auto-refresh for live locations every 30 seconds
    const locationInterval = setInterval(() => {
      fetchLiveLocations();
    }, 30000);

    // Set up employee fetch interval
    const employeeInterval = setInterval(() => {
      fetchEmployees();
    }, 60000);

    return () => {
      if (locationInterval) clearInterval(locationInterval);
      if (employeeInterval) clearInterval(employeeInterval);
    };
  }, []);

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId === selectedEmployee ? null : employeeId);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp =>
    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCount = liveLocations.filter(e => e.isOnline).length;
  const offlineCount = liveLocations.filter(e => !e.isOnline).length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Employee Tracking</h1>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {onlineCount} Online
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                {offlineCount} Offline
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Alerts Badge */}
            {unreadAlerts > 0 && (
              <button
                onClick={() => setActiveTab('geofences')}
                className="relative p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <AlertTriangle size={24} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchLiveLocations();
                fetchEmployees();
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={24} />
            </button>

            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'map' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
              >
                <MapPin size={18} />
                Live Map
              </button>
              <button
                onClick={() => setActiveTab('geofences')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'geofences' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
              >
                <Settings size={18} />
                Geo-Fences
              </button>
            </div>

            {/* Employee Dropdown */}
            <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-1.5">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    handleEmployeeSelect(value);
                  }
                }}
                value={selectedEmployee || ''}
                className="pl-10 pr-2 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={dropdownLoading}
              >
                <option value="">Select Employee</option>
                {dropdownLoading ? (
                  <option value="" disabled>Loading employees...</option>
                ) : employees.map((emp) => (
                  <option
                    key={emp.employeeId}
                    value={emp.employeeId}
                  >
                    <div className="flex items-center gap-2">
                      {emp.employeePhoto ? (
                        <img
                          src={emp.employeePhoto}
                          alt={emp.employeeName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full bg-gray-300 text-gray-400 flex items-center justify-center text-xs font-semibold"
                        >
                          {emp.employeeName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{emp.employeeName}</span>
                      <span className="text-xs text-gray-500">({emp.employeeEmail})</span>
                      {emp.isOnline && (
                        <span className="ml-2 text-green-500 text-xs">● Online</span>
                      )}
                    </div>
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'map' ? (
          <>
            {/* Employee List Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col">
              {/* Employee Search Section */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Employee List */}
              <div className="flex-1 overflow-y-auto">
                {dropdownLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-sm text-gray-600">Loading employees</p>
                  </div>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.employeeId}
                      onClick={() => handleEmployeeSelect(employee.employeeId)}
                      className={`p-3 border-b cursor-pointer transition ${selectedEmployee === employee.employeeId ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          {employee.employeePhoto ? (
                            <img
                              src={employee.employeePhoto}
                              alt={employee.employeeName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-400 flex items-center justify-center font-semibold">
                              {employee.employeeName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${employee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{employee.employeeName}</h4>
                          <p className="text-sm text-gray-500 truncate">{employee.employeeEmail}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {employee.isOnline ? (
                              <span className="text-green-600">Active now</span>
                            ) : (
                              <span>Last seen: {formatTime(employee.timestamp)}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Online/Offline Status */}
                      {employee.isOnline && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Accuracy: ±{Math.round(employee.accuracy || 0)}m
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <Users size={32} className="mb-2" />
                    <p>No employees found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="flex-1">
              <EmployeeMap
                selectedEmployeeId={selectedEmployee || undefined}
                onEmployeeSelect={handleEmployeeSelect}
                showRoutes={true}
                showGeoFences={true}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto">
            <GeoFenceManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTracking;