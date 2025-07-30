import { View, FlatList, StyleSheet, Text, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { FAB } from 'react-native-paper';
import FriendCard from '../../components/cards/friendCard';
import { COLORS } from '../../constants/colors';
import { getMatchedContacts } from '../../services/localStorage';
import LoadingBar from '../../components/loadingBar';
import { getContacts } from '../../services/contactService';
import { loadKeyPair } from '../../services/keysStorage';
import { useCallback } from 'react';
import {generateKeyPair} from "../../services/generateKeys"
import { saveKeyPair } from '../../services/keysStorage';

export default function FriendsScreen() {
  const [friends, setFriends] = useState([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeContacts();
  }, []);

  const initializeContacts = useCallback(async () => {
    try {
      const matched = getMatchedContacts();

      if (matched && matched.length > 0) {
        setFriends(matched);
        return;
      }

      setIsLoading(true);
      await refreshContacts();
    } catch (error) {
      console.error(' Error initializing contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setIsLoading(true);
      await refreshContacts();
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshContacts = async () => {
    await getContacts();

    let keyPair = await loadKeyPair();
    if (!keyPair) {
      console.log(' No key pair found, generating new keys...');
      const newKeys = await generateKeyPair();
      await saveKeyPair(newKeys);
      keyPair = newKeys;
    }

    const matchedContacts = getMatchedContacts();
    // console.log('Matched Contacts:', matchedContacts);
    setFriends(matchedContacts || []);
  };

  return (
    <View style={styles.container}>
      {isLoading && <LoadingBar />}

      <FlatList
        data={friends}
        keyExtractor={(item, index) => item.phoneNumber || index.toString()}
        renderItem={({ item }) => (
          <FriendCard
            name={item.name || item.phoneNumber}
            onPress={() => router.push(`/friend/${item.phoneNumber}/features`)}
          />
        )}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.noFriends}>No matched contacts found.</Text>
          </View>
        }
      />

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
            onPress: handleRefresh,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});
