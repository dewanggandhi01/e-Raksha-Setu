import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import FullScreenMap from '../components/FullScreenMap';

// Conditional import for ExpoMaps - fallback for Expo Go compatibility
let ExpoMaps;
try {
  ExpoMaps = require('expo-maps').ExpoMaps;
} catch (error) {
  console.log('ExpoMaps not available in Expo Go - using fallback');
  ExpoMaps = null;
}
import { theme } from '../styles/theme';
import { getCurrentUserBlockchainId } from '../utils/blockchainId';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({
    name: 'Tourist User',
    safetyScore: 85,
    activeTrips: 0,
    totalTrips: 12,
  });

  const [blockchainData, setBlockchainData] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139, // Default to Delhi, India
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [mapRef, setMapRef] = useState(null);
  const [showFullScreenMap, setShowFullScreenMap] = useState(false);

  useEffect(() => {
    loadBlockchainData();
    requestLocationPermission();
  }, []);

  const loadBlockchainData = async () => {
    try {
      const data = await getCurrentUserBlockchainId();
      setBlockchainData(data);
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use map features and route planning.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = currentLocation.coords;
      setLocation(currentLocation);
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      
      // Animate to new location if map ref is available
      if (mapRef) {
        mapRef.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Failed to get current location. Using default location.');
    }
  };

  const handleZoomIn = () => {
    const newRegion = {
      ...mapRegion,
      latitudeDelta: mapRegion.latitudeDelta * 0.5,
      longitudeDelta: mapRegion.longitudeDelta * 0.5,
    };
    setMapRegion(newRegion);
    
    // Inject JavaScript for WebView map
    if (mapRef && !ExpoMaps) {
      mapRef.injectJavaScript('if(typeof zoomIn === "function") zoomIn(); true;');
    } else if (mapRef) {
      mapRef.animateToRegion(newRegion, 500);
    }
  };

  const handleZoomOut = () => {
    const newRegion = {
      ...mapRegion,
      latitudeDelta: mapRegion.latitudeDelta * 2,
      longitudeDelta: mapRegion.longitudeDelta * 2,
    };
    setMapRegion(newRegion);
    
    // Inject JavaScript for WebView map
    if (mapRef && !ExpoMaps) {
      mapRef.injectJavaScript('if(typeof zoomOut === "function") zoomOut(); true;');
    } else if (mapRef) {
      mapRef.animateToRegion(newRegion, 500);
    }
  };

  const handleGoToLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'To show your live location, please grant location access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Access', onPress: requestLocationPermission }
        ]
      );
      return;
    }
    
    // Always get fresh location data when button is pressed
    try {
      Alert.alert('Getting Location', 'Finding your current location...', [], { cancelable: false });
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      
      const { latitude, longitude } = currentLocation.coords;
      setLocation(currentLocation);
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005, // Higher zoom for live location
        longitudeDelta: 0.005,
      };
      setMapRegion(newRegion);
      
      // Handle both native map and WebView map
      if (mapRef && !ExpoMaps) {
        mapRef.injectJavaScript('if(typeof centerOnUser === "function") centerOnUser(); true;');
      } else if (mapRef) {
        mapRef.animateToRegion(newRegion, 1000);
      }
      
      Alert.alert(
        'Location Found!',
        `Your current location:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\nAccuracy: ±${currentLocation.coords.accuracy?.toFixed(0) || 'N/A'}m`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error getting live location:', error);
      Alert.alert(
        'Location Error', 
        'Unable to get your current location. Please check if location services are enabled and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStartRoute = () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Required',
        'Please enable location services to start route planning.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: requestLocationPermission }
        ]
      );
      return;
    }
    
    navigation.navigate('RouteSelection', {
      currentLocation: location?.coords
    });
  };

  const quickActions = [
    {
      id: 1,
      title: 'Plan New Route',
      subtitle: 'AI-powered safe routes',
      icon: 'map',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('RouteSelection'),
    },
    {
      id: 2,
      title: 'Start Monitoring',
      subtitle: 'Real-time safety tracking',
      icon: 'eye',
      color: theme.colors.success,
      onPress: () => navigation.navigate('Monitoring'),
    },
    {
      id: 3,
      title: 'Emergency SOS',
      subtitle: 'Instant help & alerts',
      icon: 'warning',
      color: theme.colors.error,
      onPress: () => navigation.navigate('Emergency'),
    },
    {
      id: 4,
      title: 'My Profile',
      subtitle: 'Digital ID & settings',
      icon: 'person',
      color: theme.colors.info,
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const safetyFeatures = [
    {
      id: 1,
      title: 'Route Safety Rating',
      description: 'AI analyzes safety factors: crime data, road quality, emergency services',
      icon: 'shield-checkmark',
      status: 'Active',
    },
    {
      id: 2,
      title: 'Real-time Tracking',
      description: 'GPS monitoring with deviation alerts and offline maps',
      icon: 'location',
      status: 'Ready',
    },
    {
      id: 3,
      title: 'Emergency Response',
      description: 'Instant SOS, auto E-FIR, emergency contacts notification',
      icon: 'call',
      status: 'Available',
    },
    {
      id: 4,
      title: 'Digital Tourist ID',
      description: 'Blockchain-secured identity valid for your entire trip',
      icon: 'card',
      status: 'Verified',
    },
  ];

  const getSafetyScoreColor = (score) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const handleQuickAction = (action) => {
    action.onPress();
  };

  const generateMapHTML = () => {
    const lat = location?.coords?.latitude || mapRegion.latitude;
    const lng = location?.coords?.longitude || mapRegion.longitude;
    const zoom = mapRegion.latitudeDelta < 0.005 ? 16 : mapRegion.latitudeDelta < 0.02 ? 14 : 12;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            body, html { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            #map { height: 100vh; width: 100vw; }
            .map-overlay {
              position: absolute;
              top: 10px;
              left: 10px;
              background: rgba(255,255,255,0.9);
              padding: 10px;
              border-radius: 8px;
              z-index: 1000;
              font-size: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .user-marker {
              background: #4285F4;
              border: 3px solid white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            .controls {
              position: absolute;
              top: 10px;
              right: 10px;
              z-index: 1000;
              display: flex;
              flex-direction: column;
              gap: 5px;
            }
            .control-btn {
              background: white;
              border: none;
              border-radius: 6px;
              padding: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              cursor: pointer;
              font-size: 14px;
              width: 35px;
              height: 35px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div class="map-overlay">
            <div><strong>📍 Location</strong></div>
            <div>${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            <div>Zoom: ${zoom}</div>
          </div>
          
          <div class="controls">
            <button class="control-btn" onclick="zoomIn()">+</button>
            <button class="control-btn" onclick="zoomOut()">-</button>
            <button class="control-btn" onclick="centerOnUser()">📍</button>
          </div>
          
          <div id="map"></div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            let map;
            let userMarker;
            let currentZoom = ${zoom};

            // Initialize map
            map = L.map('map', {
              zoomControl: false,
              attributionControl: false
            }).setView([${lat}, ${lng}], currentZoom);

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap'
            }).addTo(map);

            // Custom user location icon
            const userIcon = L.divIcon({
              className: 'user-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            // Add user marker
            userMarker = L.marker([${lat}, ${lng}], { icon: userIcon })
              .addTo(map)
              .bindPopup('📍 Your Location<br>${lat.toFixed(6)}, ${lng.toFixed(6)}');

            // Add sample safety markers
            const safeIcon = L.divIcon({
              html: '<div style="background: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const touristIcon = L.divIcon({
              html: '<div style="background: #2196F3; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const cautionIcon = L.divIcon({
              html: '<div style="background: #FF9800; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            // Add markers
            L.marker([${lat + 0.002}, ${lng + 0.003}], { icon: safeIcon })
              .addTo(map)
              .bindPopup('🛡️ Safe Zone');

            L.marker([${lat - 0.001}, ${lng + 0.002}], { icon: touristIcon })
              .addTo(map)
              .bindPopup('📸 Tourist Spot');

            L.marker([${lat + 0.001}, ${lng - 0.002}], { icon: cautionIcon })
              .addTo(map)
              .bindPopup('⚠️ Caution Area');

            // Control functions
            function zoomIn() {
              map.zoomIn();
            }

            function zoomOut() {
              map.zoomOut();
            }

            function centerOnUser() {
              map.setView([${lat}, ${lng}], 16);
              userMarker.openPopup();
            }

            // Auto-open user popup
            setTimeout(() => {
              userMarker.openPopup();
            }, 1000);
          </script>
        </body>
      </html>
    `;
  };

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with User Profile */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userSubtitle}>Stay safe, travel smart</Text>
            </View>
          </View>
          
          <View style={styles.safetyScoreContainer}>
            <View style={[styles.safetyScore, { borderColor: getSafetyScoreColor(userProfile.safetyScore) }]}>
              <Text style={[styles.safetyScoreNumber, { color: getSafetyScoreColor(userProfile.safetyScore) }]}>
                {userProfile.safetyScore}
              </Text>
              <Text style={styles.safetyScoreLabel}>Safety Score</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statNumber}>{userProfile.activeTrips}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statNumber}>{userProfile.totalTrips}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Protection</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Blockchain Digital ID Section */}
      {blockchainData && (
        <View style={styles.section}>
          <View style={styles.blockchainCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.blockchainGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.blockchainHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                <Text style={styles.blockchainTitle}>Digital Tourist ID</Text>
                <View style={[styles.statusBadge, { backgroundColor: blockchainData.isValid ? '#4ade80' : '#f87171' }]}>
                  <Text style={styles.statusText}>
                    {blockchainData.isValid ? 'VERIFIED' : 'INVALID'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.idDisplay}>
                <Text style={styles.idLabel}>Digital ID</Text>
                <Text style={styles.idValue}>{blockchainData.digitalId}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.blockchainAction}
                onPress={() => navigation.navigate('DigitalID')}
              >
                <Ionicons name="qr-code" size={16} color="#fff" />
                <Text style={styles.blockchainActionText}>Show QR for Verification</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleQuickAction(action)}
            >
              <LinearGradient
                colors={[`${action.color}15`, `${action.color}05`]}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Route Planning & Map Section */}
      <View style={styles.section}>
        <View style={styles.routeHeader}>
          <Text style={styles.sectionTitle}>Start Your Journey</Text>
          <View style={styles.routeButtons}>
            <TouchableOpacity 
              style={styles.fullScreenButton}
              onPress={() => setShowFullScreenMap(true)}
            >
              <Ionicons name="expand" size={16} color={theme.colors.primary} />
              <Text style={styles.fullScreenText}>Full Map</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.startRouteButton}
              onPress={handleStartRoute}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.startRouteGradient}
              >
                <Ionicons name="navigation" size={20} color="#fff" />
                <Text style={styles.startRouteText}>Start Route</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.mapContainer}>
          {ExpoMaps ? (
            /* Native ExpoMaps for development builds */
            <ExpoMaps.ExpoMap
              ref={setMapRef}
              style={styles.map}
              region={mapRegion}
              showsUserLocation={locationPermission}
              showsMyLocationButton={false}
              showsCompass={true}
              showsScale={true}
              zoomEnabled={true}
              scrollEnabled={true}
              rotateEnabled={true}
              pitchEnabled={true}
              onRegionChangeComplete={setMapRegion}
            >
              {/* User Location Marker */}
              {location && (
                <ExpoMaps.Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Location"
                  description={`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`}
                >
                  <View style={styles.customMarker}>
                    <View style={styles.markerInner}>
                      <Ionicons name="person" size={16} color="#fff" />
                    </View>
                  </View>
                </ExpoMaps.Marker>
              )}
              
              {/* Sample Safe Route Points */}
              <ExpoMaps.Marker
                coordinate={{
                  latitude: mapRegion.latitude + 0.002,
                  longitude: mapRegion.longitude + 0.003,
                }}
                title="Safe Zone"
                description="Well-lit area with good security"
              >
                <View style={styles.safePointMarker}>
                  <Ionicons name="shield-checkmark" size={16} color="#fff" />
                </View>
              </ExpoMaps.Marker>
              
              <ExpoMaps.Marker
                coordinate={{
                  latitude: mapRegion.latitude - 0.001,
                  longitude: mapRegion.longitude + 0.002,
                }}
                title="Tourist Spot"
                description="Popular tourist destination"
              >
                <View style={styles.touristPointMarker}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </ExpoMaps.Marker>
              
              <ExpoMaps.Marker
                coordinate={{
                  latitude: mapRegion.latitude + 0.001,
                  longitude: mapRegion.longitude - 0.002,
                }}
                title="Caution Area"
                description="Exercise extra caution in this area"
              >
                <View style={styles.cautionPointMarker}>
                  <Ionicons name="warning" size={16} color="#fff" />
                </View>
              </ExpoMaps.Marker>
            </ExpoMaps.ExpoMap>
          ) : (
            /* Real Map using WebView - Works in Expo Go */
            <WebView
              ref={setMapRef}
              source={{ html: generateMapHTML() }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.mapLoadingContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
                    style={styles.mapLoadingGradient}
                  >
                    <Ionicons name="map" size={48} color={theme.colors.primary} />
                    <Text style={styles.mapLoadingText}>Loading Interactive Map...</Text>
                    <View style={styles.loadingDots}>
                      <View style={[styles.loadingDot, styles.loadingDot1]} />
                      <View style={[styles.loadingDot, styles.loadingDot2]} />
                      <View style={[styles.loadingDot, styles.loadingDot3]} />
                    </View>
                  </LinearGradient>
                </View>
              )}
              onError={(error) => {
                console.error('WebView Map Error:', error);
                Alert.alert(
                  'Map Loading Error', 
                  'Unable to load the interactive map. Please check your internet connection and try again.',
                  [{ text: 'OK' }]
                );
              }}
              onLoadStart={() => console.log('Map loading started')}
              onLoadEnd={() => console.log('Map loaded successfully')}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {!locationPermission && (
            <View style={styles.mapOverlay}>
              <Ionicons name="location-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.mapOverlayTitle}>Location Access Required</Text>
              <Text style={styles.mapOverlayDescription}>
                Enable location services to view your position and plan routes
              </Text>
              <TouchableOpacity 
                style={styles.enableLocationButton}
                onPress={requestLocationPermission}
              >
                <Text style={styles.enableLocationText}>Enable Location</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.mapControls}>
            <TouchableOpacity 
              style={[styles.mapControlButton, !locationPermission && styles.mapControlButtonDisabled]}
              onPress={handleGoToLocation}
              disabled={!locationPermission}
            >
              <Ionicons 
                name="locate" 
                size={20} 
                color={locationPermission ? theme.colors.primary : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={handleZoomIn}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={handleZoomOut}
            >
              <Ionicons name="remove" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.mapInfo}>
          <View style={styles.mapInfoItem}>
            <Ionicons name="location" size={16} color={location ? theme.colors.success : theme.colors.warning} />
            <Text style={styles.mapInfoText}>
              {location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Getting location...'}
            </Text>
          </View>
          <View style={styles.mapInfoItem}>
            <Ionicons name="compass" size={16} color={theme.colors.info} />
            <Text style={styles.mapInfoText}>
              Zoom: {mapRegion.latitudeDelta < 0.005 ? 'High' : mapRegion.latitudeDelta < 0.02 ? 'Medium' : 'Low'}
            </Text>
          </View>
          {!ExpoMaps && (
            <View style={styles.mapInfoItem}>
              <Ionicons name="information-circle" size={16} color={theme.colors.secondary} />
              <Text style={[styles.mapInfoText, { color: theme.colors.secondary }]}>
                Interactive Mode (Expo Go)
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Safety Features Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Features</Text>
        <View style={styles.featuresContainer}>
          {safetyFeatures.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <View style={[styles.featureStatus, { backgroundColor: `${theme.colors.success}20` }]}>
                  <Text style={[styles.featureStatusText, { color: theme.colors.success }]}>
                    {feature.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Quick Access */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('Emergency')}
        >
          <LinearGradient
            colors={[theme.colors.error, '#FF6B6B']}
            style={styles.emergencyButtonGradient}
          >
            <Ionicons name="warning" size={24} color="#fff" />
            <View style={styles.emergencyButtonText}>
              <Text style={styles.emergencyButtonTitle}>Emergency SOS</Text>
              <Text style={styles.emergencyButtonSubtitle}>Tap for instant help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
    
    {/* Full Screen Map Modal */}
    <FullScreenMap 
      visible={showFullScreenMap}
      onClose={() => setShowFullScreenMap(false)}
      initialLocation={location}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 2,
  },
  userSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  safetyScoreContainer: {
    alignItems: 'center',
  },
  safetyScore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyScoreNumber: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
  },
  safetyScoreLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    width: (width - theme.spacing.lg * 3) / 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  featureStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  featureStatusText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: '600',
  },
  emergencyButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emergencyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emergencyButtonText: {
    flex: 1,
  },
  emergencyButtonTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyButtonSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
  blockchainCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  blockchainGradient: {
    padding: theme.spacing.lg,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  blockchainTitle: {
    flex: 1,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: 'bold',
    color: '#fff',
  },
  idDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  idLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.xs,
  },
  idValue: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  blockchainAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  blockchainActionText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  // Map section styles
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  routeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fullScreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  fullScreenText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
  },
  startRouteButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  startRouteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  startRouteText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  mapContainer: {
    height: 400,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
    position: 'relative',
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
  },
  map: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  mapLoadingContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  mapLoadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  mapLoadingText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  loadingDot1: {
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.7,
  },
  loadingDot3: {
    opacity: 1,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...theme.shadows.small,
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  mapOverlayTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  mapOverlayDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  enableLocationButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  enableLocationText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
  },
  mapControls: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md,
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  mapControlButtonDisabled: {
    opacity: 0.5,
  },
  mapInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  mapInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapInfoText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  // Map placeholder styles
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  mapBrand: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mapTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  mapSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  viewFullMapButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  viewFullMapGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  viewFullMapText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
  },
  locationInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.md,
  },
  coordinatesText: {
    fontSize: theme.fonts.sizes.sm,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
  },
  searchingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.md,
  },
  searchingText: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: theme.spacing.sm,
  },
  routePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  safePoint: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cautionPoint: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: theme.colors.warning,
    borderWidth: 2,
    borderColor: '#fff',
  },
  safePointMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...theme.shadows.small,
  },
  touristPointMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...theme.shadows.small,
  },
  cautionPointMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...theme.shadows.small,
  },
  accuracyText: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  centerCrosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    width: 20,
    height: 20,
  },
  crosshairLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
    width: 20,
    height: 2,
    top: 9,
  },
  crosshairLineVertical: {
    width: 2,
    height: 20,
    left: 9,
    top: 0,
  },
});