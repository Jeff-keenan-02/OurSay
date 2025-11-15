import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // named import ✅
import { NavigationContainer } from '@react-navigation/native';   // named import ✅
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen';                 // default import ✅
import PollsScreen from './src/screens/PollsScreen';
import VerifyPassportScreen from './src/screens/VerifyPassportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Verify" component={VerifyPassportScreen} />
          <Tab.Screen name="Polls" component={PollsScreen} />
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Signup" component={SignupScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}