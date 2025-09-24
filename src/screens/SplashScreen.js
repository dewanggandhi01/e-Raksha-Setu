import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Splash animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Auto-navigate after animation
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 2000);
    });
  }, []);

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Ionicons 
              name="shield-checkmark" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
        </View>

        {/* App Title */}
        <Text style={styles.title}>e-Raksha Setu</Text>
        <Text style={styles.subtitle}>Stay Safe, Travel Smart</Text>

        {/* Safety Features Icons */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="location" size={24} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>Real-time Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="alert-circle" size={24} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>Emergency SOS</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="map" size={24} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>Safe Routes</Text>
          </View>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing Safety Systems...</Text>
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress,
                { 
                  transform: [{ 
                    scaleX: fadeAnim 
                  }] 
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <View style={styles.bottomContainer}>
        <Text style={styles.brandingText}>
          Powered by AI • Secured by Blockchain
        </Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: theme.fonts.sizes.xxxl,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.lg,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: theme.spacing.xxl,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.fonts.sizes.xs,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.fonts.sizes.sm,
    marginBottom: theme.spacing.md,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignItems: 'center',
  },
  brandingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.fonts.sizes.xs,
    marginBottom: theme.spacing.xs,
  },
  versionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: theme.fonts.sizes.xs,
  },
});