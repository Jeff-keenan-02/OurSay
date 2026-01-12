import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';


const fontConfig = {
  fontFamily: 'System',
};

// 2. Define the "Neo Dark" Palette
export const neoDarkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({config: fontConfig}),
  
  // The "colors" object is where the magic happens
  colors: {
    ...MD3DarkTheme.colors,
    
    // BACKGROUNDS
    background: '#0F172A', // Very dark blue-grey 
    surface: '#1E293B',    // Slightly lighter
    surfaceVariant: '#334155', // For input fields
    
    // PRIMARY: The "Neo" accent color (Buttons, Active States)
    primary: '#2DD4BF',    //
    onPrimary: '#0F172A', 
    
    // TEXT
    onBackground: '#F8FAFC', // Almost white 
    onSurface: '#E2E8F0',    // Light grey 
    onSurfaceVariant: '#94A3B8', // Muted text
    
    // ALERTS
    error: '#FB7185',      // Soft Neon Red
    
    // BORDERS
    outline: '#475569',    // Subtle borders
    elevation: {
        level1: '#1E293B',
    }
  },
  // Roundness of buttons/cards
  roundness: 12, 
};

export const neoLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: "#f6f7fb",
    surface: "#ffffff",
    primary: "#2563eb",
    secondary: "#059669",
    outline: "#d1d5db",
    onBackground: "#111827",
    onSurface: "#111827",
    error: "#b91c1c",
  },
};