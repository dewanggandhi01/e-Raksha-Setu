import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// WARNING: This uses a demo secret and simple RNG. For production, use secure key storage (SecureStore/Keychain) and real crypto.
const STORAGE_PRIVATE_ENC = 'user_private_key_enc';
const STORAGE_PUBLIC = 'user_public_key';
const DEMO_SECRET = 'eRakshaSetuKey2025';

const hexRandom = (length = 64) => {
  const chars = 'abcdef0123456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
};

export const generateAndStoreKeys = async () => {
  try {
    // Generate a random private key (hex) for demo purposes
    const privateKey = hexRandom(64);

    // Create a simple public key representation (hash of private key)
    const publicKey = 'PK' + CryptoJS.SHA256(privateKey).toString().substring(0, 40).toUpperCase();

    // Encrypt private key with demo secret (not secure for production)
    const encrypted = CryptoJS.AES.encrypt(privateKey, DEMO_SECRET).toString();

    await AsyncStorage.setItem(STORAGE_PRIVATE_ENC, encrypted);
    await AsyncStorage.setItem(STORAGE_PUBLIC, publicKey);

    return { publicKey, encrypted };
  } catch (err) {
    console.error('generateAndStoreKeys error', err);
    throw err;
  }
};

export const ensureKeysExist = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_PUBLIC);
    if (existing) return { publicKey: existing };
    return await generateAndStoreKeys();
  } catch (err) {
    console.error('ensureKeysExist error', err);
    return null;
  }
};

export const getPublicKey = async () => {
  try {
    const pk = await AsyncStorage.getItem(STORAGE_PUBLIC);
    if (pk) return pk;
    const res = await ensureKeysExist();
    return res ? res.publicKey : null;
  } catch (err) {
    return null;
  }
};

export const getPrivateKey = async () => {
  try {
    const enc = await AsyncStorage.getItem(STORAGE_PRIVATE_ENC);
    if (!enc) return null;
    const bytes = CryptoJS.AES.decrypt(enc, DEMO_SECRET);
    const priv = bytes.toString(CryptoJS.enc.Utf8);
    return priv;
  } catch (err) {
    console.error('getPrivateKey error', err);
    return null;
  }
};

export const clearKeys = async () => {
  await AsyncStorage.removeItem(STORAGE_PRIVATE_ENC);
  await AsyncStorage.removeItem(STORAGE_PUBLIC);
};
