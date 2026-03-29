import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { apiCall, getAuthToken } from '../../utils/apiClient';

const DEPARTMENTS = ['CICT', 'CBME'];
const COURSES: Record<string, string[]> = {
  CICT: ['BSTI', 'BSCS', 'BSIS', 'BTVTED'],
  CBME: ['BSA', 'BSAT', 'BSE', 'BPA'],
};
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];

export default function CompleteProfile() {
  const [idNo, setIdNo] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [block, setBlock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!idNo || !department || !course || !yearLevel || !block) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      await apiCall('/api/auth/complete-profile', 'PUT', {
        idNo,
        department,
        course,
        yearLevel,
        block,
      });
      router.replace('/student/calendar' as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Please fill in your academic information</Text>
      <TextInput
        style={styles.input}
        placeholder="Student ID Number"
        value={idNo}
        onChangeText={setIdNo}
      />
      <Picker selectedValue={department} onValueChange={setDepartment} style={styles.picker}>
        <Picker.Item label="Select Department" value="" />
        {DEPARTMENTS.map(d => <Picker.Item key={d} label={d} value={d} />)}
      </Picker>
      <Picker selectedValue={course} onValueChange={setCourse} style={styles.picker}>
        <Picker.Item label="Select Course" value="" />
        {(COURSES[department] || []).map(c => <Picker.Item key={c} label={c} value={c} />)}
      </Picker>
      <Picker selectedValue={yearLevel} onValueChange={setYearLevel} style={styles.picker}>
        <Picker.Item label="Select Year Level" value="" />
        {YEAR_LEVELS.map(y => <Picker.Item key={y} label={y} value={y} />)}
      </Picker>
      <Picker selectedValue={block} onValueChange={setBlock} style={styles.picker}>
        <Picker.Item label="Select Block" value="" />
        {BLOCKS.map(b => <Picker.Item key={b} label={b} value={b} />)}
      </Picker>
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Complete Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#2d3748', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#cbd5e0', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#5a6778', color: '#ffffff', padding: 14, borderRadius: 8, marginBottom: 16 },
  picker: { backgroundColor: '#5a6778', color: '#ffffff', marginBottom: 16, borderRadius: 8 },
  button: { backgroundColor: '#4a5568', paddingVertical: 14, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#e2e8f0', fontSize: 18, textAlign: 'center' },
});
