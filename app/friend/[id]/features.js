import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../../services/state/userState';
import { addFeatureForPhone, addMatchedContact, getFeaturesForPhone, getMatchedContacts, getMatchedContactsLocation, removeFeatureForPhone, removeMatchedContact } from '../../../services/localStorage';
import ScreenHeader from '../../../components/headers/screenHeader';
import { COLORS } from '../../../constants/colors';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { useTrackingStatus } from '../../../services/trackingStatus';
import { GlowingButton } from '../../../components/buttons/glowingButton';

export default function FriendFeatures() {
  const {
    isLocationTracking,
    isSocketConnected,
  } = useTrackingStatus();
  const layout = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user = useUserStore((state) => state.user);
  const matchedContacts = getMatchedContacts();
  const matched = matchedContacts.find((c) => c.phoneNumber === id);
  const allFeatures = matched?.features || {};
  const [matchedContactsLocation, setMatchedContactsLocation] = useState(() => {
    return getMatchedContactsLocation();
  });

  const featuresIHaveOnFriend = allFeatures[`${user.phoneNumber}_on_${id}`] || [];
  const featuresFriendHasOnMe = allFeatures[`${id}_on_${user.phoneNumber}`] || [];

  const pulseOpacity = useRef(new Animated.Value(0.3)).current;

  const isNowInSchedule = (schedules) => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
    });

    const [hourStr, minuteStr] = formatter.format(now).split(':');
    const currentTime = parseInt(hourStr) * 60 + parseInt(minuteStr);

    const currentDate = dateFormatter.format(now);
    const currentDay = dayFormatter.format(now).toUpperCase();

    return schedules?.some((schedule) => {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);

      const start = startHour * 60 + startMin;
      let end = endHour * 60 + endMin;

      if (end === 0) end = 1440;

      const dayMatch = schedule.activeDays?.includes(currentDay);
      const dateMatch = schedule.activeDates?.includes(currentDate);

      return (dayMatch || dateMatch) && currentTime >= start && currentTime < end;
    });
  };

  const handleStartLocationShare = async (feature, activeStatus) => {
    console.log(feature)
    if (activeStatus == false) {
      Alert.alert("","Please start location sharing from Friends tab first.")
      return;
    }

    const contactId = feature.trackerPhone;
    console.log(contactId)
    let contacts = getMatchedContactsLocation();
    const exists = contacts.includes(contactId);

    if (!exists) {
      addMatchedContact(contactId);
      contacts.push(contactId); // Update local copy
    } else {
      removeMatchedContact(contactId);
      contacts = contacts.filter((id) => id !== contactId);
    }
    setMatchedContactsLocation(contacts);
  };


  const isContactMatched = (phone) => {
    return matchedContactsLocation.includes(phone);
  };


  const handleStartSocketShare = async (feature, activeStatus) => {
    console.log(feature)
    if (activeStatus == false) {
      Alert.alert("","Please start notification receiver from Friends tab first.")
      return;
    }
    const features = getFeaturesForPhone(feature.trackeePhone);
    for (let index = 0; index < features.length; index++) {
      const element = features[index];
      if (element?.id === feature.id) {
        removeFeatureForPhone(feature.trackeePhone, feature.id);
        console.log(getFeaturesForPhone(feature.trackeePhone));
        return false;
      }
    }
    addFeatureForPhone(feature.trackeePhone, feature);
    console.log(getFeaturesForPhone(feature.trackeePhone));
    return true;
  }


  const renderFeatureCard = (feature, type, activeStatus) => {
    const isActiveNow = isNowInSchedule(feature.schedules || []);
    const [isFeatureNotification, setIsFeatureNotification] = useState(false);
    useEffect(() => {
      if (isActiveNow) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: false,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    }, [isActiveNow]);

    useEffect(() => {
      const features = getFeaturesForPhone(feature.trackeePhone);
      for (let index = 0; index < features.length; index++) {
        const element = features[index];
        if (element?.id === feature.id) {
          setIsFeatureNotification(true);
          return;
        }
      }
      setIsFeatureNotification(false);
    }, [isFeatureNotification]);



    return (
      <Animated.View
        key={feature.id}
        style={[
          styles.cardWrapper,
          isActiveNow && {
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: pulseOpacity,
            shadowRadius: 10,
            elevation: 10,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            isActiveNow && styles.liveCard,
          ]}
          onPress={() =>
            router.push({
              pathname: `/friend/${feature.trackeePhone}/features/${feature.id}`,
              params: {
                data: JSON.stringify(feature),
                friendId: id,
              },
            })
          }
        >
          {isActiveNow && (
            <View style={styles.liveBadgeWrapper}>
              <Text style={styles.liveBadgeText}>📡 LIVE</Text>
            </View>
          )}
          {isActiveNow && (
            <View style={styles.actionButtonsContainer}>
              {type === 'theirs' && (
                <GlowingButton
                  isGlowing={isContactMatched(feature.trackerPhone)}
                  onPress={() =>{
                     handleStartLocationShare(feature, activeStatus)
                    }}
                    icon={"location"}
                />
              )}

              {type === 'mine' && (
                 <GlowingButton
                  isGlowing={isFeatureNotification}
                  onPress={() =>{
                     setIsFeatureNotification(handleStartSocketShare(feature, activeStatus));
                    }}
                    icon={"wifi"}
                />
              )}
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.featureName}>{feature.name}</Text>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      feature.status === 'APPROVED'
                        ? '#10B98122'
                        : feature.status === 'PENDING'
                          ? '#F59E0B22'
                          : '#EF444422',
                  },
                ]}
              >
                <Ionicons
                  name={
                    feature.status === 'APPROVED'
                      ? 'checkmark-circle'
                      : feature.status === 'PENDING'
                        ? 'time'
                        : 'close-circle'
                  }
                  size={14}
                  color={
                    feature.status === 'APPROVED'
                      ? '#10B981'
                      : feature.status === 'PENDING'
                        ? '#F59E0B'
                        : '#EF4444'
                  }
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        feature.status === 'APPROVED'
                          ? '#10B981'
                          : feature.status === 'PENDING'
                            ? '#F59E0B'
                            : '#EF4444',
                    },
                  ]}
                >
                  {feature.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="radio" size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>Radius: {feature.area.radiusInKm} km</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>
              Lat: {parseFloat(feature.area.centerLocation.latitude).toFixed(4)}, Lon:{' '}
              {parseFloat(feature.area.centerLocation.longitude).toFixed(4)}
            </Text>
          </View>

          {feature.schedules?.length > 0 && (
            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduleLabel}>🗓 Schedules</Text>
              {feature.schedules.map((s, idx) => (
                <View key={idx} style={styles.scheduleItem}>
                  <Text style={styles.time}>
                    {s.startTime} - {s.endTime}
                  </Text>
                  {s.activeDays.length > 0 && (
                    <Text style={styles.meta}>📅 Days: {s.activeDays.join(', ')}</Text>
                  )}
                  {s.activeDates.length > 0 && (
                    <Text style={styles.meta}>📍 Dates: {s.activeDates.join(', ')}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };


  const renderMine = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {featuresIHaveOnFriend.length === 0 ? (
        <Text style={styles.empty}>You have no features set on this user.</Text>
      ) : featuresIHaveOnFriend.map((feature) =>
        renderFeatureCard(feature, 'mine', isSocketConnected)
      )}
    </ScrollView>
  );

  const renderTheirs = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {featuresFriendHasOnMe.length === 0 ? (
        <Text style={styles.empty}>This user has no features set on you.</Text>
      ) : featuresIHaveOnFriend.map((feature) =>
        renderFeatureCard(feature, 'theirs', isLocationTracking)
      )}
    </ScrollView>
  );

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'mine', title: 'My Features' },
    { key: 'theirs', title: 'Their Features' },
  ]);

  const renderScene = SceneMap({
    mine: renderMine,
    theirs: renderTheirs,
  });



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Mutual Features"
        subtitle={`With ${matched?.name || id}`}
        rightIcon="information-circle-outline"
        onRightPress={() => console.log('Info')}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: COLORS.primary }}
            style={{ backgroundColor: COLORS.white }}
            activeColor={COLORS.primary}
            inactiveColor={COLORS.grayText}
            labelStyle={{ fontWeight: '600' }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  iconCircle: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 50,
    marginRight: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },

  headerText: {
    flex: 1,
  },

  featureName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 2,
  },

  statusText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4B5563',
  },

  scheduleBlock: {
    marginTop: 14,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  scheduleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  scheduleItem: {
    marginBottom: 10,
  },

  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  scheduleTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 10,
    color: '#374151',
  },
  scheduleItem: {
    marginTop: 4,
  },
  scheduleTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  scheduleDays: {
    fontSize: 13,
    color: '#6B7280',
  },
  empty: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  cardWrapper: {
    marginVertical: 10,
    borderRadius: 12,
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },

  liveCard: {
    backgroundColor: '#f0fff8',
    borderWidth: 1,
    borderColor: '#10B981',
  },


  liveBadgeWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },

  liveBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 20,
    position: 'absolute',
    right: 15,
    top: 15,
    gap: 8
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  glowWrapper: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  }


});
