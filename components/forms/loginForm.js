import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { GLOBAL } from '../../constants/global';
import PrimaryButton from '../../components/buttons/primaryButton';
import { COLORS } from '../../constants/colors';

export default function LoginForm() {
  const [mobile, setMobile] = useState('');

  const handleLogin = () => {
    if (mobile.length === 10) {
      router.replace('/(tabs)/friends');
    } else {
      alert('Please enter a valid 10-digit mobile number');
    }
  };

  return (
    <View style={GLOBAL.card}>
      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={GLOBAL.input}
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
        maxLength={10}
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
  link: { color: COLORS.primary, textAlign: 'center' },
});
