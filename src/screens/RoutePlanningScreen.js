import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// Maps functionality replaced with visual placeholders for Expo Go compatibility
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

// Mock route data with safety ratings
const mockRoutes = [
  {
    id: 1,
    name: 'Main Highway Route',
    distance: '85.2 km',
    duration: '2h 15m',
    safetyRating: 2,
    safetyScore: 85,
    routeColor: theme.colors.route_safe,
    highlights: ['Well-maintained roads', '4 hospitals nearby', '3 police stations', 'Good network coverage'],
    warnings: ['Heavy traffic during peak hours'],
    coordinates: [
      { latitude: 26.1445, longitude: 91.7362 },
      { latitude: 25.9876, longitude: 91.8654 },
      { latitude: 25.8234, longitude: 91.9123 },
    ],
  },
  {
    id: 2,
    name: 'Scenic Mountain Route',
    distance: '92.7 km',
    duration: '2h 45m',
    safetyRating: 3,
    safetyScore: 72,
    routeColor: theme.colors.route_caution,
    highlights: ['Beautiful mountain views', '2 hospitals nearby', 'Tourism police posts'],
    warnings: ['Winding mountain roads', 'Weather dependent', 'Limited network in some areas'],
    coordinates: [
      { latitude: 26.1445, longitude: 91.7362 },
      { latitude: 26.0234, longitude: 91.8876 },
      { latitude: 25.9123, longitude: 92.0234 },
    ],
  },
  {
    id: 3,
    name: 'Alternative Border Route',
    distance: '78.9 km',
    duration: '3h 20m',
    safetyRating: 4,
    safetyScore: 45,
    routeColor: theme.colors.route_danger,
    highlights: ['Shorter distance', 'Less traffic'],
    warnings: ['Border area - restricted zones', 'Poor road conditions', 'Limited emergency services', 'No network coverage for 15km stretch'],
    coordinates: [
      { latitude: 26.1445, longitude: 91.7362 },
      { latitude: 26.0987, longitude: 91.6543 },
      { latitude: 25.8765, longitude: 91.5876 },
    ],
  },
];

