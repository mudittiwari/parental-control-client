import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { LocationProvider } from '../context/locationContext'; // your context
import { initSocket } from '../services/socketConnection';
import { startLocationTracking, checkPermissions } from '../services/locationService';
import {onDisplayNotification} from '../services/notificationService';
import notifee from "@notifee/react-native";
export default function Layout() {

  function initializeNotification(){
    notifee.onBackgroundEvent((event) => {
      console.log('Background event:', event.id);
    });

  }

  async function initialize() {
    initSocket();
    await checkPermissions();
    initializeNotification();
    // startLocationTracking();
  }

  useEffect(() => {
    initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* <LocationProvider> */}
          <Stack screenOptions={{ headerShown: false }} />
        {/* </LocationProvider> */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

