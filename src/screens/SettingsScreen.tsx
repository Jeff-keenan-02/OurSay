import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy & Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 20,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#dce1e6',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});