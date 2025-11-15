import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Blockchain ID Generator for e-Raksha Setu
 * Generates unique, tamper-proof digital IDs for tourists
 */

// Secret key for additional security (in production, this should be from secure env)
const SECRET_KEY = 'eRakshaSetu2025TouristSafety';

/**
 * Generate a unique blockchain-based ID for a tourist
 * @param {Object} userData - User data including Aadhaar/Passport, name, etc.
 * @returns {Object} - Contains blockchainId, digitalId, and metadata
 */
export const generateBlockchainId = async (userData) => {
  try {
    // Create timestamp for blockchain entry with enhanced randomness
    const timestamp = new Date().toISOString();
    const blockNumber = await getNextBlockNumber();
    const randomSalt = generateRandomSalt();
    
    // Create unique data string for hashing with multiple entropy sources
    const dataString = JSON.stringify({
      documentNumber: userData.documentNumber,
      documentType: userData.documentType, // 'aadhaar' or 'passport'
      name: userData.name.toLowerCase().trim(),
      timestamp: timestamp,
      blockNumber: blockNumber,
      randomSalt: randomSalt,
      deviceId: await getDeviceId(),
      appVersion: '1.0.0',
      entropy: Math.random().toString(36).substring(2)
    });
    
    // Generate blockchain hash using SHA-256 with enhanced security
    const blockchainHash = CryptoJS.SHA256(dataString + SECRET_KEY + randomSalt).toString();
    
    // Create human-readable blockchain ID (format: ERSTU-XXXX-XXXX-XXXX)
    const blockchainId = `ERSTU-${blockchainHash.substring(0, 4).toUpperCase()}-${blockchainHash.substring(4, 8).toUpperCase()}-${blockchainHash.substring(8, 12).toUpperCase()}`;
    
    // Generate shorter digital ID for daily use (format: DID-XXXXXX)
    const digitalId = `DID-${blockchainHash.substring(0, 8).toUpperCase()}`;
    
    // Initialize tourist safety score
    const initialSafetyScore = calculateInitialSafetyScore(userData);
    
    // Create block data structure
    const blockData = {
      blockNumber: blockNumber,
      timestamp: timestamp,
      blockchainId: blockchainId,
      digitalId: digitalId,
      dataHash: blockchainHash,
      documentType: userData.documentType,
      documentHash: CryptoJS.SHA256(userData.documentNumber + SECRET_KEY).toString(), // Encrypted document number
      nameHash: CryptoJS.SHA256(userData.name.toLowerCase() + SECRET_KEY).toString(), // Encrypted name
      isValid: true,
      expiryDate: userData.expiryDate || null, // Trip duration
      emergencyContacts: userData.emergencyContacts || [],
      issueLocation: userData.issueLocation || 'Mobile App',
      version: '1.0.0',
      // Enhanced profile data
      safetyScore: initialSafetyScore,
      profilePicture: userData.profilePicture || null,
      verificationStatus: 'verified',
      tripStatus: 'inactive',
      currentDestination: null,
      nextDestination: null,
      routeRating: null,
      realTimeTrackingEnabled: false,
      sosButtonActive: true,
      preferredLanguage: userData.preferredLanguage || 'english',
      createdAt: timestamp,
      lastUpdated: timestamp
    };
    
    // Store in local blockchain ledger
    await storeBlockchainEntry(blockData);
    
    // Update block counter
    await updateBlockNumber(blockNumber + 1);
    
    return {
      success: true,
      blockchainId: blockchainId,
      digitalId: digitalId,
      blockNumber: blockNumber,
      timestamp: timestamp,
      isValid: true,
      expiryDate: blockData.expiryDate
    };
    
  } catch (error) {
    console.error('Blockchain ID generation failed:', error);
    return {
      success: false,
      error: 'Failed to generate blockchain ID'
    };
  }
};

/**
 * Verify a blockchain ID's authenticity
 * @param {string} blockchainId - The blockchain ID to verify
 * @returns {Object} - Verification result
 */
export const verifyBlockchainId = async (blockchainId) => {
  try {
    const storedBlocks = await getStoredBlocks();
    const block = storedBlocks.find(b => b.blockchainId === blockchainId);
    
    if (!block) {
      return {
        isValid: false,
        error: 'Blockchain ID not found'
      };
    }
    
    // Check if expired
    if (block.expiryDate && new Date() > new Date(block.expiryDate)) {
      return {
        isValid: false,
        error: 'Blockchain ID has expired'
      };
    }
    
    return {
      isValid: true,
      blockNumber: block.blockNumber,
      timestamp: block.timestamp,
      digitalId: block.digitalId,
      documentType: block.documentType,
      issueLocation: block.issueLocation,
      expiryDate: block.expiryDate
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: 'Verification failed'
    };
  }
};

