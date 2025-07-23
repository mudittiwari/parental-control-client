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
