import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { generateBlockchainId } from '../utils/blockchainId';

const { width } = Dimensions.get('window');

export default function RegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    documentType: 'aadhaar', // 'aadhaar' or 'passport'
    documentNumber: '',
    phoneNumber: '',
    emergencyContact: '',
    tripDuration: '',
  });
  const [errors, setErrors] = useState({});
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      // Additional validation for registration
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (!formData.documentNumber.trim()) {
        newErrors.documentNumber = `${formData.documentType === 'aadhaar' ? 'Aadhaar' : 'Passport'} number is required`;
      } else if (formData.documentType === 'aadhaar' && formData.documentNumber.length !== 12) {
        newErrors.documentNumber = 'Aadhaar number must be 12 digits';
      } else if (formData.documentType === 'passport' && formData.documentNumber.length < 6) {
        newErrors.documentNumber = 'Invalid passport number';
      }
      
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (formData.phoneNumber.length !== 10) {
        newErrors.phoneNumber = 'Phone number must be 10 digits';
      }
      
      if (!formData.emergencyContact.trim()) {
        newErrors.emergencyContact = 'Emergency contact is required';
      }
      
      if (!formData.tripDuration.trim()) {
        newErrors.tripDuration = 'Trip duration is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isLogin) {
        // For demo purposes, accept any username/password
        console.log('Navigating to MainTabs...');
        
        // Navigate directly without alert to avoid timing issues
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        // Registration process with blockchain ID generation
        console.log('Generating blockchain ID...');
        
        // Calculate trip expiry date
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(formData.tripDuration));
        
        // Prepare user data for blockchain ID generation
        const userData = {
          name: formData.fullName,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          phoneNumber: formData.phoneNumber,
          emergencyContacts: [formData.emergencyContact],
          expiryDate: expiryDate.toISOString(),
          issueLocation: 'Mobile App Registration'
        };
        
        // Generate blockchain ID
        const blockchainResult = await generateBlockchainId(userData);
        
        if (blockchainResult.success) {
          Alert.alert(
            'Registration Successful! 🎉',
            `Welcome to e-Raksha Setu!\n\n` +
            `Your Digital Tourist ID: ${blockchainResult.digitalId}\n\n` +
            `Blockchain ID: ${blockchainResult.blockchainId}\n\n` +
            `Valid until: ${new Date(expiryDate).toLocaleDateString()}\n\n` +
            `This unique ID ensures your safety and can be verified by authorities.`,
            [{ 
              text: 'Continue to Biometric Setup', 
              onPress: () => navigation.navigate('BiometricSetup', {
                blockchainId: blockchainResult.blockchainId,
                digitalId: blockchainResult.digitalId
              })
            }]
          );
        } else {
          Alert.alert(
            'Registration Error',
            'Failed to generate blockchain ID. Please try again.',
            [{ text: 'Retry', onPress: () => {} }]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '' });
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
            {isLogin ? 'Tourist Login' : 'Tourist Registration'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isLogin ? 'Welcome back to e-Raksha Setu' : 'Join e-Raksha Setu'}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={isLogin ? "log-in" : "person-add"} 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
            <Text style={styles.welcomeTitle}>
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Text>
            <Text style={styles.welcomeDescription}>
              {isLogin 
                ? 'Sign in to access your safety dashboard' 
                : 'Register to start your safe journey'
              }
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, errors.username && styles.textInputError]}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  placeholder="Enter your username"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, errors.password && styles.textInputError]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                />
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Additional Registration Fields */}
            {!isLogin && (
              <>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, errors.fullName && styles.textInputError]}
                      value={formData.fullName}
                      onChangeText={(value) => handleInputChange('fullName', value)}
                      placeholder="Enter your full name as per ID"
                      placeholderTextColor={theme.colors.textSecondary}
                      autoCapitalize="words"
                    />
                  </View>
                  {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                </View>

                {/* Document Type Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Identity Document *</Text>
                  <View style={styles.documentTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.documentTypeButton,
                        formData.documentType === 'aadhaar' && styles.documentTypeButtonActive
                      ]}
                      onPress={() => handleInputChange('documentType', 'aadhaar')}
                    >
                      <Ionicons 
                        name="card" 
                        size={16} 
                        color={formData.documentType === 'aadhaar' ? '#fff' : theme.colors.primary} 
                      />
                      <Text style={[
                        styles.documentTypeText,
                        formData.documentType === 'aadhaar' && styles.documentTypeTextActive
                      ]}>
                        Aadhaar (Indian)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.documentTypeButton,
                        formData.documentType === 'passport' && styles.documentTypeButtonActive
                      ]}
                      onPress={() => handleInputChange('documentType', 'passport')}
                    >
                      <Ionicons 
                        name="airplane" 
                        size={16} 
                        color={formData.documentType === 'passport' ? '#fff' : theme.colors.primary} 
                      />
                      <Text style={[
                        styles.documentTypeText,
                        formData.documentType === 'passport' && styles.documentTypeTextActive
                      ]}>
                        Passport (Foreign)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Document Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {formData.documentType === 'aadhaar' ? 'Aadhaar Number' : 'Passport Number'} *
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, errors.documentNumber && styles.textInputError]}
                      value={formData.documentNumber}
                      onChangeText={(value) => handleInputChange('documentNumber', value)}
                      placeholder={formData.documentType === 'aadhaar' ? 'Enter 12-digit Aadhaar' : 'Enter passport number'}
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType={formData.documentType === 'aadhaar' ? 'numeric' : 'default'}
                      maxLength={formData.documentType === 'aadhaar' ? 12 : 20}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.documentNumber && <Text style={styles.errorText}>{errors.documentNumber}</Text>}
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, errors.phoneNumber && styles.textInputError]}
                      value={formData.phoneNumber}
                      onChangeText={(value) => handleInputChange('phoneNumber', value)}
                      placeholder="Enter 10-digit mobile number"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                </View>

                {/* Emergency Contact */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Emergency Contact *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="medical" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, errors.emergencyContact && styles.textInputError]}
                      value={formData.emergencyContact}
                      onChangeText={(value) => handleInputChange('emergencyContact', value)}
                      placeholder="Emergency contact number"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  {errors.emergencyContact && <Text style={styles.errorText}>{errors.emergencyContact}</Text>}
                </View>

                {/* Trip Duration */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Trip Duration (Days) *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, errors.tripDuration && styles.textInputError]}
                      value={formData.tripDuration}
                      onChangeText={(value) => handleInputChange('tripDuration', value)}
                      placeholder="Number of days (e.g., 7)"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                  {errors.tripDuration && <Text style={styles.errorText}>{errors.tripDuration}</Text>}
                </View>

                {/* Blockchain ID Info */}
                <View style={styles.blockchainInfo}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
                  <Text style={styles.blockchainInfoText}>
                    Your unique blockchain-based Digital Tourist ID will be generated upon registration for secure verification by authorities.
                  </Text>
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </Text>
                ) : (
                  <>
                    <Ionicons 
                      name={isLogin ? "log-in" : "person-add"} 
                      size={20} 
                      color="#fff" 
                    />
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View style={styles.toggleSection}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Register here' : 'Login here'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Info */}
            <View style={styles.demoInfo}>
              <Ionicons name="information-circle" size={16} color={theme.colors.info} />
              <Text style={styles.demoInfoText}>
                Demo Mode: Use any username/password to continue
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: theme.spacing.lg,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeDescription: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  textInputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  submitButtonText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  toggleText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
  },
  toggleLink: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.info}10`,
    borderRadius: theme.borderRadius.md,
  },
  demoInfoText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.info,
    textAlign: 'center',
  },
  documentTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  documentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  documentTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  documentTypeText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  documentTypeTextActive: {
    color: '#fff',
  },
  blockchainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30`,
  },
  blockchainInfoText: {
    flex: 1,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.success,
    lineHeight: 18,
  },
});