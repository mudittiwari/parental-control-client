import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useState } from 'react';

const dummyGroups = [
  { id: '1', name: 'Family' },
  { id: '2', name: 'School' },
];

export default function GroupsScreen() {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={dummyGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
      <FAB.Group
        open={open}
        icon={open ? 'close' : 'plus'}
        actions={[
          { icon: 'plus', label: 'Add Feature', onPress: () => console.log('Add Feature') },
          { icon: 'account-group', label: 'Add Group', onPress: () => console.log('Add Group') },
        ]}
        onStateChange={({ open }) => setOpen(open)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
