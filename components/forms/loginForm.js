import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import axios from 'axios';
import { GLOBAL } from '../../constants/global';
import PrimaryButton from '../../components/buttons/primaryButton';
import { COLORS } from '../../constants/colors';
import LoadingBar from '../../components/loadingBar';
import { saveUser } from '../../services/localStorage';
import { BASE_URL } from '../../constants/constants';
import { useUserStore } from '../../services/state/userState';

export default function LoginForm() {
  const setUser = useUserStore((state) => state.setUser);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (mobile.length !== 10 || !password) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        phoneNumber: mobile,
        password: password,
      },{
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true"
        },
      });
      // console.log('Login response:', response.data);
      const user = response.data;
      console.log(user)
      if (user) {
        saveUser(user);
        setUser(user);
        Alert.alert('Login Success', 'Welcome back!');
        router.replace('/(tabs)/friends');
      }
      else {
        Alert.alert('Login Failed', 'Invalid credentials, please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={GLOBAL.card}>
      {isLoading && <LoadingBar />}

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
        maxLength={10}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PrimaryButton title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={{ fontWeight: 'bold' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, marginBottom: 6, color: '#37474F' },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 12 },
});
