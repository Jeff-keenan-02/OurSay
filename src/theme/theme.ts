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
  },
  // Roundness of buttons/cards
  roundness: 12, 
};

export const neoLightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),

  colors: {
    ...MD3LightTheme.colors,

    // BACKGROUNDS
    background: "#F8FAFC",        // Soft off-white (not pure white)
    surface: "#FFFFFF",           // Cards
    surfaceVariant: "#E5E7EB",    // Inputs, subtle containers

    // PRIMARY (same brand accent as dark mode)
    primary: "#2DD4BF",           // Consistent civic teal
    onPrimary: "#042F2E",

    // SECONDARY (supporting accent)
    secondary: "#38BDF8",
    onSecondary: "#0C4A6E",

    // TEXT
    onBackground: "#0F172A",      // Deep blue-grey (not black)
    onSurface: "#1E293B",
    onSurfaceVariant: "#475569",  // Muted metadata

    // STATES
    error: "#DC2626",
    success: "#16A34A",

    // BORDERS / DIVIDERS
    outline: "#CBD5E1",


  },

  roundness: 12,
};