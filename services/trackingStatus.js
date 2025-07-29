import { create } from 'zustand';
import {getStorageValue, setStorageValue} from "./localStorage"

export const useTrackingStatus = create((set, get) => ({
  isLocationTracking: false,
  isSocketConnected: false,

  setLocationTracking: (value) => {
    set({ isLocationTracking: value });
    setStorageValue('isLocationTracking', value);
  },

  setSocketConnected: (value) => {
    set({ isSocketConnected: value });
    setStorageValue('isSocketConnected', value);
  },

  rehydrateTrackingState: () => {
    const loc = getStorageValue('isLocationTracking');
    const sock = getStorageValue('isSocketConnected');
    set({
      isLocationTracking: loc ?? false,
      isSocketConnected: sock ?? false,
    });
  }
}));
