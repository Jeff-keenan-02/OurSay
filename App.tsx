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
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Signup" component={SignupScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}


// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// // ...existing code...

// const Tab = createBottomTabNavigator();

// function HomeScreen() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// function SettingsScreen() {
//   return (
//     <View style={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.settingsText}>Settings</Text>
//       </View>
//     </View>
//   );
// }

// // ...existing code...

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   settingsText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   }
// });

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <NavigationContainer>
//         <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//         <Tab.Navigator>
//           <Tab.Screen 
//             name="Home" 
//             component={HomeScreen} 
//           />
//           <Tab.Screen 
//             name="Settings" 
//             component={SettingsScreen} 
//           />
//         </Tab.Navigator>
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }

// export default App;