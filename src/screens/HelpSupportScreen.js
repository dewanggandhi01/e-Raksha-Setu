import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const languages = [
  { code: 'english', name: 'English', nativeName: 'English' },
  { code: 'hindi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bengali', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'telugu', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'marathi', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'tamil', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'urdu', name: 'Urdu', nativeName: 'اردو' },
  { code: 'kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'odia', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

const helpSections = [
  {
    id: 1,
    title: 'Getting Started',
    items: [
      'How to register with Aadhaar/Passport',
      'Setting up your Digital Tourist ID',
      'Biometric authentication setup',
      'Understanding your safety score'
    ]
  },
  {
    id: 2,
    title: 'Safety Features',
    items: [
      'Using the SOS panic button',
      'Real-time location tracking',
      'Emergency contact management',
      'Route safety ratings'
    ]
  },
  {
    id: 3,
    title: 'Trip Planning',
    items: [
      'Selecting safe destinations',
      'Understanding route recommendations',
      'Offline map downloads',
      'Travel log management'
    ]
  },
  {
    id: 4,
    title: 'Digital Identity',
    items: [
      'QR code for authorities',
      'Blockchain ID verification',
      'Profile data security',
      'ID expiry and renewal'
    ]
  }
];

const emergencyNumbers = [
  { service: 'Police', number: '100', description: 'General police emergency' },
  { service: 'Medical Emergency', number: '108', description: 'Ambulance and medical help' },
  { service: 'Fire Department', number: '101', description: 'Fire emergency services' },
  { service: 'Tourist Helpline', number: '1363', description: 'Tourism department assistance' },
  { service: 'Women Helpline', number: '181', description: 'Women safety and support' },
  { service: 'Disaster Management', number: '108', description: 'Natural disaster assistance' },
];

export default function HelpSupportScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
    setShowLanguageModal(false);
    // Here you would typically update the app's language
    // and save the preference to storage
  };

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === selectedLanguage);
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>FAQs and Emergency Contacts</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language / भाषा</Text>
          <TouchableOpacity 
            style={styles.languageCard}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.languageInfo}>
              <Ionicons name="language" size={24} color={theme.colors.primary} />
              <View style={styles.languageText}>
                <Text style={styles.languageName}>
                  {getCurrentLanguage()?.name}
                </Text>
                <Text style={styles.languageNative}>
                  {getCurrentLanguage()?.nativeName}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Emergency Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Numbers</Text>
          <View style={styles.emergencyCard}>
            {emergencyNumbers.map((emergency, index) => (
              <View key={index} style={styles.emergencyRow}>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyService}>{emergency.service}</Text>
                  <Text style={styles.emergencyDescription}>{emergency.description}</Text>
                </View>
                <TouchableOpacity style={styles.emergencyNumber}>
                  <Text style={styles.emergencyNumberText}>{emergency.number}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {helpSections.map((section) => (
            <View key={section.id} style={styles.faqSection}>
              <TouchableOpacity 
                style={styles.faqHeader}
                onPress={() => toggleSection(section.id)}
              >
                <Text style={styles.faqTitle}>{section.title}</Text>
                <Ionicons 
                  name={expandedSection === section.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </TouchableOpacity>
              
              {expandedSection === section.id && (
                <View style={styles.faqContent}>
                  {section.items.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.faqItem}>
                      <Ionicons name="help-circle-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.faqItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.supportCard}>
            <TouchableOpacity style={styles.supportOption}>
              <View style={styles.supportIcon}>
                <Ionicons name="call" size={24} color={theme.colors.success} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Call Support</Text>
                <Text style={styles.supportDescription}>Speak with our support team</Text>
              </View>
              <Text style={styles.supportValue}>1800-XXX-XXXX</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportOption}>
              <View style={styles.supportIcon}>
                <Ionicons name="mail" size={24} color={theme.colors.info} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Email Support</Text>
                <Text style={styles.supportDescription}>Get help via email</Text>
              </View>
              <Text style={styles.supportValue}>support@eraksha.gov.in</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.supportOption}>
              <View style={styles.supportIcon}>
                <Ionicons name="chatbubble" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Live Chat</Text>
                <Text style={styles.supportDescription}>Chat with support online</Text>
              </View>
              <View style={styles.liveChatIndicator}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>September 2025</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Developed By</Text>
              <Text style={styles.infoValue}>Government of India</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Privacy Policy</Text>
              <TouchableOpacity>
                <Text style={styles.infoLink}>View Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowLanguageModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            <View style={styles.modalCloseButton} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={[
                    styles.languageOptionName,
                    selectedLanguage === language.code && styles.selectedLanguageText
                  ]}>
                    {language.name}
                  </Text>
                  <Text style={[
                    styles.languageOptionNative,
                    selectedLanguage === language.code && styles.selectedLanguageText
                  ]}>
                    {language.nativeName}
                  </Text>
                </View>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  languageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    marginLeft: theme.spacing.md,
  },
  languageName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  languageNative: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  emergencyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyService: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emergencyDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  emergencyNumber: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  emergencyNumberText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  faqSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  faqTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  faqContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  faqItemText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  supportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  supportDescription: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  supportValue: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  liveChatIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.xs,
  },
  onlineText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
  },
  infoLink: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  selectedLanguageOption: {
    backgroundColor: `${theme.colors.primary}20`,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  languageOptionContent: {
    flex: 1,
  },
  languageOptionName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  languageOptionNative: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  selectedLanguageText: {
    color: theme.colors.primary,
  },
});