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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

// Mock popular destinations data
const popularDestinations = [
  { id: 1, name: 'Kaziranga National Park', state: 'Assam', category: 'Wildlife', distance: '45 km', image: '🦏' },
  { id: 2, name: 'Majuli Island', state: 'Assam', category: 'Cultural', distance: '65 km', image: '🏝️' },
  { id: 3, name: 'Tawang Monastery', state: 'Arunachal Pradesh', category: 'Spiritual', distance: '120 km', image: '🏛️' },
  { id: 4, name: 'Cherrapunji', state: 'Meghalaya', category: 'Nature', distance: '85 km', image: '🌧️' },
  { id: 5, name: 'Ziro Valley', state: 'Arunachal Pradesh', category: 'Adventure', distance: '95 km', image: '🏔️' },
  { id: 6, name: 'Kohima War Cemetery', state: 'Nagaland', category: 'Historical', distance: '110 km', image: '🕊️' },
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
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinations, setDestinations] = useState(popularDestinations);
  const [recentSearches, setRecentSearches] = useState([
    'Shillong', 'Guwahati', 'Itanagar', 'Dimapur'
  ]);
  
  // New route planning states
  const [startLocation, setStartLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [showRouteInputs, setShowRouteInputs] = useState(false);
  const [routeSuggestions, setRouteSuggestions] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = popularDestinations.filter(dest =>
        dest.name.toLowerCase().includes(text.toLowerCase()) ||
        dest.state.toLowerCase().includes(text.toLowerCase())
      );
      setDestinations(filtered);
    } else {
      setDestinations(popularDestinations);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setDestinations(popularDestinations);
    } else {
      const filtered = popularDestinations.filter(dest =>
        dest.category.toLowerCase() === category.toLowerCase()
      );
      setDestinations(filtered);
    }
  };

  const handleDestinationSelect = (destination) => {
    navigation.navigate('RoutePlanning', { destination });
  };

  const calculateRoute = async () => {
    if (!startLocation.trim() || !destinationLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter both starting location and destination.');
      return;
    }

    setIsCalculatingRoute(true);
    
    try {
      // Simulate route calculation (in real app, use routing API)
      const mockRoutes = [
        {
          id: 1,
          name: 'Fastest Route',
          duration: '2h 45m',
          distance: '125 km',
          safetyScore: 85,
          description: 'Via main highways - fastest but moderate traffic',
          highlights: ['Well-lit roads', 'Regular fuel stations', 'Good network coverage'],
          warnings: ['Heavy traffic 9-11 AM', 'Construction work at km 45']
        },
        {
          id: 2,
          name: 'Safest Route',
          duration: '3h 15m',
          distance: '138 km',
          safetyScore: 95,
          description: 'Via scenic route - safer with better emergency services',
          highlights: ['24/7 police patrolling', 'Multiple hospitals', 'Tourist-friendly areas'],
          warnings: ['Longer travel time', 'Mountain roads']
        },
        {
          id: 3,
          name: 'Scenic Route',
          duration: '3h 45m',
          distance: '145 km',
          safetyScore: 78,
          description: 'Beautiful landscapes - perfect for leisure travel',
          highlights: ['Amazing viewpoints', 'Local attractions', 'Photo opportunities'],
          warnings: ['Remote areas', 'Limited network in some areas']
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRouteSuggestions(mockRoutes);
      
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Error', 'Unable to calculate route. Please try again.');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const selectRoute = (route) => {
    navigation.navigate('RoutePlanning', { 
      startLocation,
      destinationLocation,
      routeData: routeSuggestions,
      selectedRoute: route
    });
  };

  const useCurrentLocationAsStart = async () => {
    if (currentLocation) {
      const address = `${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`;
      setStartLocation(address);
    } else {
      Alert.alert('Location Unavailable', 'Please enable location services to use current location.');
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
        
        <View style={styles.destinationActions}>
          <View style={styles.safetyIndicator}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
            <Text style={styles.safetyText}>Safety Verified</Text>
          </View>
          
          <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select Route</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        selectedCategory === category.id && styles.categoryItemSelected
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <Ionicons 
        name={category.icon} 
        size={20} 
        color={selectedCategory === category.id ? '#fff' : theme.colors.primary} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.categoryTextSelected
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
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
            {showRouteInputs ? 'Plan Your Route' : 'Choose Destination'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {showRouteInputs ? 'Enter start and destination locations' : 'Where would you like to go today?'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowRouteInputs(!showRouteInputs)}
        >
          <Ionicons 
            name={showRouteInputs ? "list" : "navigate"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Current Location */}
        <TouchableOpacity style={styles.currentLocationButton}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <Text style={styles.currentLocationText}>Use current location</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Route Planning Section */}
        {showRouteInputs && (
          <View style={styles.routePlanningSection}>
            <Text style={styles.sectionTitle}>Route Planning</Text>
            
            {/* Starting Location Input */}
            <View style={styles.locationInputContainer}>
              <View style={styles.locationInputHeader}>
                <Ionicons name="radio-button-on" size={16} color={theme.colors.success} />
                <Text style={styles.locationInputLabel}>Starting Location</Text>
              </View>
              <View style={styles.locationInputRow}>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Enter starting location..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={startLocation}
                  onChangeText={setStartLocation}
                />
                <TouchableOpacity 
                  style={styles.currentLocationBtn}
                  onPress={useCurrentLocationAsStart}
                >
                  <Ionicons name="locate" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Destination Input */}
            <View style={styles.locationInputContainer}>
              <View style={styles.locationInputHeader}>
                <Ionicons name="location" size={16} color={theme.colors.error} />
                <Text style={styles.locationInputLabel}>Destination</Text>
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter destination..."
                placeholderTextColor={theme.colors.textSecondary}
                value={destinationLocation}
                onChangeText={setDestinationLocation}
              />
            </View>

            {/* Calculate Route Button */}
            <TouchableOpacity 
              style={[styles.calculateRouteButton, isCalculatingRoute && styles.disabledButton]}
              onPress={calculateRoute}
              disabled={isCalculatingRoute}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.calculateRouteGradient}
              >
                {isCalculatingRoute ? (
                  <>
                    <Text style={styles.calculateRouteText}>Calculating...</Text>
                    <View style={styles.loadingDots}>
                      <View style={[styles.loadingDot, styles.dot1]} />
                      <View style={[styles.loadingDot, styles.dot2]} />
                      <View style={[styles.loadingDot, styles.dot3]} />
                    </View>
                  </>
                ) : (
                  <>
                    <Ionicons name="map" size={20} color="#fff" />
                    <Text style={styles.calculateRouteText}>Calculate Best Route</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Route Suggestions */}
            {routeSuggestions.length > 0 && (
              <View style={styles.routeSuggestionsContainer}>
                <Text style={styles.routeSuggestionsTitle}>Route Options</Text>
                {routeSuggestions.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    style={styles.routeCard}
                    onPress={() => selectRoute(route)}
                  >
                    <LinearGradient
                      colors={[theme.colors.surface, `${theme.colors.primary}05`]}
                      style={styles.routeCardGradient}
                    >
                      <View style={styles.routeHeader}>
                        <View style={styles.routeNameContainer}>
                          <Text style={styles.routeName}>{route.name}</Text>
                          <View style={[styles.safetyBadge, {
                            backgroundColor: route.safetyScore >= 90 ? theme.colors.success + '20' : 
                                            route.safetyScore >= 80 ? theme.colors.warning + '20' : 
                                            theme.colors.error + '20'
                          }]}>
                            <Text style={[styles.safetyBadgeText, {
                              color: route.safetyScore >= 90 ? theme.colors.success : 
                                     route.safetyScore >= 80 ? theme.colors.warning : 
                                     theme.colors.error
                            }]}>
                              {route.safetyScore}% Safe
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.routeStats}>
                          <View style={styles.routeStat}>
                            <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.routeStatText}>{route.duration}</Text>
                          </View>
                          <View style={styles.routeStat}>
                            <Ionicons name="speedometer" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.routeStatText}>{route.distance}</Text>
                          </View>
                        </View>
                      </View>
                      
                      <Text style={styles.routeDescription}>{route.description}</Text>
                      
                      <View style={styles.routeDetails}>
                        <View style={styles.routeHighlights}>
                          <Text style={styles.routeDetailsTitle}>✓ Highlights:</Text>
                          {route.highlights.map((highlight, index) => (
                            <Text key={index} style={styles.routeDetailText}>• {highlight}</Text>
                          ))}
                        </View>
                        
                        {route.warnings.length > 0 && (
                          <View style={styles.routeWarnings}>
                            <Text style={styles.routeWarningsTitle}>⚠ Warnings:</Text>
                            {route.warnings.map((warning, index) => (
                              <Text key={index} style={styles.routeWarningText}>• {warning}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.selectRouteButton}
                        onPress={() => selectRoute(route)}
                      >
                        <Text style={styles.selectRouteButtonText}>Select This Route</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Original Categories - only show when not in route planning mode */}
        {!showRouteInputs && (
          <>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map(renderCategoryItem)}
          </ScrollView>
        </View>

        {/* Recent Searches */}
        {searchText.length === 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.recentContainer}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleSearch(search)}
                >
                  <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Popular Destinations */}
        <View style={styles.destinationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchText.length > 0 ? 'Search Results' : 'Popular Destinations'}
            </Text>
            <Text style={styles.resultCount}>
              {destinations.length} destinations
            </Text>
          </View>
          
          <FlatList
            data={destinations}
            renderItem={renderDestinationCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.destinationsList}
          />
        </View>

        {/* Safety Information */}
        <View style={styles.safetySection}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
            <Text style={styles.safetyTitle}>Safety First</Text>
          </View>
          <Text style={styles.safetyDescription}>
            All destinations are pre-verified for safety. Route recommendations include real-time 
            risk assessment, emergency services locations, and network coverage analysis.
          </Text>
          
          <View style={styles.safetyFeatures}>
            <View style={styles.safetyFeature}>
              <Ionicons name="medical" size={16} color={theme.colors.accent} />
              <Text style={styles.safetyFeatureText}>Emergency Services</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Ionicons name="cellular" size={16} color={theme.colors.accent} />
              <Text style={styles.safetyFeatureText}>Network Coverage</Text>
            </View>
            <View style={styles.safetyFeature}>
              <Ionicons name="analytics" size={16} color={theme.colors.accent} />
              <Text style={styles.safetyFeatureText}>Risk Assessment</Text>
            </View>
          </View>
        </View>
        </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  toggleButton: {
    padding: theme.spacing.sm,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  currentLocationText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    paddingVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  categoriesContainer: {
    paddingLeft: theme.spacing.lg,
  },
  categoriesContent: {
    paddingRight: theme.spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  categoryItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  recentSection: {
    paddingBottom: theme.spacing.lg,
  },
  recentContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recentText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  destinationsSection: {
    paddingBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  resultCount: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  destinationsList: {
    paddingHorizontal: theme.spacing.lg,
  },
  destinationCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  destinationGradient: {
    padding: theme.spacing.lg,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
  destinationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safetyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.success,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
  },
  selectButtonText: {
    marginRight: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
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
    marginBottom: theme.spacing.md,
  },
  safetyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  safetyFeature: {
    alignItems: 'center',
    flex: 1,
  },
  safetyFeatureText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  // Route Planning Styles
  routePlanningSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  locationInputContainer: {
    marginBottom: theme.spacing.md,
  },
  locationInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationInputLabel: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
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
  currentLocationBtn: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
  },
  calculateRouteButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    ...theme.shadows.medium,
  },
  disabledButton: {
    opacity: 0.7,
  },
  calculateRouteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  calculateRouteText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  routeSuggestionsContainer: {
    marginTop: theme.spacing.lg,
  },
  routeSuggestionsTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  routeCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  routeCardGradient: {
    padding: theme.spacing.lg,
  },
  routeHeader: {
    marginBottom: theme.spacing.md,
  },
  routeNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  routeName: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  safetyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  safetyBadgeText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: 'bold',
  },
  routeStats: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  routeStatText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  routeDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  routeDetails: {
    marginBottom: theme.spacing.md,
  },
  routeHighlights: {
    marginBottom: theme.spacing.sm,
  },
  routeDetailsTitle: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  routeDetailText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  routeWarnings: {
    marginTop: theme.spacing.sm,
  },
  routeWarningsTitle: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  routeWarningText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  selectRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  selectRouteButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});