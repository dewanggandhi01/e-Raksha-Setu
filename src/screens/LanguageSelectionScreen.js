import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
];

export default function LanguageSelectionScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchText, setSearchText] = useState('');

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    // Here you would typically save the language preference
    // to AsyncStorage or your preferred storage solution
  };

  const handleContinue = () => {
    // Save language preference and navigate
    navigation.navigate('Registration');
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchText.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderLanguageCard = (language) => {
    const isSelected = selectedLanguage === language.code;
    
    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageCard,
          isSelected && styles.languageCardSelected,
        ]}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageCardContent}>
          <View style={styles.languageInfo}>
            <Text style={styles.flag}>{language.flag}</Text>
            <View style={styles.languageText}>
              <Text style={[
                styles.languageName,
                isSelected && styles.languageNameSelected
              ]}>
                {language.name}
              </Text>
              <Text style={[
                styles.nativeName,
                isSelected && styles.nativeNameSelected
              ]}>
                {language.nativeName}
              </Text>
            </View>
          </View>
          
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
            </View>
          )}
        </View>
        
        {isSelected && (
          <LinearGradient
            colors={[`${theme.colors.primary}10`, `${theme.colors.primary}05`]}
            style={styles.selectedOverlay}
          />
        )}
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.headerTitle}>Choose Your Language</Text>
          <Text style={styles.headerSubtitle}>
            Select your preferred language for the app
          </Text>
        </View>
        
        <View style={styles.languageIcon}>
          <Ionicons name="language" size={32} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.searchText}>Search languages...</Text>
        </View>
      </View>

      {/* Languages List */}
      <ScrollView 
        style={styles.languagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.languagesContent}
      >
        <Text style={styles.sectionTitle}>Available Languages</Text>
        
        <View style={styles.languagesGrid}>
          {filteredLanguages.map(renderLanguageCard)}
        </View>
        
        {/* Language Support Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={theme.colors.info} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Multi-language Support</Text>
              <Text style={styles.infoDescription}>
                All safety features, emergency alerts, and navigation instructions 
                will be available in your selected language.
              </Text>
            </View>
          </View>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="volume-high" size={20} color={theme.colors.accent} />
              <Text style={styles.featureText}>Voice Alerts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={20} color={theme.colors.accent} />
              <Text style={styles.featureText}>Text Messages</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="call" size={20} color={theme.colors.accent} />
              <Text style={styles.featureText}>Emergency Calls</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            selectedLanguage && styles.continueButtonActive
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <LinearGradient
            colors={selectedLanguage ? 
              [theme.colors.primary, theme.colors.secondary] : 
              [theme.colors.border, theme.colors.border]
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              selectedLanguage && styles.continueButtonTextActive
            ]}>
              Continue with {languages.find(l => l.code === selectedLanguage)?.name}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={selectedLanguage ? '#fff' : theme.colors.textSecondary} 
            />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.bottomNote}>
          You can change the language anytime in settings
        </Text>
      </View>
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
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  languageIcon: {
    marginLeft: theme.spacing.md,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
  },
  languagesContainer: {
    flex: 1,
  },
  languagesContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  languagesGrid: {
    marginBottom: theme.spacing.xl,
  },
  languageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  languageCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  languageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  languageNameSelected: {
    color: theme.colors.primary,
  },
  nativeName: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  nativeNameSelected: {
    color: theme.colors.primary,
  },
  checkmark: {
    marginLeft: theme.spacing.sm,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  infoContainer: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  continueButtonActive: {
    ...theme.shadows.small,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  continueButtonText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  continueButtonTextActive: {
    color: '#fff',
  },
  bottomNote: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});