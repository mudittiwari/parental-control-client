import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>User Profile</Text>
      <Button title="Logout" onPress={() => router.replace('/')} />
    </View>
  );
}
