import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../../../components/headers/screenHeader';
import CompactMap from '../../../../components/miniMapView';

export default function FeatureDetails() {
  const { data, friendId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const parsedFeature = JSON.parse(data);
  const { id, name, status, area, schedules, createdAt } = parsedFeature;
  const center = area.centerLocation;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Feature Details" subtitle={name} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Feature Overview */}
        <View style={styles.card}>
          <Text style={styles.title}>{name}</Text>

          <InfoRow icon="account" label={`Friend ID: ${friendId}`} />
          <InfoRow icon="map-marker" label={`Location: ${center.latitude}, ${center.longitude}`} />
          <InfoRow icon="map-marker-radius" label={`Radius: ${area.radiusInKm} km`} />
          <InfoRow icon="check-decagram" label={`Status: ${status}`} iconColor={status === 'active' ? 'green' : 'red'} />

          {createdAt && (
            <InfoRow icon="calendar-month" label={`Created: ${createdAt.split('T')[0]}`} />
          )}
        </View>

        {/* Map Preview */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Map Preview</Text>
          <CompactMap
            latitude={parseFloat(center.latitude)}
            longitude={parseFloat(center.longitude)}
            radius={area.radiusInKm * 1000}
          />
        </View>

        {/* Schedules */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🗓️ Schedules</Text>
          {schedules?.length ? (
            schedules.map((sch, index) => (
              <View key={index} style={styles.scheduleBlock}>
                <Text style={styles.scheduleText}>🕓 {sch.startTime} - {sch.endTime}</Text>
                {sch.activeDays?.length > 0 && (
                  <Text style={styles.scheduleSubText}>📅 Days: {sch.activeDays.join(', ')}</Text>
                )}
                {sch.activeDates?.length > 0 && (
                  <Text style={styles.scheduleSubText}>📌 Dates: {sch.activeDates.join(', ')}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.infoText}>No schedules set.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable InfoRow Component
function InfoRow({ icon, label, iconColor = COLORS.primary }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      <Text style={styles.infoText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Subtle off-white background
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#A0AEC0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  infoText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#475569',
    fontWeight: '500',
  },
  scheduleBlock: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6', // Tailwind Blue-500
    shadowColor: '#CBD5E1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  scheduleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  scheduleSubText: {
    fontSize: 14,
    color: '#64748B',
  },
});

