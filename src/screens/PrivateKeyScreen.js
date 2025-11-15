import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { getPrivateKey } from '../utils/keys';
import { Ionicons } from '@expo/vector-icons';

export default function PrivateKeyScreen({ navigation }) {
  const [revealed, setRevealed] = useState(false);
  const [privateKey, setPrivateKey] = useState(null);

  const reveal = async () => {
    Alert.alert(
      'Warning',
      'Do NOT share your private key with anyone. This key unlocks your sensitive data. Only reveal it in a trusted environment or when making an emergency call.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reveal', style: 'destructive', onPress: async () => {
          const pk = await getPrivateKey();
          setPrivateKey(pk);
          setRevealed(true);
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Private Key (Protected)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          The private key is used to decrypt your sensitive local data. Do not share it.
        </Text>

        <View style={styles.box}>
          <Text style={styles.label}>Private Key</Text>
          <Text style={styles.keyText}>{revealed ? privateKey || 'Unavailable' : '••••••••••••••••••••••••••••••••••••••••'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={reveal}>
          <Text style={styles.buttonText}>Reveal Private Key</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => navigation.navigate('Profile')}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Back to Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  content: { padding: 20 },
  description: { color: theme.colors.textSecondary, marginBottom: 16 },
  box: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 8, marginBottom: 16 },
  label: { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 8 },
  keyText: { color: theme.colors.text, fontFamily: 'monospace' },
  button: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  secondary: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  secondaryText: { color: theme.colors.text }
});
