import { MD3DarkTheme, configureFonts } from 'react-native-paper';

// 1. Define your Font Config (Optional but recommended for "Pro" look)
// If you haven't linked custom fonts, this falls back to system fonts.
const fontConfig = {
  fontFamily: 'System', // Change this to 'Roboto', 'Inter', or 'Space Grotesk' if installed
};

// 2. Define the "Neo Dark" Palette
export const neoDarkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({config: fontConfig}),
  
  // The "colors" object is where the magic happens
  colors: {
    ...MD3DarkTheme.colors,
    
    // BACKGROUNDS: Don' use pure black (#000000). Use Deep Slate.
    background: '#0F172A', // Very dark blue-grey (Slate 900)
    surface: '#1E293B',    // Slightly lighter for Cards/Modals (Slate 800)
    surfaceVariant: '#334155', // For input fields (Slate 700)
    
    // PRIMARY: The "Neo" accent color (Buttons, Active States)
    primary: '#2DD4BF',    // Electric Teal/Cyan. High contrast against dark.
    onPrimary: '#0F172A',  // Text color on top of primary button (Dark)
    
    // TEXT
    onBackground: '#F8FAFC', // Almost white (Slate 50)
    onSurface: '#E2E8F0',    // Light grey (Slate 200)
    onSurfaceVariant: '#94A3B8', // Muted text (Slate 400) - for placeholders
    
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