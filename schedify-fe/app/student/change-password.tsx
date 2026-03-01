import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, StatusBar, ScrollView, Image,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';



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

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>
          <Text style={styles.brandBold}>Sc</Text>
          <Text style={styles.brandLight}>hedify</Text>
        </Text>

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

        <TouchableOpacity style={styles.button} onPress={handleUpdate} activeOpacity={0.85}>
          <Text style={styles.buttonTextBold}>Update </Text>
          <Text style={styles.buttonTextBold}>Password</Text>
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
  logo: {
    width: 110,
    height: 110,
    marginBottom: 14,
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