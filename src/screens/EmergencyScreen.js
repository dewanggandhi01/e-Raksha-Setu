import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

export default function EmergencyScreen({ navigation, route }) {
  const [emergencyType, setEmergencyType] = useState(route.params?.emergencyType || null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Rajesh Kumar', phone: '+91 98765 43210', relation: 'Father' },
    { id: 2, name: 'Priya Sharma', phone: '+91 87654 32109', relation: 'Sister' },
  ]);
  const [nearbyServices, setNearbyServices] = useState([
    { id: 1, name: 'District Hospital', phone: '108', distance: '2.3 km', type: 'hospital' },
    { id: 2, name: 'Police Station', phone: '100', distance: '1.8 km', type: 'police' },
    { id: 3, name: 'Fire Station', phone: '101', distance: '3.1 km', type: 'fire' },
  ]);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
    if (emergencyType) {
      handleEmergencyType(emergencyType);
    }
  }, [emergencyType]);

  useEffect(() => {
    if (sosActive) {
      startSOSPulse();
      startCountdown();
    } else {
      stopSOSPulse();
      stopCountdown();
    }
  }, [sosActive]);

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleEmergencyType = (type) => {
    switch (type) {
      case 'panic':
        triggerPanicAlert();
        break;
      case 'sos':
        triggerSOSAlert();
        break;
      case 'medical':
        showMedicalOptions();
        break;
      default:
        break;
    }
  };

  const triggerPanicAlert = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    setSosActive(true);
    setCountdown(10);
    
    Alert.alert(
      'PANIC ALERT ACTIVATED',
      'Emergency services and your contacts will be notified in 10 seconds. Press Cancel to stop.',
      [
        { text: 'Cancel', onPress: () => setSosActive(false), style: 'cancel' },
        { text: 'Send Now', onPress: () => sendEmergencyAlert('panic') }
      ]
    );
  };

  const triggerSOSAlert = () => {
    Alert.alert(
      'SOS Alert',
      'Choose the type of emergency assistance needed:',
      [
        { text: 'Medical Emergency', onPress: () => sendEmergencyAlert('medical') },
        { text: 'Police Help', onPress: () => sendEmergencyAlert('police') },
        { text: 'General Emergency', onPress: () => sendEmergencyAlert('general') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showMedicalOptions = () => {
    Alert.alert(
      'Medical Emergency',
      'What type of medical assistance do you need?',
      [
        { text: 'Call Ambulance', onPress: () => callEmergencyService('108') },
        { text: 'Contact Hospital', onPress: () => callNearbyHospital() },
        { text: 'Notify Contacts', onPress: () => sendEmergencyAlert('medical') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const startSOSPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopSOSPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startCountdown = () => {
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          sendEmergencyAlert('panic');
          setSosActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(0);
  };

  const sendEmergencyAlert = async (type) => {
    try {
      // Send to emergency contacts
      const locationText = currentLocation ? 
        `Lat: ${currentLocation.coords.latitude.toFixed(6)}, Lng: ${currentLocation.coords.longitude.toFixed(6)}` :
        'Location unavailable';
      
      const message = `EMERGENCY ALERT: I need help! Type: ${type.toUpperCase()}. My location: ${locationText}. Sent from e-Raksha Setu App.`;
      
      // In a real app, this would send SMS/notifications
      Alert.alert(
        'Emergency Alert Sent',
        `Alert has been sent to your emergency contacts and relevant authorities.\n\nMessage: ${message}`,
        [{ text: 'OK' }]
      );
      
      setSosActive(false);
      
      // Auto-generate E-FIR for serious emergencies
      if (type === 'panic' || type === 'police') {
        generateEFIR(type);
      }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send emergency alert. Please try calling directly.');
    }
  };

  const generateEFIR = (type) => {
    Alert.alert(
      'E-FIR Generation',
      'An electronic FIR has been automatically generated and sent to the nearest police station with your location and emergency details.',
      [
        { text: 'View Details', onPress: () => showEFIRDetails(type) },
        { text: 'OK' }
      ]
    );
  };

  const showEFIRDetails = (type) => {
    const firNumber = `EFIR/${new Date().getFullYear()}/${Math.floor(Math.random() * 100000)}`;
    const timestamp = new Date().toLocaleString();
    
    Alert.alert(
      'E-FIR Details',
      `FIR Number: ${firNumber}\nType: ${type.toUpperCase()} Emergency\nTime: ${timestamp}\nLocation: ${currentLocation ? 'GPS coordinates attached' : 'Location pending'}\nStatus: Submitted to nearest police station`,
      [{ text: 'OK' }]
    );
  };

  const callEmergencyService = (number) => {
    Alert.alert(
      'Emergency Call',
      `Calling ${number}. This will make a direct call to emergency services.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => {
            Linking.openURL(`tel:${number}`);
          }
        }
      ]
    );
  };

  const callNearbyHospital = () => {
    const hospital = nearbyServices.find(service => service.type === 'hospital');
    if (hospital) {
      callEmergencyService(hospital.phone);
    }
  };

  const shareLocation = async () => {
    if (!currentLocation) {
      Alert.alert('Location Unavailable', 'Unable to get current location. Please try again.');
      return;
    }
    
    const locationText = `My current location: https://maps.google.com/?q=${currentLocation.coords.latitude},${currentLocation.coords.longitude}`;
    
    // In a real app, this would use the Share API
    Alert.alert(
      'Location Shared',
      'Your location has been shared with your emergency contacts.',
      [{ text: 'OK' }]
    );
  };

  const renderEmergencyContact = (contact) => (
    <TouchableOpacity
      key={contact.id}
      style={styles.contactCard}
      onPress={() => callEmergencyService(contact.phone)}
    >
      <View style={styles.contactInfo}>
        <View style={styles.contactIcon}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactRelation}>{contact.relation}</Text>
          <Text style={styles.contactPhone}>{contact.phone}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => callEmergencyService(contact.phone)}
      >
        <Ionicons name="call" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderNearbyService = (service) => {
    const getServiceIcon = (type) => {
      switch (type) {
        case 'hospital': return 'medical';
        case 'police': return 'shield';
        case 'fire': return 'flame';
        default: return 'help-circle';
      }
    };

    const getServiceColor = (type) => {
      switch (type) {
        case 'hospital': return theme.colors.error;
        case 'police': return theme.colors.info;
        case 'fire': return theme.colors.warning;
        default: return theme.colors.textSecondary;
      }
    };

    return (
      <TouchableOpacity
        key={service.id}
        style={styles.serviceCard}
        onPress={() => callEmergencyService(service.phone)}
      >
        <View style={styles.serviceInfo}>
          <View style={[styles.serviceIcon, { backgroundColor: `${getServiceColor(service.type)}20` }]}>
            <Ionicons name={getServiceIcon(service.type)} size={20} color={getServiceColor(service.type)} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDistance}>{service.distance}</Text>
            <Text style={styles.servicePhone}>{service.phone}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.callButton, { backgroundColor: getServiceColor(service.type) }]}
          onPress={() => callEmergencyService(service.phone)}
        >
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.emergency, theme.colors.panic]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Emergency</Text>
          <Text style={styles.headerSubtitle}>
            {sosActive ? `Alert sending in ${countdown}s` : 'Get help when you need it'}
          </Text>
        </View>
        
        {sosActive && (
          <View style={styles.sosIndicator}>
            <Animated.View style={[styles.sosIcon, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="warning" size={24} color="#fff" />
            </Animated.View>
          </View>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Emergency Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.panicButton]}
            onPress={() => handleEmergencyType('panic')}
          >
            <LinearGradient
              colors={[theme.colors.panic, theme.colors.emergency]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="warning" size={32} color="#fff" />
              <Text style={styles.quickActionText}>PANIC ALERT</Text>
              <Text style={styles.quickActionSubtext}>Immediate help</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.sosButton]}
            onPress={() => handleEmergencyType('sos')}
          >
            <LinearGradient
              colors={[theme.colors.sos, theme.colors.emergency]}
              style={styles.quickActionGradient}
            >
              <Ionicons name="call" size={32} color="#fff" />
              <Text style={styles.quickActionText}>SOS CALL</Text>
              <Text style={styles.quickActionSubtext}>Choose emergency type</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Location Sharing */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location Sharing</Text>
          <TouchableOpacity style={styles.locationCard} onPress={shareLocation}>
            <LinearGradient
              colors={[`${theme.colors.info}20`, `${theme.colors.info}05`]}
              style={styles.locationGradient}
            >
              <Ionicons name="location" size={32} color={theme.colors.info} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Share Live Location</Text>
                <Text style={styles.locationDescription}>
                  {currentLocation ? 
                    'Send your real-time location to emergency contacts' :
                    'Getting your location...'
                  }
                </Text>
              </View>
              <Ionicons name="share" size={20} color={theme.colors.info} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.contactsList}>
            {emergencyContacts.map(renderEmergencyContact)}
          </View>
        </View>

        {/* Nearby Emergency Services */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nearby Emergency Services</Text>
          <View style={styles.servicesList}>
            {nearbyServices.map(renderNearbyService)}
          </View>
        </View>

        {/* Safety Information */}
        <View style={styles.sectionContainer}>
          <View style={styles.safetyInfoCard}>
            <View style={styles.safetyInfoHeader}>
              <Ionicons name="information-circle" size={24} color={theme.colors.info} />
              <Text style={styles.safetyInfoTitle}>Emergency Guidelines</Text>
            </View>
            <View style={styles.safetyInfoContent}>
              <Text style={styles.safetyInfoItem}>• Use PANIC ALERT for immediate danger</Text>
              <Text style={styles.safetyInfoItem}>• SOS CALL for specific emergency type</Text>
              <Text style={styles.safetyInfoItem}>• Share location with trusted contacts</Text>
              <Text style={styles.safetyInfoItem}>• E-FIR auto-generated for serious incidents</Text>
              <Text style={styles.safetyInfoItem}>• All alerts include your GPS coordinates</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* SOS Active Overlay */}
      {sosActive && (
        <View style={styles.sosOverlay}>
          <LinearGradient
            colors={['rgba(220,53,69,0.9)', 'rgba(139,0,0,0.9)']}
            style={styles.sosOverlayGradient}
          >
            <Animated.View style={[styles.sosOverlayIcon, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="warning" size={64} color="#fff" />
            </Animated.View>
            <Text style={styles.sosOverlayTitle}>EMERGENCY ALERT ACTIVE</Text>
            <Text style={styles.sosOverlayCountdown}>{countdown}</Text>
            <Text style={styles.sosOverlayDescription}>
              Alert will be sent automatically
            </Text>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setSosActive(false)}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
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
  sosIndicator: {
    padding: theme.spacing.sm,
  },
  sosIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    height: 120,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  quickActionText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: theme.spacing.sm,
  },
  quickActionSubtext: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  sectionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  locationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  locationInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  locationTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  contactsList: {
    gap: theme.spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  contactRelation: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  contactPhone: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesList: {
    gap: theme.spacing.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  serviceDistance: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  servicePhone: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  safetyInfoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
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
  safetyInfoContent: {
    gap: theme.spacing.sm,
  },
  safetyInfoItem: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  sosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sosOverlayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  sosOverlayIcon: {
    marginBottom: theme.spacing.lg,
  },
  sosOverlayTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  sosOverlayCountdown: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.md,
  },
  sosOverlayDescription: {
    fontSize: theme.fonts.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cancelButtonText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
});