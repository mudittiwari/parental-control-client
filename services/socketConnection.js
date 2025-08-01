import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { onDisplayNotification } from '../services/notificationService';
import { loadKeyPair } from './keysStorage';
import { RSA } from 'react-native-rsa-native';
import { SOCKET_URL } from '../constants/constants';
import { useTrackingStatus } from './trackingStatus';
import { getFeaturesForPhone, getUser } from './localStorage';
import { storage } from './localStorage';



const FEATURE_MAP_KEY = 'matchedContactFeatures';
const FEATURE_STATE_KEY = 'contactPreviousGeofenceStates';

const getSetSocketConnected = () => {
  try {
    return useTrackingStatus.getState().setSocketConnected;
  } catch (e) {
    return () => { };
  }
};

export const initSocket = (client) => {
  const setSocketConnected = getSetSocketConnected();

  if (client && client.active && client.connected) return;

  const socket = new SockJS(`${SOCKET_URL}/ws`);
  client = new Client({
    webSocketFactory: () => socket,
    debug: (msg) => console.log('STOMP DEBUG:', msg),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('✅ STOMP connected');
      setSocketConnected(true);
      const user = getUser();
      if (user.phoneNumber) {
        client.subscribe(`/topic/notifications/${user.phoneNumber}`, async (message) => {
          try {
            console.log(message.body)
            const body = JSON.parse(message?.body);
            const payload = body?.payload;
            const keys = await loadKeyPair();

            if (!keys) {
              console.error('❌ No keys found for decryption');
              return;
            }
            const privateKey = keys.private;
            const decryptedPayload = await RSA.decrypt(payload, privateKey);
            console.log('📥 Decrypted payload:', decryptedPayload);

            const senderNumber = body.userId;
            handleLocationUpdate(senderNumber, decryptedPayload.latitude, decryptedPayload.longitude);

          } catch (err) {
            console.error('❌ Error handling incoming message:', err);
          }
        });
      }
    },
    onStompError: (frame) => {
      setSocketConnected(false);
      console.error('❌ STOMP error:', frame);
    },
    onWebSocketClose: () => {
      setSocketConnected(false);
      console.log('❌ WebSocket closed');
    },
    onWebSocketError: (error) => {
      setSocketConnected(false);
      console.error('❌ WebSocket error:', error);
    },
  });
  client.activate();
  return client;
};

export const disconnectSocket = (client) => {
  const setSocketConnected = getSetSocketConnected();
  console.log('🔌 Disconnecting STOMP client...');
  if (!client) {
    console.warn('❗ No STOMP client to disconnect');
    return;
  }
  if (client && client.connected) {
    console.log("hello world")
    client.deactivate();
    setSocketConnected(false);
    console.log('✅ STOMP disconnected');
  }
};



const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const getTimeMeta = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  });

  const [hourStr, minuteStr] = formatter.format(now).split(':');
  const minutes = parseInt(hourStr) * 60 + parseInt(minuteStr);
  const dateStr = dateFormatter.format(now);
  const day = dayFormatter.format(now).toUpperCase();

  return { minutes, day, dateStr };
};

const isScheduleActive = (feature) => {
  const { minutes, day, dateStr } = getTimeMeta();
  return feature.schedules?.some((schedule) => {
    const start = timeToMinutes(schedule.startTime);
    let end = timeToMinutes(schedule.endTime);
    if (end === 0) end = 1440;
    const inTime = minutes >= start && minutes < end;
    const inDay = schedule.activeDays?.includes(day);
    const inDate = schedule.activeDates?.includes(dateStr);
    return inTime && (inDay || inDate);
  });
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isInsideGeofence = (feature, lat, lon) => {
  const center = feature.area.centerLocation;
  const distance = getDistanceKm(
    parseFloat(center.latitude),
    parseFloat(center.longitude),
    lat,
    lon
  );
  return distance <= feature.area.radiusInKm;
};



const handleLocationUpdate = async (phone, currentLat, currentLon) => {
  console.log(phone)
  const updatedFeatures = getFeaturesForPhone(phone);
  const previousStatesRaw = storage.getString(FEATURE_STATE_KEY);
  const previousStates = previousStatesRaw ? JSON.parse(previousStatesRaw) : {};

  const mapRaw = storage.getString(FEATURE_MAP_KEY);
  const featureMap = mapRaw ? JSON.parse(mapRaw) : {};
  // const updatedFeatures = featureMap[phone] || [];

  const currentState = [];

  updatedFeatures.forEach((feature) => {
    const featureId = feature.id.toString();
    const isInside = isInsideGeofence(feature, currentLat, currentLon);
    const wasInside = previousStates[featureId] === true;
    const activeNow = isScheduleActive(feature);

    if (isInside && !wasInside && activeNow && feature.hasNotified === false) {
      console.log(`📥 ENTERED feature ${feature.name}`);
      feature.hasNotified = true;
      // TODO: trigger notification here
    }
    else if (!isInside && wasInside && activeNow && feature.hasNotified === false) {
      console.log(`📤 EXITED feature ${feature.name}`);
      feature.hasNotified = true;

      // TODO: trigger notification here
    }

    currentState.push({ id: featureId, inside: isInside });
  });

  // Save updated state and feature map
  const updatedStates = {};
  currentState.forEach(({ id, inside }) => {
    updatedStates[id] = inside;
  });

  storage.set(FEATURE_STATE_KEY, JSON.stringify(updatedStates));
  featureMap[phone] = updatedFeatures;
  storage.set(FEATURE_MAP_KEY, JSON.stringify(featureMap));
  await onDisplayNotification();
};


