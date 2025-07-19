import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useContext } from 'react';
import { LocationContext } from '../../context/locationContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { useState } from 'react';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import ScreenHeader from '../../components/headers/screenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screen = Dimensions.get('window');

export default function AddFeatureScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [featureName, setFeatureName] = useState('');
  const [radius, setRadius] = useState(500);
  const { location } = useContext(LocationContext);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: location.latitude || 37.78825,
    longitude: location.longitude || -122.4324,
  });
  const [selectedFeatureType, setSelectedFeatureType] = useState('enter_area');

  const handleMapPress = (e) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedLocation(coords);
  };

  const handleSubmit = () => {
    console.log({
      featureName,
      radius,
      selectedLocation,
      featureType: selectedFeatureType,
      forFriend: id,
    });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
            <Picker.Item label="Enter In An Area" value="enter_area" />
            <Picker.Item label="Exit From An Area" value="exit_area" />
          </Picker>
        </View>

        <Text style={styles.label}>Pick Location on Map</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            ...selectedLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          <Marker coordinate={selectedLocation} />
          <Circle center={selectedLocation} radius={radius} strokeColor={COLORS.primary} fillColor={'rgba(0, 122, 255, 0.1)'} />
        </MapView>

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
});

