import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, StatusBar, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

// Full Schedify Shield Logo (larger, colored)
const ShieldLogo = () => (
  <Svg width="90" height="90" viewBox="0 0 42 42" fill="none">
    <Path
      d="M21 2L4 9v11c0 10.5 7.3 20.3 17 23 9.7-2.7 17-12.5 17-23V9L21 2z"
      fill="#3a5a3a"
      stroke="#4a9d5f"
      strokeWidth="1.5"
    />
    {/* Open book */}
    <Path d="M13 13h7v14h-7z" fill="none" stroke="#a0d080" strokeWidth="1.2" strokeLinejoin="round" />
    <Path d="M20 13h7v14h-7z" fill="none" stroke="#a0d080" strokeWidth="1.2" strokeLinejoin="round" />
    <Path d="M20 13v14" stroke="#a0d080" strokeWidth="1.2" />
    {/* Pen/quill on top */}
    <Path d="M24 10l4 4-6 6-2-2 4-8z" fill="#a0d080" stroke="#a0d080" strokeWidth="0.5" />
    <Path d="M16 27c2-1 4.5-1 7 0s4.5 1 7 0" stroke="#a0d080" strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

// Back arrow icon
const BackIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    Alert.alert('Success', 'Password updated successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const fields = [
    { label: 'Current Password', key: 'currentPassword', placeholder: '' },
    { label: 'New Password', key: 'newPassword', placeholder: '' },
    { label: 'Confirm Password', key: 'confirmPassword', placeholder: '' },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <ShieldLogo />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandName}>
          <Text style={styles.brandBold}>Sc</Text>
          <Text style={styles.brandLight}>hedify</Text>
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {fields.map(field => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                value={formData[field.key as keyof typeof formData]}
                onChangeText={val => handleChange(field.key, val)}
                placeholder={field.placeholder}
                placeholderTextColor="#8a9bb0"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          ))}
        </View>

        {/* Update Button */}
        <TouchableOpacity style={styles.button} onPress={handleUpdate} activeOpacity={0.85}>
          <Text style={styles.buttonTextBold}>Update </Text>
          <Text style={styles.buttonTextLight}>Password</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2d3748',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 12,
  },
  logoContainer: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 30,
    marginBottom: 36,
    letterSpacing: 0.5,
  },
  brandBold: {
    color: '#ffffff',
    fontWeight: '700',
  },
  brandLight: {
    color: '#ffffff',
    fontWeight: '300',
  },
  form: {
    width: '100%',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#4a5f78',
    color: '#ffffff',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#4a5568',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonTextBold: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextLight: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '300',
  },
});