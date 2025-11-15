import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { 
  getCurrentUserBlockchainId, 
  getUserProfile, 
  updateUserProfile, 
  updateSafetyScore 
} from '../utils/blockchainId';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeTracking, setRealTimeTracking] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUserBlockchainId();
      
      if (currentUser && currentUser.blockchainId) {
        const profileResult = await getUserProfile(currentUser.blockchainId);
        
        if (profileResult.success) {
          setUserProfile(profileResult.profile);
          setRealTimeTracking(profileResult.profile.realTimeTrackingEnabled);
        } else {
          Alert.alert('Error', 'Failed to load profile data');
        }
      } else {
        Alert.alert('Error', 'No user found. Please register again.');
        navigation.navigate('Registration');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleRealTimeTracking = async (value) => {
    if (!userProfile) return;
    
    try {
      const result = await updateUserProfile(userProfile.blockchainId, {
        realTimeTrackingEnabled: value
      });
      
      if (result.success) {
        setRealTimeTracking(value);
        setUserProfile(prev => ({
          ...prev,
          realTimeTrackingEnabled: value
        }));
        
        Alert.alert(
          'Settings Updated',
          value ? 'Real-time tracking is now enabled' : 'Real-time tracking is now disabled'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update tracking settings');
    }
  };

  const handleEmergencySOS = () => {
    Alert.alert(
      'SOS Emergency',
      'This will immediately send an emergency alert to your contacts and authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SOS', 
          style: 'destructive',
          onPress: () => navigation.navigate('Emergency', { emergencyType: 'sos' })
        }
      ]
    );
  };

  const handleEndTrip = () => {
    if (!userProfile || userProfile.tripStatus !== 'active') {
      Alert.alert('No Active Trip', 'You don\'t have an active trip to end.');
      return;
    }

    Alert.alert(
      'End Trip',
      'Are you sure you want to end your current trip? This will save your travel logs and allow you to rate your experience.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Trip', 
          onPress: () => showTripRatingDialog()
        }
      ]
    );
  };

  const showTripRatingDialog = () => {
    Alert.alert(
      'Rate Your Trip',
      'How would you rate the safety and experience of your route?',
      [
        { text: 'Excellent (5★)', onPress: () => completeTripWithRating(5) },
        { text: 'Good (4★)', onPress: () => completeTripWithRating(4) },
        { text: 'Average (3★)', onPress: () => completeTripWithRating(3) },
        { text: 'Poor (2★)', onPress: () => completeTripWithRating(2) },
        { text: 'Very Poor (1★)', onPress: () => completeTripWithRating(1) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const completeTripWithRating = async (rating) => {
    try {
      await updateUserProfile(userProfile.blockchainId, {
        tripStatus: 'completed',
        routeRating: rating,
        currentDestination: null,
        nextDestination: null
      });
      
      // Update safety score based on trip completion
      await updateSafetyScore(userProfile.blockchainId, {
        routeCompliance: rating >= 4,
        tripCompletion: true
      });
      
      setUserProfile(prev => ({
        ...prev,
        tripStatus: 'completed',
        routeRating: rating
      }));
      
      Alert.alert(
        'Trip Completed',
        `Thank you for rating your trip ${rating}/5 stars. Your travel logs have been securely saved.`
      );
      
      loadUserProfile(); // Refresh profile
    } catch (error) {
      Alert.alert('Error', 'Failed to complete trip');
    }
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 75) return theme.colors.info;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getSafetyScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Attention';
  };

  const maskDocumentNumber = (type) => {
    return type === 'aadhaar' ? 'XXXX-XXXX-2XXX' : 'XXX-XXXXX89';
  };

  if (loading || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Tourist Profile</Text>
          <Text style={styles.headerSubtitle}>Digital ID & Travel Information</Text>
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Digital ID Card */}
        <View style={styles.section}>
          <View style={styles.digitalIdCard}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.digitalIdGradient}
            >
              <View style={styles.idCardHeader}>
                <View style={styles.profileImageContainer}>
                  {userProfile.profilePicture ? (
                    <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="person" size={32} color="#fff" />
                    </View>
                  )}
                </View>
                
                <View style={styles.verificationBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              
              <View style={styles.idCardContent}>
                <Text style={styles.digitalIdTitle}>Digital Tourist ID</Text>
                <Text style={styles.digitalIdNumber}>{userProfile.digitalId}</Text>
                <Text style={styles.blockchainIdNumber}>{userProfile.blockchainId}</Text>
                
                <View style={styles.idCardFooter}>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentType}>
                      {userProfile.documentType === 'aadhaar' ? 'Aadhaar' : 'Passport'}
                    </Text>
                    <Text style={styles.documentNumber}>
                      {maskDocumentNumber(userProfile.documentType)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.qrButton}
                    onPress={() => navigation.navigate('DigitalID')}
                  >
                    <Ionicons name="qr-code" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Safety Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tourist Safety Score</Text>
          <View style={styles.safetyScoreCard}>
            <View style={styles.safetyScoreHeader}>
              <View style={[styles.safetyScoreCircle, { borderColor: getSafetyScoreColor(userProfile.safetyScore) }]}>
                <Text style={[styles.safetyScoreNumber, { color: getSafetyScoreColor(userProfile.safetyScore) }]}>
                  {userProfile.safetyScore}
                </Text>
              </View>
              <View style={styles.safetyScoreInfo}>
                <Text style={styles.safetyScoreLabel}>
                  {getSafetyScoreLabel(userProfile.safetyScore)}
                </Text>
                <Text style={styles.safetyScoreDescription}>
                  Based on your travel patterns and safety compliance
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trip Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Information</Text>
          <View style={styles.tripInfoCard}>
            <View style={styles.tripStatusRow}>
              <Text style={styles.tripStatusLabel}>Status:</Text>
              <View style={[styles.tripStatusBadge, 
                { backgroundColor: userProfile.tripStatus === 'active' ? theme.colors.success : theme.colors.textSecondary }
              ]}>
                <Text style={styles.tripStatusText}>
                  {userProfile.tripStatus === 'active' ? 'Active Trip' : 'No Active Trip'}
                </Text>
              </View>
            </View>
            
            {userProfile.currentDestination && (
              <View style={styles.destinationRow}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationLabel}>Current Destination</Text>
                  <Text style={styles.destinationValue}>{userProfile.currentDestination}</Text>
                </View>
              </View>
            )}
            
            {userProfile.nextDestination && (
              <View style={styles.destinationRow}>
                <Ionicons name="navigate" size={20} color={theme.colors.secondary} />
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationLabel}>Next Destination</Text>
                  <Text style={styles.destinationValue}>{userProfile.nextDestination}</Text>
                </View>
              </View>
            )}
            
            {userProfile.routeRating && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Last Route Rating:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= userProfile.routeRating ? "star" : "star-outline"}
                      size={16}
                      color={theme.colors.warning}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Safety & Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety & Monitoring</Text>
          
          <View style={styles.safetyCard}>
            <View style={styles.trackingRow}>
              <View style={styles.trackingInfo}>
                <Ionicons name="location-outline" size={24} color={theme.colors.info} />
                <View style={styles.trackingText}>
                  <Text style={styles.trackingTitle}>Real-time Tracking</Text>
                  <Text style={styles.trackingDescription}>
                    Share location with family & authorities
                  </Text>
                </View>
              </View>
              <Switch
                value={realTimeTracking}
                onValueChange={toggleRealTimeTracking}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={realTimeTracking ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.sosStatusRow}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
              <View style={styles.sosStatusInfo}>
                <Text style={styles.sosStatusTitle}>SOS Panic Button</Text>
                <Text style={styles.sosStatusDescription}>
                  {userProfile.sosButtonActive ? 'Active & Ready' : 'Inactive'}
                </Text>
              </View>
              <View style={[styles.statusIndicator, 
                { backgroundColor: userProfile.sosButtonActive ? theme.colors.success : theme.colors.error }
              ]} />
            </View>
          </View>
        </View>

        {/* Emergency Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Actions</Text>
          
          <View style={styles.emergencyActions}>
            <TouchableOpacity 
              style={styles.sosButton}
              onPress={handleEmergencySOS}
            >
              <LinearGradient
                colors={[theme.colors.sos, theme.colors.emergency]}
                style={styles.sosButtonGradient}
              >
                <Ionicons name="warning" size={28} color="#fff" />
                <Text style={styles.sosButtonText}>SOS PANIC BUTTON</Text>
                <Text style={styles.sosButtonSubtext}>Immediate Emergency Alert</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.endTripButton}
              onPress={handleEndTrip}
              disabled={userProfile.tripStatus !== 'active'}
            >
              <View style={[styles.endTripButtonContent, 
                { opacity: userProfile.tripStatus === 'active' ? 1 : 0.5 }
              ]}>
                <Ionicons name="flag" size={24} color={theme.colors.primary} />
                <Text style={styles.endTripButtonText}>End Trip</Text>
                <Text style={styles.endTripButtonSubtext}>Complete & Rate Journey</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow}>
              <Ionicons name="language" size={24} color={theme.colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingValue}>
                  {userProfile.preferredLanguage || 'English'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <Ionicons name="help-circle" size={24} color={theme.colors.info} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Help & Support</Text>
                <Text style={styles.settingValue}>FAQs, Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Ionicons name="document-text" size={24} color={theme.colors.secondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Travel Logs</Text>
                <Text style={styles.settingValue}>Securely recorded & encrypted</Text>
              </View>
              <View style={styles.logStatusIndicator}>
                <View style={styles.logStatusDot} />
                <Text style={styles.logStatusText}>Active</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.contactsCard}>
            {userProfile.emergencyContacts && userProfile.emergencyContacts.length > 0 ? (
              userProfile.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactRow}>
                  <Ionicons name="person-circle" size={24} color={theme.colors.primary} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <Text style={styles.contactRelation}>{contact.relation}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noContactsText}>No emergency contacts added</Text>
            )}
            
            <TouchableOpacity style={styles.addContactButton}>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={styles.addContactText}>Add Emergency Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
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
  settingsButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  digitalIdCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  digitalIdGradient: {
    padding: theme.spacing.lg,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  verifiedText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
  idCardContent: {
    alignItems: 'center',
  },
  digitalIdTitle: {
    fontSize: theme.fonts.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.xs,
  },
  digitalIdNumber: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  blockchainIdNumber: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.lg,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold',
  },
  documentNumber: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyScoreCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  safetyScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  safetyScoreNumber: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
  },
  safetyScoreInfo: {
    flex: 1,
  },
  safetyScoreLabel: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  safetyScoreDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  tripInfoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  tripStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tripStatusLabel: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tripStatusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  tripStatusText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.sm,
    fontWeight: 'bold',
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  destinationInfo: {
    marginLeft: theme.spacing.md,
  },
  destinationLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  destinationValue: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  safetyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  trackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackingText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  trackingTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  trackingDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  sosStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosStatusInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  sosStatusTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sosStatusDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emergencyActions: {
    gap: theme.spacing.md,
  },
  sosButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  sosButtonGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: theme.spacing.sm,
  },
  sosButtonSubtext: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: theme.spacing.xs,
  },
  endTripButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  endTripButtonContent: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  endTripButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  endTripButtonSubtext: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  logStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  logStatusText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  contactsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  contactName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  contactPhone: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  contactRelation: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  noContactsText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    borderStyle: 'dashed',
  },
  addContactText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});