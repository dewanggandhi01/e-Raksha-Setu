import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

export default function RouteSelectionScreen({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startLocation, setStartLocation] = useState('');
  const [startCoordinates, setStartCoordinates] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [sourceSearchResults, setSourceSearchResults] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [destinationSearchResults, setDestinationSearchResults] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  
  const sourceSearchTimeout = useRef(null);
  const destinationSearchTimeout = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Calculate distance whenever both source and destination coordinates are available
  useEffect(() => {
    if (startCoordinates && destinationCoordinates) {
      const distance = calculateDistance(
        startCoordinates.latitude,
        startCoordinates.longitude,
        destinationCoordinates.latitude,
        destinationCoordinates.longitude
      );
      setEstimatedDistance(distance);
    } else {
      setEstimatedDistance(null);
    }
  }, [startCoordinates, destinationCoordinates]);

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

  // Geocode search function to get location suggestions
  const searchLocations = async (query) => {
    try {
      const results = await Location.geocodeAsync(query);
      
      if (results && results.length > 0) {
        const limitedResults = results.slice(0, Math.min(8, results.length));
        
        const formattedResults = await Promise.all(
          limitedResults.map(async (result, index) => {
            try {
              const addresses = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude,
              });
              
              if (addresses && addresses.length > 0) {
                const address = addresses[0];
                
                let name = '';
                let detailsParts = [];
                
                const isValidName = (str) => {
                  if (!str || str.length < 2) return false;
                  const alphaCount = (str.match(/[a-zA-Z]/g) || []).length;
                  return alphaCount > str.length / 2;
                };
                
                if (address.city && isValidName(address.city)) {
                  name = address.city;
                } else if (address.district && isValidName(address.district)) {
                  name = address.district;
                } else if (address.subregion && isValidName(address.subregion)) {
                  name = address.subregion;
                } else if (address.region && isValidName(address.region)) {
                  name = address.region;
                } else if (address.street && isValidName(address.street)) {
                  name = address.street;
                } else if (address.name && isValidName(address.name)) {
                  name = address.name;
                } else {
                  name = query;
                }
                
                if (address.district && address.district !== name && isValidName(address.district)) {
                  detailsParts.push(address.district);
                }
                if (address.region && address.region !== name && address.region !== address.city && isValidName(address.region)) {
                  detailsParts.push(address.region);
                }
                if (address.country && isValidName(address.country)) {
                  detailsParts.push(address.country);
                }
                
                const details = detailsParts.length > 0 
                  ? detailsParts.join(', ') 
                  : (address.country || 'Location');
                
                return {
                  id: `${result.latitude}-${result.longitude}-${index}`,
                  name: name,
                  details: details,
                  latitude: result.latitude,
                  longitude: result.longitude,
                  fullAddress: address,
                };
              }
            } catch (error) {
              // Silent error handling
            }
            
            return null;
          })
        );
        
        const validResults = formattedResults.filter(Boolean);
        const uniqueResults = [];
        const seenNames = new Set();
        
        for (const result of validResults) {
          const normalizedName = result.name.toLowerCase().trim();
          if (!seenNames.has(normalizedName)) {
            seenNames.add(normalizedName);
            uniqueResults.push(result);
          }
        }
        
        const finalResults = uniqueResults.slice(0, 4);
        
        if (finalResults.length >= 2) {
          return finalResults;
        } else if (finalResults.length === 1) {
          const single = finalResults[0];
          const alternative = {
            ...single,
            id: `${single.latitude}-${single.longitude}-alt`,
            details: `Coordinates: ${single.latitude.toFixed(4)}, ${single.longitude.toFixed(4)}`
          };
          return [single, alternative];
        } else if (finalResults.length > 0) {
          return finalResults;
        }
      }
      
      return [];
    } catch (error) {
      return [];
    }
  };

  const useCurrentLocationAsStart = async () => {
    setIsLoadingLocation(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (newStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Please enable location access in your device settings to use this feature.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
          return;
        }
        status = newStatus;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCurrentLocation(location);

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setStartCoordinates(coords);

      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (address && address.length > 0) {
          const place = address[0];
          const locationName = place.city || place.subregion || place.region || 
                              place.name || place.district || 
                              `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
          setStartLocation(locationName);
        } else {
          const coordsString = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
          setStartLocation(coordsString);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const coordsString = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
        setStartLocation(coordsString);
      }
      
      setShowSourceSuggestions(false);
      setSourceSearchResults([]);
      
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

  const handleStartLocationChange = async (text) => {
    setStartLocation(text);
    setStartCoordinates(null);
    
    // Clear previous timeout
    if (sourceSearchTimeout.current) {
      clearTimeout(sourceSearchTimeout.current);
    }
    
    if (text.trim() === '') {
      setSourceSearchResults([]);
      setShowSourceSuggestions(false);
      setIsSearchingSource(false);
      return;
    }

    // Only search after 3 characters
    if (text.trim().length < 3) {
      setSourceSearchResults([]);
      setShowSourceSuggestions(false);
      setIsSearchingSource(false);
      return;
    }

    // Show loading state
    setIsSearchingSource(true);
    setShowSourceSuggestions(true);

    // Debounce the search
    sourceSearchTimeout.current = setTimeout(async () => {
      const results = await searchLocations(text.trim());
      setSourceSearchResults(results);
      setIsSearchingSource(false);
      setShowSourceSuggestions(results.length > 0);
    }, 500); // Wait 500ms after user stops typing
  };

  const handleSourceSelect = (location) => {
    const coords = {
      latitude: location.latitude,
      longitude: location.longitude
    };
    
    setStartLocation(location.name);
    setStartCoordinates(coords);
    setShowSourceSuggestions(false);
    setSourceSearchResults([]);
  };

  const handleDestinationChange = (text) => {
    setDestinationLocation(text);
    setDestinationCoordinates(null);
    
    // Clear previous timeout
    if (destinationSearchTimeout.current) {
      clearTimeout(destinationSearchTimeout.current);
    }
    
    if (text.trim() === '') {
      setDestinationSearchResults([]);
      setShowDestinationSuggestions(false);
      setIsSearchingDestination(false);
      return;
    }

    // Only search after 3 characters
    if (text.trim().length < 3) {
      setDestinationSearchResults([]);
      setShowDestinationSuggestions(false);
      setIsSearchingDestination(false);
      return;
    }

    // Show loading state
    setIsSearchingDestination(true);
    setShowDestinationSuggestions(true);

    // Debounce the search
    destinationSearchTimeout.current = setTimeout(async () => {
      const results = await searchLocations(text.trim());
      setDestinationSearchResults(results);
      setIsSearchingDestination(false);
      setShowDestinationSuggestions(results.length > 0);
    }, 500); // Wait 500ms after user stops typing
  };

  const handlePlanRoute = async () => {
    if (!startLocation.trim() || !destinationLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter both source and destination locations.');
      return;
    }

    if (!startCoordinates) {
      Alert.alert(
        'Invalid Source Location', 
        'Please select your source location from the dropdown suggestions or use the current location button.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!destinationCoordinates) {
      Alert.alert(
        'Invalid Destination',
        'Please select your destination from the dropdown suggestions.',
        [{ text: 'OK' }]
      );
      return;
    }



    navigation.navigate('RoutePlanning', { 
      startLocation,
      destinationLocation,
      startCoordinates,
      destinationCoordinates
    });
  };

  const handleDestinationSelect = (location) => {
    const coords = {
      latitude: location.latitude,
      longitude: location.longitude
    };
    
    setDestinationLocation(location.name);
    setDestinationCoordinates(coords);
    setShowDestinationSuggestions(false);
    setDestinationSearchResults([]);
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
                <View style={styles.inputWithIndicator}>
                  <TextInput
                    style={[
                      styles.textInput,
                      startCoordinates && styles.textInputValid
                    ]}
                    placeholder="Search or enter starting location..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={startLocation}
                    onChangeText={handleStartLocationChange}
                    onFocus={() => setShowSourceSuggestions(sourceSearchResults.length > 0)}
                  />
                  {startCoordinates && (
                    <View style={styles.validIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    </View>
                  )}
                </View>
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
              
              {/* Source Suggestions Dropdown */}
              {showSourceSuggestions && (
                <View style={styles.suggestionsDropdown}>
                  <ScrollView 
                    style={styles.suggestionsScroll}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                  >
                    {isSearchingSource ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Searching locations...</Text>
                      </View>
                    ) : sourceSearchResults.length > 0 ? (
                      sourceSearchResults.map((location) => (
                        <TouchableOpacity
                          key={location.id}
                          style={styles.suggestionItem}
                          onPress={() => handleSourceSelect(location)}
                        >
                          <View style={styles.suggestionIcon}>
                            <Ionicons name="location" size={20} color={theme.colors.primary} />
                          </View>
                          <View style={styles.suggestionInfo}>
                            <Text style={styles.suggestionName}>{location.name}</Text>
                            <Text style={styles.suggestionDetails}>{location.details}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No locations found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Destination Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Ionicons name="location" size={18} color={theme.colors.error} />
                <Text style={styles.inputLabel}>Destination</Text>
              </View>
              <View style={styles.inputWithIndicator}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Search or enter destination..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={destinationLocation}
                  onChangeText={handleDestinationChange}
                  onFocus={() => setShowDestinationSuggestions(destinationSearchResults.length > 0)}
                />
              </View>
              
              {/* Destination Suggestions Dropdown */}
              {showDestinationSuggestions && (
                <View style={styles.suggestionsDropdown}>
                  <ScrollView 
                    style={styles.suggestionsScroll}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                  >
                    {isSearchingDestination ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Searching locations...</Text>
                      </View>
                    ) : destinationSearchResults.length > 0 ? (
                      destinationSearchResults.map((location) => (
                        <TouchableOpacity
                          key={location.id}
                          style={styles.suggestionItem}
                          onPress={() => handleDestinationSelect(location)}
                        >
                          <View style={styles.suggestionIcon}>
                            <Ionicons name="location" size={20} color={theme.colors.error} />
                          </View>
                          <View style={styles.suggestionInfo}>
                            <Text style={styles.suggestionName}>{location.name}</Text>
                            <Text style={styles.suggestionDetails}>{location.details}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No locations found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Distance Display */}
            {estimatedDistance !== null && (
              <View style={styles.distanceDisplay}>
                <View style={styles.distanceIconContainer}>
                  <Ionicons name="navigate-circle" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.distanceInfoContainer}>
                  <Text style={styles.distanceLabel}>Estimated Distance</Text>
                  <Text style={styles.distanceValue}>
                    {estimatedDistance < 1 
                      ? `${(estimatedDistance * 1000).toFixed(0)} meters`
                      : `${estimatedDistance.toFixed(2)} km`
                    }
                  </Text>
                </View>
                <View style={styles.distanceBadge}>
                  <Ionicons name="airplane" size={16} color={theme.colors.accent} />
                  <Text style={styles.distanceBadgeText}>Direct</Text>
                </View>
              </View>
            )}

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

          {/* Tourism Exploration Section */}
          <View style={styles.tourismSection}>
            <View style={styles.tourismSectionHeader}>
              <Ionicons name="compass" size={28} color={theme.colors.primary} />
              <Text style={styles.tourismSectionTitle}>Discover Northeast India</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.tourismButton}
              onPress={() => navigation.navigate('Tourism', { destinationLocation })}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tourismGradient}
              >
                <View style={styles.tourismContent}>
                  <View style={styles.tourismLeft}>
                    <View style={styles.tourismIcon}>
                      <Ionicons name="location" size={24} color="#fff" />
                    </View>
                    <View style={styles.tourismInfo}>
                      <Text style={styles.tourismTitle}>Places to Visit</Text>
                      <Text style={styles.tourismSubtitle}>26+ attractions</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.tourismGrid}>
              <TouchableOpacity 
                style={styles.tourismGridItem}
                onPress={() => navigation.navigate('Tourism', { destinationLocation })}
              >
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={styles.tourismGridGradient}
                >
                  <Ionicons name="bed" size={28} color="#fff" />
                  <Text style={styles.tourismGridText}>Hotels</Text>
                  <Text style={styles.tourismGridSubtext}>Book Stay</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tourismGridItem}
                onPress={() => navigation.navigate('Tourism', { destinationLocation })}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.tourismGridGradient}
                >
                  <Ionicons name="calendar" size={28} color="#fff" />
                  <Text style={styles.tourismGridText}>Festivals</Text>
                  <Text style={styles.tourismGridSubtext}>Culture</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <View style={styles.helpSection}>
            <View style={styles.helpHeader}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.helpTitle}>How to use</Text>
            </View>
            <Text style={styles.helpText}>
              • Type at least 3 characters in the source or destination field{'\n'}
              • Select a location from the suggestions that appear{'\n'}
              • Or use the location button to set your current location as source{'\n'}
              • Once both locations are selected, tap "Plan Route"
            </Text>
          </View>

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
  inputWithIndicator: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.xl + theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  textInputValid: {
    borderColor: theme.colors.success,
    borderWidth: 2,
  },
  validIndicator: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
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
  suggestionsDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionsScroll: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  suggestionEmoji: {
    fontSize: 20,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  noResultsContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  helpSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  helpTitle: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  helpText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  distanceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}05`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}20`,
  },
  distanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  distanceInfoContainer: {
    flex: 1,
  },
  distanceLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  distanceValue: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.accent}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  distanceBadgeText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  tourismSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl || 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tourismSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tourismSectionTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tourismButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  tourismGradient: {
    padding: theme.spacing.md,
  },
  tourismContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tourismLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tourismIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  tourismInfo: {
    flex: 1,
  },
  tourismTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  tourismSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  tourismGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tourismGridItem: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  tourismGridGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  tourismGridText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: '#fff',
    marginTop: theme.spacing.xs,
  },
  tourismGridSubtext: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});