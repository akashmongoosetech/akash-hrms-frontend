import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, Circle } from '@react-google-maps/api';
import { getLiveLocations, getGeoFences, getLocationHistory, EmployeeLocation, GeoFenceData, LocationHistory } from '../../utils/locationApi';
import socket from '../../utils/socket';

// Google Maps configuration
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 23.0225,
  lng: 72.5714 // Default to Ahmedabad, India
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

interface EmployeeMapProps {
  selectedEmployeeId?: string;
  onEmployeeSelect?: (employeeId: string) => void;
  showRoutes?: boolean;
  showGeoFences?: boolean;
}

const EmployeeMap: React.FC<EmployeeMapProps> = ({
  selectedEmployeeId,
  onEmployeeSelect,
  showRoutes = true,
  showGeoFences = true
}) => {
  const [employees, setEmployees] = useState<EmployeeLocation[]>([]);
  const [geoFences, setGeoFences] = useState<GeoFenceData[]>([]);
  const [routeHistory, setRouteHistory] = useState<LocationHistory[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(12);

  const googleMapsKey = (import.meta as any).env.VITE_GOOGLE_MAPS_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsKey,
    libraries: ['geometry']
  });

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch live locations
      const locationsResponse = await getLiveLocations();
      if (locationsResponse.success) {
        setEmployees(locationsResponse.data);
        
        // Center map on first online employee if available
        const onlineEmployees = locationsResponse.data.filter((e: EmployeeLocation) => e.isOnline);
        if (onlineEmployees.length > 0) {
          setMapCenter({
            lat: onlineEmployees[0].latitude,
            lng: onlineEmployees[0].longitude
          });
        }
      }

      // Fetch geofences
      if (showGeoFences) {
        const geoFencesResponse = await getGeoFences();
        if (geoFencesResponse.success) {
          setGeoFences(geoFencesResponse.data);
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  }, [showGeoFences]);

  // Fetch route history for selected employee
  const fetchRouteHistory = useCallback(async (employeeId: string) => {
    try {
      const response = await getLocationHistory(employeeId);
      if (response.success) {
        setRouteHistory(response.data);
      }
    } catch (err) {
      console.error('Error fetching route history:', err);
    }
  }, []);

  // Handle employee selection
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchRouteHistory(selectedEmployeeId);
      
      // Find employee and center map
      const employee = employees.find(e => e.employeeId === selectedEmployeeId);
      if (employee) {
        setMapCenter({
          lat: employee.latitude,
          lng: employee.longitude
        });
        setZoom(15);
      }
    } else {
      setRouteHistory([]);
    }
  }, [selectedEmployeeId, fetchRouteHistory, employees]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!isLoaded) return;

    const handleLocationUpdate = (data: any) => {
      setEmployees(prev => {
        const existingIndex = prev.findIndex(e => e.employeeId === data.employeeId);
        
        if (existingIndex >= 0) {
          // Update existing employee
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            accuracy: data.location.accuracy,
            timestamp: data.location.timestamp,
            isOnline: true
          };
          return updated;
        } else {
          // Add new employee
          return [...prev, {
            _id: data.employeeId,
            employeeId: data.employeeId,
            employeeName: `${data.employee?.firstName || ''} ${data.employee?.lastName || ''}`,
            employeeEmail: data.employee?.email || '',
            employeePhoto: data.employee?.photo,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            accuracy: data.location.accuracy,
            timestamp: data.location.timestamp,
            isOnline: true
          }];
        }
      });

      // Show alert notification if geofence violation
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert: any) => {
          console.log('GeoFence Alert:', alert);
        });
      }
    };

    socket.on('locationUpdate', handleLocationUpdate);

    return () => {
      socket.off('locationUpdate', handleLocationUpdate);
    };
  }, [isLoaded]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-4">
          <p className="text-red-500">Error loading Google Maps</p>
          <p className="text-sm text-gray-500">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onMapLoad}
        options={mapOptions}
      >
        {/* Employee Markers */}
        {employees.map((employee) => (
          <Marker
            key={employee.employeeId}
            position={{
              lat: employee.latitude,
              lng: employee.longitude
            }}
            onClick={() => onEmployeeSelect?.(employee.employeeId)}
            icon={{
              url: employee.isOnline 
                ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="white" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `)
                : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#6b7280" stroke="white" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16)
            }}
            title={employee.employeeName}
          />
        ))}

        {/* Route History Polyline */}
        {showRoutes && routeHistory.length > 0 && (
          <Polyline
            path={routeHistory.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.8,
              strokeWeight: 3
            }}
          />
        )}

        {/* GeoFence Circles */}
        {showGeoFences && geoFences.map((fence) => (
          fence.isActive && (
            <Circle
              key={fence._id}
              center={{
                lat: fence.centerLatitude,
                lng: fence.centerLongitude
              }}
              radius={fence.radius}
              options={{
                fillColor: fence.color,
                fillOpacity: 0.2,
                strokeColor: fence.color,
                strokeOpacity: 0.8,
                strokeWeight: 2
              }}
            />
          )
        ))}
      </GoogleMap>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md">
          <span className="text-sm text-gray-600">Updating locations...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 px-4 py-2 rounded-lg">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-xs">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          <span className="text-xs">Offline</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMap;
