import BackgroundService from 'react-native-background-actions';
// import Geolocation from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform, Linking, Alert } from 'react-native';
import { getSocketClient, initSocket } from './socketConnection';
import { RSA } from 'react-native-rsa-native';
import { loadKeyPair } from './keysStorage';
// import { saveLocation } from './locationStorage';
import { useTrackingStatus } from './trackingStatus'; 

let client = null;
const { setLocationTracking } = useTrackingStatus.getState();

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
            // console.log('✅ Notification permission granted');
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

const encryptLocation = async (location, receiverPublicKey) => {
    const payload = JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
    });
    // console.log(payload, receiverPublicKey)
    const encrypted = await RSA.encrypt(payload, receiverPublicKey);
    return encrypted;
};


let watchId = null;
const locationTask = async () => {
    console.log('📍 Starting hybrid location tracking task');

    const interval = 60 * 1000; // 10 seconds
    const timeoutMs = 8000;
    const maxFailuresBeforeWatch = 3;

    let failureCount = 0;
    let watchId = null;

    const sendEncryptedLocation = async (position) => {
        try {
            setLocationTracking(true);
            const timestamp = Date.now();
            const keys = await loadKeyPair();

            const payload = await encryptLocation(
                {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                keys.public
            );

            const location = {
                senderId: 'device123',
                receiverId: 'admin456',
                payload,
                timestamp,
            };

            const client = getSocketClient();

            const maxRetries = 3;
            let attempt = 0;

            while ((!client || !client.connected) && attempt < maxRetries) {
                console.warn(`🔁 Attempting to reconnect socket (${attempt + 1}/${maxRetries})`);
                initSocket(); // make sure this returns a Promise that resolves when socket is ready
                await sleep(5000);  // wait a bit before next check
                attempt++;
            }

            // After retrying, check again
            const newClient = getSocketClient();
            if (newClient && newClient.connected) {
                newClient.publish({
                    destination: '/app/send-location',
                    body: JSON.stringify(location),
                });
                console.log('📤 Location sent:', location);
            } else {
                console.error('❌ Failed to connect socket after multiple attempts');
            }

        } catch (err) {
            console.error('❌ Encryption/send failed:', err);
        }
    };

    const startWatch = () => {
        if (watchId !== null) return;

        console.log('📡 Switching to watchPosition fallback');
        watchId = Geolocation.watchPosition(
            async (position) => {
                console.log('📍 watchPosition received:', position);
                await sendEncryptedLocation(position);

                // After 1 successful reading, go back to polling
                Geolocation.clearWatch(watchId);
                watchId = null;
                failureCount = 0;
                console.log('🔁 Returning to getCurrentPosition mode');
            },
            (error) => {
                console.warn('❌ watchPosition error:', error);
            },
            {
                enableHighAccuracy: false,
                distanceFilter: 0,
                interval: 10000,
                fastestInterval: 5000,
                showsBackgroundLocationIndicator: true,
            }
        );
    };

    while (BackgroundService.isRunning()) {
        await new Promise((resolve) => {
            let resolved = false;

            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    failureCount++;
                    console.warn('⚠️ getCurrentPosition timed out');
                    if (failureCount >= maxFailuresBeforeWatch) {
                        startWatch();
                    }
                    resolve();
                }
            }, timeoutMs);

            Geolocation.getCurrentPosition(
                async (position) => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        failureCount = 0;
                        if (watchId !== null) {
                            Geolocation.clearWatch(watchId);
                            watchId = null;
                            console.log('🛑 Cleared watchPosition after successful one-shot');
                        }
                        console.log('✅ getCurrentPosition success:', position);
                        await sendEncryptedLocation(position);
                        resolve();
                    }
                },
                (error) => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        failureCount++;
                        console.warn('❌ getCurrentPosition error:', error);
                        if (failureCount >= maxFailuresBeforeWatch) {
                            startWatch();
                        }
                        resolve();
                    }
                },
                {
                    enableHighAccuracy: false,
                    timeout: timeoutMs,
                    maximumAge: 0,
                }
            );
        });

        await sleep(interval);
    }

    // Cleanup
    //   if (watchId !== null) {
    //     Geolocation.clearWatch(watchId);
    //     watchId = null;
    //     console.log('🧹 Cleared watchPosition on exit');
    //   }
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
        setLocationTracking(false);
        console.log('🛑 Background service stopped');
    }
};


export const isLocationTracking = () => BackgroundService.isRunning();