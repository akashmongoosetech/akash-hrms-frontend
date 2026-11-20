import { useState, useEffect } from 'react';
import { useLocationTracker } from './LocationTracker';
import { MapPin, Navigation, Power, PowerOff, RefreshCw, AlertCircle, Info } from 'lucide-react';

const LocationTrackingToggle: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    currentPosition,
    error,
    permissionStatus,
    startTracking,
    stopTracking,
    refreshLocation
  } = useLocationTracker(isTracking);

  const handleToggle = () => {
    setIsTracking(!isTracking);
  };

  const handleRefresh = async () => {
    await refreshLocation();
  };

  // Derive tracking status display
  const trackingStatus = {
    isTracking,
    hasPermission: permissionStatus !== 'denied' && permissionStatus !== 'blocked',
    hasPosition: !!currentPosition,
    error,
    displayColor: () => {
      if (error) return 'bg-red-500';
      if (isTracking && currentPosition) return 'bg-green-500';
      if (isTracking) return 'bg-yellow-500';
      return 'bg-gray-400';
    },
    displayText: () => {
      if (error) return 'Error';
      if (isTracking && currentPosition) return 'Tracking Active';
      if (isTracking) return 'Starting...';
      return 'Not Tracking';
    },
    badgeText: () => {
      if (error) return 'Error';
      if (isTracking) {
        if (currentPosition) {
          return `Tracking (${Math.round(currentPosition.accuracy)}m accuracy)`;
        }
        return 'Tracking...';
      }
      if (permissionStatus === 'denied') return 'Permission Denied';
      if (permissionStatus === 'blocked') return 'Permission Blocked';
      return 'Not Tracking';
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${trackingStatus.displayColor()} text-white}`}>
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Location Tracking</h3>
            <p className="text-sm text-gray-500">{trackingStatus.displayText()}</p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${trackingStatus.displayColor() === 'bg-green-500' ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center ${isTracking ? 'translate-x-7' : 'translate-x-1'}`}
          >
            {isTracking ? (
              <PowerOff size={14} className="text-green-500" />
            ) : (
              <Power size={14} className="text-gray-400" />
            )}
          </span>
        </button>
      </div>

      {/* Permission Warning */}
      {permissionStatus === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">
            <MapPin size={16} className="mr-1" /> Location permission denied. Please enable location access in your browser settings.
          </p>
        </div>
      )}

      {permissionStatus === 'blocked' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">
            <AlertCircle size={16} className="mr-1" /> Location permission permanently blocked. Change settings in your browser.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !permissionStatus && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-600">
            <AlertCircle size={16} className="mr-1" /> {error}
          </p>
        </div>
      )}

      {/* Current Location Details */}
      {showDetails && currentPosition && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Current Location</h4>
            <button
              onClick={handleRefresh}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
              title="Refresh location"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Latitude:</span>
              <span className="font-mono">{currentPosition.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Longitude:</span>
              <span className="font-mono">{currentPosition.longitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Accuracy:</span>
              <span>±{Math.round(currentPosition.accuracy)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Speed:</span>
              <span>{currentPosition.speed ? `${(currentPosition.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Heading:</span>
              <span>{currentPosition.heading !== undefined ? `${currentPosition.heading.toFixed(0)}°` : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      {isTracking && currentPosition && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <Navigation size={14} />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      )}

      {/* Info Text */}
      {!isTracking && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border-t">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">
                Enable location tracking to share your real-time location with your employer.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your location will be updated every 15 seconds while tracking is active. Your location data is used solely for employee tracking and management purposes during working hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Details Button (secondary) */}
      {isTracking && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <Navigation size={14} />
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      )}
    </div>
  );
};

export default LocationTrackingToggle;