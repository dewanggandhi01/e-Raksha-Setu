import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

// Comprehensive tourist destinations across Northeast India with coordinates
const popularDestinations = [
  // Assam
  { id: 1, name: 'Kaziranga National Park', state: 'Assam', category: 'Wildlife', image: '🦏', lat: 26.5775, lng: 93.1711 },
  { id: 2, name: 'Majuli Island', state: 'Assam', category: 'Cultural', image: '🏝️', lat: 26.9500, lng: 94.2167 },
  { id: 3, name: 'Kamakhya Temple', state: 'Assam', category: 'Spiritual', image: '🕉️', lat: 26.1656, lng: 91.7050 },
  { id: 4, name: 'Manas National Park', state: 'Assam', category: 'Wildlife', image: '🐘', lat: 26.6761, lng: 90.9635 },
  { id: 5, name: 'Pobitora Wildlife Sanctuary', state: 'Assam', category: 'Wildlife', image: '🦏', lat: 26.2500, lng: 92.0333 },
  { id: 6, name: 'Umananda Island', state: 'Assam', category: 'Spiritual', image: '🛕', lat: 26.1813, lng: 91.7417 },
  { id: 7, name: 'Assam State Zoo', state: 'Assam', category: 'Wildlife', image: '🦁', lat: 26.1678, lng: 91.7778 },
  { id: 8, name: 'Srimanta Sankardev Kalakshetra', state: 'Assam', category: 'Cultural', image: '🎭', lat: 26.1431, lng: 91.7898 },
  { id: 9, name: 'Navagraha Temple', state: 'Assam', category: 'Spiritual', image: '🕉️', lat: 26.1811, lng: 91.8067 },
  { id: 10, name: 'Haflong Hill Station', state: 'Assam', category: 'Nature', image: '🏔️', lat: 25.1669, lng: 93.0175 },
  { id: 11, name: 'Sivasagar Tank', state: 'Assam', category: 'Cultural', image: '🏛️', lat: 26.9840, lng: 94.6411 },
  { id: 12, name: 'Gibbon Wildlife Sanctuary', state: 'Assam', category: 'Wildlife', image: '🐵', lat: 26.7000, lng: 94.5667 },
  
  // Meghalaya
  { id: 13, name: 'Shillong Peak', state: 'Meghalaya', category: 'Nature', image: '⛰️', lat: 25.5544, lng: 91.9014 },
  { id: 14, name: 'Elephant Falls', state: 'Meghalaya', category: 'Nature', image: '💧', lat: 25.5275, lng: 91.8906 },
  { id: 15, name: 'Umiam Lake', state: 'Meghalaya', category: 'Nature', image: '🌊', lat: 25.6645, lng: 91.9159 },
  { id: 16, name: 'Don Bosco Museum', state: 'Meghalaya', category: 'Cultural', image: '🏛️', lat: 25.5788, lng: 91.8933 },
  { id: 17, name: 'Mawlynnong Village', state: 'Meghalaya', category: 'Cultural', image: '🏡', lat: 25.2025, lng: 91.9464 },
  { id: 18, name: 'Cherrapunji', state: 'Meghalaya', category: 'Nature', image: '🌧️', lat: 25.2654, lng: 91.7321 },
  { id: 19, name: 'Living Root Bridges', state: 'Meghalaya', category: 'Nature', image: '🌉', lat: 25.2583, lng: 91.7056 },
  { id: 20, name: 'Nohkalikai Falls', state: 'Meghalaya', category: 'Nature', image: '💦', lat: 25.2758, lng: 91.7197 },
  
  // Arunachal Pradesh
  { id: 21, name: 'Tawang Monastery', state: 'Arunachal Pradesh', category: 'Spiritual', image: '🏛️', lat: 27.5864, lng: 91.8597 },
  { id: 22, name: 'Ziro Valley', state: 'Arunachal Pradesh', category: 'Nature', image: '🏔️', lat: 27.5445, lng: 93.8293 },
  { id: 23, name: 'Sela Pass', state: 'Arunachal Pradesh', category: 'Nature', image: '⛰️', lat: 27.3567, lng: 92.0635 },
  { id: 24, name: 'Namdapha National Park', state: 'Arunachal Pradesh', category: 'Wildlife', image: '🐆', lat: 27.5167, lng: 96.4167 },
  { id: 25, name: 'Itanagar Wildlife Sanctuary', state: 'Arunachal Pradesh', category: 'Wildlife', image: '🦌', lat: 27.0844, lng: 93.6053 },
  
  // Nagaland
  { id: 26, name: 'Kohima War Cemetery', state: 'Nagaland', category: 'Historical', image: '🕊️', lat: 25.6640, lng: 94.1078 },
  { id: 27, name: 'Dzukou Valley', state: 'Nagaland', category: 'Nature', image: '🌸', lat: 25.5500, lng: 94.0833 },
  { id: 28, name: 'Japfu Peak', state: 'Nagaland', category: 'Nature', image: '🏔️', lat: 25.6000, lng: 94.0500 },
  
  // Manipur
  { id: 29, name: 'Loktak Lake', state: 'Manipur', category: 'Nature', image: '🌊', lat: 24.5167, lng: 93.8167 },
  { id: 30, name: 'Kangla Fort', state: 'Manipur', category: 'Historical', image: '🏰', lat: 24.8108, lng: 93.9536 },
  { id: 31, name: 'Keibul Lamjao National Park', state: 'Manipur', category: 'Wildlife', image: '🦌', lat: 24.5167, lng: 93.8333 },
  
  // Tripura
  { id: 32, name: 'Ujjayanta Palace', state: 'Tripura', category: 'Historical', image: '🏰', lat: 23.8368, lng: 91.2791 },
  { id: 33, name: 'Neermahal', state: 'Tripura', category: 'Historical', image: '🏛️', lat: 23.5767, lng: 91.5333 },
  { id: 34, name: 'Sepahijala Wildlife Sanctuary', state: 'Tripura', category: 'Wildlife', image: '🦜', lat: 23.6333, lng: 91.3833 },
  
  // Mizoram
  { id: 35, name: 'Vantawng Falls', state: 'Mizoram', category: 'Nature', image: '💧', lat: 23.4833, lng: 92.9833 },
  { id: 36, name: 'Phawngpui Blue Mountain', state: 'Mizoram', category: 'Nature', image: '⛰️', lat: 22.6167, lng: 93.0333 },
];

