import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testConnection, API_CONFIG } from '../config/api';
import { theme } from '../styles/theme';

export default function ServerTestScreen({ navigation }) {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-test on mount
    handleTest();
  }, []);

  const handleTest = async () => {
    setLoading(true);
    console.log('=== SERVER CONNECTION TEST ===');
    console.log('Server URL:', API_CONFIG.BASE_URL);
    
    const result = await testConnection();
    setTestResult(result);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        '✓ Connection Successful!',
        `Server: ${result.data.server}\nMongoDB: ${result.data.mongodb}\n\nYou can now use the app!`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '✗ Connection Failed',
        `Error: ${result.error}\n\nServer URL: ${result.url}\n\nTroubleshooting:\n1. Check if server is running\n2. Verify IP address in api.js\n3. Ensure phone and PC on same WiFi`,
        [{ text: 'Retry', onPress: handleTest }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Server Connection Test</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="server" size={40} color={theme.colors.primary} />
          <Text style={styles.infoTitle}>Testing Connection</Text>
          <Text style={styles.infoUrl}>{API_CONFIG.BASE_URL}</Text>
        </View>

        {testResult && (
          <View style={[
            styles.resultCard,
            testResult.success ? styles.successCard : styles.errorCard
          ]}>
            <Ionicons 
              name={testResult.success ? "checkmark-circle" : "close-circle"} 
              size={50} 
              color={testResult.success ? theme.colors.success : theme.colors.error}
            />
            <Text style={styles.resultTitle}>
              {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
            </Text>

            {testResult.success ? (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Server:</Text>
                  <Text style={styles.detailValue}>{testResult.data.server}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>MongoDB:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: testResult.data.mongodb === 'connected' ? theme.colors.success : theme.colors.error }
                  ]}>
                    {testResult.data.mongodb}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Version:</Text>
                  <Text style={styles.detailValue}>{testResult.data.server}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Your IP:</Text>
                  <Text style={styles.detailValue}>{testResult.data.clientIp}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{testResult.error}</Text>
                <Text style={styles.errorUrl}>URL: {testResult.url}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.testButton}
          onPress={handleTest}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.testButtonText}>
            {loading ? 'Testing...' : 'Test Connection Again'}
          </Text>
        </TouchableOpacity>

        <View style={styles.troubleshootCard}>
          <Text style={styles.troubleshootTitle}>Troubleshooting Tips:</Text>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.info} />
            <Text style={styles.tipText}>Server must be running on your PC</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.info} />
            <Text style={styles.tipText}>Phone and PC on same WiFi network</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.info} />
            <Text style={styles.tipText}>Check IP address in src/config/api.js</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.info} />
            <Text style={styles.tipText}>Port 4001 not blocked by firewall</Text>
          </View>
        </View>

        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Current Configuration:</Text>
          <Text style={styles.configText}>Server URL: {API_CONFIG.BASE_URL}</Text>
          <Text style={styles.configText}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
          <Text style={styles.configText}>Platform: {require('react-native').Platform.OS}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  infoUrl: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  resultCard: {
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  successCard: {
    backgroundColor: `${theme.colors.success}10`,
    borderColor: theme.colors.success,
  },
  errorCard: {
    backgroundColor: `${theme.colors.error}10`,
    borderColor: theme.colors.error,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 15,
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  errorContainer: {
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorUrl: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  troubleshootCard: {
    backgroundColor: `${theme.colors.info}10`,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.info}30`,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  configCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  configText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