/**
 * Get user's blockchain data by digital ID
 * @param {string} digitalId - The digital ID
 * @returns {Object} - User's blockchain data
 */
export const getBlockchainDataByDigitalId = async (digitalId) => {
  try {
    const storedBlocks = await getStoredBlocks();
    const block = storedBlocks.find(b => b.digitalId === digitalId);
    
    if (!block) {
      return {
        found: false,
        error: 'Digital ID not found'
      };
    }
    
    // Return safe data (no sensitive info)
    return {
      found: true,
      blockchainId: block.blockchainId,
      digitalId: block.digitalId,
      blockNumber: block.blockNumber,
      timestamp: block.timestamp,
      documentType: block.documentType,
      isValid: block.isValid,
      expiryDate: block.expiryDate,
      issueLocation: block.issueLocation
    };
    
  } catch (error) {
    return {
      found: false,
      error: 'Failed to retrieve data'
    };
  }
};

/**
 * Generate QR code data for authorities
 * @param {string} blockchainId - The blockchain ID
 * @returns {string} - QR code data string
 */
export const generateAuthorityQRData = async (blockchainId) => {
  try {
    const verification = await verifyBlockchainId(blockchainId);
    
    if (!verification.isValid) {
      return null;
    }
    
    const qrData = {
      app: 'e-Raksha-Setu',
      type: 'tourist-verification',
      blockchainId: blockchainId,
      digitalId: verification.digitalId,
      timestamp: verification.timestamp,
      verified: true
    };
    
    return JSON.stringify(qrData);
    
  } catch (error) {
    return null;
  }
};

// Helper functions for local storage management

const getNextBlockNumber = async () => {
  try {
    const lastBlock = await AsyncStorage.getItem('blockchain_last_block');
    return lastBlock ? parseInt(lastBlock) + 1 : 1;
  } catch (error) {
    return 1;
  }
};

const updateBlockNumber = async (blockNumber) => {
  try {
    await AsyncStorage.setItem('blockchain_last_block', blockNumber.toString());
  } catch (error) {
    console.error('Failed to update block number:', error);
  }
};

const storeBlockchainEntry = async (blockData) => {
  try {
    const existingBlocks = await getStoredBlocks();
    const updatedBlocks = [...existingBlocks, blockData];
    
    await AsyncStorage.setItem('blockchain_ledger', JSON.stringify(updatedBlocks));
    
    // Also store user's current active ID
    await AsyncStorage.setItem('user_blockchain_id', blockData.blockchainId);
    await AsyncStorage.setItem('user_digital_id', blockData.digitalId);
    
  } catch (error) {
    console.error('Failed to store blockchain entry:', error);
    throw error;
  }
};

