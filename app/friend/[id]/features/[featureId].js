import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenHeader from '../../../../components/headers/screenHeader';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function FeatureDetails() {
  const { id, featureId } = useLocalSearchParams();
   const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Feature Details"
        subtitle="Complete information about this geo-fence"
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Geofence Zone</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="identifier" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Feature ID: {featureId}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Friend ID: {id}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-radius" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Type: Geofence</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-distance" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Radius: 500m</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="school" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Location: School Zone</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status & Timestamps</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="check-circle" size={20} color="green" />
            <Text style={styles.infoText}>Status: Active</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>Created At: 2024-11-12</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    marginLeft: 10,
    color: COLORS.grayText,
  },
});
