import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function KYCVerificationScreen({ navigation }) {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [touchIdSupported, setTouchIdSupported] = useState(false);
  const [verificationStep, setVerificationStep] = useState('document'); // 'document', 'biometric', 'complete'
  const [isLoading, setIsLoading] = useState(false);
  const [documentCaptured, setDocumentCaptured] = useState(false);

  useEffect(() => {
    checkPermissions();
    checkBiometricSupport();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status === 'granted');
  };

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setFaceIdSupported(supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION));
      setTouchIdSupported(supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT));
    }
  };

  const handleDocumentCapture = () => {
    setIsLoading(true);
    // Simulate document capture and verification
    setTimeout(() => {
      setDocumentCaptured(true);
      setIsLoading(false);
      Alert.alert(
        'Document Verified',
        'Your identity document has been successfully verified using blockchain technology.',
        [{ text: 'Next', onPress: () => setVerificationStep('biometric') }]
      );
    }, 3000);
  };

  const handleBiometricVerification = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        setIsLoading(true);
        // Simulate biometric data processing
        setTimeout(() => {
          setIsLoading(false);
          setVerificationStep('complete');
          Alert.alert(
            'Verification Complete',
            'Your identity has been successfully verified and secured.',
            [{ text: 'Continue', onPress: () => navigation.navigate('BiometricSetup') }]
          );
        }, 2000);
      } else {
        Alert.alert('Verification Failed', 'Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric verification failed. Please try again.');
    }
  };

  const renderDocumentVerification = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="document-text" size={48} color={theme.colors.primary} />
        <Text style={styles.stepTitle}>Document Verification</Text>
        <Text style={styles.stepDescription}>
          Capture your Aadhaar card or Passport for verification
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        {cameraPermission === null ? (
          <View style={styles.permissionContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.permissionText}>Requesting camera permission...</Text>
          </View>
        ) : cameraPermission === false ? (
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-off" size={48} color={theme.colors.error} />
            <Text style={styles.permissionText}>Camera permission denied</Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={checkPermissions}
            >
              <Text style={styles.permissionButtonText}>Request Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <View style={styles.cameraPreview}>
              <View style={styles.documentFrame}>
                <View style={[styles.frameCorner, styles.topLeft]} />
                <View style={[styles.frameCorner, styles.topRight]} />
                <View style={[styles.frameCorner, styles.bottomLeft]} />
                <View style={[styles.frameCorner, styles.bottomRight]} />
                
                {!documentCaptured && (
                  <View style={styles.instructionOverlay}>
                    <Ionicons name="card" size={64} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.instructionText}>
                      Align your document within the frame
                    </Text>
                  </View>
                )}
                
                {documentCaptured && (
                  <View style={styles.successOverlay}>
                    <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
                    <Text style={styles.successText}>Document Captured!</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={[
                  styles.captureButton,
                  isLoading && styles.captureButtonDisabled
                ]}
                onPress={handleDocumentCapture}
                disabled={isLoading || documentCaptured}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Ionicons 
                    name={documentCaptured ? "checkmark" : "camera"} 
                    size={32} 
                    color="#fff" 
                  />
                )}
              </TouchableOpacity>
              
              <Text style={styles.captureText}>
                {isLoading ? 'Verifying...' : 
                 documentCaptured ? 'Verified' : 'Tap to capture'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.verificationFeatures}>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
          <Text style={styles.featureText}>Blockchain secured verification</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="lock-closed" size={20} color={theme.colors.success} />
          <Text style={styles.featureText}>End-to-end encrypted</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="time" size={20} color={theme.colors.success} />
          <Text style={styles.featureText}>Valid for trip duration only</Text>
        </View>
      </View>
    </View>
  );

  const renderBiometricVerification = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="fingerprint" size={48} color={theme.colors.primary} />
        <Text style={styles.stepTitle}>Biometric Verification</Text>
        <Text style={styles.stepDescription}>
          Complete your verification with biometric authentication
        </Text>
      </View>

      <View style={styles.biometricContainer}>
        <LinearGradient
          colors={[`${theme.colors.primary}20`, `${theme.colors.primary}05`]}
          style={styles.biometricCard}
        >
          <View style={styles.biometricIcon}>
            <Ionicons 
              name={faceIdSupported ? "face-recognition" : "fingerprint"} 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
          
          <Text style={styles.biometricTitle}>
            {faceIdSupported ? 'Face ID' : touchIdSupported ? 'Touch ID' : 'PIN'} Verification
          </Text>
          
          <Text style={styles.biometricDescription}>
            Use your device's biometric authentication to secure your tourist profile
          </Text>
          
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={handleBiometricVerification}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.biometricButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="scan" size={20} color="#fff" />
                  <Text style={styles.biometricButtonText}>Verify Now</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>Why biometric verification?</Text>
        <View style={styles.securityPoints}>
          <Text style={styles.securityPoint}>• Enhanced security for your safety profile</Text>
          <Text style={styles.securityPoint}>• Quick emergency authentication</Text>
          <Text style={styles.securityPoint}>• Prevent unauthorized access</Text>
          <Text style={styles.securityPoint}>• Blockchain-backed identity proof</Text>
        </View>
      </View>
    </View>
  );

  const renderVerificationComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContainer}>
        <LinearGradient
          colors={[theme.colors.success, theme.colors.accent]}
          style={styles.successBadge}
        >
          <Ionicons name="checkmark-circle" size={80} color="#fff" />
        </LinearGradient>
        
        <Text style={styles.completeTitle}>Verification Complete!</Text>
        <Text style={styles.completeDescription}>
          Your identity has been successfully verified and secured using blockchain technology.
        </Text>
        
        <View style={styles.verificationDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.success} />
            <View style={styles.detailText}>
              <Text style={styles.detailTitle}>Document Verified</Text>
              <Text style={styles.detailDescription}>Blockchain secured</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="fingerprint" size={24} color={theme.colors.success} />
            <View style={styles.detailText}>
              <Text style={styles.detailTitle}>Biometric Added</Text>
              <Text style={styles.detailDescription}>Device secured</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="key" size={24} color={theme.colors.success} />
            <View style={styles.detailText}>
              <Text style={styles.detailTitle}>Digital ID Ready</Text>
              <Text style={styles.detailDescription}>Trip duration valid</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <Text style={styles.headerSubtitle}>
            Secure identity verification
          </Text>
        </View>
        
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNumber}>
            {verificationStep === 'document' ? '1' : 
             verificationStep === 'biometric' ? '2' : '✓'}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      {verificationStep === 'document' && renderDocumentVerification()}
      {verificationStep === 'biometric' && renderBiometricVerification()}
      {verificationStep === 'complete' && renderVerificationComplete()}
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
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  stepTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraContainer: {
    flex: 1,
    marginBottom: theme.spacing.xl,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
  },
  cameraWrapper: {
    flex: 1,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  documentFrame: {
    flex: 1,
    margin: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionOverlay: {
    alignItems: 'center',
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.fonts.sizes.md,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  successOverlay: {
    alignItems: 'center',
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
  },
  cameraControls: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  captureButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  captureText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  verificationFeatures: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
  },
  biometricContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  biometricCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  biometricIcon: {
    marginBottom: theme.spacing.lg,
  },
  biometricTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  biometricDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  biometricButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  biometricButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  securityInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  securityTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  securityPoints: {
    gap: theme.spacing.xs,
  },
  securityPoint: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  completeTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  completeDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  verificationDetails: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  detailTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  detailDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
});