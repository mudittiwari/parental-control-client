import React, { createContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      setPermissionGranted(true);

      // Start tracking in background
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // every 5 seconds
          distanceInterval: 10, // or every 10 meters
        },
        (loc) => {
          setLocation(loc.coords);
          // TODO: Send to server here if needed
        }
      );
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, permissionGranted }}>
      {children}
    </LocationContext.Provider>
  );
}
