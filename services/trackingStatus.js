import { create } from 'zustand';

export const useTrackingStatus = create((set) => ({
  isLocationTracking: false,
  isSocketConnected: false,
  setLocationTracking: (value) => set({ isLocationTracking: value }),
  setSocketConnected: (value) => set({ isSocketConnected: value }),
}));
