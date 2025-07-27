import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/headers/screenHeader';
import { COLORS } from '../../constants/colors';
import { getMatchedContacts } from '../../services/localStorage';

export default function SelectFriendForFeature() {
  const [friends, setFriends] = useState([]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const matched = getMatchedContacts();
    setFriends(matched || []);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}>
      <ScreenHeader title="Select a Friend" subtitle="Choose who to assign a feature to" />

      <FlatList
        data={friends}
        keyExtractor={(item, index) => item.phoneNumber || index.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/features/addFeature/${item.phoneNumber}`)}
          >
            <Text style={styles.name}>{item.name || item.phoneNumber}</Text>
            <Text style={styles.sub}>Tap to proceed</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No matched contacts available.</Text>
        }
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
  empty: {
    textAlign: 'center',
    color: COLORS.grayText,
    fontSize: 14,
    marginTop: 32,
  },
});
