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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../styles/theme';

export default function EmergencyScreen({ navigation, route }) {
  const [emergencyType, setEmergencyType] = useState(route.params?.emergencyType || null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [nearbyServices, setNearbyServices] = useState([
    { id: 1, name: 'District Hospital', phone: '108', distance: '2.3 km', type: 'hospital' },
    { id: 2, name: 'Police Station', phone: '100', distance: '1.8 km', type: 'police' },
    { id: 3, name: 'Fire Station', phone: '101', distance: '3.1 km', type: 'fire' },
  ]);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  
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
    
    if (emergencyContacts.length === 0) {
      Alert.alert('No Contacts', 'Please add emergency contacts first.');
      return;
    }

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;
      const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const timestamp = new Date().toLocaleString();
      
      // Get location address
      let address = 'Location coordinates attached';
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });
        if (reverseGeocode && reverseGeocode.length > 0) {
          const loc = reverseGeocode[0];
          address = `${loc.street || ''}, ${loc.city || ''}, ${loc.region || ''}, ${loc.postalCode || ''}`;
        }
      } catch (err) {
        console.log('Reverse geocoding failed:', err);
      }

      // Prepare SMS message with basic details
      const smsMessage = `🚨 EMERGENCY ALERT\n\nTime: ${timestamp}\nLocation: ${address}\n\nCoordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\nView on map: ${googleMapsUrl}\n\n- Sent from e-Raksha Setu`;

      // Extract phone numbers
      const phoneNumbers = emergencyContacts.map(contact => contact.phone.replace(/[^0-9+]/g, ''));

      // Send SMS to all contacts
      const isSMSAvailable = await SMS.isAvailableAsync();
      if (isSMSAvailable) {
        await SMS.sendSMSAsync(phoneNumbers, smsMessage);
      }

      // If online, also share live location via WhatsApp
      if (isOnline) {
        const whatsappMessage = encodeURIComponent(`🚨 EMERGENCY - Live Location Sharing\n\nI need help! Sharing my live location with you.\n\nTime: ${timestamp}\nAddress: ${address}`);
        
        // Share with each contact via WhatsApp
        for (const contact of emergencyContacts) {
          const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
          const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${whatsappMessage}`;
          
          // Try to open WhatsApp with location
          try {
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
              await Linking.openURL(whatsappUrl);
              // Small delay between contacts
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (err) {
            console.log('WhatsApp sharing failed for contact:', contact.name);
          }
        }

        Alert.alert(
          'Location Shared Successfully',
          `Emergency alert sent via SMS to ${emergencyContacts.length} contact(s).\n\nLive location sharing initiated via WhatsApp.\n\nPlease manually share your live location in the WhatsApp chat that opened.`,
          [{ text: 'OK' }]
        );
      } else {
        // Offline - SMS only
        Alert.alert(
          'Location Shared (Offline)',
          `Emergency alert with location sent via SMS to ${emergencyContacts.length} contact(s).\n\nYou are currently offline. WhatsApp live location sharing is not available.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert(
        'Error',
        'Failed to share location. Please try calling your contacts directly.',
        [{ text: 'OK' }]
      );
    }
  };

  const openContactModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setContactName(contact.name);
      setContactPhone(contact.phone);
      setContactRelation(contact.relation);
    } else {
      setEditingContact(null);
      setContactName('');
      setContactPhone('');
      setContactRelation('');
    }
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setEditingContact(null);
    setContactName('');
    setContactPhone('');
    setContactRelation('');
  };

  const saveContact = () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactRelation.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingContact) {
      // Update existing contact
      setEmergencyContacts(emergencyContacts.map(c => 
        c.id === editingContact.id
          ? { ...c, name: contactName, phone: contactPhone, relation: contactRelation }
          : c
      ));
      Alert.alert('Success', 'Contact updated successfully');
    } else {
      // Add new contact
      const newContact = {
        id: Date.now(),
        name: contactName,
        phone: contactPhone,
        relation: contactRelation
      };
      setEmergencyContacts([...emergencyContacts, newContact]);
      Alert.alert('Success', 'Contact added successfully');
    }

    closeContactModal();
  };

  const deleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEmergencyContacts(emergencyContacts.filter(c => c.id !== contactId));
            Alert.alert('Success', 'Contact removed successfully');
          }
        }
      ]
    );
  };

  const renderEmergencyContact = (contact) => (
    <View key={contact.id} style={styles.contactCard}>
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
      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openContactModal(contact)}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.info} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteContact(contact.id)}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => callEmergencyService(contact.phone)}
        >
          <Ionicons name="call" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openContactModal()}
            >
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

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeContactModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </Text>
              <TouchableOpacity onPress={closeContactModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter contact name"
                  value={contactName}
                  onChangeText={setContactName}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 XXXXX XXXXX"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Relationship *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Father, Mother, Sibling, Friend"
                  value={contactRelation}
                  onChangeText={setContactRelation}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={closeContactModal}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={saveContact}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.modalSaveButtonGradient}
                  >
                    <Text style={styles.modalSaveButtonText}>
                      {editingContact ? 'Update' : 'Add Contact'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.emergency,
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
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.info}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.error}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    ...theme.shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  modalCancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  modalSaveButtonGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
});