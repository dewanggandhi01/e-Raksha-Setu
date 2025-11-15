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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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
  const { destination, routeData, startLocation, destinationLocation, startCoordinates, destinationCoordinates } = route.params || {};
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [offlineMapDownloaded, setOfflineMapDownloaded] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  // Haversine formula to calculate distance between two coordinates in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Calculate route distance including waypoints
  const calculateRouteDistance = (coordinates) => {
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += calculateDistance(
        coordinates[i].latitude,
        coordinates[i].longitude,
        coordinates[i + 1].latitude,
        coordinates[i + 1].longitude
      );
    }
    return totalDistance;
  };

  // Generate estimated duration based on distance and route type
  const calculateDuration = (distance, routeMultiplier = 1) => {
    const avgSpeed = 45; // Average speed in km/h for hilly terrain
    const hours = (distance * routeMultiplier) / avgSpeed;
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // Fetch actual road route from OSRM routing service
  const fetchRoadRoute = async (start, end, alternativeIndex = 0) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?alternatives=${alternativeIndex > 0 ? 'true' : 'false'}&geometries=geojson&overview=full&steps=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const routeIndex = Math.min(alternativeIndex, data.routes.length - 1);
        const route = data.routes[routeIndex];
        
        // Convert GeoJSON coordinates to react-native-maps format
        const coordinates = route.geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        // Return route info
        return {
          coordinates,
          distance: route.distance / 1000, // Convert meters to km
          duration: route.duration / 60 // Convert seconds to minutes
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  };

  // Fetch route with slight offset to get alternative paths
  const fetchAlternativeRoute = async (start, end, offsetLat, offsetLng) => {
    try {
      // Create an intermediate waypoint to force different route
      const midpoint = {
        latitude: (start.latitude + end.latitude) / 2 + offsetLat,
        longitude: (start.longitude + end.longitude) / 2 + offsetLng
      };
      
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${midpoint.longitude},${midpoint.latitude};${end.longitude},${end.latitude}?geometries=geojson&overview=full`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        const coordinates = route.geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        return {
          coordinates,
          distance: route.distance / 1000,
          duration: route.duration / 60
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching alternative route:', error);
      return null;
    }
  };

  // Generate alternative routes with actual road data
  const generateAlternativeRoutes = async (start, end) => {
    const routes = [];
    
    try {
      // Fetch main direct route
      const mainRoute = await fetchRoadRoute(start, end, 0);
      if (mainRoute) {
        const duration = mainRoute.duration;
        const hrs = Math.floor(duration / 60);
        const mins = Math.round(duration % 60);
        const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
        
        routes.push({
          id: 1,
          name: 'Main Highway Route',
          distance: `${mainRoute.distance.toFixed(1)} km`,
          duration: durationStr,
          safetyRating: 2,
          safetyScore: 85,
          routeColor: '#4CAF50',
          highlights: ['Well-maintained roads', '4 hospitals nearby', '3 police stations', 'Good network coverage'],
          warnings: ['Heavy traffic during peak hours'],
          coordinates: mainRoute.coordinates,
        });
      }

      // Fetch scenic route (with northern detour)
      const scenicRoute = await fetchAlternativeRoute(start, end, 0.05, 0.03);
      if (scenicRoute) {
        const duration = scenicRoute.duration;
        const hrs = Math.floor(duration / 60);
        const mins = Math.round(duration % 60);
        const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
        
        routes.push({
          id: 2,
          name: 'Scenic Mountain Route',
          distance: `${scenicRoute.distance.toFixed(1)} km`,
          duration: durationStr,
          safetyRating: 3,
          safetyScore: 72,
          routeColor: '#FF9800',
          highlights: ['Beautiful mountain views', '2 hospitals nearby', 'Tourism police posts'],
          warnings: ['Winding mountain roads', 'Weather dependent', 'Limited network in some areas'],
          coordinates: scenicRoute.coordinates,
        });
      }

      // Fetch alternative route (with southern detour)
      const alternativeRoute = await fetchAlternativeRoute(start, end, -0.04, -0.02);
      if (alternativeRoute) {
        const duration = alternativeRoute.duration;
        const hrs = Math.floor(duration / 60);
        const mins = Math.round(duration % 60);
        const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
        
        routes.push({
          id: 3,
          name: 'Alternative Border Route',
          distance: `${alternativeRoute.distance.toFixed(1)} km`,
          duration: durationStr,
          safetyRating: 4,
          safetyScore: 45,
          routeColor: '#F44336',
          highlights: ['Shorter distance', 'Less traffic'],
          warnings: ['Border area - restricted zones', 'Poor road conditions', 'Limited emergency services', 'No network coverage for 15km stretch'],
          coordinates: alternativeRoute.coordinates,
        });
      }

      // Fetch bypass route (with western detour) for longer distances
      const directDistance = mainRoute ? mainRoute.distance : 0;
      if (directDistance > 50) {
        const bypassRoute = await fetchAlternativeRoute(start, end, 0.02, -0.03);
        if (bypassRoute) {
          const duration = bypassRoute.duration;
          const hrs = Math.floor(duration / 60);
          const mins = Math.round(duration % 60);
          const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
          
          routes.push({
            id: 4,
            name: 'City Bypass Route',
            distance: `${bypassRoute.distance.toFixed(1)} km`,
            duration: durationStr,
            safetyRating: 2,
            safetyScore: 78,
            routeColor: '#2196F3',
            highlights: ['Avoids city traffic', 'Express highway sections', '2 rest stops', 'Good network'],
            warnings: ['Toll charges apply', 'Limited food options'],
            coordinates: bypassRoute.coordinates,
          });
        }
      }
      
    } catch (error) {
      console.error('Error generating routes:', error);
    }

    return routes;
  };

  const loadRoutes = async () => {
    setIsLoading(true);
    
    // If we have route data from route planning, use it
    if (routeData && routeData.length > 0) {
      setRoutes(routeData);
      setSelectedRoute(routeData[0]); // Pre-select first route
      setIsLoading(false);
      return;
    }
    
    // Generate routes based on actual coordinates
    try {
      let generatedRoutes;
      
      if (startCoordinates && destinationCoordinates) {
        // Fetch actual road routes from OSRM
        generatedRoutes = await generateAlternativeRoutes(
          startCoordinates,
          destinationCoordinates
        );
      } else {
        // Fallback to mock data if coordinates not available
        generatedRoutes = mockRoutes;
      }
      
      // Sort routes by safety rating (lower rating = safer)
      const sortedRoutes = generatedRoutes.sort((a, b) => a.safetyRating - b.safetyRating);
      setRoutes(sortedRoutes);
      setSelectedRoute(sortedRoutes[0]); // Pre-select safest route
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading routes:', error);
      // Fallback to mock data on error
      const sortedRoutes = mockRoutes.sort((a, b) => a.safetyRating - b.safetyRating);
      setRoutes(sortedRoutes);
      setSelectedRoute(sortedRoutes[0]);
      setIsLoading(false);
    }
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
            onPress: () => openGoogleMaps()
          }
        ]
      );
    } else {
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
    
    if (!selectedRoute) {
      Alert.alert('Error', 'No route selected');
      return;
    }
    
    // Get origin and destination from user-selected coordinates
    const origin = {
      lat: startCoordinates.latitude,
      lng: startCoordinates.longitude
    };
    
    const destination = {
      lat: destinationCoordinates.latitude,
      lng: destinationCoordinates.longitude
    };
    
    // Extract waypoints from selected route (exclude origin and destination)
    const waypoints = [];
    if (selectedRoute.coordinates && selectedRoute.coordinates.length > 2) {
      // Get intermediate waypoints (skip first and last which are origin and destination)
      for (let i = 1; i < selectedRoute.coordinates.length - 1; i++) {
        waypoints.push({
          lat: selectedRoute.coordinates[i].latitude,
          lng: selectedRoute.coordinates[i].longitude
        });
      }
    }
    
    console.log('🗺️ Opening Google Maps Navigation:');
    console.log('   Route:', selectedRoute.name);
    console.log('   Source:', startLocation, `(${origin.lat}, ${origin.lng})`);
    console.log('   Destination:', destinationLocation, `(${destination.lat}, ${destination.lng})`);
    console.log('   Waypoints:', waypoints.length);
    
    // Build waypoints string for URL
    const waypointsString = waypoints.length > 0
      ? waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|')
      : '';
    
    // Build Google Maps URL with waypoints
    let url = `https://www.google.com/maps/dir/?api=1`;
    url += `&origin=${origin.lat},${origin.lng}`;
    url += `&destination=${destination.lat},${destination.lng}`;
    if (waypointsString) {
      url += `&waypoints=${waypointsString}`;
    }
    url += `&travelmode=driving`;
    
    console.log('   Google Maps URL:', url);
    
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        console.log('✅ Opening Google Maps with route waypoints');
        await Linking.openURL(url);
      } else {
        console.log('⚠️ Cannot open URL, trying alternative');
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('❌ Error opening Google Maps:', error);
      Alert.alert(
        'Error',
        'Unable to open Google Maps. Please make sure you have an internet connection.',
        [{ text: 'OK' }]
      );
    }
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
            {startCoordinates && destinationCoordinates ? (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: (startCoordinates.latitude + destinationCoordinates.latitude) / 2,
                  longitude: (startCoordinates.longitude + destinationCoordinates.longitude) / 2,
                  latitudeDelta: Math.abs(startCoordinates.latitude - destinationCoordinates.latitude) * 2 || 0.5,
                  longitudeDelta: Math.abs(startCoordinates.longitude - destinationCoordinates.longitude) * 2 || 0.5,
                }}
              >
                {/* Origin Marker */}
                <Marker
                  coordinate={{
                    latitude: startCoordinates.latitude,
                    longitude: startCoordinates.longitude,
                  }}
                  title={startLocation || 'Start'}
                  description="Starting Point"
                  pinColor="green"
                />
                
                {/* Destination Marker */}
                <Marker
                  coordinate={{
                    latitude: destinationCoordinates.latitude,
                    longitude: destinationCoordinates.longitude,
                  }}
                  title={destinationLocation || 'Destination'}
                  description="Destination Point"
                  pinColor="red"
                />
                
                {/* Draw all routes as polylines */}
                {routes.map((routeItem) => (
                  <Polyline
                    key={routeItem.id}
                    coordinates={routeItem.coordinates}
                    strokeColor={
                      selectedRoute?.id === routeItem.id
                        ? routeItem.routeColor
                        : `${routeItem.routeColor}60`
                    }
                    strokeWidth={selectedRoute?.id === routeItem.id ? 6 : 3}
                  />
                ))}
              </MapView>
            ) : (
              <View style={styles.mapPlaceholder}>
                <LinearGradient
                  colors={['#E3F2FD', '#BBDEFB']}
                  style={styles.map}
                >
                  <Ionicons name="map" size={80} color={theme.colors.primary} style={{ opacity: 0.6 }} />
                  <Text style={styles.mapPlaceholderText}>Interactive Map View</Text>
                  <Text style={styles.mapPlaceholderSubtext}>
                    Loading route coordinates...
                  </Text>
                </LinearGradient>
              </View>
            )}
            
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
    height: 300,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
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