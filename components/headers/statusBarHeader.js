import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrackingStatus } from '../../services/trackingStatus';
import { startLocationTracking, stopLocationTracking } from '../../services/locationService';
import { initSocket, disconnectSocket } from '../../services/socketConnection';
import { COLORS } from '../../constants/colors';
import { BlurView } from 'expo-blur';

export default function StatusBarHeader() {
    const {
        isLocationTracking,
        isSocketConnected,
        setLocationTracking,
        setSocketConnected,
    } = useTrackingStatus();

    const handleToggleLocation = async () => {
        if (isLocationTracking) {
            await stopLocationTracking();
            setLocationTracking(false);
        } else {
            await startLocationTracking();
            setLocationTracking(true);
        }
    };

    const handleToggleSocket = () => {
        if (isSocketConnected) {
            disconnectSocket();
            setSocketConnected(false);
        } else {
            initSocket();
        }
    };

    return (
        <View style={styles.wrapper}>
            <BlurView intensity={40} tint="light" style={styles.container}>
                <View style={styles.pillGroup}>
                    <View style={[styles.pill, { backgroundColor: isLocationTracking ? '#E6FFF0' : '#FFE6E6' }]}>
                        <Ionicons
                            name="location-outline"
                            size={16}
                            color={isLocationTracking ? COLORS.green : COLORS.red}
                            style={styles.pillIcon}
                        />
                        <Text style={[styles.pillText, { color: isLocationTracking ? COLORS.green : COLORS.red }]}>
                            {isLocationTracking ? 'Tracking On' : 'Tracking Off'}
                        </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: isSocketConnected ? '#E8F4FF' : '#FFEFE6' }]}>
                        <Ionicons
                            name="wifi-outline"
                            size={16}
                            color={isSocketConnected ? COLORS.primary : COLORS.red}
                            style={styles.pillIcon}
                        />
                        <Text style={[styles.pillText, { color: isSocketConnected ? COLORS.primary : COLORS.red }]}>
                            {isSocketConnected ? 'Connected' : 'Disconnected'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={handleToggleLocation}
                        style={[
                            styles.iconBtn,
                            { backgroundColor: isLocationTracking ? '#FF4E4E' : '#7CFFCB' },
                        ]}
                    >
                        <Ionicons
                            name={isLocationTracking ? 'navigate' : 'navigate-circle-outline'}
                            size={22}
                            color={'#1B1B1B'}
                        />
                    </TouchableOpacity>



                    <TouchableOpacity
                        onPress={handleToggleSocket}
                        style={[
                            styles.iconBtn,
                            { backgroundColor: isSocketConnected ? '#7CD1FF' : '#FFAD60' },
                        ]}
                    >
                        <Ionicons name={isSocketConnected ? 'wifi' : 'refresh'} size={22} color={'#1B1B1B'} />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        overflow: 'visible',
        backgroundColor: "#5B36AC",
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        zIndex: 100,
    },
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pillGroup: {
        flexDirection: 'row',
        gap: 10,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    pillIcon: {
        marginRight: 6,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        padding: 10,
        borderRadius: 100,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});
