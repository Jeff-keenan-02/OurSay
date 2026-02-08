import React, { useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";

import { AuthProvider } from "./src/context/AuthContext";
import { ThemeModeProvider, useThemeMode } from "./src/context/ThemeModeContext";
import MainNavigator from "./src/navigation/MainNavigator";

/**
 * AppInner handles the logic that requires access to ThemeContext.
 * We separate this from the root App component because a component 
 * cannot consume a context provided by itself.
 */
function AppInner() {
  const { theme } = useThemeMode();

  const navigationTheme: NavigationTheme = useMemo(
    () => ({
      dark: theme.dark,
      colors: {
        ...NavigationDefaultTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border:
          theme.colors.outline ??
          theme.colors.onSurfaceVariant ??
          theme.colors.onSurface,
        notification: theme.colors.error,
      },
      // ✅ REQUIRED by React Navigation
      fonts: NavigationDefaultTheme.fonts,
    }),
    [theme]
  );

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <AuthProvider>
          <MainNavigator/>
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

/**
 * Root App component.
 * We wrap everything in SafeAreaProvider and ThemeModeProvider here 
 * so that all child components (including AppInner) have access to them.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <AppInner />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}