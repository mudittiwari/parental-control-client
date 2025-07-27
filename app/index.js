import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import AuthHeader from '../components/headers/authHeader';
import { useEffect } from 'react';
import LoginForm from '../components/forms/loginForm';
import { COLORS } from '../constants/colors';
import { getUser } from '../services/localStorage';
import { InteractionManager } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      const user = getUser();
      if (user) {
        console.log('User already logged in:', user);
        router.replace('/(tabs)/friends');
      }
    });

    return () => task.cancel();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <AuthHeader
              title="Welcome Back 👋"
              subtitle="Login to manage your family circle"
            />
            <LoginForm />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