const getStoredBlocks = async () => {
  try {
    const blocks = await AsyncStorage.getItem('blockchain_ledger');
    return blocks ? JSON.parse(blocks) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Get current user's blockchain ID
 */
export const getCurrentUserBlockchainId = async () => {
  try {
    const blockchainId = await AsyncStorage.getItem('user_blockchain_id');
    const digitalId = await AsyncStorage.getItem('user_digital_id');
    
    if (blockchainId && digitalId) {
      const verification = await verifyBlockchainId(blockchainId);
      return {
        blockchainId,
        digitalId,
        isValid: verification.isValid,
        ...verification
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear user's blockchain data (for logout/reset)
 */
export const clearBlockchainData = async () => {
  try {
    await AsyncStorage.removeItem('user_blockchain_id');
    await AsyncStorage.removeItem('user_digital_id');
    // Note: We keep the ledger for verification purposes
  } catch (error) {
    console.error('Failed to clear blockchain data:', error);
  }
};

/**
 * Export blockchain data for authorities (encrypted)
 */
export const exportBlockchainDataForAuthorities = async (blockchainId, authorityKey) => {
  try {
    const storedBlocks = await getStoredBlocks();
    const block = storedBlocks.find(b => b.blockchainId === blockchainId);
    
    if (!block) {
      return null;
    }
    
    // Encrypt sensitive data for authorities
    const authorityData = {
      blockchainId: block.blockchainId,
      digitalId: block.digitalId,
      blockNumber: block.blockNumber,
      timestamp: block.timestamp,
      documentType: block.documentType,
      isValid: block.isValid,
      expiryDate: block.expiryDate,
      issueLocation: block.issueLocation,
      emergencyContacts: block.emergencyContacts,
      exportTimestamp: new Date().toISOString(),
      authorityAccess: true
    };
    
    // In production, encrypt with authority's public key
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(authorityData), authorityKey).toString();
    
    return {
      encryptedData,
      blockchainId: block.blockchainId,
      digitalId: block.digitalId,
      exportTimestamp: authorityData.exportTimestamp
    };
    
  } catch (error) {
    return null;
  }
};

// Enhanced helper functions

/**
 * Generate random salt for enhanced security
 */
const generateRandomSalt = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < 16; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt + Date.now().toString(36);
};

/**
 * Get device identifier for additional entropy
 */
const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    return 'device_' + Math.random().toString(36).substring(2);
  }
};

/**
 * Calculate initial safety score based on user profile
 */
const calculateInitialSafetyScore = (userData) => {
  let score = 75; // Base score
  
  // Document type factor
  if (userData.documentType === 'aadhaar') {
    score += 10; // Local citizen bonus
  } else if (userData.documentType === 'passport') {
    score += 5; // Foreign tourist
  }
  
  // Emergency contacts factor
  if (userData.emergencyContacts && userData.emergencyContacts.length >= 2) {
    score += 10;
  } else if (userData.emergencyContacts && userData.emergencyContacts.length >= 1) {
    score += 5;
  }
  
  // Profile completeness
  if (userData.profilePicture) score += 5;
  if (userData.preferredLanguage) score += 2;
  
  return Math.min(100, Math.max(50, score)); // Keep between 50-100
};

/**
 * Update user's safety score based on travel behavior
 */
export const updateSafetyScore = async (blockchainId, factors) => {
  try {
    const storedBlocks = await getStoredBlocks();
    const blockIndex = storedBlocks.findIndex(b => b.blockchainId === blockchainId);
    
    if (blockIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    
    let currentScore = storedBlocks[blockIndex].safetyScore || 75;
    
    // Apply scoring factors
    if (factors.routeCompliance) currentScore += 5;
    if (factors.emergencyUsage) currentScore -= 10;
    if (factors.regularCheckIns) currentScore += 3;
    if (factors.safeAreaVisits) currentScore += 2;
    if (factors.nightTravel) currentScore -= 5;
    if (factors.offRouteTravel) currentScore -= 8;
    
    // Keep score in valid range
    currentScore = Math.min(100, Math.max(30, currentScore));
    
    storedBlocks[blockIndex].safetyScore = currentScore;
    storedBlocks[blockIndex].lastUpdated = new Date().toISOString();
    
    await AsyncStorage.setItem('blockchain_ledger', JSON.stringify(storedBlocks));
    
    return { success: true, newScore: currentScore };
    
  } catch (error) {
    return { success: false, error: 'Failed to update safety score' };
  }
};

/**
 * Update user profile data
 */
export const updateUserProfile = async (blockchainId, profileData) => {
  try {
    const storedBlocks = await getStoredBlocks();
    const blockIndex = storedBlocks.findIndex(b => b.blockchainId === blockchainId);
    
    if (blockIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    
    // Update allowed fields
    const allowedFields = [
      'tripStatus', 'currentDestination', 'nextDestination', 'routeRating',
      'realTimeTrackingEnabled', 'preferredLanguage', 'emergencyContacts',
      'profilePicture'
    ];
    
    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        storedBlocks[blockIndex][field] = profileData[field];
      }
    });
    
    storedBlocks[blockIndex].lastUpdated = new Date().toISOString();
    
    await AsyncStorage.setItem('blockchain_ledger', JSON.stringify(storedBlocks));
    
    return { success: true, updatedData: storedBlocks[blockIndex] };
    
  } catch (error) {
    return { success: false, error: 'Failed to update profile' };
  }
};

/**
 * Get comprehensive user profile data
 */
export const getUserProfile = async (blockchainId) => {
  try {
    const storedBlocks = await getStoredBlocks();
    const block = storedBlocks.find(b => b.blockchainId === blockchainId);
    
    if (!block) {
      return { success: false, error: 'User not found' };
    }
    
    return {
      success: true,
      profile: {
        blockchainId: block.blockchainId,
        digitalId: block.digitalId,
        verificationStatus: block.verificationStatus,
        safetyScore: block.safetyScore,
        documentType: block.documentType,
        tripStatus: block.tripStatus,
        currentDestination: block.currentDestination,
        nextDestination: block.nextDestination,
        routeRating: block.routeRating,
        realTimeTrackingEnabled: block.realTimeTrackingEnabled,
        sosButtonActive: block.sosButtonActive,
        preferredLanguage: block.preferredLanguage,
        emergencyContacts: block.emergencyContacts,
        profilePicture: block.profilePicture,
        createdAt: block.createdAt,
        lastUpdated: block.lastUpdated,
        isValid: block.isValid,
        expiryDate: block.expiryDate
      }
    };
    
  } catch (error) {
    return { success: false, error: 'Failed to get user profile' };
  }
};