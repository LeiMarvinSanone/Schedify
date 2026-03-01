import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, StatusBar, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

type Role = 'Student' | 'Professor';

const COURSES: Record<string, string[]> = {
  CICT: ['BSIT', 'BSCS', 'BSIS', 'BTVTED'],
  CBME: ['BSA', 'BSAIS', 'BSE', 'BPA'],
};

const DEPARTMENTS = Object.keys(COURSES);
const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    idNo: '',
    department: '',
    course: '',
    block: '',
  });
  const [role, setRole] = useState<Role>('Student');

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const { name, email, password, idNo, department, course, block } = formData;

    if (!name || !email || !password || !idNo || !department || !course || !block) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      Alert.alert('Success', 'Account created! Please login.');
      router.replace('/login' as any);
    } catch {
      Alert.alert('Error', 'Failed. Please try again.');
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
            source={require('../assets/images/logo.png')}
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
          style={styles.input}
          value={formData.name}
          onChangeText={val => update('name', val)}
          placeholder="Enter your name"
          placeholderTextColor="#8a9bb0"
        />

        <Text style={styles.label}>Sorsu Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={val => update('email', val)}
          placeholder="Enter your Sorsu email"
          placeholderTextColor="#8a9bb0"
          keyboardType="email-address"
          autoCapitalize="none"
        />


        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={val => update('password', val)}
          placeholder="Enter your password"
          placeholderTextColor="#8a9bb0"
          secureTextEntry
        />

        <Text style={styles.label}>ID no.</Text>
        <TextInput
          style={styles.input}
          value={formData.idNo}
          onChangeText={val => update('idNo', val)}
          placeholder="Enter your ID number"
          placeholderTextColor="#8a9bb0"
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.pickerWrapper}>
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
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>Course</Text>
            <View style={[styles.pickerWrapper, !formData.department && styles.pickerDisabled]}>
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
          </View>
        </View>

        <Text style={styles.label}>Block</Text>
        <View style={[styles.pickerWrapper, styles.blockPickerWidth]}>
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

        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login' as any)}>
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