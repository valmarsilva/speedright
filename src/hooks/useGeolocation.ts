import { useState, useEffect, useCallback, useRef } from "react";

interface GeolocationState {
  speed: number; // m/s
  distance: number; // meters
  accuracy: number;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isTracking: boolean;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
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
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    speed: 0,
    distance: 0,
    accuracy: 0,
    latitude: null,
    longitude: null,
    error: null,
    isTracking: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const totalDistanceRef = useRef(0);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalização não suportada pelo navegador",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy } = position.coords;
        
        // Calculate distance
        if (lastPositionRef.current) {
          const dist = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lon,
            latitude,
            longitude
          );
          // Only add distance if accuracy is reasonable and movement is significant
          if (accuracy < 50 && dist > 2) {
            totalDistanceRef.current += dist;
          }
        }
        
        lastPositionRef.current = { lat: latitude, lon: longitude };

        setState((prev) => ({
          ...prev,
          speed: speed !== null && speed >= 0 ? speed : 0,
          distance: totalDistanceRef.current,
          accuracy,
          latitude,
          longitude,
          error: null,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          isTracking: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  const resetDistance = useCallback(() => {
    totalDistanceRef.current = 0;
    lastPositionRef.current = null;
    setState((prev) => ({ ...prev, distance: 0 }));
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    resetDistance,
  };
};
