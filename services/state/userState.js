// stores/useUserStore.js
import { create } from 'zustand';
import { saveUser, getUser, clearUser as clearUserStorage, deleteMatchedContacts, deleteMatchedContactsLocation } from '../../services/localStorage';

export const useUserStore = create((set) => ({
  user: getUser(),

  setUser: (userData) => {
    saveUser(userData);
    set({ user: userData });
  },

  clearUser: () => {
    clearUserStorage();
    deleteMatchedContacts();
    deleteMatchedContactsLocation();
    set({ user: null });
  },

  getUserId: () => {
    const state = useUserStore.getState();
    return state.user?.id || null;
  },

  getUserPhone: () => {
    const state = useUserStore.getState();
    return state.user?.phoneNumber || null;
  },

  getUserLocation: () => {
    const state = useUserStore.getState();
    return state.user?.location || null;
  },
}));
