import { AppRegistry } from 'react-native';
import { initSocket } from './socketConnection';

import { NativeModules } from 'react-native';
// export const SocketTask = async () => {
//   console.log('[Headless JS] 🔌 WebSocket task started');
//   initSocket(); // Your existing STOMP logic
//   // while (true) {
//   //   console.log('[Headless JS] 🔄 Reinitializing socket connection')
//   // };
// };


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const SocketTask = async () => {
  console.log('[Headless JS] 🔌 SocketHeadlessTask started');

  let counter = 0;
  while (true) {
    const time = new Date().toLocaleTimeString();
    console.log(`[Headless JS] 🔄 Background loop [${counter}] at ${time}`);
    counter++;
    await sleep(1000); // Wait 5 seconds to avoid CPU hogging
  }
};


// AppRegistry.registerHeadlessTask('SocketHeadlessTask', () => SocketTask);

// NativeModules.SocketStarterModule.startSocketService();