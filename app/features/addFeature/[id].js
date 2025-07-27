import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { COLORS } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import ScreenHeader from '../../../components/headers/screenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InteractiveMap from '../../../components/interactiveMap';
import { requestEntryExitFeature } from '../../../services/api/featureService';
import { useUserStore } from '../../../services/state/userState';
import LoadingBar from '../../../components/loadingBar';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';



const screen = Dimensions.get('window');

export default function AddFeatureScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUserStore((state) => state.user);
  const [featureName, setFeatureName] = useState('');
  const [radius, setRadius] = useState(500);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFeatureType, setSelectedFeatureType] = useState('entry');
  const [isLoading, setIsLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleDate = (dateStr) => {
    setSelectedDates((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr] ? undefined : { selected: true },
    }));
  };

  const handleAddSchedule = () => {
    if (!startTime || !endTime) return Alert.alert('Missing Time');

    setSchedules(prev => [
      ...prev,
      {
        startTime,
        endTime,
        activeDays: selectedDays,
        activeDates: Object.keys(selectedDates),
      },
    ]);

    // Reset selections
    setSelectedDays([]);
    setSelectedDates({});
    setStartTime(null);
    setEndTime(null);
  };



  //7535832284
  //6376433270

  const handleMapPress = (e) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedLocation(coords);
  };

  const handleSubmit = async () => {
    console.log({
      featureName,
      radius,
      selectedLocation,
      featureType: selectedFeatureType,
      forFriend: id,
    });
    console.log(user)
    if (featureName.trim() === '' || !selectedLocation) {
      Alert.alert("Validation Error", "Please fill all fields correctly");
      return;
    }
    try {
      setIsLoading(true);
      await requestEntryExitFeature({
        trackerPhone: user.phoneNumber,
        trackeePhone: id,
        lat: selectedLocation.latitude,
        lon: selectedLocation.longitude,
        radiusKm: radius / 1000,
        name: featureName,
        featureType: selectedFeatureType,
        schedules
      });

      Alert.alert("Feature Added", `${selectedFeatureType} feature has been added successfully`);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Failed to add entry/exit feature:", error);
      Alert.alert("Error", "Something went wrong while adding the feature. Please try again.");
    } finally {
      setIsLoading(false);

    }
  };

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    let current = await Location.getCurrentPositionAsync({});
    setLocation(current);
    setSelectedLocation({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
    // console.log(current);
  }

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isLoading && <LoadingBar />}
      <ScreenHeader title="Add Feature" subtitle={`Assign to Friend ID: ${id}`} />

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.inputWrapper}>
          <Ionicons name="pricetag" size={20} color={COLORS.grayText} style={styles.icon} />
          <TextInput
            placeholder="Feature Name"
            value={featureName}
            onChangeText={setFeatureName}
            style={styles.input}
            placeholderTextColor={COLORS.grayText}
          />
        </View>

        <Text style={styles.label}>Select Feature Type</Text>
        <View style={styles.dropdownWrapper}>
          <Picker
            selectedValue={selectedFeatureType}
            onValueChange={(itemValue) => setSelectedFeatureType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Enter In An Area" value="entry" />
            <Picker.Item label="Exit From An Area" value="exit" />
            <Picker.Item label="Entry & Exit From An Area" value="entry-exit" />
          </Picker>
        </View>

        <Text style={styles.label}>Pick Location on Map</Text>
        {/* <MapView
          style={styles.map}
          initialRegion={{
            ...selectedLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={selectedLocation} />
          <Circle
            center={selectedLocation}
            radius={radius}
            strokeColor={COLORS.primary}
            fillColor={'rgba(0, 122, 255, 0.1)'}
          />
        </MapView> */}
        {selectedLocation ? (
          <InteractiveMap
            initialLocation={selectedLocation}
            radius={radius}
            onLocationSelect={(coords) => setSelectedLocation(coords)}
          />
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 12 }}>📍 Getting location...</Text>
        )}

        <View style={styles.inputWrapper}>
          <Ionicons name="resize" size={20} color={COLORS.grayText} style={styles.icon} />
          <TextInput
            placeholder="Radius (meters)"
            keyboardType="numeric"
            value={radius.toString()}
            onChangeText={(value) => setRadius(Number(value))}
            style={styles.input}
            placeholderTextColor={COLORS.grayText}
          />
        </View>

        <Text style={styles.label}>Add Schedule</Text>

        <View style={styles.scheduleBlock}>
          <Text style={styles.label}>Select Start Time</Text>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.timeBox}
          >
            <Text>{startTime || 'Pick Start Time'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Select End Time</Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.timeBox}
          >
            <Text>{endTime || 'Pick End Time'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Select Days</Text>
          <View style={styles.dayRow}>
            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.daySelected,
                ]}
              >
                <Text style={styles.dayText}>{day.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Select Dates</Text>
          <Calendar
            markingType="multi-dot"
            markedDates={selectedDates}
            onDayPress={(day) => toggleDate(day.dateString)}
          />

          <TouchableOpacity onPress={handleAddSchedule} style={styles.addScheduleBtn}>
            <Text style={styles.buttonText}>+ Add This Schedule</Text>
          </TouchableOpacity>
        </View>

        {schedules.map((s, i) => (
          <View key={i} style={styles.scheduleItem}>
            <Text>🕓 {s.startTime} → {s.endTime}</Text>
            {s.activeDays.length > 0 && <Text>📆 Days: {s.activeDays.join(', ')}</Text>}
            {s.activeDates.length > 0 && <Text>📅 Dates: {s.activeDates.join(', ')}</Text>}
          </View>
        ))}

        {showStartPicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartTime(date.toTimeString().slice(0, 5));
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) setEndTime(date.toTimeString().slice(0, 5));
            }}
          />
        )}



        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Add Feature</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: 20,
    gap: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkText,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 6,
    marginTop: 12,
  },
  dropdownWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  map: {
    height: screen.height * 0.25,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scheduleBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    elevation: 2,
  },
  timeBox: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayText,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayText,
  },
  daySelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    color: COLORS.darkText,
  },
  addScheduleBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  scheduleItem: {
    backgroundColor: COLORS.white,
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    elevation: 1,
  },

});
