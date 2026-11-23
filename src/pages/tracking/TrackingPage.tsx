import { useState, useEffect, useCallback } from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import {
  MapPin,
  Users,
  Clock,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Power,
  PowerOff,
  Info
} from 'lucide-react';
import {
  updateLocation,
  getMyLocation,
  getLocationStatus
} from '../../utils/locationApi';
import { useLocationTracker } from '../../components/tracking/LocationTracker';
import { connectSocket, disconnectSocket, socket } from '../../utils/socket';

interface TrackingStats {
  label: string;
  value: string | number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const TrackingPage: React.FC = () => {
  const { notify } = useToast();
  const [myLocation, setMyLocation] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    currentPosition,
    isTracking,
    error: trackerError,
    permissionStatus,
    startTracking,
    stopTracking,
    refreshLocation
  } = useLocationTracker(isTracking);

  // Connect socket and join own room for presence
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Fetch my location on mount
  const fetchMyLocation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyLocation();
      if (response.success && response.data) {
        setMyLocation(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching my location:', err);
      setError(err.message || 'Failed to load location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch location status on mount
  const fetchLocationStatus = useCallback(async () => {
    try {
      const response = await getLocationStatus();
      if (response.success && response.data) {
        setLocationStatus(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching location status:', err);
    }
  }, []);

  useEffect(() => {
    fetchMyLocation();
    fetchLocationStatus();
  }, [fetchMyLocation, fetchLocationStatus]);

  // Handle location updates from the tracker hook
  useEffect(() => {
    if (currentPosition) {
      // Send location to backend (the hook does this automatically via sendLocation)
      // But we can also update local state
      setMyLocation({
        ...myLocation,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        accuracy: currentPosition.accuracy,
        timestamp: new Date().toISOString(),
        isLatest: true
      });
    }
  }, [currentPosition, myLocation]);

  // Handle tracking errors
  useEffect(() => {
    if (trackerError) {
      setError(trackerError);
    }
  }, [trackerError]);

  const handleStartTracking = async () => {
    setError(null);
    await startTracking();
  };

  const handleStopTracking = async () => {
    await stopTracking();
  };

  const handleRefresh = async () => {
    setError(null);
    await refreshLocation();
    await fetchMyLocation();
  };

  const formatTime = (timestamp: string | Date | undefined | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const isSharingLocation = isTracking && !!currentPosition;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Location Tracking</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share your real-time location with your employer
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 rounded-xl shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Location Sharing
              </p>
              <p className="text-lg font-bold text-gray-900">
                {isSharingLocation ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Last Update
              </p>
              <p className="text-lg font-bold text-gray-900">
                {myLocation?.timestamp ? formatTime(myLocation.timestamp) : 'Never'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Shield size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Permission
              </p>
              <p className="text-lg font-bold text-gray-900">
                {permissionStatus === 'granted' ? 'Granted' : 
                 permissionStatus === 'denied' ? 'Denied' :
                 permissionStatus === 'prompt' ? 'Not Asked' : 'Unknown'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <CheckCircle size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Accuracy
              </p>
              <p className="text-lg font-bold text-gray-900">
                {currentPosition ? `±${Math.round(currentPosition.accuracy)}m` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Location Tracking Toggle */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Location Tracking</h3>
            <p className="text-sm text-gray-500">
              {isTracking
                ? 'Your location is being shared with your employer in real time.'
                : 'Enable location sharing to allow your employer to track your location during working hours.'}
            </p>
          </div>
          <button
            onClick={isTracking ? handleStopTracking : handleStartTracking}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${isSharingLocation ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform flex items-center justify-center ${isTracking ? 'translate-x-7' : 'translate-x-1'}`}
            >
              {isTracking ? (
                <PowerOff size={14} className="text-green-500" />
              ) : (
                <Power size={14} className="text-gray-400" />
              )}
            </span>
          </button>
        </div>

        {permissionStatus === 'denied' && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-600">
                  Location permission denied. Please enable location access in your browser settings to use tracking.
                </p>
              </div>
            </div>
          </div>
        )}

        {permissionStatus === 'blocked' && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <div>
                <p className="text-sm text-red-600">
                  Location permission permanently blocked. Change settings in your browser.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Current Location Details */}
      {currentPosition || myLocation && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Location</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <MapPin size={20} className="text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</p>
                <p className="text-sm font-medium text-gray-900">
                  {(currentPosition?.latitude ?? myLocation?.latitude)?.toFixed(6) ?? 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <MapPin size={20} className="text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</p>
                <p className="text-sm font-medium text-gray-900">
                  {(currentPosition?.longitude ?? myLocation?.longitude)?.toFixed(6) ?? 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Clock size={20} className="text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</p>
                <p className="text-sm font-medium text-gray-900">
                  {`±${(currentPosition?.accuracy ?? myLocation?.accuracy ?? 0).toFixed(0)}m`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <RefreshCw size={20} className="text-orange-600" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(currentPosition ? new Date().toISOString() : myLocation?.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Location Status from Backend */}
      {locationStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-500">Online Status</span>
              <StatusBadge 
                status={locationStatus.isOnline ? 'online' : 'offline'} 
                size="sm" 
              />
            </div>
            {locationStatus.lastSeen && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-500">Last Seen</span>
                <span className="text-sm font-medium text-gray-900">{formatTime(locationStatus.lastSeen)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!currentPosition && !myLocation && !error && !loading && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
          <p className="text-sm text-gray-500 mb-6">
            Start location tracking to share your location with your employer.
          </p>
          <Button variant="primary" onClick={handleStartTracking} disabled={permissionStatus === 'denied'}>
            {permissionStatus === 'denied' ? 'Permission Denied' : 'Start Tracking'}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TrackingPage;