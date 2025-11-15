import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function MonitoringDashboard({ navigation, route }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [isTracking, setIsTracking] = useState(true);
  const [direction, setDirection] = useState('N');
  const [hospitals, setHospitals] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);

  // Log when markers are updated
  useEffect(() => {
    if (hospitals.length > 0) {
      console.log(`🗺️ ${hospitals.length} hospital markers ready to render`);
      console.log('Hospital coordinates:', hospitals.map(h => `${h.name}: [${h.latitude}, ${h.longitude}]`).join('\n'));
    }
  }, [hospitals]);

  useEffect(() => {
    if (policeStations.length > 0) {
      console.log(`🗺️ ${policeStations.length} police station markers ready to render`);
      console.log('Police coordinates:', policeStations.map(p => `${p.name}: [${p.latitude}, ${p.longitude}]`).join('\n'));
    }
  }, [policeStations]);

  useEffect(() => {
    requestLocationPermissions();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const requestLocationPermissions = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for live tracking.');
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      startLiveTracking();
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  };

  const startLiveTracking = async () => {
    try {
      let lastFetchTime = 0;
      const FETCH_INTERVAL = 30000; // Fetch nearby places every 30 seconds instead of every location update
      
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // Changed from BestForNavigation for better performance
          timeInterval: 2000, // Update every 2 seconds instead of 1
          distanceInterval: 5, // Only update when moved 5 meters
        },
        (location) => {
          const { latitude, longitude, heading: locationHeading, speed: locationSpeed } = location.coords;
          
          setCurrentLocation({
            latitude,
            longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          });

          // Update heading (direction)
          if (locationHeading !== null && locationHeading !== -1) {
            setHeading(locationHeading);
            setDirection(getCardinalDirection(locationHeading));
          }

          // Update speed (convert m/s to km/h)
          if (locationSpeed !== null) {
            setSpeed((locationSpeed * 3.6).toFixed(1));
          }

          // Fetch nearby places only every 30 seconds to reduce API calls
          const currentTime = Date.now();
          if (currentTime - lastFetchTime > FETCH_INTERVAL) {
            fetchNearbyPlaces(latitude, longitude);
            lastFetchTime = currentTime;
          }

          // Smoother camera animation with reduced frequency - only center, don't zoom
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: { latitude, longitude },
              heading: 0,
              pitch: 0,
              zoom: 12, // Wider zoom to see 10km radius
            }, { duration: 1500 }); // Smooth 1.5-second animation
          }
        }
      );
    } catch (error) {
      console.error('Error starting live tracking:', error);
      Alert.alert('Tracking Error', 'Unable to start live location tracking.');
    }
  };

  const fetchNearbyPlaces = async (latitude, longitude, retryCount = 0) => {
    // Initialize markers arrays at the start of the function
    let hospitalMarkers = [];
    let policeMarkers = [];
    
    try {
      setIsLoadingPlaces(true);
      setPlacesError(null);
      console.log(`🔍 Fetching nearby places for coordinates: ${latitude}, ${longitude} (Attempt ${retryCount + 1})`);
      
      const radius = 5000; // 5km radius for faster API response (5000 meters = 5km)
      
      // Using Overpass API (OpenStreetMap) - Simplified query for faster response
      const hospitalQuery = `
        [out:json][timeout:10];
        (
          node["amenity"="hospital"](around:${radius},${latitude},${longitude});
          way["amenity"="hospital"](around:${radius},${latitude},${longitude});
        );
        out center;
      `;

      console.log('📡 Fetching hospitals from Overpass API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const hospitalResponse = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(hospitalQuery)}`,
        { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        }
      ).finally(() => clearTimeout(timeoutId));
      
      if (!hospitalResponse.ok) {
        if (hospitalResponse.status === 504 || hospitalResponse.status === 429) {
          throw new Error(`API_TIMEOUT`);
        }
        throw new Error(`Hospital API returned status: ${hospitalResponse.status}`);
      }
      
      const hospitalData = await hospitalResponse.json();
      console.log(`✅ Received ${hospitalData.elements?.length || 0} hospital elements from API`);
      
      if (hospitalData.remark) {
        console.log('⚠️ API Remark:', hospitalData.remark);
      }
      
      if (hospitalData.elements) {
        const seenCoordinates = new Set();
        
        hospitalData.elements.forEach(element => {
          let lat, lon;
          
          // Get coordinates based on element type
          if (element.type === 'node') {
            lat = element.lat;
            lon = element.lon;
          } else if (element.center) {
            // For ways and relations, use center point
            lat = element.center.lat;
            lon = element.center.lon;
          }
          
          // Only add if we have valid coordinates and a name
          if (lat && lon && element.tags) {
            const coordKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
            
            // Avoid duplicate locations
            if (!seenCoordinates.has(coordKey)) {
              seenCoordinates.add(coordKey);
              
              const name = element.tags.name || 
                          element.tags['name:en'] || 
                          element.tags['official_name'] ||
                          'Hospital';
              
              const address = element.tags['addr:full'] || 
                            `${element.tags['addr:street'] || ''} ${element.tags['addr:housenumber'] || ''}`.trim() ||
                            element.tags['addr:city'] ||
                            'Address not available';
              
              const phone = element.tags.phone || element.tags['contact:phone'] || '';
              const emergency = element.tags.emergency || element.tags['emergency:phone'] || '';
              
              hospitalMarkers.push({
                id: element.id.toString(),
                name: name,
                latitude: lat,
                longitude: lon,
                address: address,
                phone: phone,
                emergency: emergency,
                type: 'hospital',
              });
            }
          }
        });
        
        console.log(`✅ Setting ${hospitalMarkers.length} hospitals to state`);
        setHospitals(hospitalMarkers);
        
        if (hospitalMarkers.length > 0) {
          console.log(`✅ Found ${hospitalMarkers.length} hospitals within 5km`);
          console.log('First 3 hospital details:');
          hospitalMarkers.slice(0, 3).forEach((h, i) => {
            console.log(`  ${i + 1}. ${h.name} at [${h.latitude}, ${h.longitude}]`);
          });
        } else {
          console.log('⚠️ No hospitals found within 5km.');
        }
      }

      // Simplified query for police stations
      console.log('📡 Fetching police stations from Overpass API...');
      const policeQuery = `
        [out:json][timeout:10];
        (
          node["amenity"="police"](around:${radius},${latitude},${longitude});
          way["amenity"="police"](around:${radius},${latitude},${longitude});
        );
        out center;
      `;

      // Wait 2 seconds between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const policeController = new AbortController();
      const policeTimeoutId = setTimeout(() => policeController.abort(), 10000);
      
      const policeResponse = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(policeQuery)}`,
        { 
          signal: policeController.signal,
          headers: { 'Accept': 'application/json' }
        }
      ).finally(() => clearTimeout(policeTimeoutId));
      
      if (!policeResponse.ok) {
        if (policeResponse.status === 504 || policeResponse.status === 429) {
          throw new Error(`API_TIMEOUT`);
        }
        throw new Error(`Police API returned status: ${policeResponse.status}`);
      }
      
      const policeData = await policeResponse.json();
      console.log(`✅ Received ${policeData.elements?.length || 0} police station elements from API`);
      
      if (policeData.remark) {
        console.log('⚠️ API Remark:', policeData.remark);
      }
      
      if (policeData.elements) {
        const seenCoordinates = new Set();
        
        policeData.elements.forEach(element => {
          let lat, lon;
          
          // Get coordinates based on element type
          if (element.type === 'node') {
            lat = element.lat;
            lon = element.lon;
          } else if (element.center) {
            // For ways and relations, use center point
            lat = element.center.lat;
            lon = element.center.lon;
          }
          
          // Only add if we have valid coordinates and tags
          if (lat && lon && element.tags) {
            const coordKey = `${lat.toFixed(6)},${lon.toFixed(6)}`;
            
            // Avoid duplicate locations
            if (!seenCoordinates.has(coordKey)) {
              seenCoordinates.add(coordKey);
              
              const name = element.tags.name || 
                          element.tags['name:en'] || 
                          element.tags['official_name'] ||
                          'Police Station';
              
              const address = element.tags['addr:full'] || 
                            `${element.tags['addr:street'] || ''} ${element.tags['addr:housenumber'] || ''}`.trim() ||
                            element.tags['addr:city'] ||
                            'Address not available';
              
              const phone = element.tags.phone || element.tags['contact:phone'] || element.tags['phone:emergency'] || '';
              
              policeMarkers.push({
                id: element.id.toString(),
                name: name,
                latitude: lat,
                longitude: lon,
                address: address,
                phone: phone,
                type: 'police',
              });
            }
          }
        });
        
        console.log(`✅ Setting ${policeMarkers.length} police stations to state`);
        setPoliceStations(policeMarkers);
        
        if (policeMarkers.length > 0) {
          console.log(`✅ Found ${policeMarkers.length} police stations within 5km`);
          console.log('First 3 police station details:');
          policeMarkers.slice(0, 3).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} at [${p.latitude}, ${p.longitude}]`);
          });
        } else {
          console.log('⚠️ No police stations found within 5km.');
        }
      }
      
      // Move this outside the if block to ensure it always runs
      setIsLoadingPlaces(false);
      
      // Show user feedback
      if (hospitalMarkers.length === 0 && policeMarkers.length === 0) {
        Alert.alert(
          'No Nearby Facilities Found',
          'No hospitals or police stations found within 5km. Try using the refresh button to search again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error fetching nearby places:', error);
      setIsLoadingPlaces(false);
      setPlacesError(error.message);
      
      // Retry logic for timeout errors
      if (error.message === 'API_TIMEOUT' && retryCount < 2) {
        console.log(`⏳ Retrying in 3 seconds... (Attempt ${retryCount + 2}/3)`);
        setTimeout(() => {
          fetchNearbyPlaces(latitude, longitude, retryCount + 1);
        }, 3000);
        return;
      }
      
      // Show error to user
      Alert.alert(
        'Unable to Load Nearby Facilities',
        `Could not fetch hospitals and police stations.\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`,
        [
          { text: 'Retry', onPress: () => {
            if (currentLocation) {
              fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude);
            }
          }},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const getCardinalDirection = (heading) => {
    if (heading === null || heading === -1) return 'N';
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      startLiveTracking();
    } else {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    }
  };

  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(currentLocation, 500);
    }
  };

  const manualSearchPlaces = () => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Please wait for GPS to acquire your location first.');
      return;
    }
    
    Alert.alert(
      'Search Nearby Facilities',
      `Current location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}\n\nThis will search for hospitals and police stations within 5km radius.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Search Now', 
          onPress: () => fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude)
        }
      ]
    );
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
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isTracking ? theme.colors.success : theme.colors.error }
                ]}
              />
              <Text style={styles.statusText}>
                {isTracking ? 'Tracking Active' : 'Tracking Paused'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {currentLocation ? (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={currentLocation}
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={false}
              showsBuildings={false}
              showsIndoors={false}
              showsTraffic={false}
              mapType="standard"
              loadingEnabled={true}
              pitchEnabled={false}
              rotateEnabled={true}
              zoomEnabled={true}
              scrollEnabled={true}
              maxZoomLevel={20}
              minZoomLevel={10}
            >
              {/* Custom User Location Marker with Directional Arrow */}
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true}
                zIndex={1000}
              >
                <View style={styles.userLocationMarker}>
                  {/* Outer Pulse Ring */}
                  <View style={styles.pulseRing} />
                  {/* Direction Arrow - Centered */}
                  <View style={styles.arrowPointer}>
                    <Ionicons 
                      name="navigate" 
                      size={20} 
                      color={theme.colors.primary} 
                      style={{ transform: [{ rotate: `${heading}deg` }] }}
                    />
                  </View>
                </View>
              </Marker>

              {/* Hospital Markers */}
              {showHospitals && hospitals.map((hospital) => (
                <Marker
                  key={`hospital-${hospital.id}`}
                  coordinate={{
                    latitude: parseFloat(hospital.latitude),
                    longitude: parseFloat(hospital.longitude),
                  }}
                  title={hospital.name}
                  description={hospital.address}
                  tracksViewChanges={false}
                  zIndex={10}
                >
                  <View style={styles.hospitalMarker}>
                    <Ionicons name="medical" size={16} color="#fff" />
                  </View>
                </Marker>
              ))}

              {/* Police Station Markers */}
              {showPolice && policeStations.map((station) => (
                <Marker
                  key={`police-${station.id}`}
                  coordinate={{
                    latitude: parseFloat(station.latitude),
                    longitude: parseFloat(station.longitude),
                  }}
                  title={station.name}
                  description={station.address}
                  tracksViewChanges={false}
                  zIndex={10}
                >
                  <View style={styles.policeMarker}>
                    <Ionicons name="shield" size={16} color="#fff" />
                  </View>
                </Marker>
              ))}
            </MapView>
          ) : (
            <View style={styles.loadingContainer}>
              <Ionicons name="location" size={64} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Acquiring GPS Signal...</Text>
            </View>
          )}

          {/* Map Overlays */}
          <View style={styles.overlayTop}>
            <View style={styles.leftControls}>
              {/* Speed Indicator */}
              <View style={styles.speedCard}>
                <Ionicons name="speedometer" size={20} color={theme.colors.primary} />
                <Text style={styles.speedValue}>{speed} km/h</Text>
              </View>

              {/* Status Indicator */}
              {isLoadingPlaces && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              )}

              {/* Filter Buttons */}
              <View style={styles.filterButtons}>
                <TouchableOpacity 
                  style={[styles.filterButton, showHospitals && styles.filterButtonActive]}
                  onPress={() => setShowHospitals(!showHospitals)}
                >
                  <Ionicons name="medical" size={18} color={showHospitals ? '#fff' : '#DC143C'} />
                  <Text style={[styles.filterButtonText, showHospitals && styles.filterButtonTextActive]}>
                    {isLoadingPlaces ? '...' : hospitals.length}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterButton, showPolice && styles.filterButtonActive]}
                  onPress={() => setShowPolice(!showPolice)}
                >
                  <Ionicons name="shield" size={18} color={showPolice ? '#fff' : '#1E40AF'} />
                  <Text style={[styles.filterButtonText, showPolice && styles.filterButtonTextActive]}>
                    {isLoadingPlaces ? '...' : policeStations.length}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Direction Card */}
            <View style={styles.directionCard}>
              <Text style={styles.directionCardLabel}>Heading</Text>
              <Text style={styles.directionCardValue}>{direction}</Text>
              <Text style={styles.directionCardDegrees}>{heading.toFixed(0)}°</Text>
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.overlayBottom}>
            {/* Center on User Button */}
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={centerOnUser}
            >
              <Ionicons name="locate" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* Refresh Places Button */}
            <TouchableOpacity 
              style={styles.refreshPlacesButton}
              onPress={() => {
                if (currentLocation) {
                  fetchNearbyPlaces(currentLocation.latitude, currentLocation.longitude);
                }
              }}
              disabled={isLoadingPlaces}
            >
              <Ionicons 
                name="refresh" 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>

            {/* Tracking Toggle Button */}
            <TouchableOpacity 
              style={[styles.trackingButton, { backgroundColor: isTracking ? theme.colors.error : theme.colors.success }]}
              onPress={toggleTracking}
            >
              <Ionicons 
                name={isTracking ? 'pause' : 'play'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.trackingButtonText}>
                {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Info Panel */}
        {currentLocation && (
          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Latitude</Text>
                <Text style={styles.infoValue}>{currentLocation.latitude.toFixed(6)}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Longitude</Text>
                <Text style={styles.infoValue}>{currentLocation.longitude.toFixed(6)}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Ionicons name="business-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Facilities</Text>
                <Text style={styles.infoValue}>
                  {hospitals.length}H / {policeStations.length}P
                </Text>
              </View>
            </View>
            {(hospitals.length === 0 && policeStations.length === 0 && !isLoadingPlaces) && (
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={manualSearchPlaces}
              >
                <Ionicons name="search" size={16} color="#fff" />
                <Text style={styles.searchButtonText}>Search Nearby Facilities</Text>
              </TouchableOpacity>
            )}
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
  },
  userLocationMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  arrowPointer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  overlayTop: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftControls: {
    gap: theme.spacing.sm,
  },
  speedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  speedValue: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: 4,
    ...theme.shadows.small,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  hospitalMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  policeMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  directionCard: {
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  directionCardLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  directionCardValue: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  directionCardDegrees: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  refreshPlacesButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  loadingIndicator: {
    backgroundColor: '#fff',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  loadingText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  trackingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  trackingButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoPanel: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  searchButton: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  searchButtonText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
});