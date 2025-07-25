import {RSA} from 'react-native-rsa-native';

export const generateKeyPair = async () => {
  const keys = await RSA.generateKeys(2048); 
  return keys;
};
