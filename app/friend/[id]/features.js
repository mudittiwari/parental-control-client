import { View, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FeatureCard from '../../../components/cards/featureCard';
import ScreenHeader from '../../../components/headers/screenHeader';
import { COLORS } from '../../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const mockFeatures = [
  {
    id: 'f1',
    name: 'School Zone Geofence',
    description: 'Alerts when child enters/exits school zone.',
    type: 'geofence',
  },
  {
    id: 'f2',
    name: 'Home Radius Alert',
    description: 'Notification when child leaves home perimeter.',
    type: 'alert',
  },
  {
    id: 'f3',
    name: 'Night Stay Monitor',
    description: 'Notifies if child stays outside home after 10pm.',
    type: 'safezone',
  },
];

export default function FriendFeatures() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Features"
        subtitle="Geo-fencing features enabled"
        rightIcon="information-circle-outline"
        onRightPress={() => console.log('Info')}
      />


      <FlatList
        data={mockFeatures}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeatureCard
            title={item.name}
            description={item.description}
            type={item.type}
            onPress={() => router.push(`/friend/${id}/features/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
});

