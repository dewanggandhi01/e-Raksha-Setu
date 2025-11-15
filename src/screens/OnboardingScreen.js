import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Secure Digital Identity',
    subtitle: 'Get your blockchain-secured tourist ID',
    description: 'Register with Aadhaar or Passport to get a tamper-proof digital identity valid for your entire trip duration.',
    icon: 'card-outline',
    color: theme.colors.primary,
  },
  {
    id: 2,
    title: 'Smart Route Planning',
    subtitle: 'AI-powered safety recommendations',
    description: 'Get route recommendations rated 1-5 based on safety factors including road quality, emergency services, and risk assessment.',
    icon: 'map-outline',
    color: theme.colors.accent,
  },
  {
    id: 3,
    title: 'Real-time Monitoring',
    subtitle: 'Stay safe with continuous tracking',
    description: 'Advanced monitoring system tracks your journey and sends alerts for deviations or prolonged inactivity.',
    icon: 'eye-outline',
    color: theme.colors.info,
  },
  {
    id: 4,
    title: 'Emergency Response',
    subtitle: 'Instant help when you need it',
    description: 'Panic button, automatic SOS calls, and direct connection to nearest police stations and emergency contacts.',
    icon: 'shield-checkmark-outline',
    color: theme.colors.error,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      navigation.navigate('Permissions');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Permissions');
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true,
      });
    }
  };

  const renderOnboardingItem = (item, index) => (
    <View key={item.id} style={[styles.slide, { width }]}>
      <LinearGradient
        colors={[`${item.color}20`, `${item.color}05`]}
        style={styles.slideGradient}
      >
        {/* Illustration Container */}
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconBackground, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon} size={80} color={item.color} />
          </View>
          
          {/* Floating elements for visual interest */}
          <View style={[styles.floatingElement, styles.floatingElement1]}>
            <Ionicons name="location" size={16} color={`${item.color}60`} />
          </View>
          <View style={[styles.floatingElement, styles.floatingElement2]}>
            <Ionicons name="shield" size={12} color={`${item.color}40`} />
          </View>
          <View style={[styles.floatingElement, styles.floatingElement3]}>
            <Ionicons name="pulse" size={14} color={`${item.color}50`} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: item.color }]}>
            {item.subtitle}
          </Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {/* Features list for each onboarding screen */}
        <View style={styles.featuresContainer}>
          {index === 0 && (
            <>
              <FeatureItem icon="checkmark-circle" text="Blockchain Security" />
              <FeatureItem icon="time" text="Trip Duration Validity" />
              <FeatureItem icon="fingerprint" text="Biometric Verification" />
            </>
          )}
          {index === 1 && (
            <>
              <FeatureItem icon="analytics" text="AI Risk Assessment" />
              <FeatureItem icon="medical" text="Nearby Emergency Services" />
              <FeatureItem icon="cellular" text="Network Coverage Check" />
            </>
          )}
          {index === 2 && (
            <>
              <FeatureItem icon="location" text="GPS Tracking" />
              <FeatureItem icon="notifications" text="Deviation Alerts" />
              <FeatureItem icon="wifi" text="Offline Maps" />
            </>
          )}
          {index === 3 && (
            <>
              <FeatureItem icon="call" text="Instant SOS" />
              <FeatureItem icon="people" text="Emergency Contacts" />
              <FeatureItem icon="document-text" text="Auto E-FIR" />
            </>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>e-Raksha Setu</Text>
        
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {currentIndex + 1}/{onboardingData.length}
          </Text>
        </View>
      </View>

      {/* Onboarding Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item, index) => renderOnboardingItem(item, index))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Page Indicators */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
                { backgroundColor: index === currentIndex ? 
                  onboardingData[currentIndex].color : theme.colors.border 
                }
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity 
              onPress={handlePrevious}
              style={[styles.navButton, styles.prevButton]}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.textSecondary} />
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={handleNext}
            style={[
              styles.navButton, 
              styles.nextButton,
              { backgroundColor: onboardingData[currentIndex].color }
            ]}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={16} color={theme.colors.accent} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  skipButton: {
    padding: theme.spacing.sm,
  },
  skipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.md,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  stepIndicator: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  stepText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  slide: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  floatingElement: {
    position: 'absolute',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  floatingElement1: {
    top: '20%',
    right: '20%',
  },
  floatingElement2: {
    bottom: '30%',
    left: '15%',
  },
  floatingElement3: {
    top: '40%',
    left: '10%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  featuresContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  prevButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  prevButtonText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.md,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    marginRight: theme.spacing.xs,
  },
});