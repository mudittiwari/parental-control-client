// storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const saveLocation = (location) => {
  storage.set('lastLocation', JSON.stringify(location));
};

export const getLastLocation = () => {
  const loc = storage.getString('lastLocation');
  return loc ? JSON.parse(loc) : null;
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

