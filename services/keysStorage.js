import * as Keychain from 'react-native-keychain';

export async function saveKeyPair(keys) {
    // console.log("keys are " ,keys)
    await Keychain.setGenericPassword('rsa', JSON.stringify({ private: keys.private, public: keys.public }));
    console.log('Key pair saved securely');
}

export async function loadKeyPair() {
    const creds = await Keychain.getGenericPassword();
    if (creds) {
        return JSON.parse(creds.password);
    }
    return null;
}

export async function deleteKeyPair() {
    await Keychain.resetGenericPassword();
    console.log("key pair deleted successfully");
}
