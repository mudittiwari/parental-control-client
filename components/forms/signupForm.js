import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { GLOBAL } from '../../constants/global';
import { COLORS } from '../../constants/colors';
import PrimaryButton from '../../components/buttons/primaryButton';
import axios from 'axios';
import LoadingBar from '../../components/loadingBar';
import { BASE_URL } from '../../constants/constants';
import { generateKeyPair } from '../../services/generateKeys';
import { saveKeyPair } from '../../services/keysStorage';
import { loadKeyPair } from '../../services/keysStorage';

export default function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.name || !form.email || form.mobile.length !== 10 || !form.password) {
      Alert.alert('Validation Error', 'Please fill all fields with valid info');
      return;
    }

    setIsLoading(true);
    try {
      let keyPair = await loadKeyPair();
      let key = null;
      if (!keyPair) {
        console.log('No key pair found, generating new keys...');
        const keys = await generateKeyPair();
        await saveKeyPair(keys);
        key = keys.public;
      }
      else{
        key = keyPair.public; 
      }
      const requestBody = {
        name: form.name,
        email: form.email,
        phoneNumber: form.mobile,
        password: form.password,
        lat: "",
        lon: "",
        pKey: key
      };
      const res = await axios.post(`${BASE_URL}/auth/register`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true"
        },
      });

      Alert.alert('Success', 'User registered successfully');
      router.replace('/');
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={GLOBAL.card}>
      {isLoading && <LoadingBar />}

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your full name"
        value={form.name}
        onChangeText={(val) => setForm({ ...form, name: val })}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(val) => setForm({ ...form, email: val })}
      />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        maxLength={10}
        value={form.mobile}
        onChangeText={(val) => setForm({ ...form, mobile: val })}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your password"
        secureTextEntry
        value={form.password}
        onChangeText={(val) => setForm({ ...form, password: val })}
      />

      <PrimaryButton title="Sign Up" onPress={handleSignup} />

      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={styles.link}>
          Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, marginBottom: 6, color: '#37474F' },
  link: { color: COLORS.primary, textAlign: 'center' },
});
