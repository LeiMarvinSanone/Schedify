import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, StatusBar, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { login as apiLogin } from '../../utils/apiClient';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
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
      setIsLoading(true);
      await apiLogin(formData.email, formData.password, role);

      if (role === 'admin') {
        router.replace('/admin/dashboard' as any);
      } else {
        router.replace('/student/calendar' as any);
      }
    } catch {
      Alert.alert('Error', 'Login failed. Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />

      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.appName}>
        <Text style={styles.appNameNormal}>Sch</Text>
        <Text style={styles.appNameNormal}>e</Text>
        <Text style={styles.appNameNormal}>dify</Text>
      </Text>

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

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            value={formData.password}
            onChangeText={(val) => handleChange('password', val)}
            placeholder="Enter your password"
            placeholderTextColor="#a0aec0"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeButton}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#cbd5e0" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>


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

      <TouchableOpacity style={styles.button} disabled={isLoading} onPress={handleSubmit} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/student/signup' as any)}>
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
    color: '#68d391',  
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
  passwordContainer: {
    backgroundColor: '#5a6778',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#ffffff',
    padding: 14,
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
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