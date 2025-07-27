import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { FAB } from 'react-native-paper';
import FriendCard from '../../components/cards/friendCard';
import { COLORS } from '../../constants/colors';
import { getMatchedContacts } from '../../services/localStorage';
import LoadingBar from '../../components/loadingBar';
import { getContacts } from '../../services/contactService';

export default function FriendsScreen() {
  const [friends, setFriends] = useState([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const matched = getMatchedContacts();
    setFriends(matched || []);
  }, []);

  return (
    <View style={styles.container}>

      {isLoading && <LoadingBar />}
      {friends.length === 0 ? (
        <Text style={styles.noFriends}>No matched contacts found.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item, index) => item.phoneNumber || index.toString()}
          renderItem={({ item }) => (
            <FriendCard
              name={item.name || item.phoneNumber}
              onPress={() => router.push(`/friend/${item.phoneNumber}/features`)}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        />
      )}

      <FAB.Group
        open={open}
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'account-plus',
            label: 'Add Feature',
            onPress: () => router.push('/friend/selectForFeature'),
          },
          {
            icon: 'account-group',
            label: 'Add Group',
            onPress: () => router.push('/groups/add'),
          },
          {
            icon: 'refresh',
            label: 'Refresh Contacts',
            onPress: async () => {
              setIsLoading(true);
              await getContacts();
              const matched = getMatchedContacts();
              setFriends(matched || []);
              setIsLoading(false);
            },
          },
        ]}
        onStateChange={({ open }) => setOpen(open)}
        style={{ position: 'absolute', bottom: 0, right: 8 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  noFriends: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#64748B',
  },
});
