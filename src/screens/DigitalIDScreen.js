import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../styles/theme';
import { getCurrentUserBlockchainId, generateAuthorityQRData } from '../utils/blockchainId';

const { width } = Dimensions.get('window');

export default function DigitalIDScreen({ navigation, route }) {
  const [blockchainData, setBlockchainData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { blockchainId, digitalId, biometricEnabled } = route.params || {};

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUserBlockchainId();
      
      if (data) {
        setBlockchainData(data);
        
        // Generate QR code for authorities
        const qrCode = await generateAuthorityQRData(data.blockchainId);
        setQrData(qrCode);
      } else if (blockchainId && digitalId) {
        // Use passed data
        setBlockchainData({
          blockchainId,
          digitalId,
          isValid: true
        });
        
        const qrCode = await generateAuthorityQRData(blockchainId);
        setQrData(qrCode);
      }
    } catch (error) {
      console.error('Failed to load blockchain data:', error);
      Alert.alert('Error', 'Failed to load your Digital ID data.');
    } finally {
      setLoading(false);
    }
  };

  const shareDigitalId = async () => {
    try {
      const result = await Share.share({
        message: `My e-Raksha Setu Digital Tourist ID: ${blockchainData?.digitalId}\n\nThis ID can be verified by authorities for tourist safety.`,
        title: 'e-Raksha Setu Digital ID'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share Digital ID');
    }
  };

  const copyToClipboard = (text, label) => {
    // Note: In a real app, you'd use @react-native-clipboard/clipboard
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const proceedToApp = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cube" size={50} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your Digital ID...</Text>
        </View>
      </View>
    );
  }

  if (!blockchainData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={50} color={theme.colors.error} />
          <Text style={styles.errorText}>Failed to load Digital ID</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBlockchainData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Digital ID Created! 🎉</Text>
          <Text style={styles.headerSubtitle}>
            Your blockchain-based tourist identity is ready
          </Text>
        </View>
      </LinearGradient>

      {/* Digital ID Card */}
      <View style={styles.content}>
        <View style={styles.idCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.idCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>e-Raksha Setu</Text>
              <Text style={styles.cardSubtitle}>Digital Tourist ID</Text>
            </View>

            {/* Digital ID */}
            <View style={styles.idSection}>
              <Text style={styles.idLabel}>Digital ID</Text>
              <TouchableOpacity onPress={() => copyToClipboard(blockchainData.digitalId, 'Digital ID')}>
                <Text style={styles.idValue}>{blockchainData.digitalId}</Text>
              </TouchableOpacity>
            </View>

            {/* Status and Validity */}
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
                <Text style={styles.statusText}>
                  {blockchainData.isValid ? 'VERIFIED' : 'INVALID'}
                </Text>
              </View>
              {biometricEnabled && (
                <View style={styles.statusItem}>
                  <Ionicons name="finger-print" size={16} color="#fff" />
                  <Text style={styles.statusText}>BIOMETRIC</Text>
                </View>
              )}
            </View>

            {/* Validity Date */}
            {blockchainData.expiryDate && (
              <View style={styles.validityContainer}>
                <Text style={styles.validityLabel}>Valid Until</Text>
                <Text style={styles.validityDate}>
                  {formatDate(blockchainData.expiryDate)}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* QR Code Section */}
        {qrData && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Authority Verification</Text>
            <Text style={styles.qrDescription}>
              Show this QR code to authorities for instant verification
            </Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={qrData}
                size={200}
                color={theme.colors.text}
                backgroundColor={theme.colors.surface}
              />
            </View>
          </View>
        )}

        {/* Blockchain Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Blockchain Details</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Blockchain ID:</Text>
            <TouchableOpacity onPress={() => copyToClipboard(blockchainData.blockchainId, 'Blockchain ID')}>
              <Text style={styles.detailValue}>{blockchainData.blockchainId}</Text>
            </TouchableOpacity>
          </View>
          
          {blockchainData.blockNumber && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Block Number:</Text>
              <Text style={styles.detailValue}>#{blockchainData.blockNumber}</Text>
            </View>
          )}
          
          {blockchainData.timestamp && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {new Date(blockchainData.timestamp).toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={shareDigitalId}>
            <Ionicons name="share" size={20} color={theme.colors.primary} />
            <Text style={styles.shareButtonText}>Share Digital ID</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={proceedToApp}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Enter e-Raksha Setu</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.success} />
          <Text style={styles.securityNoticeText}>
            Your Digital ID is secured by blockchain technology and can be verified by authorized personnel for your safety and security.
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  idCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  idCardGradient: {
    padding: theme.spacing.xl,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: theme.fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
  idSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  idLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.xs,
  },
  idValue: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fonts.sizes.sm,
    color: '#fff',
    fontWeight: '600',
  },
  validityContainer: {
    alignItems: 'center',
  },
  validityLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  validityDate: {
    fontSize: theme.fonts.sizes.md,
    color: '#fff',
    fontWeight: '600',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  qrTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  qrDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailsSection: {
    marginBottom: theme.spacing.xl,
  },
  detailsTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
    fontWeight: '600',
  },
  actionButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  shareButtonText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  continueButtonText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.md,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.success,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fonts.sizes.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fonts.sizes.lg,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});