import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const GlowingButton = ({ isGlowing, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isGlowing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.stopAnimation();
    }
  }, [isGlowing]);

  return (
    <Animated.View
      style={[
        styles.glowWrapper,
        isGlowing && {
          transform: [{ scale: scaleAnim }],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          borderWidth: 2,
          ...Platform.select({
            android: {
              elevation: 12,
            },
            ios: {
              shadowColor: '#10B981',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 12,
            },
          }),
        },
      ]}
    >
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <Ionicons name="location" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: '#10B981', // deep inner tone
    borderRadius: 24,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#10B981', // same as glow
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  glowWrapper: {
    borderRadius: 30,
    padding:0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)', // subtle glow halo
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    ...Platform.select({
      android: {
        elevation: 16,
      },
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
      },
    }),
  },
});
