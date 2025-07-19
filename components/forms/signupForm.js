import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { GLOBAL } from '../../constants/global';
import { COLORS } from '../../constants/colors';
import PrimaryButton from '../../components/buttons/primaryButton';

export default function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '' });

  const handleSignup = () => {
    if (!form.name || !form.email || form.mobile.length !== 10) {
      alert('Please fill all fields with valid info');
      return;
    }

    // In real app: send to backend here

    router.replace('/(tabs)/friends');
  };

  return (
    <View style={GLOBAL.card}>
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

      <PrimaryButton title="Sign Up" onPress={handleSignup} />

      <TouchableOpacity onPress={() => {
        console.log("Navigating to login screen");
        router.replace('/')
        }}>
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