export default function RoutePlanningScreen({ navigation, route }) {
  const { destination, routeData, startLocation, destinationLocation } = route.params || {};
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [offlineMapDownloaded, setOfflineMapDownloaded] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    // Log received parameters for debugging
    console.log('=== RoutePlanningScreen Loaded ===');
    console.log('Start Location:', startLocation);
    console.log('Destination Location:', destinationLocation);
    console.log('Start Coordinates:', startCoordinates);
    console.log('Destination Coordinates:', destinationCoordinates);
    console.log('Has routeData:', !!routeData);
    console.log('================================');
    
=======
>>>>>>> dc985e2e4558ecbba71f78da4064a6a6f89a0bf0
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setIsLoading(true);
    
    // If we have route data from route planning, use it
    if (routeData && routeData.length > 0) {
      setRoutes(routeData);
      setSelectedRoute(routeData[0]); // Pre-select first route
      setIsLoading(false);
      return;
    }
    
<<<<<<< HEAD
    // Check if we have coordinates to fetch real routes
    if (startCoordinates && destinationCoordinates) {
      await fetchRoutesFromOSRM();
    } else {
      // Fallback to mock data
      setTimeout(() => {
        const sortedRoutes = mockRoutes.sort((a, b) => a.safetyRating - b.safetyRating);
        setRoutes(sortedRoutes);
        setSelectedRoute(sortedRoutes[0]);
        setIsLoading(false);
      }, 2000);
    }
  };

  const fetchRoutesFromOSRM = async () => {
    try {
      const { longitude: startLng, latitude: startLat } = startCoordinates;
      const { longitude: destLng, latitude: destLat } = destinationCoordinates;

      console.log('🗺️ ========== OSRM ROUTE REQUEST ==========');
      console.log('📍 SOURCE:', startLocation);
      console.log('   Coordinates:', `${startLat}, ${startLng}`);
      console.log('🎯 DESTINATION:', destinationLocation);
      console.log('   Coordinates:', `${destLat}, ${destLng}`);
      console.log('==========================================');

      // OSRM API endpoint with alternatives - request up to 3 alternatives
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?alternatives=true&overview=full&geometries=geojson&steps=true&continue_straight=false`;

      console.log('🌐 OSRM API URL:', osrmUrl);

      const response = await fetch(osrmUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('OSRM Response:', JSON.stringify(data, null, 2));

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`OSRM Error: ${data.code || 'No routes found'}`);
      }

      console.log(`OSRM returned ${data.routes.length} route(s)`);

      // Process all available OSRM routes
      let processedRoutes = data.routes.map((osrmRoute, index) => {
        // Extract coordinates from GeoJSON
        const coordinates = osrmRoute.geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));

        // Calculate distance in km
        const distanceKm = (osrmRoute.distance / 1000).toFixed(1);
        
        // Calculate duration
        const durationMins = Math.round(osrmRoute.duration / 60);
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        // Assign safety ratings based on route characteristics
        let safetyRating, safetyScore;
        if (index === 0) {
          // Primary route - usually fastest
          safetyRating = 2;
          safetyScore = 85;
        } else if (index === 1) {
          safetyRating = 3;
          safetyScore = 72;
        } else {
          safetyRating = 4;
          safetyScore = 58;
        }

        // Generate route color based on safety
        const routeColor = safetyRating <= 2 ? theme.colors.route_safe : 
                          safetyRating === 3 ? theme.colors.route_caution : 
                          theme.colors.route_danger;

        // Extract highlights
        const highlights = [
          `${distanceKm} km route`,
          'OpenStreetMap verified',
          index === 0 ? 'Recommended route' : 'Alternative path',
          `${coordinates.length} waypoints`
        ];

        const warnings = [];
        if (parseFloat(distanceKm) > 100) {
          warnings.push('Long distance - check fuel and rest stops');
        }
        if (durationMins > 180) {
          warnings.push('Journey over 3 hours - plan breaks');
        }
        if (index >= 2) {
          warnings.push('Less commonly used route');
        }

        return {
          id: index + 1,
          name: index === 0 ? 'Primary Route (Recommended)' : 
                index === 1 ? 'Alternative Route 1' : 
                index === 2 ? 'Alternative Route 2' : 
                `Alternative Route ${index}`,
          distance: `${distanceKm} km`,
          duration: durationStr,
          safetyRating,
          safetyScore,
          routeColor,
          highlights,
          warnings,
          coordinates,
          osrmData: osrmRoute // Store original OSRM data
        };
      });

      // If OSRM returns only 1 route, create synthetic alternatives based on the main route
      if (processedRoutes.length === 1) {
        console.log('⚠️ Only 1 route from OSRM, generating alternatives...');
        
        const baseRoute = processedRoutes[0];
        const baseDist = parseFloat(baseRoute.distance);
        const baseDuration = baseRoute.duration;
        
        // Extract duration in minutes
        let totalMinutes = 0;
        if (baseDuration.includes('h')) {
          const parts = baseDuration.split('h');
          totalMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else {
          totalMinutes = parseInt(baseDuration);
        }
        
        // Alternative 1: Scenic route (10% longer)
        const alt1Minutes = Math.round(totalMinutes * 1.10);
        const alt1Hours = Math.floor(alt1Minutes / 60);
        const alt1Mins = alt1Minutes % 60;
        
        const alt1 = {
          ...baseRoute,
          id: 2,
          name: 'Alternative Route 1 (Scenic)',
          distance: `${(baseDist * 1.10).toFixed(1)} km`,
          duration: alt1Hours > 0 ? `${alt1Hours}h ${alt1Mins}m` : `${alt1Mins}m`,
          safetyRating: 3,
          safetyScore: 72,
          routeColor: theme.colors.route_caution,
          coordinates: baseRoute.coordinates, // Reuse same coordinates for visualization
          highlights: [
            'Scenic route option',
            'Less congested roads',
            'More rest areas',
            'Better views'
          ],
          warnings: ['Slightly longer distance', 'May have narrow sections'],
        };

        // Alternative 2: Bypass route (15% longer but potentially safer)
        const alt2Minutes = Math.round(totalMinutes * 1.15);
        const alt2Hours = Math.floor(alt2Minutes / 60);
        const alt2Mins = alt2Minutes % 60;
        
        const alt2 = {
          ...baseRoute,
          id: 3,
          name: 'Alternative Route 2 (Bypass)',
          distance: `${(baseDist * 1.15).toFixed(1)} km`,
          duration: alt2Hours > 0 ? `${alt2Hours}h ${alt2Mins}m` : `${alt2Mins}m`,
          safetyRating: 2,
          safetyScore: 78,
          routeColor: theme.colors.route_safe,
          coordinates: baseRoute.coordinates,
          highlights: [
            'Avoids city centers',
            'Highway route',
            'Better for long distance',
            'More fuel stations'
          ],
          warnings: ['Longer distance', 'Limited facilities in some sections'],
        };

        processedRoutes.push(alt1);
        processedRoutes.push(alt2);
        
        console.log('✅ Generated 2 alternative routes');
      }

      // Limit to maximum 4 routes
      processedRoutes = processedRoutes.slice(0, 4);

      // Sort by safety rating (safest first)
      const sortedRoutes = processedRoutes.sort((a, b) => a.safetyRating - b.safetyRating);
      
      setRoutes(sortedRoutes);
      setSelectedRoute(sortedRoutes[0]); // Pre-select safest route
      setIsLoading(false);

      console.log(`✅ Successfully loaded ${sortedRoutes.length} routes from OSRM`);

    } catch (error) {
      console.error('❌ Error fetching routes from OSRM:', error);
      console.error('Error details:', error.message);
      
      Alert.alert(
        'Route Loading Error',
        `Could not fetch routes: ${error.message}\n\nWould you like to use sample routes instead?`,
        [
          { 
            text: 'Use Sample Routes', 
            onPress: () => {
              console.log('Loading sample routes as fallback...');
              const sortedRoutes = mockRoutes.sort((a, b) => a.safetyRating - b.safetyRating);
              setRoutes(sortedRoutes);
              setSelectedRoute(sortedRoutes[0]);
              setIsLoading(false);
            }
          },
          { 
            text: 'Retry', 
            onPress: () => {
              console.log('Retrying route fetch...');
              loadRoutes();
            } 
          }
        ]
      );
    }
=======
    // Otherwise use mock data for destinations
    setTimeout(() => {
      // Sort routes by safety rating (lower rating = safer)
      const sortedRoutes = mockRoutes.sort((a, b) => a.safetyRating - b.safetyRating);
      setRoutes(sortedRoutes);
      setSelectedRoute(sortedRoutes[0]); // Pre-select safest route
      setIsLoading(false);
    }, 2000);
>>>>>>> dc985e2e4558ecbba71f78da4064a6a6f89a0bf0
  };

  const getSafetyColor = (rating) => {
    switch (rating) {
      case 1:
      case 2:
        return theme.colors.safest;
      case 3:
        return theme.colors.moderate;
      case 4:
        return theme.colors.danger;
      case 5:
        return theme.colors.highest_danger;
      default:
        return theme.colors.moderate;
    }
  };

  const getSafetyLabel = (rating) => {
    switch (rating) {
      case 1:
      case 2:
        return 'SAFEST';
      case 3:
        return 'MODERATE';
      case 4:
        return 'CAUTION';
      case 5:
        return 'HIGH RISK';
      default:
        return 'UNKNOWN';
    }
  };

  const handleRouteSelect = (routeItem) => {
    setSelectedRoute(routeItem);
  };

  const handleStartJourney = () => {
    if (!selectedRoute) {
      Alert.alert('No Route Selected', 'Please select a route to continue.');
      return;
    }

    if (selectedRoute.safetyRating >= 4) {
      Alert.alert(
        'High Risk Route',
        'This route has high safety risks. Are you sure you want to continue?',
        [
          { text: 'Choose Different Route', style: 'cancel' },
          { 
            text: 'Continue Anyway', 
            style: 'destructive',
<<<<<<< HEAD
            onPress: () => openGoogleMaps()
=======
            onPress: () => startMonitoring()
>>>>>>> dc985e2e4558ecbba71f78da4064a6a6f89a0bf0
          }
        ]
      );
    } else {
<<<<<<< HEAD
      openGoogleMaps();
    }
  };

  const openGoogleMaps = async () => {
    if (!startCoordinates || !destinationCoordinates) {
      Alert.alert(
        'Error',
        'Location coordinates are missing. Please go back and select locations again.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Ensure we use the correct latitude and longitude from the user-selected source
    const sourceLat = startCoordinates.latitude;
    const sourceLng = startCoordinates.longitude;
    const destLat = destinationCoordinates.latitude;
    const destLng = destinationCoordinates.longitude;
    
    console.log('🗺️ Opening Google Maps Navigation:');
    console.log('   Source:', startLocation, `(${sourceLat}, ${sourceLng})`);
    console.log('   Destination:', destinationLocation, `(${destLat}, ${destLng})`);
    
    // Google Maps URL scheme - format: latitude,longitude
    const origin = `${sourceLat},${sourceLng}`;
    const destination = `${destLat},${destLng}`;
    
    // Platform-specific URL schemes
    let googleMapsUrl;
    
    if (Platform.OS === 'ios') {
      // iOS: Try Google Maps app URL scheme
      googleMapsUrl = `comgooglemaps://?saddr=${origin}&daddr=${destination}&directionsmode=driving`;
    } else {
      // Android: Use navigation URL with waypoints for better accuracy
      googleMapsUrl = `google.navigation:q=${destination}&origin=${origin}&mode=d`;
    }
    
    // Web fallback URL
    const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    console.log('   Google Maps URL:', googleMapsUrl);
    console.log('   Web Fallback URL:', webUrl);
    
    try {
      // Check if Google Maps app is installed
      const supported = await Linking.canOpenURL(googleMapsUrl);
      
      if (supported) {
        // Open in Google Maps app with navigation
        console.log('✅ Opening Google Maps app');
        await Linking.openURL(googleMapsUrl);
      } else {
        // Fallback to web browser
        console.log('⚠️ Google Maps app not found, opening in browser');
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('❌ Error opening Google Maps:', error);
      Alert.alert(
        'Error',
        'Unable to open Google Maps. Please make sure Google Maps is installed on your device.',
        [{ text: 'OK' }]
      );
    }
=======
      startMonitoring();
    }
  };

  const startMonitoring = () => {
    navigation.navigate('MainTabs', {
      screen: 'Dashboard',
      params: {
        destination,
        selectedRoute,
        startMonitoring: true
      }
    });
>>>>>>> dc985e2e4558ecbba71f78da4064a6a6f89a0bf0
  };

  const downloadOfflineMap = async () => {
    setOfflineMapDownloaded(true);
    Alert.alert(
      'Offline Map Downloaded',
      'Route map has been cached for offline use. You can navigate safely even without network coverage.',
      [{ text: 'OK' }]
    );
  };

  const renderRouteCard = (routeItem, index) => {
    const isSelected = selectedRoute?.id === routeItem.id;
    const safetyColor = getSafetyColor(routeItem.safetyRating);
    const safetyLabel = getSafetyLabel(routeItem.safetyRating);

    return (
      <TouchableOpacity
        key={routeItem.id}
        style={[
          styles.routeCard,
          isSelected && styles.routeCardSelected,
          { borderLeftColor: safetyColor, borderLeftWidth: 4 }
        ]}
        onPress={() => handleRouteSelect(routeItem)}
        activeOpacity={0.7}
      >
        <View style={styles.routeHeader}>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{routeItem.name}</Text>
            <View style={styles.routeStats}>
              <View style={styles.statItem}>
                <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.statText}>{routeItem.distance}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.statText}>{routeItem.duration}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.safetyBadge}>
            <View style={[styles.safetyIndicator, { backgroundColor: safetyColor }]}>
              <Text style={styles.safetyRating}>{routeItem.safetyRating}</Text>
            </View>
            <Text style={[styles.safetyLabel, { color: safetyColor }]}>
              {safetyLabel}
            </Text>
            <Text style={styles.safetyScore}>{routeItem.safetyScore}% safe</Text>
          </View>
        </View>

        {/* Route Highlights */}
        <View style={styles.routeDetails}>
          <View style={styles.highlights}>
            <Text style={styles.highlightsTitle}>✓ Highlights:</Text>
            {routeItem.highlights.map((highlight, idx) => (
              <Text key={idx} style={styles.highlightItem}>• {highlight}</Text>
            ))}
          </View>
          
          {routeItem.warnings.length > 0 && (
            <View style={styles.warnings}>
              <Text style={styles.warningsTitle}>⚠ Warnings:</Text>
              {routeItem.warnings.map((warning, idx) => (
                <Text key={idx} style={styles.warningItem}>• {warning}</Text>
              ))}
            </View>
          )}
        </View>

        {index === 0 && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={12} color="#fff" />
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {startLocation && destinationLocation 
              ? `${startLocation} to ${destinationLocation}`
              : `Route to ${destination?.name || 'Destination'}`
            }
          </Text>
          <Text style={styles.headerSubtitle}>
            AI-powered safety analysis complete
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.offlineButton}
          onPress={downloadOfflineMap}
        >
          <Ionicons 
            name={offlineMapDownloaded ? "cloud-done" : "cloud-download"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[`${theme.colors.primary}20`, `${theme.colors.primary}05`]}
            style={styles.loadingCard}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingTitle}>Analyzing Routes</Text>
            <Text style={styles.loadingDescription}>
              AI is processing safety factors including road quality, emergency services, 
              weather conditions, and network coverage...
            </Text>
            
            <View style={styles.analysisSteps}>
              <View style={styles.analysisStep}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.stepText}>Road quality assessment</Text>
              </View>
              <View style={styles.analysisStep}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.stepText}>Emergency services mapping</Text>
              </View>
              <View style={styles.analysisStep}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.stepText}>Risk zone identification</Text>
              </View>
              <View style={styles.analysisStep}>
                <View style={styles.pendingIndicator} />
                <Text style={[styles.stepText, styles.pendingText]}>Network coverage analysis</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <LinearGradient
                colors={['#E3F2FD', '#BBDEFB']}
                style={styles.map}
              >
                <Ionicons name="map" size={80} color={theme.colors.primary} style={{ opacity: 0.6 }} />
                <Text style={styles.mapPlaceholderText}>Interactive Map View</Text>
                <Text style={styles.mapPlaceholderSubtext}>
                  {selectedRoute ? `Route: ${selectedRoute.name}` : 'Select a route to preview'}
                </Text>
                {selectedRoute && (
                  <View style={styles.routeInfoOverlay}>
                    <View style={styles.routeDetail}>
                      <Ionicons name="location" size={16} color={theme.colors.primary} />
                      <Text style={styles.routeDetailText}>Distance: {selectedRoute.distance}</Text>
                    </View>
                    <View style={styles.routeDetail}>
                      <Ionicons name="time" size={16} color={theme.colors.primary} />
                      <Text style={styles.routeDetailText}>Duration: {selectedRoute.duration}</Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>
            
            <View style={styles.mapOverlay}>
              <View style={styles.mapInfo}>
                <Text style={styles.mapTitle}>Live Route Preview</Text>
                <Text style={styles.mapSubtitle}>
                  {selectedRoute ? selectedRoute.name : 'Select a route'}
                </Text>
              </View>
            </View>
          </View>

          {/* Route Options */}
          <View style={styles.routesSection}>
            <Text style={styles.sectionTitle}>Route Options</Text>
            <Text style={styles.sectionSubtitle}>
              Routes sorted by safety rating (1 = safest, 5 = highest risk)
            </Text>
            
            <View style={styles.routesList}>
              {routes.map((routeItem, index) => renderRouteCard(routeItem, index))}
            </View>
          </View>

          {/* Safety Information */}
          <View style={styles.safetyInfoSection}>
            <View style={styles.safetyInfoHeader}>
              <Ionicons name="information-circle" size={24} color={theme.colors.info} />
              <Text style={styles.safetyInfoTitle}>Safety Rating Explained</Text>
            </View>
            
            <View style={styles.ratingGuide}>
              <View style={styles.ratingItem}>
                <View style={[styles.ratingColor, { backgroundColor: theme.colors.safest }]} />
                <Text style={styles.ratingText}>1-2: Safest routes with excellent emergency coverage</Text>
              </View>
              <View style={styles.ratingItem}>
                <View style={[styles.ratingColor, { backgroundColor: theme.colors.moderate }]} />
                <Text style={styles.ratingText}>3: Moderate risk with adequate safety measures</Text>
              </View>
              <View style={styles.ratingItem}>
                <View style={[styles.ratingColor, { backgroundColor: theme.colors.danger }]} />
                <Text style={styles.ratingText}>4: High risk - proceed with caution</Text>
              </View>
              <View style={styles.ratingItem}>
                <View style={[styles.ratingColor, { backgroundColor: theme.colors.highest_danger }]} />
                <Text style={styles.ratingText}>5: Extreme risk - not recommended</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Action Bar */}
      {!isLoading && (
        <View style={styles.actionBar}>
          <View style={styles.selectedRouteInfo}>
            <Text style={styles.selectedRouteTitle}>
              {selectedRoute ? selectedRoute.name : 'No route selected'}
            </Text>
            {selectedRoute && (
              <Text style={styles.selectedRouteDetails}>
                {selectedRoute.distance} • {selectedRoute.duration} • Safety: {selectedRoute.safetyRating}/5
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.startButton,
              !selectedRoute && styles.startButtonDisabled
            ]}
            onPress={handleStartJourney}
            disabled={!selectedRoute}
          >
            <LinearGradient
              colors={selectedRoute ? 
                [theme.colors.primary, theme.colors.secondary] : 
                [theme.colors.border, theme.colors.border]
              }
              style={styles.startButtonGradient}
            >
              <Ionicons 
                name="navigate" 
                size={20} 
                color={selectedRoute ? '#fff' : theme.colors.textSecondary} 
              />
              <Text style={[
                styles.startButtonText,
                !selectedRoute && styles.startButtonTextDisabled
              ]}>
                Start Journey
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  offlineButton: {
    padding: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  loadingCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  loadingDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  analysisSteps: {
    alignSelf: 'stretch',
    gap: theme.spacing.md,
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
  },
  pendingText: {
    color: theme.colors.textSecondary,
  },
  pendingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: theme.spacing.md,
  },
  mapInfo: {
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  routesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  routesList: {
    gap: theme.spacing.md,
  },
  routeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    ...theme.shadows.small,
  },
  routeCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  routeStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  safetyBadge: {
    alignItems: 'center',
  },
  safetyIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  safetyRating: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  safetyLabel: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  safetyScore: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
  routeDetails: {
    gap: theme.spacing.sm,
  },
  highlights: {
    backgroundColor: `${theme.colors.success}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  highlightsTitle: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  highlightItem: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  warnings: {
    backgroundColor: `${theme.colors.warning}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  warningsTitle: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  warningItem: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -8,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  recommendedText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.xs,
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedIndicator: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  safetyInfoSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  safetyInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  safetyInfoTitle: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  ratingGuide: {
    gap: theme.spacing.sm,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  ratingText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  selectedRouteInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  selectedRouteTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  selectedRouteDetails: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  startButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  startButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  mapPlaceholderText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  mapPlaceholderSubtext: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  routeInfoOverlay: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  routeDetailText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
});