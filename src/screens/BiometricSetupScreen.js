import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from '../styles/theme';
import { getCurrentUserBlockchainId } from '../utils/blockchainId';

const { width } = Dimensions.get('window');

export default function BiometricSetupScreen({ navigation, route }) {
  const [biometricType, setBiometricType] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [blockchainData, setBlockchainData] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);

  const { blockchainId, digitalId } = route.params || {};

  useEffect(() => {
    checkBiometricSupport();
    loadBlockchainData();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsSupported(compatible && enrolled);
      
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('fingerprint');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('face');
      } else {
        setBiometricType('biometric');
      }
    } catch (error) {
      console.error('Biometric check failed:', error);
      setIsSupported(false);
    }
  };

  const loadBlockchainData = async () => {
    try {
      const data = await getCurrentUserBlockchainId();
      setBlockchainData(data);
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
    }
  };

  const setupBiometric = async () => {
    try {
      if (!isSupported) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device. You can continue without biometric setup.',
          [
            { text: 'Continue Without Biometric', onPress: proceedToDigitalID },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Set up biometric authentication for e-Raksha Setu',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setSetupComplete(true);
        Alert.alert(
          'Biometric Setup Complete! ✅',
          'Your biometric authentication has been successfully configured for enhanced security.',
          [{ 
            text: 'Continue to Digital ID', 
            onPress: proceedToDigitalID 
          }]
        );
      } else {
        Alert.alert(
          'Setup Incomplete',
          'Biometric setup was not completed. You can continue without biometric authentication.',
          [
            { text: 'Retry', onPress: setupBiometric },
            { text: 'Continue Without Biometric', onPress: proceedToDigitalID }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to set up biometric authentication.');
    }
  };

  const proceedToDigitalID = () => {
    navigation.navigate('DigitalID', {
      blockchainId: blockchainId || blockchainData?.blockchainId,
      digitalId: digitalId || blockchainData?.digitalId,
      biometricEnabled: setupComplete
    });
  };

  const skipBiometric = () => {
    Alert.alert(
      'Skip Biometric Setup?',
      'Biometric authentication provides additional security for your digital tourist ID. Are you sure you want to skip this step?',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: proceedToDigitalID }
      ]
    );
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'fingerprint':
        return 'finger-print';
      case 'face':
        return 'scan';
      default:
        return 'shield-checkmark';
    }
  };

  const getBiometricText = () => {
    switch (biometricType) {
      case 'fingerprint':
        return 'Fingerprint';
      case 'face':
        return 'Face ID';
      default:
        return 'Biometric';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Biometric Security</Text>
          <Text style={styles.headerSubtitle}>
            Secure your Digital Tourist ID with biometric authentication
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Blockchain ID Display */}
        {(blockchainId || blockchainData) && (
          <View style={styles.blockchainCard}>
            <View style={styles.blockchainHeader}>
              <Ionicons name="cube" size={24} color={theme.colors.primary} />
              <Text style={styles.blockchainTitle}>Your Blockchain Identity</Text>
            </View>
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>Digital ID:</Text>
              <Text style={styles.idValue}>{digitalId || blockchainData?.digitalId}</Text>
            </View>
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>Blockchain ID:</Text>
              <Text style={styles.idValueSmall}>{blockchainId || blockchainData?.blockchainId}</Text>
            </View>
          </View>
        )}

        {/* Biometric Setup Section */}
        <View style={styles.setupSection}>
          <View style={styles.biometricIcon}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={80} 
              color={isSupported ? theme.colors.success : theme.colors.textSecondary} 
            />
          </View>

          <Text style={styles.setupTitle}>
            {isSupported ? `Set Up ${getBiometricText()} Authentication` : 'Biometric Not Available'}
          </Text>

          <Text style={styles.setupDescription}>
            {isSupported 
              ? `Use your ${getBiometricText().toLowerCase()} to quickly and securely access your Digital Tourist ID and emergency features.`
              : 'Your device does not support biometric authentication or it is not set up. You can continue without biometric security.'
            }
          </Text>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Quick access to emergency features</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Secure Digital ID verification</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Enhanced privacy protection</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Authority verification support</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isSupported && !setupComplete && (
              <TouchableOpacity style={styles.setupButton} onPress={setupBiometric}>
                <LinearGradient
                  colors={[theme.colors.success, '#45a049']}
                  style={styles.setupButtonGradient}
                >
                  <Ionicons name={getBiometricIcon()} size={20} color="#fff" />
                  <Text style={styles.setupButtonText}>
                    Set Up {getBiometricText()}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {setupComplete && (
              <TouchableOpacity style={styles.continueButton} onPress={proceedToDigitalID}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.setupButtonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                  <Text style={styles.setupButtonText}>Continue to Digital ID</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {!setupComplete && (
              <TouchableOpacity style={styles.skipButton} onPress={skipBiometric}>
                <Text style={styles.skipButtonText}>
                  {isSupported ? 'Skip Biometric Setup' : 'Continue Without Biometric'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="information-circle" size={16} color={theme.colors.info} />
          <Text style={styles.securityNoticeText}>
            Your biometric data is stored securely on your device and never transmitted to our servers.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  blockchainCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  blockchainTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  idContainer: {
    marginBottom: theme.spacing.sm,
  },
  idLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  idValue: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  idValueSmall: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  setupSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  biometricIcon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  setupTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  setupDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  benefitsList: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  setupButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  continueButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  setupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  setupButtonText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.info}10`,
    borderRadius: theme.borderRadius.md,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.info,
    lineHeight: 18,
  },
});