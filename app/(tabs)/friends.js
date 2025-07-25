import { View, FlatList, StyleSheet, Button } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import FriendCard from '../../components/cards/friendCard';
import { FAB } from 'react-native-paper';
import { COLORS } from '../../constants/colors';

const friends = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
];

export default function FriendsScreen() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            name={item.name}
            onPress={() => router.push(`/friend/${item.id}/features`)}
          //             onPress={() => router.push({
          //   pathname: '/features/addFeature',
          //   params: { id: '1' },
          // })
          // }
          />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
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
        ]}
        onStateChange={({ open }) => setOpen(open)}
        style={{ position: 'absolute', bottom: 0, right: 8 }}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
