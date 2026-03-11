import API from './api';

// Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

export interface EmployeeLocation {
  _id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeePhoto?: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  isOnline: boolean;
}

export interface LocationHistory {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
}

export interface GeoFenceData {
  _id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radius: number;
  description: string;
  color: string;
  isActive: boolean;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GeoFenceAlert {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  geoFenceId: {
    _id: string;
    name: string;
  };
  geoFenceName: string;
  alertType: 'ENTER' | 'EXIT';
  employeeLatitude: number;
  employeeLongitude: number;
  distance: number;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes: string;
  createdAt: string;
}

// Location API functions

// Update employee location
export const updateLocation = async (locationData: LocationData) => {
  const response = await API.post('/location/update', locationData);
  return response.data;
};

// Get my current location (for employee)
export const getMyLocation = async () => {
  const response = await API.get('/location/my-location');
  return response.data;
};

// Get all live locations (for admin)
export const getLiveLocations = async () => {
  const response = await API.get('/location/live');
  return response.data;
};

// Get employee route history (for admin)
export const getLocationHistory = async (employeeId: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await API.get(`/location/history/${employeeId}?${params.toString()}`);
  return response.data;
};

// Get single employee current location (for admin)
export const getCurrentLocation = async (employeeId: string) => {
  const response = await API.get(`/location/current/${employeeId}`);
  return response.data;
};

// Get employee location status (for admin)
export const getLocationStatus = async (employeeId: string) => {
  const response = await API.get(`/location/status/${employeeId}`);
  return response.data;
};

// GeoFence API functions

// Create geofence
export const createGeoFence = async (data: Partial<GeoFenceData>) => {
  const response = await API.post('/geofence/create', data);
  return response.data;
};

// Get all geofences
export const getGeoFences = async () => {
  const response = await API.get('/geofence');
  return response.data;
};

// Get single geofence
export const getGeoFence = async (id: string) => {
  const response = await API.get(`/geofence/${id}`);
  return response.data;
};

// Update geofence
export const updateGeoFence = async (id: string, data: Partial<GeoFenceData>) => {
  const response = await API.put(`/geofence/${id}`, data);
  return response.data;
};

// Delete geofence
export const deleteGeoFence = async (id: string) => {
  const response = await API.delete(`/geofence/${id}`);
  return response.data;
};

// Get all alerts
export const getAlerts = async (params?: { isRead?: boolean; isResolved?: boolean; employeeId?: string; geoFenceId?: string }) => {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    if (params.isResolved !== undefined) queryParams.append('isResolved', params.isResolved.toString());
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params.geoFenceId) queryParams.append('geoFenceId', params.geoFenceId);
  }
  
  const response = await API.get(`/geofence/alerts?${queryParams.toString()}`);
  return response.data;
};

// Mark alert as read
export const markAlertAsRead = async (id: string) => {
  const response = await API.put(`/geofence/alerts/${id}/read`);
  return response.data;
};

// Resolve alert
export const resolveAlert = async (id: string, notes?: string) => {
  const response = await API.put(`/geofence/alerts/${id}/resolve`, { notes });
  return response.data;
};

// Get unread alert count
export const getUnreadAlertCount = async () => {
  const response = await API.get('/geofence/alerts/count');
  return response.data;
};
