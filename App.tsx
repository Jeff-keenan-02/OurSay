// App.tsx
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
// ADDED: The required Navigation Container
import { NavigationContainer } from "@react-navigation/native"; 
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import MainNavigator from "./src/navigation/MainNavigator";
import { neoDarkTheme } from "./src/theme/theme"; 
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={neoDarkTheme}>
        {/* THIS IS THE ONLY NavigationContainer in the entire project! */}
        <NavigationContainer > 
            <AuthProvider>
              <MainNavigator />
            </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}