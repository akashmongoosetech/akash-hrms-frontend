import { useEffect, useRef, useState, useCallback } from 'react';
import { updateLocation } from '../../utils/locationApi';
import toast from 'react-hot-toast';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Custom hook for location tracking
export const useLocationTracker = (
  isTracking: boolean,
  updateInterval: number = 15000
) => {
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [lastSentPosition, setLastSentPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Check and request geolocation permission
  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);
      
      permission.addEventListener('change', () => {
        setPermissionStatus(permission.state);
      });

      if (permission.state === 'denied') {
        setError('Location permission denied. Please enable location access in your browser settings.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error checking permission:', err);
      return true;
    }
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(async (): Promise<Position | null> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCurrentPosition(pos);
          resolve(pos);
        },
        (err) => {
          console.error('Error getting current position:', err);
          setError(`Failed to get location: ${err.message}`);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );
    });
  }, []);

  // Send location to backend
  const sendLocation = useCallback(async (position: Position) => {
    try {
      // Check if position changed significantly (> 5 meters)
      if (lastSentPosition) {
        const distance = calculateDistance(
          lastSentPosition.latitude,
          lastSentPosition.longitude,
          position.latitude,
          position.longitude
        );
        
        // Only send if moved more than 5 meters
        if (distance < 5) {
          console.log('Position not changed significantly, skipping update');
          return;
        }
      }

      await updateLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: new Date().toISOString()
      });

      setLastSentPosition(position);
      console.log('Location sent successfully');
    } catch (err) {
      console.error('Error sending location:', err);
    }
  }, [lastSentPosition, calculateDistance]);

  // Start watching position
  const startTracking = useCallback(async () => {
    const hasPermission = await checkPermission();
    if (!hasPermission) return;

    // First, get initial position
    const initialPosition = await getCurrentPosition();
    if (initialPosition) {
      await sendLocation(initialPosition);
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setCurrentPosition(pos);
        sendLocation(pos);
      },
      (err) => {
        console.error('Watch position error:', err);
        setError(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    // Also set up periodic updates
    intervalRef.current = setInterval(async () => {
      const pos = await getCurrentPosition();
      if (pos) {
        await sendLocation(pos);
      }
    }, updateInterval);

    console.log('Location tracking started');
    toast.success('Location tracking started');
  }, [checkPermission, getCurrentPosition, sendLocation, updateInterval]);

  // Stop watching position
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCurrentPosition(null);
    console.log('Location tracking stopped');
    toast.success('Location tracking stopped');
  }, []);

  // Handle tracking state changes
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, startTracking, stopTracking]);

  return {
    currentPosition,
    isTracking,
    error,
    permissionStatus,
    startTracking,
    stopTracking,
    refreshLocation: getCurrentPosition
  };
};

export default useLocationTracker;
