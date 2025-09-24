import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({
    name: 'Tourist User',
    safetyScore: 85,
    activeTrips: 0,
    totalTrips: 12,
  });

  const quickActions = [
    {
      id: 1,
      title: 'Plan New Route',
      subtitle: 'AI-powered safe routes',
      icon: 'map',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('RouteSelection'),
    },
    {
      id: 2,
      title: 'Start Monitoring',
      subtitle: 'Real-time safety tracking',
      icon: 'eye',
      color: theme.colors.success,
      onPress: () => navigation.navigate('Monitoring'),
    },
    {
      id: 3,
      title: 'Emergency SOS',
      subtitle: 'Instant help & alerts',
      icon: 'warning',
      color: theme.colors.error,
      onPress: () => navigation.navigate('Emergency'),
    },
    {
      id: 4,
      title: 'My Profile',
      subtitle: 'Digital ID & settings',
      icon: 'person',
      color: theme.colors.info,
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const safetyFeatures = [
    {
      id: 1,
      title: 'Route Safety Rating',
      description: 'AI analyzes safety factors: crime data, road quality, emergency services',
      icon: 'shield-checkmark',
      status: 'Active',
    },
    {
      id: 2,
      title: 'Real-time Tracking',
      description: 'GPS monitoring with deviation alerts and offline maps',
      icon: 'location',
      status: 'Ready',
    },
    {
      id: 3,
      title: 'Emergency Response',
      description: 'Instant SOS, auto E-FIR, emergency contacts notification',
      icon: 'call',
      status: 'Available',
    },
    {
      id: 4,
      title: 'Digital Tourist ID',
      description: 'Blockchain-secured identity valid for your entire trip',
      icon: 'card',
      status: 'Verified',
    },
  ];

  const getSafetyScoreColor = (score) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const handleQuickAction = (action) => {
    action.onPress();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with User Profile */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color="#fff" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userSubtitle}>Stay safe, travel smart</Text>
            </View>
          </View>
          
          <View style={styles.safetyScoreContainer}>
            <View style={[styles.safetyScore, { borderColor: getSafetyScoreColor(userProfile.safetyScore) }]}>
              <Text style={[styles.safetyScoreNumber, { color: getSafetyScoreColor(userProfile.safetyScore) }]}>
                {userProfile.safetyScore}
              </Text>
              <Text style={styles.safetyScoreLabel}>Safety Score</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statNumber}>{userProfile.activeTrips}</Text>
            <Text style={styles.statLabel}>Active Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statNumber}>{userProfile.totalTrips}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="shield" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Protection</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleQuickAction(action)}
            >
              <LinearGradient
                colors={[`${action.color}15`, `${action.color}05`]}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Safety Features Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Features</Text>
        <View style={styles.featuresContainer}>
          {safetyFeatures.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <View style={[styles.featureStatus, { backgroundColor: `${theme.colors.success}20` }]}>
                  <Text style={[styles.featureStatusText, { color: theme.colors.success }]}>
                    {feature.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Quick Access */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('Emergency')}
        >
          <LinearGradient
            colors={[theme.colors.error, '#FF6B6B']}
            style={styles.emergencyButtonGradient}
          >
            <Ionicons name="warning" size={24} color="#fff" />
            <View style={styles.emergencyButtonText}>
              <Text style={styles.emergencyButtonTitle}>Emergency SOS</Text>
              <Text style={styles.emergencyButtonSubtitle}>Tap for instant help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 2,
  },
  userSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  safetyScoreContainer: {
    alignItems: 'center',
  },
  safetyScore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyScoreNumber: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
  },
  safetyScoreLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: theme.fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    width: (width - theme.spacing.lg * 3) / 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  featureStatus: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  featureStatusText: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: '600',
  },
  emergencyButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  emergencyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  emergencyButtonText: {
    flex: 1,
  },
  emergencyButtonTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyButtonSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});