// Theme configuration for ICEA Carpool app
// Supports both dark and light modes with centralized color management

export const colors = {
  // Primary brand colors
  primary: {
    main: '#4299e1',
    light: '#63b3ed',
    dark: '#3182ce',
    contrast: '#ffffff',
  },
  
  // Secondary brand colors
  secondary: {
    main: '#38b2ac',
    light: '#4fd1c7',
    dark: '#319795',
    contrast: '#ffffff',
  },
  
  // Success colors
  success: {
    main: '#48bb78',
    light: '#68d391',
    dark: '#38a169',
    contrast: '#ffffff',
  },
  
  // Warning colors
  warning: {
    main: '#ed8936',
    light: '#f6ad55',
    dark: '#dd6b20',
    contrast: '#ffffff',
  },
  
  // Error colors
  error: {
    main: '#fc8181',
    light: '#fed7d7',
    dark: '#e53e3e',
    contrast: '#ffffff',
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
};

// Dark theme configuration
export const darkTheme = {
  // Background colors
  background: {
    primary: "#1b1c1d",    // #1a202c
    secondary: colors.neutral.gray[700],  // #2d3748
    tertiary: colors.neutral.gray[600],   // #4a5568
    modal: colors.neutral.gray[700],      // #2d3748
  },
  
  // Surface colors
  surface: {
    primary: "#1b1c1d",    // #2d3748
    secondary: colors.neutral.gray[600],  // #4a5568
    elevated: "#282a2c",   // #4a5568
  },
  
  // Text colors
  text: {
    primary: colors.neutral.white,        // #ffffff
    secondary: colors.neutral.gray[200],  // #e2e8f0
    tertiary: colors.neutral.gray[400],   // #a0aec0
    disabled: colors.neutral.gray[500],   // #718096
    inverse: colors.neutral.gray[800],    // #1a202c
  },
  
  // Border colors
  border: {
    primary: colors.neutral.gray[600],    // #4a5568
    secondary: colors.neutral.gray[700],  // #2d3748
    active: colors.primary.main,          // #4299e1
  },
  
  // Shadow colors
  shadow: {
    primary: colors.neutral.black,        // #000000
  },
  
  // Status colors
  status: {
    available: colors.success.main,       // #48bb78
    unavailable: colors.error.main,       // #fc8181
    pending: colors.warning.main,         // #ed8936
  },
  
  // Interactive elements
  interactive: {
    button: {
      primary: colors.primary.main,       // #4299e1
      secondary: colors.neutral.gray[600], // #4a5568
      danger: colors.error.main,          // #fc8181
    },
    link: colors.primary.main,            // #4299e1
    active: colors.primary.main,          // #4299e1
  },
};

// Light theme configuration
export const lightTheme = {
  // Background colors
  background: {
    primary: colors.neutral.white,        // #ffffff
    secondary: colors.neutral.gray[50],   // #f7fafc
    tertiary: colors.neutral.gray[100],   // #edf2f7
    modal: colors.neutral.white,          // #ffffff
  },
  
  // Surface colors
  surface: {
    primary: "#f0f4f9",     // #f7fafc
    secondary: colors.neutral.gray[100],  // #edf2f7
    elevated: "#dde3ea",       // #ffffff
  },
  
  // Text colors
  text: {
    primary: colors.neutral.gray[900],    // #171923
    secondary: colors.neutral.gray[700],  // #2d3748
    tertiary: colors.neutral.gray[600],   // #4a5568
    disabled: colors.neutral.gray[400],   // #a0aec0
    inverse: colors.neutral.white,        // #ffffff
  },
  
  // Border colors
  border: {
    primary: colors.neutral.gray[200],    // #e2e8f0
    secondary: colors.neutral.gray[300],  // #cbd5e0
    active: colors.primary.main,          // #4299e1
  },
  
  // Shadow colors
  shadow: {
    primary: colors.neutral.black,        // #000000
  },
  
  // Status colors
  status: {
    available: colors.success.main,       // #48bb78
    unavailable: colors.error.main,       // #fc8181
    pending: colors.warning.main,         // #ed8936
  },
  
  // Interactive elements
  interactive: {
    button: {
      primary: colors.primary.main,       // #4299e1
      secondary: colors.neutral.gray[300], // #cbd5e0
      danger: colors.error.main,          // #fc8181
    },
    link: colors.primary.main,            // #4299e1
    active: colors.primary.main,          // #4299e1
  },
};

// Theme selector function
export const getTheme = (isDark = true) => {
  return isDark ? darkTheme : lightTheme;
};

// Export default theme (dark mode)
export default lightTheme;