const categories = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'wildlife', name: 'Wildlife', icon: 'leaf' },
  { id: 'cultural', name: 'Cultural', icon: 'library' },
  { id: 'spiritual', name: 'Spiritual', icon: 'flower' },
  { id: 'nature', name: 'Nature', icon: 'mountain' },
  { id: 'adventure', name: 'Adventure', icon: 'trail-sign' },
  { id: 'historical', name: 'Historical', icon: 'time' },
];

export default function RouteSelectionScreen({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState('');
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    // Update nearby destinations when source location changes
    if (startLocation.trim() && startCoordinates) {
      fetchNearbyDestinations(startLocation, startCoordinates);
    } else {
      setNearbyDestinations([]);
      setAllDestinations([]);
      setAvailableTags([]);
      setSelectedTags([]);
    }
  }, [startLocation, startCoordinates]);

  useEffect(() => {
    // Filter destinations based on selected tags
    if (selectedTags.length === 0) {
      setNearbyDestinations(allDestinations);
    } else {
      const filtered = allDestinations.filter(dest =>
        selectedTags.includes(dest.category)
      );
      setNearbyDestinations(filtered);
    }
  }, [selectedTags, allDestinations]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for safety features.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

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

  const useCurrentLocationAsStart = async () => {
    setIsLoadingLocation(true);
    try {
      // Check location permission first
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Request permission if not granted
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (newStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Please enable location access in your device settings to use this feature.',
            [{ text: 'OK' }]
          );
          return;
        }
        status = newStatus;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCurrentLocation(location);

      try {
        // Reverse geocoding to get place name
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (address && address.length > 0) {
          const place = address[0];
          // Format address with city, region, or name
          const locationName = place.city || place.subregion || place.region || 
                              place.name || place.district || 
                              `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
          setStartLocation(locationName);
          setStartCoordinates({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        } else {
          setStartLocation(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
          setStartCoordinates({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setStartLocation(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
        setStartCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please make sure location services are enabled.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const fetchNearbyDestinations = async (sourceLocation, coordinates) => {
    if (!coordinates) return;

    // Calculate distances and filter destinations within 100km
    const nearbyPlaces = popularDestinations
      .map(dest => {
        const distance = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          dest.lat,
          dest.lng
        );
        return {
          ...dest,
          distance: `${Math.round(distance)} km`,
          distanceValue: distance
        };
      })
      .filter(dest => dest.distanceValue <= 100) // Only show destinations within 100km
      .sort((a, b) => a.distanceValue - b.distanceValue); // Sort by distance (closest first)
    
    setAllDestinations(nearbyPlaces);
    setNearbyDestinations(nearbyPlaces);
    
    if (nearbyPlaces.length === 0) {
      Alert.alert(
        'No Nearby Destinations',
        'No tourist destinations found within 100km of your location. Try a different source location.',
        [{ text: 'OK' }]
      );
    }
    
    // Extract unique categories for tags
    const uniqueCategories = [...new Set(nearbyPlaces.map(dest => dest.category))];
    setAvailableTags(uniqueCategories);
    setSelectedTags([]);
  };

  const handleStartLocationChange = async (text) => {
    setStartLocation(text);
    
    // Clear coordinates when user starts typing
    if (text.trim() === '') {
      setStartCoordinates(null);
    }
  };

  const handleStartLocationSubmit = async () => {
    if (!startLocation.trim()) return;

    try {
      // Try to geocode the entered location
      const geocoded = await Location.geocodeAsync(startLocation);
      
      if (geocoded && geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        setStartCoordinates({ latitude, longitude });
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find the specified location. Please try a different location or use current location.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      Alert.alert(
        'Error',
        'Unable to find location. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePlanRoute = () => {
    if (!startLocation.trim() || !destinationLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter both source and destination locations.');
      return;
    }

    navigation.navigate('RoutePlanning', { 
      startLocation,
      destinationLocation
    });
  };

  const handleDestinationSelect = (destination) => {
    setDestinationLocation(destination.name);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const renderDestinationCard = ({ item }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      onPress={() => handleDestinationSelect(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[theme.colors.surface, `${theme.colors.primary}05`]}
        style={styles.destinationGradient}
      >
        <View style={styles.destinationHeader}>
          <View style={styles.destinationIcon}>
            <Text style={styles.destinationEmoji}>{item.image}</Text>
          </View>
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationName}>{item.name}</Text>
            <Text style={styles.destinationState}>{item.state}</Text>
          </View>
          <View style={styles.destinationMeta}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={styles.distanceContainer}>
              <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle}>Plan Your Journey</Text>
            <Text style={styles.headerSubtitle}>Enter your travel details</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Route Input Section */}
          <View style={styles.routeInputSection}>
            {/* Source Location Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Ionicons name="radio-button-on" size={18} color={theme.colors.success} />
                <Text style={styles.inputLabel}>Source Location</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter starting location..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={startLocation}
                  onChangeText={handleStartLocationChange}
                  onSubmitEditing={handleStartLocationSubmit}
                  returnKeyType="search"
                />
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={useCurrentLocationAsStart}
                  activeOpacity={0.7}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                  ) : (
                    <Ionicons name="locate" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Destination Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Ionicons name="location" size={18} color={theme.colors.error} />
                <Text style={styles.inputLabel}>Destination</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter destination..."
                placeholderTextColor={theme.colors.textSecondary}
                value={destinationLocation}
                onChangeText={setDestinationLocation}
              />
            </View>

            {/* Plan Route Button */}
            <TouchableOpacity 
              style={styles.planRouteButton}
              onPress={handlePlanRoute}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.planRouteGradient}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.planRouteText}>Plan Route</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Nearby Tourist Places Suggestions */}
          {nearbyDestinations.length > 0 && (
            <View style={styles.suggestionsSection}>
              <View style={styles.suggestionHeader}>
                <Ionicons name="compass" size={24} color={theme.colors.primary} />
                <Text style={styles.suggestionTitle}>Nearby Tourist Places</Text>
              </View>
              <Text style={styles.suggestionSubtitle}>
                Popular destinations near your source location
              </Text>
              
              {/* Dynamic Filter Tags */}
              {availableTags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tagsScrollContent}
                  >
                    {availableTags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tagChip,
                          selectedTags.includes(tag) && styles.tagChipSelected
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={[
                          styles.tagText,
                          selectedTags.includes(tag) && styles.tagTextSelected
                        ]}>
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <FlatList
                data={nearbyDestinations}
                renderItem={renderDestinationCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.destinationsList}
              />
            </View>
          )}

          {/* Safety Information */}
          <View style={styles.safetySection}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
              <Text style={styles.safetyTitle}>Safety First</Text>
            </View>
            <Text style={styles.safetyDescription}>
              All routes are analyzed for safety. We provide real-time risk assessment, 
              emergency services locations, and network coverage information.
            </Text>
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  routeInputSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  locationButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.lg,
  },
  planRouteButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  planRouteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  planRouteText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  suggestionsSection: {
    padding: theme.spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  suggestionTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  suggestionSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  destinationsList: {
    gap: theme.spacing.md,
  },
  destinationCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  destinationGradient: {
    padding: theme.spacing.lg,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  destinationEmoji: {
    fontSize: 24,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  destinationState: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  destinationMeta: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    backgroundColor: `${theme.colors.accent}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
  safetySection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.success}20`,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  safetyTitle: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  safetyDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  tagsContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tagsScrollContent: {
    paddingRight: theme.spacing.lg,
  },
  tagChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full || 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  tagChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});