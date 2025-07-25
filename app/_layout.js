import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { LocationProvider } from '../context/locationContext'; // your context
import { initSocket } from '../services/socketConnection';
import { startLocationTracking, checkPermissions } from '../services/locationService';
import { onDisplayNotification } from '../services/notificationService';
import notifee, { EventType } from "@notifee/react-native";
import { generateKeyPair } from "../services/generateKeys";
import { loadKeyPair, saveKeyPair, deleteKeyPair } from "../services/keysStorage";
import { isLocationTracking } from '../services/locationService';
import { useTrackingStatus } from '../services/trackingStatus';
export default function Layout() {

  const { setLocationTracking, setSocketConnected } = useTrackingStatus.getState();
  function initializeNotification() {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('📲 Notification pressed in background:', detail.notification.id);
        // Handle navigation, data fetching, etc.
      }
    });

    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('🗑 Notification dismissed:', detail.notification.id);
          break;

        case EventType.PRESS:
          console.log('📲 Notification pressed:', detail.notification.id);
          break;
      }
    });




  }

  async function initialize() {
    initSocket();
    await checkPermissions();
    initializeNotification();
    const keyPair = await loadKeyPair();
    if (!keyPair) {
      console.log('No key pair found, generating new keys...');
      const keys = await generateKeyPair();
      await saveKeyPair(keys);
    }
    const isLocationTrackingActive = isLocationTracking();
    if(isLocationTrackingActive){
      setLocationTracking(true);
    }
    else{
      setLocationTracking(false);
    }
    // console.log(keyPair)
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

