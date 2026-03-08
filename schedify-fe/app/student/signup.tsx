import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, StatusBar, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { signup as apiSignup } from '../../utils/apiClient';

type Role = 'Student' | 'Professor';

const COURSES: Record<string, string[]> = {
  CICT: ['BSIT', 'BSCS', 'BSIS', 'BTVTED'],
  CBME: ['BSA', 'BSAIS', 'BSE', 'BPA'],
};

const DEPARTMENTS = Object.keys(COURSES);
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    idNo: '',
    department: '',
    course: '',
    yearLevel: '',
    block: '',
  });
  const [role, setRole] = useState<Role>('Student');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const { name, email, password, idNo, department, course, yearLevel, block } = formData;
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    if (!password.trim()) nextErrors.password = 'Password is required';
    if (!idNo.trim()) nextErrors.idNo = 'ID number is required';
    if (!department.trim()) nextErrors.department = 'Department is required';
    if (!course.trim()) nextErrors.course = 'Course is required';
    if (!yearLevel.trim()) nextErrors.yearLevel = 'Year level is required';
    if (!block.trim()) nextErrors.block = 'Block is required';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      Alert.alert('Missing Fields', 'Please complete all required fields.');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(true);
      await apiSignup({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        idNo: idNo.trim(),
        department: department.trim(),
        course: course.trim(),
        yearLevel: yearLevel.trim(),
        block: block.trim(),
        role,
      });
      setErrors({});
      Alert.alert('Success', 'Account created!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/student/profile' as any),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      const lower = message.toLowerCase();

      if (lower.includes('email already exists')) {
        setErrors({ email: 'Email already exists' });
        Alert.alert('Signup failed', 'Email already exists. Please use a different email.');
      } else if (lower.includes('id number already exists')) {
        setErrors({ idNo: 'ID number already exists' });
        Alert.alert('Signup failed', 'ID number already exists. Please check your ID number.');
      } else {
        Alert.alert('Signup failed', message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        
        <View style={styles.header}>
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
        </View>

        
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, !!errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={val => update('name', val)}
          placeholder="Enter your name"
          placeholderTextColor="#8a9bb0"
        />
        {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Sorsu Email</Text>
        <TextInput
          style={[styles.input, !!errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={val => update('email', val)}
          placeholder="Enter your Sorsu email"
          placeholderTextColor="#8a9bb0"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}


        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordContainer, !!errors.password && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            value={formData.password}
            onChangeText={val => update('password', val)}
            placeholder="Enter your password"
            placeholderTextColor="#8a9bb0"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeButton}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#cbd5e0" />
          </TouchableOpacity>
        </View>
        {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Text style={styles.label}>ID no.</Text>
        <TextInput
          style={[styles.input, !!errors.idNo && styles.inputError]}
          value={formData.idNo}
          onChangeText={val => update('idNo', val)}
          placeholder="Enter your ID number"
          placeholderTextColor="#8a9bb0"
          keyboardType="numeric"
        />
        {!!errors.idNo && <Text style={styles.errorText}>{errors.idNo}</Text>}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Department</Text>
            <View style={[styles.pickerWrapper, !!errors.department && styles.inputError]}>
              <Picker
                selectedValue={formData.department}
                onValueChange={val => {
                  update('department', val);
                  update('course', ''); 
                }}
                style={styles.picker}
                dropdownIconColor="#8a9bb0"
              >
                <Picker.Item label="Select Department" value="" color="#999" />
                {DEPARTMENTS.map(d => (
                  <Picker.Item key={d} label={d} value={d} color="#333" />
                ))}
              </Picker>
            </View>
            {!!errors.department && <Text style={styles.errorText}>{errors.department}</Text>}
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>Course</Text>
            <View style={[styles.pickerWrapper, !formData.department && styles.pickerDisabled, !!errors.course && styles.inputError]}>
              <Picker
                selectedValue={formData.course}
                onValueChange={val => update('course', val)}
                style={styles.picker}
                dropdownIconColor="#8a9bb0"
                enabled={!!formData.department}
              >
                <Picker.Item label="Select Course" value="" color="#999" />
                {(COURSES[formData.department] || []).map(c => (
                  <Picker.Item key={c} label={c} value={c} color="#333" />
                ))}
              </Picker>
            </View>
            {!!errors.course && <Text style={styles.errorText}>{errors.course}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Year Level</Text>
            <View style={[styles.pickerWrapper, !!errors.yearLevel && styles.inputError]}>
              <Picker
                selectedValue={formData.yearLevel}
                onValueChange={val => update('yearLevel', val)}
                style={styles.picker}
                dropdownIconColor="#8a9bb0"
              >
                <Picker.Item label="Select Year Level" value="" color="#999" />
                {YEAR_LEVELS.map(y => (
                  <Picker.Item key={y} label={y} value={y} color="#333" />
                ))}
              </Picker>
            </View>
            {!!errors.yearLevel && <Text style={styles.errorText}>{errors.yearLevel}</Text>}
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>Block</Text>
            <View style={[styles.pickerWrapper, !!errors.block && styles.inputError]}>
              <Picker
                selectedValue={formData.block}
                onValueChange={val => update('block', val)}
                style={styles.picker}
                dropdownIconColor="#8a9bb0"
              >
                <Picker.Item label="Select Block" value="" color="#999" />
                {BLOCKS.map(b => (
                  <Picker.Item key={b} label={b} value={b} color="#333" />
                ))}
              </Picker>
            </View>
            {!!errors.block && <Text style={styles.errorText}>{errors.block}</Text>}
          </View>
        </View>

        <View style={styles.roleRow}>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>Role</Text>
          </View>
          {(['Student', 'Professor'] as Role[]).map(r => (
            <TouchableOpacity
              key={r}
              style={styles.roleOption}
              onPress={() => setRole(r)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, role === r && styles.radioOuterActive]}>
                {role === r && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Sign up'}</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/student/login' as any)}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2d3748',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  logo: {
    width: 42,
    height: 42,
  },
  appName: {
    fontSize: 26,
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
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#5a6778',
    color: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordContainer: {
    backgroundColor: '#5a6778',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
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
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  half: {
    flex: 1,
  },
  pickerWrapper: {
    backgroundColor: '#5a6778',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  blockPickerWidth: {
    width: '52%',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    height: 52,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 20,
  },
  roleTag: {
    backgroundColor: '#4a5568',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  roleTagText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#a0aec0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#68d391',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#68d391',
  },
  roleText: {
    color: '#a0aec0',
    fontSize: 14,
  },
  roleTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4a5568',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
  },
  buttonText: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '400',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  loginText: {
    color: '#a0aec0',
    fontSize: 14,
  },
  linkText: {
    color: '#68d391',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default SignUp;