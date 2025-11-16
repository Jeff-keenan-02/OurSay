import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import PollsScreen from './src/screens/PollsScreen';
import VerifyPassportScreen from './src/screens/VerifyPassportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';

import DiscussionsScreen from './src/screens/DiscussionsListScreen';
import DiscussionDetailScreen from './src/screens/DiscussionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Discussions (List → Detail)
function DiscussionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DiscussionsList" component={DiscussionsScreen} options={{ title: "Discussions" }} />
      <Stack.Screen name="DiscussionDetail" component={DiscussionDetailScreen} options={{ title: "Thread" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Polls" component={PollsScreen} />
          <Tab.Screen name="Discuss" component={DiscussionStack} />
          <Tab.Screen name="Verify" component={VerifyPassportScreen} />
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Signup" component={SignupScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}