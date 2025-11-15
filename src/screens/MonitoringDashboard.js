import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Maps functionality replaced with visual placeholders for Expo Go compatibility
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function MonitoringDashboard({ navigation, route }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [tripData, setTripData] = useState({
    startTime: null,
    distance: 0,
    duration: 0,
    speed: 0,
    batteryLevel: 100,
    networkStrength: 4,
  });
  const [alertsCount, setAlertsCount] = useState(0);
  const [deviationStatus, setDeviationStatus] = useState('on-route'); // 'on-route', 'minor-deviation', 'major-deviation'
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startLocationTracking();
    startHeartbeatAnimation();
    
    // Check if we're starting monitoring from route selection
    if (route.params?.startMonitoring) {
      handleStartJourney();
    }
  }, []);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        updateTripData();
        checkForAnomalies();
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const startLocationTracking = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for safety monitoring.');
        return;
      }

      // Start watching location
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentLocation(location);
          setLastActivity(Date.now());
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const startHeartbeatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleStartJourney = () => {
    setIsMonitoring(true);
    setJourneyStarted(true);
    setTripData(prev => ({ ...prev, startTime: Date.now() }));
    
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Alert.alert(
      'Journey Started',
      'Safety monitoring is now active. Your location is being tracked and logged for security.',
      [{ text: 'OK' }]
    );
  };

  const handleEndJourney = () => {
    Alert.alert(
      'End Journey',
      'Are you sure you want to end your journey? This will stop safety monitoring.',
      [
        { text: 'Continue Journey', style: 'cancel' },
        { 
          text: 'End Journey', 
          style: 'destructive',
          onPress: () => {
            setIsMonitoring(false);
            setJourneyStarted(false);
            
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start();
            
            // Navigate to trip rating screen
            Alert.alert(
              'Journey Completed',
              'Thank you for using e-Raksha Setu. Please rate your experience.',
              [{ text: 'Rate Journey', onPress: () => navigation.navigate('Profile') }]
            );
          }
        }
      ]
    );
  };

  const updateTripData = () => {
    if (!tripData.startTime) return;

    const now = Date.now();
    const duration = Math.floor((now - tripData.startTime) / 1000); // seconds
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    setTripData(prev => ({
      ...prev,
      duration: `${hours}:${minutes.toString().padStart(2, '0')}`,
      distance: (Math.random() * 50 + 10).toFixed(1), // Mock distance
      speed: (Math.random() * 30 + 40).toFixed(0), // Mock speed
      batteryLevel: Math.max(20, prev.batteryLevel - 0.1),
      networkStrength: Math.floor(Math.random() * 5) + 1,
    }));
  };

  const checkForAnomalies = () => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    
    // Check for prolonged inactivity (mock)
    if (inactiveTime > 30000) { // 30 seconds for demo
      setAlertsCount(prev => prev + 1);
      // In real app, this would trigger SOS alerts
    }

    // Mock deviation detection
    const random = Math.random();
    if (random < 0.1) {
      setDeviationStatus('minor-deviation');
    } else if (random < 0.02) {
      setDeviationStatus('major-deviation');
    } else {
      setDeviationStatus('on-route');
    }
  };

  const handleEmergencyAction = (type) => {
    navigation.navigate('Emergency', { emergencyType: type });
  };

  const getDeviationColor = () => {
    switch (deviationStatus) {
      case 'on-route': return theme.colors.success;
      case 'minor-deviation': return theme.colors.warning;
      case 'major-deviation': return theme.colors.error;
      default: return theme.colors.success;
    }
  };

  const getDeviationText = () => {
    switch (deviationStatus) {
      case 'on-route': return 'On Route';
      case 'minor-deviation': return 'Minor Deviation';
      case 'major-deviation': return 'Major Deviation';
      default: return 'Unknown';
    }
  };

  const getStatusText = () => {
    if (!journeyActive) return 'Not Started';
    return getDeviationText();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Safety Dashboard</Text>
          <View style={styles.statusContainer}>
            <Animated.View 
              style={[
                styles.statusIndicator,
                { transform: [{ scale: isMonitoring ? pulseAnim : 1 }] },
                { backgroundColor: isMonitoring ? theme.colors.success : theme.colors.textSecondary }
              ]}
            />
            <Text style={styles.statusText}>
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.emergencyButton, styles.panicButton]}
            onPress={() => handleEmergencyAction('panic')}
          >
            <LinearGradient
              colors={[theme.colors.emergency, theme.colors.panic]}
              style={styles.emergencyButtonGradient}
            >
              <Ionicons name="warning" size={32} color="#fff" />
              <Text style={styles.emergencyButtonText}>PANIC</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.emergencyButton, styles.sosButton]}
            onPress={() => handleEmergencyAction('sos')}
          >
            <LinearGradient
              colors={[theme.colors.sos, theme.colors.emergency]}
              style={styles.emergencyButtonGradient}
            >
              <Ionicons name="call" size={32} color="#fff" />
              <Text style={styles.emergencyButtonText}>SOS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {!journeyStarted ? (
          // Pre-Journey State
          <View style={styles.preJourneyContainer}>
            <View style={styles.welcomeCard}>
              <LinearGradient
                colors={[`${theme.colors.primary}10`, `${theme.colors.primary}05`]}
                style={styles.welcomeGradient}
              >
                <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} />
                <Text style={styles.welcomeTitle}>Ready for Safe Travel</Text>
                <Text style={styles.welcomeDescription}>
                  Your digital ID is verified and emergency contacts are set. 
                  Select a destination to begin safety monitoring.
                </Text>
                
                <TouchableOpacity 
                  style={styles.selectRouteButton}
                  onPress={() => navigation.navigate('RouteSelection')}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.selectRouteGradient}
                  >
                    <Ionicons name="map" size={20} color="#fff" />
                    <Text style={styles.selectRouteText}>Select Destination</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
            
            {/* Safety Features Overview */}
            <View style={styles.featuresOverview}>
              <Text style={styles.featuresTitle}>Safety Features</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="location" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>Real-time GPS tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="analytics" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>AI anomaly detection</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="call" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>Emergency SOS system</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>Family sharing (optional)</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          // Journey Active State
          <Animated.View 
            style={[
              styles.journeyContainer,
              { opacity: slideAnim }
            ]}
          >
            {/* Map View */}
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <LinearGradient
                  colors={['#E8F5E8', '#C8E6C9']}
                  style={styles.map}
                >
                  <Animated.View style={[styles.locationIndicator, { transform: [{ scale: pulseAnim }] }]}>
                    <Ionicons name="location" size={60} color={theme.colors.primary} />
                  </Animated.View>
                  <Text style={styles.mapPlaceholderText}>Live Tracking Active</Text>
                  <Text style={styles.mapPlaceholderSubtext}>
                    {currentLocation ? 'GPS Signal Strong' : 'Acquiring GPS Signal...'}
                  </Text>
                  {journeyStats && (
                    <View style={styles.liveStats}>
                      <View style={styles.liveStat}>
                        <Ionicons name="speedometer" size={16} color={theme.colors.primary} />
                        <Text style={styles.liveStatText}>Speed: {journeyStats.speed}</Text>
                      </View>
                      <View style={styles.liveStat}>
                        <Ionicons name="shield" size={16} color={getDeviationColor()} />
                        <Text style={styles.liveStatText}>Status: {getStatusText()}</Text>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </View>
              
              {/* Map Overlay */}
              <View style={styles.mapOverlay}>
                <View style={[styles.deviationBadge, { backgroundColor: getDeviationColor() }]}>
                  <Text style={styles.deviationText}>{getDeviationText()}</Text>
                </View>
              </View>
            </View>

            {/* Trip Stats */}
            <View style={styles.tripStatsContainer}>
              <Text style={styles.tripStatsTitle}>Journey Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{tripData.duration}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="location" size={20} color={theme.colors.accent} />
                  <Text style={styles.statValue}>{tripData.distance} km</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="speedometer" size={20} color={theme.colors.info} />
                  <Text style={styles.statValue}>{tripData.speed} km/h</Text>
                  <Text style={styles.statLabel}>Speed</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="notifications" size={20} color={theme.colors.warning} />
                  <Text style={styles.statValue}>{alertsCount}</Text>
                  <Text style={styles.statLabel}>Alerts</Text>
                </View>
              </View>
            </View>

            {/* System Status */}
            <View style={styles.systemStatusContainer}>
              <Text style={styles.systemStatusTitle}>System Status</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name="battery-full" 
                    size={16} 
                    color={tripData.batteryLevel > 20 ? theme.colors.success : theme.colors.error} 
                  />
                  <Text style={styles.statusText}>Battery: {tripData.batteryLevel.toFixed(0)}%</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name="cellular" 
                    size={16} 
                    color={tripData.networkStrength > 2 ? theme.colors.success : theme.colors.warning} 
                  />
                  <Text style={styles.statusText}>Network: {tripData.networkStrength}/5</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="location" size={16} color={theme.colors.success} />
                  <Text style={styles.statusText}>GPS: Active</Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons name="cloud" size={16} color={theme.colors.info} />
                  <Text style={styles.statusText}>Sync: Online</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Emergency')}
              >
                <Ionicons name="medical" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Emergency</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {/* Share location */}}
              >
                <Ionicons name="share" size={20} color={theme.colors.accent} />
                <Text style={styles.actionButtonText}>Share Location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.endJourneyButton]}
                onPress={handleEndJourney}
              >
                <Ionicons name="stop" size={20} color={theme.colors.error} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                  End Journey
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 40,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emergencyButton: {
    flex: 1,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  emergencyButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: theme.spacing.xs,
  },
  preJourneyContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  welcomeCard: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  welcomeDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  selectRouteButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  selectRouteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  selectRouteText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuresOverview: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featuresTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featuresList: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
  },
  journeyContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  mapContainer: {
    height: 250,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  deviationBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  deviationText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}30`,
    position: 'absolute',
  },
  locationCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  tripStatsContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tripStatsTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  statValue: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  systemStatusContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  systemStatusTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  endJourneyButton: {
    borderColor: theme.colors.error,
    backgroundColor: `${theme.colors.error}10`,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  locationIndicator: {
    marginBottom: theme.spacing.md,
  },
  mapPlaceholderText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  mapPlaceholderSubtext: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  liveStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  liveStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  liveStatText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
});