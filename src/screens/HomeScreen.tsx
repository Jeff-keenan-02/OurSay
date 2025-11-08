// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// export default function HomeScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Home</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   text: { fontSize: 24 }
// });
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen() {
const navigation: any = useNavigation(); // ✅ Get navigation without props
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to OurSay</Text>
      <Text style={styles.subtitle}>Verified Civic Engagement Platform</Text>
{/* 
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Verify')}
      >
        <Text style={styles.buttonText}>Verify Your Identity</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#3949ab',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#3949ab',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#1a237e',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});