// app/(tabs)/_layout.js or app/_layout.js if you're nesting tabs there
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import StatusBarHeader from '../../components/headers/statusBarHeader';;

export default function TabLayout() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={{ flex: 1 ,paddingTop: Platform.OS === 'android' ? 0 : 10}}>
        {/* <StatusBarHeader /> */}

        <Tabs
          screenOptions={({ route }) => ({
            headerShown: true,
            header: () => <StatusBarHeader />,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.grayText,
            tabBarStyle: {
              backgroundColor: COLORS.white,
              borderTopWidth: 1,
              borderTopColor: COLORS.lightGray,
              height: 80,
              paddingBottom: 10,
              paddingTop: 6,
            },
            tabBarIcon: ({ focused, color }) => {
              let iconName;
              if (route.name === 'friends') iconName = focused ? 'people' : 'people-outline';
              else if (route.name === 'groups') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              else if (route.name === 'invites') iconName = focused ? 'mail-open' : 'mail-outline';
              else if (route.name === 'profile') iconName = focused ? 'person-circle' : 'person-circle-outline';

              return <Ionicons name={iconName} size={22} color={color} />;
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
        >
          <Tabs.Screen name="friends" options={{ title: 'Friends' }} />
          <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
          <Tabs.Screen name="invites" options={{ title: 'Invites' }} />
          <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lightGray, // match your header background
  },
});

