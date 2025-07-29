import { View, Text, FlatList, Alert, StyleSheet, RefreshControl, Image } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore } from '../../services/state/userState';
import { BASE_URL } from '../../constants/constants';
import { getMatchedContacts } from '../../services/localStorage';
import CompactMap from '../../components/miniMapView';

export default function InvitesScreen() {
  const user = useUserStore((state) => state.user);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const matchedContacts = getMatchedContacts();

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/features/pending/${user.phoneNumber}`);
      console.log('Pending requests:', response.data);
      setPendingRequests(response.data || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load invites');
    } finally {
      setRefreshing(false);
    }
  };

  const approveFeature = async (featureId) => {
    try {
      await axios.post(`${BASE_URL}/features/${featureId}/approve`, {
        trackeePhone: user.phoneNumber,
      }).then(response => {
        console.log('Feature approved:', response.data);
      });
      console.log()
      Alert.alert('Success', 'Feature approved successfully');
      fetchPendingRequests();
    } catch (err) {
      console.error('Failed to approve feature:', err);
      Alert.alert('Error', 'Approval failed');
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const getNameFromPhone = (phone) => {
    const match = matchedContacts.find(c => c.phoneNumber === phone);
    return match?.name || phone;
  };

  const renderSchedules = (schedules = []) => {
    if (schedules.length === 0) return <Text style={styles.label}>No schedules defined.</Text>;

    return (
      <View style={styles.scheduleContainer}>
        <Text style={styles.label}>Schedules:</Text>
        {schedules.map((schedule, index) => (
          <View key={index} style={styles.scheduleBox}>
            <Text style={styles.scheduleText}>
              🕒 {schedule.startTime} - {schedule.endTime}
            </Text>
            {schedule.activeDays?.length > 0 && (
              <Text style={styles.scheduleText}>📅 {schedule.activeDays.join(', ')}</Text>
            )}
            {schedule.activeDates?.length > 0 && (
              <Text style={styles.scheduleText}>
                📆 Dates: {schedule.activeDates.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const center = item.area.centerLocation;
    const name = getNameFromPhone(item.trackerPhone);

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.name || 'Feature Request'}</Text>
        <Text style={styles.sub}>From: {name}</Text>
        <CompactMap
          latitude={parseFloat(center.latitude)}
          longitude={parseFloat(center.longitude)}
          radius={item.area.radiusInKm * 1000}
        />
        <Text style={styles.label}>Radius: {item.area.radiusInKm} km</Text>
        <Text style={styles.label}>Status: {item.status}</Text>
        {renderSchedules(item.schedules)}
        <Text style={styles.button} onPress={() => approveFeature(item.id)}>
          ✅ Approve
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={pendingRequests}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchPendingRequests();
          }}
        />
      }
      contentContainerStyle={{
        padding: 16,
        flexGrow: 1,
        justifyContent: pendingRequests.length === 0 ? 'center' : 'flex-start',
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/images/no-invites.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Invites Yet</Text>
          <Text style={styles.emptySubtitle}>
            You’ll see feature requests here when someone adds you to their tracking list.
          </Text>
        </View>
      }

    />
  );

}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#10B981',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '600',
  },
  scheduleContainer: {
    marginTop: 10,
    paddingVertical: 8,
  },
  scheduleBox: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  scheduleText: {
    fontSize: 13,
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 32,
  },
  emptyImage: {
    width: 250,
    height: 250,
    marginBottom: 24,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },



});
