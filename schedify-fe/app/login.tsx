import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, StatusBar, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!role) {
      Alert.alert('Select Role', 'Please select your role.');
      return;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (role === 'admin') {
        router.replace('/admin/dashboard' as any);
      } else {
        router.replace('/student/calendar' as any);
      }
    } catch {
      Alert.alert('Error', 'Navigation failed. Please try again.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />

      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App Name with accent on 'e' */}
      <Text style={styles.appName}>
        <Text style={styles.appNameNormal}>Sch</Text>
        <Text style={styles.appNameNormal}>e</Text>
        <Text style={styles.appNameNormal}>dify</Text>
      </Text>

      {/* Email */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(val) => handleChange('email', val)}
          placeholder="Enter your email"
          placeholderTextColor="#a0aec0"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={formData.password}
          onChangeText={(val) => handleChange('password', val)}
          placeholder="Enter your password"
          placeholderTextColor="#a0aec0"
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Role Dropdown */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Role</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={role}
            onValueChange={(val) => setRole(val)}
            style={styles.picker}
            dropdownIconColor="#a0aec0"
          >
            <Picker.Item label="Select role..." value="" color="#999" />
            <Picker.Item label="Student" value="student" color="#333" />
            <Picker.Item label="Professor" value="professor" color="#333" />
          </Picker>
        </View>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Create account link */}
      <TouchableOpacity onPress={() => router.push('/signup' as any)}>
        <Text style={styles.linkText}>Create an account</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#2d3748',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 14,
  },
  appName: {
    fontSize: 30,
    marginBottom: 32,
  },
  appNameNormal: {
    color: '#ffffff',
    fontWeight: '400',
    letterSpacing: 1,
  },
  appNameAccent: {
    color: '#68d391',  // green accent on 'e' matching prototype
    fontWeight: '400',
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#5a6778',
    color: '#ffffff',
    padding: 14,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#fc8181',
  },
  errorText: {
    color: '#fc8181',
    fontSize: 13,
    marginTop: 4,
  },
  pickerWrapper: {
    backgroundColor: '#5a6778',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    height: 52,
  },
  button: {
    backgroundColor: '#4a5568',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '400',
  },
  linkText: {
    color: '#e2e8f0',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '300',
  },
});

export default Login;