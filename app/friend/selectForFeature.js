import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/headers/screenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const friends = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
];

export default function SelectFriendForFeature() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}>
      <ScreenHeader title="Select a Friend" subtitle="Choose who to assign a feature to" />

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            // onPress={() => router.push({ pathname: '/features/addFeature', params: { id: item.id } })}
            onPress={() => router.push(`/features/addFeature/${item.id}`)}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>Tap to proceed</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  sub: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 4,
  },
});
