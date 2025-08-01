// storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const setStorageValue = (key, value) => {
  storage.set(key, JSON.stringify(value));
};

export const getStorageValue = (key) => {
  const raw = storage.getString(key);
  return raw ? JSON.parse(raw) : null;
};


export const saveMatchedContacts = (contacts) => {
  storage.set('matchedContacts', JSON.stringify(contacts));
};

export const getMatchedContacts = () => {
  const raw = storage.getString('matchedContacts');
  return raw ? JSON.parse(raw) : [];
};
export const saveUser = (user) => {
  storage.set('currentUser', JSON.stringify(user));
};

export const getUser = () => {
  const raw = storage.getString('currentUser');
  return raw ? JSON.parse(raw) : null;
};

export const clearUser = () => {
  storage.delete('currentUser');
};

export const deleteMatchedContacts = () => {
  storage.delete('matchedContacts');
}

export const addMatchedContact = (identifier) => {
  const raw = storage.getString('matchedContactsLocation');
  const contactArray = raw ? JSON.parse(raw) : [];
  const contactSet = new Set(contactArray);

  contactSet.add(identifier);
  storage.set('matchedContactsLocation', JSON.stringify([...contactSet]));

};
export const removeMatchedContact = (identifier) => {
  const raw = storage.getString('matchedContactsLocation');
  const contactArray = raw ? JSON.parse(raw) : [];

  const contactSet = new Set(contactArray);
  contactSet.delete(identifier);

  storage.set('matchedContactsLocation', JSON.stringify([...contactSet]));
};
export const getMatchedContactsLocation = () => {
  const raw = storage.getString('matchedContactsLocation');
  return raw ? JSON.parse(raw) : [];
};
export const deleteMatchedContactsLocation = () => {
  storage.delete('matchedContactsLocation');
}



const FEATURE_MAP_KEY = 'matchedContactFeatures';
const FEATURE_STATE_KEY = 'contactPreviousGeofenceStates';

const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const getTimeMeta = () => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const day = now.toLocaleString('en-US', { weekday: 'long' });
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  return { minutes, day, dateStr };
};

const isScheduleActive = (feature) => {
  const { minutes, day, dateStr } = getTimeMeta();
  return feature.schedules?.some((schedule) => {
    const inTime = timeToMinutes(schedule.startTime) <= minutes && minutes <= timeToMinutes(schedule.endTime);
    const inDay = schedule.activeDays?.includes(day);
    const inDate = schedule.activeDates?.includes(dateStr);
    return inTime && (inDay || inDate);
  });
};

export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isInsideGeofence = (feature, lat, lon) => {
  const center = feature.area.centerLocation;
  const distance = getDistanceKm(
    parseFloat(center.latitude),
    parseFloat(center.longitude),
    lat,
    lon
  );
  return distance <= feature.area.radiusInKm;
};


export const addFeatureForPhone = (phone, feature) => {
  const raw = storage.getString(FEATURE_MAP_KEY);
  const map = raw ? JSON.parse(raw) : {};
  const features = map[phone] || [];
  feature.hasNotified = false;
  features.push(feature);
  map[phone] = features;
  storage.set(FEATURE_MAP_KEY, JSON.stringify(map));
};

// Remove all features for a phone
export const removePhoneFeatures = (phone) => {
  const raw = storage.getString(FEATURE_MAP_KEY);
  const map = raw ? JSON.parse(raw) : {};
  delete map[phone];
  storage.set(FEATURE_MAP_KEY, JSON.stringify(map));
};

// Remove a single feature by ID
export const removeFeatureForPhone = (phone, featureId) => {
  const raw = storage.getString(FEATURE_MAP_KEY);
  const map = raw ? JSON.parse(raw) : {};
  if (!map[phone]) return;
  map[phone] = map[phone].filter((feature) => feature.id !== featureId);
  storage.set(FEATURE_MAP_KEY, JSON.stringify(map));
};

export const getFeaturesForPhone = (phone) => {
  const raw = storage.getString(FEATURE_MAP_KEY);
  const map = raw ? JSON.parse(raw) : {};
  return map[phone] || [];
};

export const clearAllFeatures = () => {
  storage.delete(FEATURE_MAP_KEY);
};

// Location handler
export const handleLocationUpdate = (phone, currentLat, currentLon) => {
  const features = getFeaturesForPhone(phone);
  const previousStatesRaw = storage.getString(FEATURE_STATE_KEY);
  const previousStates = previousStatesRaw ? JSON.parse(previousStatesRaw) : {};

  const mapRaw = storage.getString(FEATURE_MAP_KEY);
  const featureMap = mapRaw ? JSON.parse(mapRaw) : {};
  const updatedFeatures = featureMap[phone] || [];

  const currentState = [];

  updatedFeatures.forEach((feature) => {
    const featureId = feature.id.toString();
    const isInside = isInsideGeofence(feature, currentLat, currentLon);
    const wasInside = previousStates[featureId] === true;
    const activeNow = isScheduleActive(feature);

    if (isInside && !wasInside && activeNow && feature.hasNotified === false) {
      console.log(`📥 ENTERED feature ${feature.name}`);
      feature.hasNotified = true;
      // TODO: trigger notification here
    }
    else if (!isInside && wasInside && activeNow && feature.hasNotified === false) {
      console.log(`📤 EXITED feature ${feature.name}`);
      feature.hasNotified = true;
      // TODO: trigger notification here
    }

    currentState.push({ id: featureId, inside: isInside });
  });

  // Save updated state and feature map
  const updatedStates = {};
  currentState.forEach(({ id, inside }) => {
    updatedStates[id] = inside;
  });

  storage.set(FEATURE_STATE_KEY, JSON.stringify(updatedStates));
  featureMap[phone] = updatedFeatures;
  storage.set(FEATURE_MAP_KEY, JSON.stringify(featureMap));
};
