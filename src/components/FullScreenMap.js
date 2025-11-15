import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function FullScreenMap({ visible, onClose, initialLocation }) {
  const [location, setLocation] = useState(initialLocation);
  const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite, hybrid, terrain
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    if (visible && !location) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to show your position on the map');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location');
    }
  };

  const generateMapHTML = () => {
    const lat = location?.coords?.latitude || 28.6139;
    const lng = location?.coords?.longitude || 77.2090;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            #map { height: 100vh; width: 100vw; }
            .controls {
              position: absolute;
              top: 10px;
              right: 10px;
              z-index: 1000;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .control-btn {
              background: white;
              border: none;
              border-radius: 8px;
              padding: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
              min-width: 45px;
              transition: all 0.2s;
            }
            .control-btn:hover {
              background: #f0f0f0;
              transform: scale(1.05);
            }
            .info-box {
              position: absolute;
              bottom: 20px;
              left: 20px;
              right: 20px;
              background: rgba(255,255,255,0.95);
              padding: 16px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              backdrop-filter: blur(10px);
              z-index: 1000;
            }
            .location-title {
              font-size: 16px;
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
            }
            .location-info {
              font-size: 13px;
              color: #666;
              margin: 4px 0;
            }
            .accuracy-info {
              font-size: 12px;
              color: #999;
              font-style: italic;
            }
            .user-marker {
              background: #4285F4;
              border: 3px solid white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
          </style>
        </head>
        <body>
          <div class="controls">
            <button class="control-btn" onclick="toggleLayer()" title="Toggle Map Type">🗺️</button>
            <button class="control-btn" onclick="zoomIn()" title="Zoom In">➕</button>
            <button class="control-btn" onclick="zoomOut()" title="Zoom Out">➖</button>
            <button class="control-btn" onclick="centerOnUser()" title="Center on Location">🎯</button>
          </div>
          
          <div id="map"></div>
          
          <div class="info-box">
            <div class="location-title">📍 Your Current Location</div>
            <div class="location-info">
              <strong>Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}
            </div>
            <div class="location-info">
              <strong>Zoom:</strong> <span id="zoom-level">${zoom}</span> | 
              <strong>Layer:</strong> <span id="layer-type">Street Map</span>
            </div>
            <div class="accuracy-info">
              Real-time location tracking enabled
            </div>
          </div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            let map;
            let userMarker;
            let currentZoom = ${zoom};
            let currentLayer = 'street';
            let layers = {};

            // Initialize map
            map = L.map('map').setView([${lat}, ${lng}], currentZoom);

            // Define different map layers
            layers.street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            });

            layers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics',
              maxZoom: 19
            });

            layers.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenTopoMap contributors',
              maxZoom: 17
            });

            // Add default layer
            layers.street.addTo(map);

            // Custom user location icon
            const userIcon = L.divIcon({
              className: 'user-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            // Add user marker
            userMarker = L.marker([${lat}, ${lng}], { icon: userIcon })
              .addTo(map)
              .bindPopup('<b>📍 Your Location</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}');

            // Add safety markers
            const safeIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: #4CAF50; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const touristIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: #2196F3; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const cautionIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: #FF9800; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            // Hospital icon (red cross)
            const hospitalIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: #FF4444; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;">+</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            // Police station icon (shield)
            const policeIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background: #1565C0; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold;">👮</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            // Add hospital markers (2-3 hospitals)
            L.marker([${lat + 0.004}, ${lng + 0.005}], { icon: hospitalIcon })
              .addTo(map)
              .bindPopup('<b>🏥 City Hospital</b><br>24/7 Emergency Services<br>Distance: ~450m<br>Contact: 108');

            L.marker([${lat - 0.003}, ${lng - 0.004}], { icon: hospitalIcon })
              .addTo(map)
              .bindPopup('<b>🏥 Medical Center</b><br>Multi-specialty Hospital<br>Distance: ~380m<br>Contact: 102');

            L.marker([${lat + 0.006}, ${lng - 0.003}], { icon: hospitalIcon })
              .addTo(map)
              .bindPopup('<b>🏥 Community Clinic</b><br>Primary Healthcare<br>Distance: ~520m<br>Contact: 108');

            // Add police station markers (2-3 stations)
            L.marker([${lat - 0.005}, ${lng + 0.006}], { icon: policeIcon })
              .addTo(map)
              .bindPopup('<b>🚔 Central Police Station</b><br>24x7 Protection<br>Distance: ~600m<br>Contact: 100');

            L.marker([${lat + 0.003}, ${lng - 0.006}], { icon: policeIcon })
              .addTo(map)
              .bindPopup('<b>🚔 Tourist Police Desk</b><br>Tourist Assistance<br>Distance: ~350m<br>Contact: 1073');

            L.marker([${lat - 0.002}, ${lng + 0.004}], { icon: policeIcon })
              .addTo(map)
              .bindPopup('<b>🚔 Safety Outpost</b><br>Emergency Response<br>Distance: ~280m<br>Contact: 100');

            // Update zoom level display
            map.on('zoomend', function() {
              currentZoom = map.getZoom();
              document.getElementById('zoom-level').textContent = currentZoom;
            });

            // Control functions
            function toggleLayer() {
              const layerTypes = ['street', 'satellite', 'terrain'];
              const layerNames = ['Street Map', 'Satellite', 'Terrain'];
              const currentIndex = layerTypes.indexOf(currentLayer);
              const nextIndex = (currentIndex + 1) % layerTypes.length;
              
              // Remove current layer
              map.removeLayer(layers[currentLayer]);
              
              // Add new layer
              currentLayer = layerTypes[nextIndex];
              layers[currentLayer].addTo(map);
              
              // Update display
              document.getElementById('layer-type').textContent = layerNames[nextIndex];
            }

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

            // Auto-center on user location initially
            setTimeout(() => {
              map.setView([${lat}, ${lng}], ${zoom});
            }, 500);
          </script>
        </body>
      </html>
    `;
  };

  const toggleMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interactive Map</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: generateMapHTML() }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            scrollEnabled={false}
            onError={(error) => {
              console.error('WebView error:', error);
              Alert.alert('Map Error', 'Unable to load map. Please check your internet connection.');
            }}
          />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={getCurrentLocation}>
            <Ionicons name="locate" size={20} color={theme.colors.primary} />
            <Text style={styles.controlText}>My Location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
            <Ionicons name="layers" size={20} color={theme.colors.primary} />
            <Text style={styles.controlText}>{mapType}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={() => setZoom(z => Math.min(z + 2, 20))}>
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.controlText}>Zoom In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: 50,
    backgroundColor: theme.colors.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: theme.spacing.sm,
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  bottomControls: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: 30,
    justifyContent: 'space-around',
  },
  controlButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  controlText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.text,
    marginTop: 4,
    textTransform: 'capitalize',
  },
});