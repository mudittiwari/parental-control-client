import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {onDisplayNotification} from "../services/notificationService";
import { loadKeyPair } from './keysStorage';
import { RSA } from 'react-native-rsa-native';
import { useTrackingStatus } from './trackingStatus'; 
const { setSocketConnected } = useTrackingStatus.getState();

let client = null;

export const initSocket = () => {
  if (client && client.active && client.connected) return;
  const socket = new SockJS('http://192.168.1.16:8080/ws');
  client = new Client({
    webSocketFactory: () => socket,
    debug: (msg) => console.log('STOMP DEBUG:', msg),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('✅ STOMP connected');
      setSocketConnected(true);
      // Subscribe to receive notifications
      client.subscribe('/topic/notifications/device123', async (message) => {
        const body = JSON.parse(message?.body);
        const payload  = body?.payload;
        const keys= await loadKeyPair();
        if(!keys){
          console.error('❌ No keys found for decryption');
          return;
        }
        const privateKey = keys.private;
        // console.log(keys)
        // console.log('📥 Received payload:', payload);
        const decryptedPayload = await RSA.decrypt(payload, privateKey);
        console.log('📥 Decrypted payload:', decryptedPayload);
        await onDisplayNotification();
      });
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
    }
  });
  client.activate();
};

export const disconnectSocket = () =>{
  if(client && client.connected){
    client.deactivate();
    setSocketConnected(false);
    console.log('✅ STOMP disconnected');
  }
}

export const getSocketClient = () => client;
