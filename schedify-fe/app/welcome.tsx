import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Image,
} from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />

      {/* Title */}
      <Text style={styles.title}>Welcome to{'\n'}Schedify!</Text>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        <Text>Smart reminders for your{'\n'}schedules</Text>
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login' as any)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d3748',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 32,
    marginTop: 32,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e0',
    textAlign: 'center',
    marginBottom: 52,
    lineHeight: 22,
    fontWeight: '300',
  },
  subtitleBold: {
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  button: {
    backgroundColor: '#4a5568',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 8,
  },
  buttonText: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '400',
  },
});