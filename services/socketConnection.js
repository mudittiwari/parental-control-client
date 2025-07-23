import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {onDisplayNotification} from "../services/notificationService";

let client = null;

export const initSocket = () => {
  if (client && client.active) return;

  const socket = new SockJS('http://192.168.1.16:8080/ws');
  client = new Client({
    webSocketFactory: () => socket,
    debug: (msg) => console.log('STOMP DEBUG:', msg),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('✅ STOMP connected');

      // Subscribe to receive notifications
      client.subscribe('/topic/notifications/device123', async (message) => {
        const payload = JSON.parse(message.body);
        console.log('📩 Notification received:', payload);
        await onDisplayNotification();
        // TODO: Optional - trigger a local notification
        // PushNotification.localNotification({ title: "Alert", message: payload.message });
      });
    },
    onStompError: (frame) => {
      console.error('❌ STOMP error:', frame);
    },
  });

  client.activate();
};

export const getSocketClient = () => client;
