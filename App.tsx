import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";

import { AuthProvider } from "./src/context/AuthContext";
import { ThemeModeProvider, useThemeMode } from "./src/context/ThemeModeContext";
import MainNavigator from "./src/navigation/MainNavigator";



function AppInner() {
  const { theme } = useThemeMode();
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AuthProvider>
          <MainNavigator />
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <AppInner />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}