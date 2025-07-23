import BackgroundService from 'react-native-background-actions';
// import Geolocation from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Linking, Alert } from 'react-native';
import { getSocketClient } from './socketConnection';
// import { saveLocation } from './locationStorage';

let client = null;

// Permission request
async function requestLocationPermissions() {
    try {
        const fine = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        const coarse = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
        let backgroundGranted = true;

        if (Platform.Version >= 30) {
            backgroundGranted = (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION)) === PermissionsAndroid.RESULTS.GRANTED;
        }

        return (
            fine === PermissionsAndroid.RESULTS.GRANTED &&
            coarse === PermissionsAndroid.RESULTS.GRANTED &&
            backgroundGranted
        );
    } catch (err) {
        console.warn('Permission error:', err);
        return false;
    }
}
async function requestNotificationPermission() {
    if (Platform.OS !== 'android' || Platform.Version < 33) {
        // Notification permission not required below Android 13 (API 33)
        return true;
    }

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('✅ Notification permission granted');
            return true;
        } else {
            console.warn('❌ Notification permission denied');
            Alert.alert(
                'Notifications Required',
                'Please enable notification permissions in app settings',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings(),
                    },
                ]
            );
            return false;
        }
    } catch (err) {
        console.error('Error requesting notification permission:', err);
        return false;
    }
}


const sleep = (ms) => new Promise(res => setTimeout(res, ms));

let watchId = null;
const locationTask = async () => {
    console.log('📍 Starting background location task (watch-based)');

    let lastSentAt = 0;
    const interval = 30 * 1000; // 10 seconds

    watchId = Geolocation.watchPosition(
        (position) => {
            // console.log('📍 Location update:', position);

            const now = Date.now();
            if (now - lastSentAt < interval) return;

            lastSentAt = now;

            const location = {
                senderId: 'device123',
                receiverId: 'admin456',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: now,
            };

            //   saveLocation({
            //     latitude: location.latitude,
            //     longitude: location.longitude,
            //   });

            const client = getSocketClient();
            if (client && client.connected) {
                client.publish({
                    destination: '/app/send-location',
                    body: JSON.stringify(location),
                });
                console.log('📤 Location sent:', location);
            } else {
                console.log('❌ STOMP not connected');
            }
        },
        (error) => {
            console.error('❌ Location watch error:', error);
        },
        {
            enableHighAccuracy: true,
            distanceFilter: 0,
            interval: 10000,
            fastestInterval: 5000,
            showsBackgroundLocationIndicator: true,
        }
    );

    console.log(watchId)
    while (BackgroundService.isRunning()) {
        await sleep(1000);
    }
};


const options = {
    taskName: 'LocationTracker',
    taskTitle: 'Tracking Location',
    taskDesc: 'Sending live location to server',
    taskIcon: {
        name: 'ic_launcher', // ✅ You must have this in mipmap folder as PNG or WebP
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourapp://home',
    parameters: {
        delay: 1000,
    },
};

export const checkPermissions = async () => {
    const granted = await requestLocationPermissions();
    if (!granted) {
        Alert.alert('Permission required', 'Grant location permissions to continue');
        return;
    }
    const notificationGranted = await requestNotificationPermission();
    if (!notificationGranted) {
        Alert.alert('Notification permission required', 'Please enable notifications for better experience');
        return;
    }
}

// Public API
export const startLocationTracking = async () => {
    const granted = await requestLocationPermissions();
    if (!granted) {
        Alert.alert('Permission required', 'Grant location permissions to continue');
        return;
    }
    const notificationGranted = await requestNotificationPermission();
    if (!notificationGranted) {
        Alert.alert('Notification permission required', 'Please enable notifications for better experience');
        return;
    }

    if (!BackgroundService.isRunning()) {
        try {
            await BackgroundService.start(locationTask, options);
            console.log('✅ Location service started');
        } catch (err) {
            console.error('❌ Failed to start service:', err);
        }
    }
};
export const stopLocationTracking = async () => {
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    console.log('🛑 Cleared location watch');
    watchId = null;
  }

  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
    console.log('🛑 Background service stopped');
  }
};

