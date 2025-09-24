import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import KYCVerificationScreen from '../screens/KYCVerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import RouteSelectionScreen from '../screens/RouteSelectionScreen';
import RoutePlanningScreen from '../screens/RoutePlanningScreen';
import MonitoringDashboard from '../screens/MonitoringDashboard';
import EmergencyScreen from '../screens/EmergencyScreen';
import { BiometricSetupScreen, DigitalIDScreen, ProfileScreen, SettingsScreen } from '../screens/PlaceholderScreens';

import { theme } from '../styles/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main app tabs after authentication
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Monitoring') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Emergency') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'e-Raksha Setu',
          headerShown: false 
        }}
      />
      <Tab.Screen 
        name="Monitoring" 
        component={MonitoringDashboard}
        options={{ title: 'Live Tracking' }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{ title: 'Emergency SOS' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}



// Combined navigator that handles both auth and main app flows
function CombinedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Auth Flow */}
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LanguageSelection" 
        component={LanguageSelectionScreen}
        options={{ title: 'Choose Language' }}
      />
      <Stack.Screen 
        name="Registration" 
        component={RegistrationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="KYCVerification" 
        component={KYCVerificationScreen}
        options={{ title: 'Identity Verification' }}
      />
      <Stack.Screen 
        name="BiometricSetup" 
        component={BiometricSetupScreen}
        options={{ title: 'Biometric Setup' }}
      />
      <Stack.Screen 
        name="DigitalID" 
        component={DigitalIDScreen}
        options={{ title: 'Digital Tourist ID' }}
      />
      
      {/* Main App Flow */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RouteSelection" 
        component={RouteSelectionScreen}
        options={{ title: 'Select Destination' }}
      />
      <Stack.Screen 
        name="RoutePlanning" 
        component={RoutePlanningScreen}
        options={{ title: 'Route Planning' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      onStateChange={(state) => {
        console.log('Navigation state changed:', state);
      }}
    >
      <CombinedStack />
    </NavigationContainer>
  );
}