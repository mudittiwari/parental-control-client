import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { onDisplayNotification } from '../services/notificationService';
import { loadKeyPair } from './keysStorage';
import { RSA } from 'react-native-rsa-native';
import { SOCKET_URL } from '../constants/constants';
import { useTrackingStatus } from './trackingStatus';
import { getUser } from './localStorage';


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
        console.log("subscribing")
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
            console.log(keys)
            const privateKey = keys.private;
            const decryptedPayload = await RSA.decrypt(payload, privateKey);
            console.log('📥 Decrypted payload:', decryptedPayload);

            await onDisplayNotification();
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

