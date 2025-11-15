import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@e_raksha_setu_auth';
const USER_KEY = '@e_raksha_setu_user';

/**
 * Authentication Service
 * Manages user authentication state and session
 */

export const authService = {
  /**
   * Save authentication session
   * @param {Object} userData - User data including address, name, etc.
   */
  saveSession: async (userData) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
      }));
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      console.log('✓ Session saved');
      return { success: true };
    } catch (error) {
      console.error('Failed to save session:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get current authentication session
   */
  getSession: async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_KEY);
      if (authData) {
        return { success: true, session: JSON.parse(authData) };
      }
      return { success: false, session: null };
    } catch (error) {
      console.error('Failed to get session:', error);
      return { success: false, session: null };
    }
  },

  /**
   * Get current user data
   */
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (userData) {
        return { success: true, user: JSON.parse(userData) };
      }
      return { success: false, user: null };
    } catch (error) {
      console.error('Failed to get user:', error);
      return { success: false, user: null };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_KEY);
      if (authData) {
        const session = JSON.parse(authData);
        return session.isAuthenticated === true;
      }
      return false;
    } catch (error) {
      console.error('Failed to check authentication:', error);
      return false;
    }
  },

  /**
   * Logout user - clear all session data
   */
  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('✓ Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to logout:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user data in session
   * @param {Object} userData - Updated user data
   */
  updateUserData: async (userData) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      console.log('✓ User data updated');
      return { success: true };
    } catch (error) {
      console.error('Failed to update user data:', error);
      return { success: false, error: error.message };
    }
  },
};

export default authService;
