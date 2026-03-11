import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { 
  getGeoFences, 
  createGeoFence, 
  updateGeoFence, 
  deleteGeoFence,
  getAlerts,
  markAlertAsRead,
  resolveAlert,
  GeoFenceData,
  GeoFenceAlert as AlertType
} from '../../utils/locationApi';
import { MapPin, AlertTriangle, Check, X, Trash2, Edit, Plus, Eye, EyeOff } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 23.0225,
  lng: 72.5714
};

const GeoFenceManager: React.FC = () => {
  const [geoFences, setGeoFences] = useState<GeoFenceData[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'geofences' | 'alerts'>('geofences');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    centerLatitude: 23.0225,
    centerLongitude: 72.5714,
    radius: 100,
    description: '',
    color: '#FF5722',
    alertOnEnter: true,
    alertOnExit: true
  });

  // Map state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  const googleMapsKey = (import.meta as any).env.VITE_GOOGLE_MAPS_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsKey,
    libraries: ['geometry']
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [geoFencesResponse, alertsResponse] = await Promise.all([
        getGeoFences(),
        getAlerts()
      ]);

      if (geoFencesResponse.success) {
        setGeoFences(geoFencesResponse.data);
      }

      if (alertsResponse.success) {
        setAlerts(alertsResponse.data);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateGeoFence(editingId, formData);
      } else {
        await createGeoFence(formData);
      }
      await fetchData();
      resetForm();
    } catch (err: any) {
      console.error('Error saving geofence:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this geofence?')) {
      try {
        await deleteGeoFence(id);
        await fetchData();
      } catch (err) {
        console.error('Error deleting geofence:', err);
      }
    }
  };

  const handleEdit = (fence: GeoFenceData) => {
    setEditingId(fence._id);
    setFormData({
      name: fence.name,
      centerLatitude: fence.centerLatitude,
      centerLongitude: fence.centerLongitude,
      radius: fence.radius,
      description: fence.description,
      color: fence.color,
      alertOnEnter: fence.alertOnEnter,
      alertOnExit: fence.alertOnExit
    });
    setMarkerPosition({
      lat: fence.centerLatitude,
      lng: fence.centerLongitude
    });
    setShowForm(true);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAlertAsRead(id);
      fetchData();
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveAlert(id);
      fetchData();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      centerLatitude: 23.0225,
      centerLongitude: 72.5714,
      radius: 100,
      description: '',
      color: '#FF5722',
      alertOnEnter: true,
      alertOnExit: true
    });
    setMarkerPosition(defaultCenter);
  };

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setMarkerPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
      setFormData(prev => ({
        ...prev,
        centerLatitude: e.latLng!.lat(),
        centerLongitude: e.latLng!.lng()
      }));
    }
  };

  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`pb-2 px-4 ${activeTab === 'geofences' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('geofences')}
        >
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <span>Geo-Fences</span>
          </div>
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'alerts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('alerts')}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </div>
        </button>
      </div>

      {activeTab === 'geofences' ? (
        <div>
          {/* Add Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-600"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add Geo-Fence'}
          </button>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Radius (meters)</label>
                  <input
                    type="number"
                    value={formData.radius}
                    onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                    min={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.centerLatitude}
                    onChange={(e) => setFormData({ ...formData, centerLatitude: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.centerLongitude}
                    onChange={(e) => setFormData({ ...formData, centerLongitude: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.alertOnEnter}
                      onChange={(e) => setFormData({ ...formData, alertOnEnter: e.target.checked })}
                    />
                    Alert on Enter
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.alertOnExit}
                      onChange={(e) => setFormData({ ...formData, alertOnExit: e.target.checked })}
                    />
                    Alert on Exit
                  </label>
                </div>
              </div>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                {editingId ? 'Update Geo-Fence' : 'Create Geo-Fence'}
              </button>
            </form>
          )}

          {/* Map for selecting location */}
          {isLoaded && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Click on the map to set the center location</p>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPosition}
                zoom={14}
                onClick={onMapClick}
                onLoad={onMapLoad}
              >
                <Marker
                  position={markerPosition}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      setMarkerPosition({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng()
                      });
                      setFormData(prev => ({
                        ...prev,
                        centerLatitude: e.latLng!.lat(),
                        centerLongitude: e.latLng!.lng()
                      }));
                    }
                  }}
                />
                {geoFences.map((fence) => (
                  fence.isActive && (
                    <Circle
                      key={fence._id}
                      center={{ lat: fence.centerLatitude, lng: fence.centerLongitude }}
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
            </div>
          )}

          {/* Geofence List */}
          <div className="space-y-3">
            {geoFences.map((fence) => (
              <div key={fence._id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: fence.color }}
                  ></div>
                  <div>
                    <h4 className="font-medium">{fence.name}</h4>
                    <p className="text-sm text-gray-500">
                      Radius: {fence.radius}m | 
                      {fence.alertOnEnter && ' Alert on Enter'}
                      {fence.alertOnEnter && fence.alertOnExit && ' | '}
                      {fence.alertOnExit && ' Alert on Exit'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(fence)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(fence._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {geoFences.length === 0 && !loading && (
              <p className="text-center text-gray-500">No geo-fences created yet</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert._id} 
                className={`border rounded-lg p-4 ${!alert.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${alert.alertType === 'ENTER' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <AlertTriangle 
                        size={20} 
                        className={alert.alertType === 'ENTER' ? 'text-green-600' : 'text-red-600'} 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {alert.employeeId.firstName} {alert.employeeId.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {alert.alertType === 'ENTER' ? 'Entered' : 'Exited'} {alert.geoFenceName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.createdAt).toLocaleString()} | 
                        Distance: {alert.distance}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert._id)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                        title="Mark as read"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolveAlert(alert._id)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded"
                        title="Resolve"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    {alert.isResolved && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && !loading && (
              <p className="text-center text-gray-500">No alerts yet</p>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default GeoFenceManager;
