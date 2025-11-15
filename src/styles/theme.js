// Theme configuration for e-Raksha Setu App
export const theme = {
  colors: {
    primary: '#2596be', // Primary blue - trust and reliability
    secondary: '#1e7ba0', // Darker blue variant - depth and security
    accent: '#2E8B57', // Sea green - safety and nature
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    
    // Safety rating colors
    safest: '#2E8B57', // Green for rating 1-2
    moderate: '#FFA500', // Orange for rating 3
    danger: '#2596be', // Primary blue for rating 4
    highest_danger: '#DC3545', // Red for rating 5
    
    // Emergency colors
    emergency: '#DC3545',
    panic: '#8B0000',
    sos: '#FF1744',
    
    // Map colors
    route_safe: '#2E8B57',
    route_caution: '#FFA500',
    route_danger: '#DC3545',
    current_location: '#2596be',
  },
  
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    round: 50,
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 12,
    }
  }
};