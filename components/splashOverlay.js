import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Text, Animated, Easing } from 'react-native';

export default function SplashOverlay() {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const bounce1 = useRef(new Animated.Value(0)).current;
    const bounce2 = useRef(new Animated.Value(0)).current;
    const bounce3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate welcome text
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 60,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

        const pulse = (dot, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: -8,
                        duration: 250,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                        delay,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 250,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        pulse(bounce1, 0);
        pulse(bounce2, 150);
        pulse(bounce3, 300);
    }, []);

    return (
        <View style={styles.overlay}>
            <Image
                source={require('../assets/images/splash_screen.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            <Animated.Text
                style={[
                    styles.welcomeText,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                Welcome to <Text style={styles.brand}>SafeTrack</Text>
            </Animated.Text>

            <View style={styles.dotContainer}>
                <Animated.View style={[styles.dot, { transform: [{ translateY: bounce1 }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: bounce2 }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: bounce3 }] }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    logo: {
        width: 350,
        height: 150,
        marginBottom: 32,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 30,
        textAlign: 'center',
    },
    brand: {
        color: '#3B82F6',
        fontWeight: '800',
    },
    dotContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#3B82F6',
        marginHorizontal: 6,
        shadowColor: '#3B82F6',
        shadowOpacity: 0.5,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
});
