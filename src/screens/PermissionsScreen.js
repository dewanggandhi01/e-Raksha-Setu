import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';
import { theme } from '../styles/theme';

const PERMISSIONS_LIST = [
  {
    id: 'location',
    title: 'Location Access',
    description: 'Required for real-time tracking, route planning, and emergency services',
    icon: 'location',
    color: theme.colors.primary,
    critical: true,
  },
  {
    id: 'notifications',
    title: 'Push Notifications',
    description: 'Get safety alerts, emergency notifications, and travel updates',
    icon: 'notifications',
    color: theme.colors.warning,
    critical: true,
  },
  {
    id: 'camera',
    title: 'Camera Access',
    description: 'For KYC verification, QR code scanning, and identity documents',
    icon: 'camera',
    color: theme.colors.info,
    critical: false,
  },
];

export default function PermissionsScreen({ navigation }) {
  const [permissions, setPermissions] = useState({
    location: { status: 'pending', granted: false },
    notifications: { status: 'pending', granted: false },
    camera: { status: 'pending', granted: false },
  });
  const [allCriticalGranted, setAllCriticalGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  useEffect(() => {
    const critical = PERMISSIONS_LIST.filter(p => p.critical);
    const allGranted = critical.every(p => permissions[p.id]?.granted);
    setAllCriticalGranted(allGranted);
  }, [permissions]);

  const checkExistingPermissions = async () => {
    setChecking(true);
    try {
      // Check Location
      const locationStatus = await Location.getForegroundPermissionsAsync();
      
      // Check Notifications
      const notificationStatus = await Notifications.getPermissionsAsync();
      
      // Check Camera
      const cameraStatus = await Camera.getCameraPermissionsAsync();

      setPermissions({
        location: {
          status: locationStatus.status,
          granted: locationStatus.status === 'granted',
        },
        notifications: {
          status: notificationStatus.status,
          granted: notificationStatus.status === 'granted',
        },
        camera: {
          status: cameraStatus.status,
          granted: cameraStatus.status === 'granted',
        },
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setChecking(false);
    }
  };

  const requestPermission = async (permissionType) => {
    try {
      let result;
      
      switch (permissionType) {
        case 'location':
          result = await Location.requestForegroundPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            location: {
              status: result.status,
              granted: result.status === 'granted',
            },
          }));
          
          if (result.status === 'granted') {
            Alert.alert(
              'Location Enabled ✓',
              'Your location will be used for safety tracking and route planning.'
            );
          } else if (result.status === 'denied') {
            showSettingsAlert('Location');
          }
          break;

        case 'notifications':
          result = await Notifications.requestPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            notifications: {
              status: result.status,
              granted: result.status === 'granted',
            },
          }));
          
          if (result.status === 'granted') {
            Alert.alert(
              'Notifications Enabled ✓',
              'You will receive important safety alerts and updates.'
            );
          } else if (result.status === 'denied') {
            showSettingsAlert('Notifications');
          }
          break;

        case 'camera':
          result = await Camera.requestCameraPermissionsAsync();
          setPermissions(prev => ({
            ...prev,
            camera: {
              status: result.status,
              granted: result.status === 'granted',
            },
          }));
          
          if (result.status === 'granted') {
            Alert.alert(
              'Camera Enabled ✓',
              'Camera access granted for document scanning.'
            );
          } else if (result.status === 'denied') {
            showSettingsAlert('Camera');
          }
          break;
      }
    } catch (error) {
      console.error(`Error requesting ${permissionType} permission:`, error);
      Alert.alert('Error', `Failed to request ${permissionType} permission. Please try again.`);
    }
  };

  const showSettingsAlert = (permissionName) => {
    Alert.alert(
      `${permissionName} Permission Denied`,
      `${permissionName} access is required for core features. Please enable it in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const requestAllPermissions = async () => {
    for (const permission of PERMISSIONS_LIST) {
      if (!permissions[permission.id].granted) {
        await requestPermission(permission.id);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleContinue = () => {
    if (!allCriticalGranted) {
      Alert.alert(
        'Required Permissions Missing',
        'Location and Notifications are required for your safety. Please grant these permissions to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    navigation.replace('LanguageSelection');
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions?',
      'Some features may not work properly without these permissions. You can grant them later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip Anyway',
          style: 'destructive',
          onPress: () => navigation.replace('LanguageSelection'),
        },
      ]
    );
  };

  const renderPermissionCard = (permission) => {
    const permStatus = permissions[permission.id];
    const isGranted = permStatus.granted;
    const isPending = permStatus.status === 'pending' || permStatus.status === 'undetermined';

    return (
      <View key={permission.id} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <View style={[styles.permissionIcon, { backgroundColor: `${permission.color}20` }]}>
            <Ionicons name={permission.icon} size={28} color={permission.color} />
          </View>
          <View style={styles.permissionInfo}>
            <View style={styles.permissionTitleRow}>
              <Text style={styles.permissionTitle}>{permission.title}</Text>
              {permission.critical && (
                <View style={styles.criticalBadge}>
                  <Text style={styles.criticalText}>Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.permissionDescription}>{permission.description}</Text>
          </View>
        </View>

        <View style={styles.permissionFooter}>
          {isGranted ? (
            <View style={styles.grantedContainer}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.grantedText}>Granted</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.allowButton,
                { backgroundColor: permission.critical ? permission.color : theme.colors.textSecondary },
              ]}
              onPress={() => requestPermission(permission.id)}
            >
              <Text style={styles.allowButtonText}>
                {isPending ? 'Allow' : 'Grant Access'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={48} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>App Permissions</Text>
          <Text style={styles.headerSubtitle}>
            Grant permissions to ensure your safety and enable all features
          </Text>
        </LinearGradient>

        {/* Permissions List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Permissions</Text>
            <Text style={styles.sectionDescription}>
              These permissions are essential for the app to function properly
            </Text>
          </View>

          {PERMISSIONS_LIST.map(permission => renderPermissionCard(permission))}

          {/* Grant All Button */}
          {!allCriticalGranted && (
            <TouchableOpacity
              style={styles.grantAllButton}
              onPress={requestAllPermissions}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.grantAllGradient}
              >
                <Ionicons name="checkmark-done" size={24} color="#fff" />
                <Text style={styles.grantAllText}>Grant All Permissions</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Info Section */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={theme.colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Why We Need These Permissions</Text>
              <Text style={styles.infoText}>
                • <Text style={styles.infoBold}>Location:</Text> Track your journey and provide emergency assistance{'\n'}
                • <Text style={styles.infoBold}>Notifications:</Text> Alert you about safety concerns and updates{'\n'}
                • <Text style={styles.infoBold}>Camera:</Text> Scan documents for quick verification
              </Text>
            </View>
          </View>

          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.privacyText}>
              Your privacy is our priority. We only use permissions when necessary.
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              !allCriticalGranted && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!allCriticalGranted}
          >
            <LinearGradient
              colors={
                allCriticalGranted
                  ? [theme.colors.success, theme.colors.success + 'CC']
                  : [theme.colors.textSecondary, theme.colors.textSecondary]
              }
              style={styles.continueGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.fonts.sizes.lg,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: theme.spacing.md,
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
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  permissionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  permissionHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  permissionTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  criticalBadge: {
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  criticalText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: '600',
    color: theme.colors.error,
  },
  permissionDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  permissionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  grantedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  grantedText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.success,
  },
  allowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  allowButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  grantAllButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  grantAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  grantAllText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.info + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.info + '30',
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  privacyText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  continueButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  continueButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
});
