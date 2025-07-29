// storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const setStorageValue = (key, value) => {
  storage.set(key, JSON.stringify(value));
};

export const getStorageValue = (key) => {
  const raw = storage.getString(key);
  return raw ? JSON.parse(raw) : null;
};


export const saveMatchedContacts = (contacts) => {
  storage.set('matchedContacts', JSON.stringify(contacts));
};

export const getMatchedContacts = () => {
  const raw = storage.getString('matchedContacts');
  return raw ? JSON.parse(raw) : [];
};
export const saveUser = (user) => {
  storage.set('currentUser', JSON.stringify(user));
};

export const getUser = () => {
  const raw = storage.getString('currentUser');
  return raw ? JSON.parse(raw) : null;
};

export const clearUser = () => {
  storage.delete('currentUser');
};

export const deleteMatchedContacts = () => {
  storage.delete('matchedContacts');
}
