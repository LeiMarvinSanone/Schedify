import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Modal, Alert, Keyboard } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ICONS } from '../../constants/icons';
import { useTheme } from '../../ThemeContext';
import BottomNav from '../../components/BottomNav';
import { createSchedule, importSchedulesBulk, getCurrentUser } from '../../utils/apiClient';
export {}; // Ensures this file is a module
declare global {
  var schedifyCsvImported: boolean | undefined;
}

function parseSubjectsFromCSV(raw: string): Subject[] {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  // Normalize header (remove spaces, lower case)
  const headers = lines[0].split(',').map(h => h.replace(/\s+/g, '').toLowerCase());
  const col = (name: string, alt?: string) => {
    const idx = headers.indexOf(name);
    if (idx !== -1) return idx;
    if (alt) {
      const altIdx = headers.indexOf(alt);
      if (altIdx !== -1) return altIdx;
    }
    return -1;
  };

  const iName      = col('name');
  const iDay       = col('day');
  const iTime      = col('time', 'timerange');
  const iRoom      = col('room');
  const iBldg      = col('building');
  const iProf      = col('professor');
  const iDept      = col('department');
  const iCourse    = col('course');
  const iYearLevel = col('yearlevel');
  const iBlock     = col('block');
  // tag column is optional
  const iTag       = col('tag');

  if (iName === -1 || iDay === -1 || iTime === -1 || iRoom === -1) {
    throw new Error('CSV header must include: name, day, time/timeRange, room');
  }

  return lines.slice(1).map((line, i) => {
    const cols = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? line.split(',');
    const get = (idx: number) => (idx !== -1 ? (cols[idx] ?? '').replace(/^"|"$/g, '').trim() : '');

    // Validate required fields
    if (!get(iName) || !get(iDay) || !get(iTime) || !get(iRoom)) {
      throw new Error(`Row ${i + 1} is missing required fields.`);
    }
    // Validate time format (24-hour or 12-hour AM/PM)
    const timeRegex = /^(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)(\s*-\s*\d{1,2}:\d{2}(?:\s*[APap][Mm])?)?$/;
    if (!timeRegex.test(get(iTime))) {
      throw new Error(`Row ${i + 1} has invalid time format: ${get(iTime)}. Use HH:MM or HH:MM AM/PM or HH:MM - HH:MM AM/PM.`);
    }

    // Auto-generate tag if not present
    let tag = get(iTag);
    // If professor is present, include in tag for professor-only targeting
    if (!tag && (iCourse !== -1 || iYearLevel !== -1 || iBlock !== -1 || iProf !== -1)) {
      tag = [get(iCourse), get(iYearLevel), get(iBlock), get(iProf)].filter(Boolean).join(' ');
    }

    const rawDay = get(iDay);
    const matchedDay = DAYS.find(d => d.toLowerCase().startsWith(rawDay.toLowerCase().slice(0, 3))) ?? 'Monday';

    return {
      id: `csv-${Date.now()}-${i}`,
      name:      get(iName),
      day:       matchedDay,
      time:      get(iTime),
      room:      get(iRoom),
      building:  get(iBldg),
      professor: get(iProf),
      department: get(iDept),
      course:    get(iCourse),
      yearLevel: get(iYearLevel),
      block:     get(iBlock),
      tag,
    };
  }).filter(s => s.name.length > 0);
}

type PostType = 'class' | 'event' | 'suspension';

type Subject = {
  id: string;
  name: string;
  day: string;
  time: string;
  room: string;
  building: string;
  professor: string;
  department: string;
  course: string;
  yearLevel: string;
  block: string;
  tag: string;
  semester?: string;
    timeType?: 'dropdown' | 'other';
    buildingType?: 'dropdown' | 'other';
    roomType?: 'dropdown' | 'other';
};

const DEPARTMENTS = ['CICT', 'CBME'];
const COURSES: Record<string, string[]> = {
  CICT: ['BSIT', 'BSCS', 'BSIS', 'BTVTED'],
  CBME: ['BSA', 'BSAIS', 'BSE', 'BPA'],
};
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];
const SEMESTERS = ['1st Semester', '2nd Semester', 'Summer'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];


function Dropdown({ value, options, onSelect, placeholder }: {
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <>
      <TouchableOpacity
        style={[dd.trigger, { backgroundColor: theme.input, borderColor: theme.divider }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[dd.triggerText, { color: theme.text }, !value && { color: theme.muted }]}>
          {value || placeholder || 'Select...'}
        </Text>
        <Text style={[dd.arrow, { color: theme.muted }]}>▾</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[dd.menu, { backgroundColor: theme.card, borderColor: theme.divider }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[dd.item, { borderBottomColor: theme.divider }, opt === value && { backgroundColor: theme.input }]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[dd.itemText, { color: theme.subtitle }, opt === value && { color: theme.text, fontWeight: '700' }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const dd = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
  },
  triggerText: { fontSize: 14, flex: 1 },
  arrow: { fontSize: 12, marginLeft: 6 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  menu: {
    position: 'absolute', top: '30%', left: 32, right: 32,
    borderRadius: 12, borderWidth: 1, maxHeight: 280, elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8,
  },
  item: { paddingVertical: 13, paddingHorizontal: 18, borderBottomWidth: 1 },
  itemText: { fontSize: 14 },
});


function ReminderSelector({ accentColor }: { accentColor: string }) {
  const { theme } = useTheme();
  const options = ['1 Day Before', '3 Hours Before', '1 Hour Before', '30 Mins Before', 'At Event Time'];
  const [selected, setSelected] = useState<string[]>(['1 Day Before']);

  const toggle = (opt: string) => {
    setSelected(prev => prev.includes(opt) ? prev.filter(r => r !== opt) : [...prev, opt]);
  };

  return (
    <View style={styles.remindersWrap}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => toggle(opt)}
            style={[
              styles.reminderOption,
              { backgroundColor: theme.input, borderColor: theme.divider },
              active && { backgroundColor: accentColor + '22', borderColor: accentColor + '88' },
            ]}
          >
            <Text style={[styles.reminderOptionText, { color: theme.muted }, active && { color: accentColor }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
function ClassScheduleForm() {
  const { theme, isDark } = useTheme();
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState('');
  const [dept, setDept]         = useState('');
  const [course, setCourse]     = useState('');
  const [year, setYear]         = useState('');
  const [block, setBlock]       = useState('');
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: String(Date.now()),
      name: '',
      day: 'Monday',
      time: '',
      room: '',
      building: '',
      professor: '',
      department: '',
      course: '',
      yearLevel: '',
      block: '',
      tag: '',
    },
  ]);

  const audienceTag = [course, year, block].filter(Boolean).join(' ');

  // CSV Import handler
  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const { uri, name } = result.assets[0];

      // Use new FileSystem API for file reading (Expo SDK v54+)
            // Fetch admin user ID
            const user = await getCurrentUser();
            const adminUserId = user?.id;
      const { File } = FileSystem;
      const file = new File(uri);
      const raw = await file.text();
      const imported = parseSubjectsFromCSV(raw);
      
      // Prepare for backend bulk import
      const schedulesPayload = imported.map(subj => ({
        name: subj.name,
        day: subj.day,
        timeRange: subj.time,
        room: subj.room,
        department: subj.department || dept,
        course: subj.course,
        yearLevel: subj.yearLevel,
        block: subj.block,
        semester: subj.semester,
        tag: subj.tag || audienceTag || 'whole-university',
        createdBy: adminUserId,
        type: "Class Schedules",
      }));

      try {
        const resp = await importSchedulesBulk(schedulesPayload);
        let importMessage = 'CSV import completed.';
        if (resp && resp.message) {
          importMessage = resp.message;
        }
        if (resp && resp.results) {
          const successCount = resp.results.filter((r: any) => r.status === 'success').length;
          const errorCount = resp.results.filter((r: any) => r.status === 'error').length;
          setPostStatus(`Imported: ${successCount} succeeded, ${errorCount} failed.`);
          importMessage += `\nImported: ${successCount} succeeded, ${errorCount} failed.`;
        }
        // Always show confirmation alert
        Alert.alert('Import Result', importMessage);
        // Set global flag for schedules refresh in React Native
        if (typeof global !== 'undefined') {
          global.schedifyCsvImported = true;
        }
      } catch (err: any) {
        Alert.alert('Backend Import Failed', err?.message || 'Could not import schedules.');
      }
    } catch (err: any) {
      Alert.alert('Import failed', err.message ?? 'Could not read the CSV file. Please check the format.');
      console.error('CSV import error:', err);
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const addSubject = () => {
    setSubjects(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        day: 'Monday',
        time: '',
        room: '',
        building: '',
        professor: '',
        department: '',
        course: '',
        yearLevel: '',
        block: '',
        tag: '',
      },
    ]);
  };
  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handlePostClassSchedule = async () => {
    if (isPosting) return;
    setIsPosting(true);
    setPostStatus('Posting class schedule...');

    try {
      if (!dept || !course) {
        Alert.alert('Missing target fields', 'Please select at least department and course before posting.');
        setPostStatus('Please complete department and course.');
        return;
      }

      const timeRegex = /^(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)(\s*-\s*\d{1,2}:\d{2}(?:\s*[APap][Mm])?)?$/;
      const validSubjects = subjects
        .map((s) => ({
          name: s.name.trim(),
          day: s.day,
          timeRange: s.time.trim(),
          room: s.room.trim() || undefined,
        }))
        .filter((s) => s.name);

      if (validSubjects.length === 0) {
        Alert.alert('Missing subject name', 'Please provide at least one subject name before posting.');
        setPostStatus('Please provide at least one subject name.');
        return;
      }

      // Validate time format for all subjects
      for (const subj of validSubjects) {
        if (!timeRegex.test(subj.timeRange)) {
          Alert.alert('Invalid time format', `Subject '${subj.name}' has invalid time: '${subj.timeRange}'. Use HH:MM or HH:MM - HH:MM.`);
          setPostStatus('Invalid time format.');
          setIsPosting(false);
          return;
        }
      }

      await createSchedule({
        type: 'Class Schedules',
        department: dept,
        course: course,
        yearLevel: year,
        block: block,
        semester: semester,
        tag: audienceTag || 'whole-university',
        subjects: validSubjects,
      });

      Alert.alert('Posted', `Class schedule posted with ${validSubjects.length} subject${validSubjects.length > 1 ? 's' : ''}.`);
      setPostStatus(`Posted ${validSubjects.length} subject${validSubjects.length > 1 ? 's' : ''}.`);
      
      // Reset form
      setSubjects([
        {
          id: '1',
          name: '',
          day: 'Monday',
          time: '',
          room: '',
          building: '',
          professor: '',
          department: '',
          course: '',
          yearLevel: '',
          block: '',
          tag: '',
        },
      ]);
      setDept('');
      setCourse('');
      setYear('');
      setBlock('');
      setSemester('');
      
    } catch (error: any) {
      Alert.alert('Post failed', error.message || 'Could not save class schedule. Please try again.');
      console.error('Failed to post class schedule:', error);
      setPostStatus('Post failed. Check console and try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const tagBg     = isDark ? '#1a1a3a' : '#ede9fe';
  const tagBorder = isDark ? '#5b3fd4' : '#c4b5fd';
  const tagText   = isDark ? '#a78bfa' : '#7c3aed';

  const addBtnBg     = isDark ? '#1a3a5c' : '#dbeafe';
  const addBtnBorder = isDark ? '#2d6ea8' : '#93c5fd';
  const addBtnText   = isDark ? '#60a5fa' : '#1d4ed8';

  const subjectCardBg     = isDark ? '#14142a' : '#f8faff';
  const subjectCardBorder = isDark ? '#2d2d4e' : '#e2e8f0';
  const subjectLabelColor = isDark ? '#a78bfa' : '#7c3aed';

  return (
    <>
      {/* Large Import CSV button at the top */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <TouchableOpacity
          style={{
            width: '90%',
            backgroundColor: isDark ? '#1a3a5c' : '#dbeafe',
            borderColor: isDark ? '#2d6ea8' : '#93c5fd',
            borderWidth: 2,
            borderRadius: 16,
            paddingVertical: 18,
            marginTop: 8,
            marginBottom: 8,
            elevation: 2,
          }}
          onPress={handleImportCSV}
        >
          <Text style={{
            color: isDark ? '#60a5fa' : '#1d4ed8',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}>Import CSV (Class Subjects)</Text>
        </TouchableOpacity>
        
      </View>

      <View style={styles.row2}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>DEPARTMENT</Text>
          <Dropdown
            value={dept}
            options={DEPARTMENTS}
            placeholder="Select department"
            onSelect={v => {
              setDept(v);
              setCourse(COURSES[v]?.[0] ?? '');
            }}
          />
        </View>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>COURSE</Text>
          <Dropdown value={course} options={COURSES[dept] || []} placeholder="Select course" onSelect={setCourse} />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>YEAR LEVEL</Text>
          <Dropdown value={year} options={YEAR_LEVELS} placeholder="Select year level" onSelect={setYear} />
        </View>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>BLOCK / SECTION</Text>
          <Dropdown value={block} options={BLOCKS} placeholder="Select block" onSelect={setBlock} />
        </View>
      </View>


      <Text style={[styles.label, { color: theme.muted }]}>SEMESTER</Text>
      <Dropdown value={semester} options={SEMESTERS} placeholder="Select semester" onSelect={setSemester} />
      <View style={{ height: 16 }} />

      <Text style={[styles.label, { color: theme.muted }]}>TARGET AUDIENCE TAG</Text>
      <View style={[styles.tagDisplay, { backgroundColor: tagBg, borderColor: tagBorder }]}>
        <Text style={[styles.tagDisplayText, { color: tagText }]}>{audienceTag}</Text>
      </View>

      <View style={styles.subjectsHeader}>
        <Text style={[styles.label, { color: theme.muted }]}>SUBJECTS & SCHEDULES</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: addBtnBg, borderColor: addBtnBorder }]} onPress={addSubject}>
            <Text style={[styles.addBtnText, { color: addBtnText }]}>{ICONS.actions.add} Add Subject</Text>
          </TouchableOpacity>
        </View>
      </View>

      {subjects.map((subj, index) => (
        <View key={subj.id} style={[styles.subjectCard, { backgroundColor: subjectCardBg, borderColor: subjectCardBorder }]}> 
          {/* Track if 'Other' is selected for building - initialization logic should be handled in addSubject or CSV import, not in render */}
          <View style={styles.subjectCardHeader}>
            <Text style={[styles.subjectLabel, { color: subjectLabelColor }]}>Subject {index + 1}</Text>
            {subjects.length > 1 && (
              <TouchableOpacity onPress={() => removeSubject(subj.id)}>
                <Text style={[styles.deleteBtn, { color: theme.danger }]}>{ICONS.actions.remove} Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.subjectNameInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
            value={subj.name} onChangeText={v => updateSubject(subj.id, 'name', v)}
            placeholder="Subject name" placeholderTextColor={theme.muted}
          />
          <TextInput
            style={[styles.subjectNameInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
            value={subj.professor} onChangeText={v => updateSubject(subj.id, 'professor', v)}
            placeholder="Professor name" placeholderTextColor={theme.muted}
          />
          <View style={styles.subjectRow}>
            <View style={{ flex: 1 }}>
              <Dropdown value={subj.day.slice(0, 4)} options={DAYS.map(d => d.slice(0, 4))} onSelect={v => updateSubject(subj.id, 'day', v)} />
            </View>
          </View>

          <View style={styles.subjectRow}>
            <View style={{ flex: 1 }}>
              <Dropdown
                value={subj.timeType === 'dropdown' ? subj.time : (subj.timeType === 'other' ? 'Other' : '')}
                options={[
                  '7:00 AM - 8:00 AM',
                  '8:00 AM - 10:00 AM',
                  '10:00 AM - 12:00 PM',
                  '1:00 PM - 3:00 PM',
                  '3:00 PM - 5:00 PM',
                  'Other'
                ]}
                onSelect={v => {
                  if (v === 'Other') {
                    updateSubject(subj.id, 'timeType', 'other');
                    updateSubject(subj.id, 'time', '');
                  } else {
                    updateSubject(subj.id, 'timeType', 'dropdown');
                    updateSubject(subj.id, 'time', v);
                  }
                }}
                placeholder="Select time range"
              />
              {subj.timeType === 'other' && (
                <TextInput
                  style={[styles.roomInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text, marginTop: 6 }]}
                  value={subj.time}
                  onChangeText={v => updateSubject(subj.id, 'time', v)}
                  placeholder="Type time range manually"
                  placeholderTextColor={theme.muted}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown
                value={subj.roomType === 'dropdown' ? subj.room : (subj.roomType === 'other' ? 'Other' : '')}
                options={[
                  'Room 1', 'Room 2', 'Room 3', 'Room 4', 'Room 5', 'Room 6', 'Room 7', 'Room 8', 'Room 9', 'Room 10', 'Room 11',
                  'CCB laboratory A', 'CCB laboratory B', 'CCB laboratory C', 'CCB laboratory D',
                  'Other'
                ]}
                onSelect={v => {
                  if (v === 'Other') {
                    updateSubject(subj.id, 'roomType', 'other');
                    updateSubject(subj.id, 'room', '');
                  } else {
                    updateSubject(subj.id, 'roomType', 'dropdown');
                    updateSubject(subj.id, 'room', v);
                  }
                }}
                placeholder="Select room"
              />
              {subj.roomType === 'other' && (
                <TextInput
                  style={[styles.roomInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text, marginTop: 6 }]}
                  value={subj.room}
                  onChangeText={v => updateSubject(subj.id, 'room', v)}
                  placeholder="Type room manually"
                  placeholderTextColor={theme.muted}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Dropdown
                value={subj.buildingType === 'dropdown' ? subj.building : (subj.buildingType === 'other' ? 'Other' : '')}
                options={[
                  "ICT", "CCB", "CCB LABORATORY", "BME", "BTTE",
                  "SOCIAL HALL", "GRANDTAND", "MANGGAHAN", "FIELD",
                  "Other"
                ]}
                onSelect={v => {
                  if (v === 'Other') {
                    updateSubject(subj.id, 'buildingType', 'other');
                    updateSubject(subj.id, 'building', '');
                  } else {
                    updateSubject(subj.id, 'buildingType', 'dropdown');
                    updateSubject(subj.id, 'building', v);
                  }
                }}
                placeholder="Select building"
              />
              {subj.buildingType === 'other' && (
                <TextInput
                  style={[styles.roomInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text, marginTop: 6 }]}
                  value={subj.building}
                  onChangeText={v => updateSubject(subj.id, 'building', v)}
                  placeholder="Type building manually"
                  placeholderTextColor={theme.muted}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              )}
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: isDark ? '#0f2a1a' : '#dcfce7', borderColor: isDark ? '#22c55e55' : '#86efac' }]}
        disabled={isPosting}
        onPress={() => {
          Keyboard.dismiss();
          void handlePostClassSchedule();
        }}
      >
        <Text style={styles.saveBtnIcon}></Text>
        <Text style={[styles.saveBtnText, { color: isDark ? '#4ade80' : '#16a34a' }]}>
          {isPosting ? 'Posting...' : `Save & Post Schedule for ${audienceTag}`}
        </Text>
      </TouchableOpacity>
      {!!postStatus && (
        <Text style={[styles.postStatusText, { color: theme.muted }]}>{postStatus}</Text>
      )}
    </>
  );
}


function EventSuspensionForm({ type }: { type: 'event' | 'suspension' }) {
  const { theme, isDark } = useTheme();
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [room, setRoom]           = useState('');
  const [building, setBuilding]   = useState('');
  const [date, setDate]           = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime]     = useState('');
  const [tag, setTag]             = useState('');
  const [startTimeType, setStartTimeType] = useState<'dropdown' | 'other'>('dropdown');
  const [endTimeType, setEndTimeType] = useState<'dropdown' | 'other'>('dropdown');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const accentColor = type === 'event' ? '#3b82f6' : '#fc8181';
  const accentBg    = type === 'event'
    ? (isDark ? '#0f1f3a' : '#dbeafe')
    : (isDark ? '#2a0000' : '#fff1f2');
  const formBg      = isDark ? '#14142a' : '#f8faff';
  const formBorder  = isDark ? accentColor + '33' : accentColor + '44';

  const tagOptions = ['whole-university', 'BSIT', 'BSCS', 'BSIS', 'BTVTED', 'BSA', 'BSAIS', 'BSE', 'BPA', 'CICT Dept', 'CBME Dept'];

  const handlePost = async () => {
    const safeTitle = title.trim();
    const safeDate = date.trim();
    const safeTag = tag.trim();

    if (!safeTitle || !safeDate) {
      Alert.alert('Missing required fields', 'Please provide at least title and date.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) {
      Alert.alert('Invalid date format', 'Use YYYY-MM-DD format.');
      return;
    }

    // Validate time format
    const timeRegex = /^(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)(\s*-\s*\d{1,2}:\d{2}(?:\s*[APap][Mm])?)?$/;
    let composedTime = '';
    if (type === 'event') {
      composedTime = [startTime.trim(), endTime.trim()].filter(Boolean).join(' - ');
      if (startTime.trim() && !timeRegex.test(startTime.trim())) {
        Alert.alert('Invalid time format', `Start time '${startTime.trim()}' is invalid. Use HH:MM or HH:MM - HH:MM.`);
        return;
      }
      if (endTime.trim() && !timeRegex.test(endTime.trim())) {
        Alert.alert('Invalid time format', `End time '${endTime.trim()}' is invalid. Use HH:MM or HH:MM - HH:MM.`);
        return;
      }
    } else {
      composedTime = startTime.trim();
      if (composedTime && !timeRegex.test(composedTime)) {
        Alert.alert('Invalid time format', `Suspension time '${composedTime}' is invalid. Use HH:MM or HH:MM - HH:MM.`);
        return;
      }
    }

    try {
      await createSchedule({
        type: type === 'event' ? 'Events' : 'Suspension',
        tag: safeTag || 'whole-university',
        subjects: [{
          name: safeTitle,
          day: safeDate,
          timeRange: composedTime || 'TBA',
          room: room.trim() || undefined,
        }],
      });

      Alert.alert('Posted', `${type === 'event' ? 'Event' : 'Suspension'} added to calendar.`);
      
      // Reset form
      setTitle('');
      setDesc('');
      setRoom('');
      setBuilding('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setTag('');
    } catch (error: any) {
      Alert.alert('Post failed', error.message || 'Could not post. Please try again.');
      console.error('Failed to post:', error);
    }
  };

  return (
    <View style={[styles.eventForm, { backgroundColor: formBg, borderColor: formBorder }]}>
      <Text style={[styles.sectionHeader, { color: theme.title }]}>Event Info</Text>

      <Text style={[styles.label, { color: theme.muted }]}>TITLE</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
        value={title} onChangeText={setTitle}
        placeholder={type === 'event' ? 'Enter event title' : 'Enter suspension title'}
        placeholderTextColor={theme.muted}
      />

      <Text style={[styles.label, { color: theme.muted }]}>DESCRIPTION</Text>
      <TextInput
        style={[styles.input, styles.multiline, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
        value={description} onChangeText={setDesc}
        placeholder="Additional details..." placeholderTextColor={theme.muted}
        multiline numberOfLines={3} textAlignVertical="top"
      />

      {type === 'event' && (
        <View style={styles.row2}>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.muted }]}>ROOM</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
              value={room} onChangeText={setRoom} placeholder="Enter venue" placeholderTextColor={theme.muted} />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.muted }]}>BUILDING</Text>
            <Dropdown
              value={building}
              options={["SOCIAL HALL", "GRANDTAND", "MANGGAHAN", "FIELD", "Other"]}
              onSelect={v => {
                if (v === 'Other') {
                  setBuilding('');
                } else {
                  setBuilding(v);
                }
              }}
              placeholder="Select building"
            />
            {building === '' && (
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text, marginTop: 6 }]}
                value={building}
                onChangeText={setBuilding}
                placeholder="Type building manually"
                placeholderTextColor={theme.muted}
                autoCorrect={false}
                autoCapitalize="words"
              />
            )}
          </View>
        </View>
      )}

      <Text style={[styles.label, { color: theme.muted }]}>DATE</Text>
      <TouchableOpacity
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider }]} // removed color from View style
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: date ? theme.text : theme.muted }}>
          {date ? date : 'Select date'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date ? new Date(date) : new Date()}
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const yyyy = selectedDate.getFullYear();
              const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const dd = String(selectedDate.getDate()).padStart(2, '0');
              setDate(`${yyyy}-${mm}-${dd}`);
            }
          }}
        />
      )}

      {type === 'event' && (
        <View style={styles.row2}>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.muted }]}>START TIME</Text>
            <Dropdown
              value={startTimeType === 'dropdown' ? startTime : (startTimeType === 'other' ? 'Other' : '')}
              options={[
                '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 'Other'
              ]}
              onSelect={v => {
                if (v === 'Other') {
                  setStartTimeType('other');
                  setStartTime('');
                } else {
                  setStartTimeType('dropdown');
                  setStartTime(v);
                }
              }}
              placeholder="Select start time"
            />
            {startTimeType === 'other' && (
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text, marginTop: 6 }]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="Type start time manually"
                placeholderTextColor={theme.muted}
                autoCorrect={false}
                autoCapitalize="words"
              />
            )}
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.muted }]}>END TIME</Text>
            <Dropdown
              value={endTimeType === 'dropdown' ? endTime : (endTimeType === 'other' ? 'Other' : '')}
              options={[
                '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 'Other'
              ]}
              onSelect={v => {
                if (v === 'Other') {
                  setEndTimeType('other');
                  setEndTime('');
                } else {
                  setEndTimeType('dropdown');
                  setEndTime(v);
                }
              }}
              placeholder="Select end time"
            />
            {endTimeType === 'other' && (
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text, marginTop: 6 }]}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="Type end time manually"
                placeholderTextColor={theme.muted}
                autoCorrect={false}
                autoCapitalize="words"
              />
            )}
          </View>
        </View>
      )}

      <Text style={[styles.label, { color: theme.muted }]}>AUDIENCE TAG</Text>
      <Dropdown value={tag} options={tagOptions} onSelect={setTag} placeholder="Who sees this?" />
      <View style={{ height: 16 }} />

      {tag !== '' && (
        <View style={[styles.tagDisplay, { backgroundColor: accentBg, borderColor: accentColor + '55' }]}>
          <Text style={[styles.tagDisplayText, { color: accentColor }]}>
            {type === 'event' ? '📢' : '⚠️'} This will be sent to: {tag}
          </Text>
        </View>
      )}

      <Text style={[styles.label, { color: theme.muted }]}>NOTIFICATION REMINDERS</Text>
      <ReminderSelector accentColor={accentColor} />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: accentBg, borderColor: accentColor + '66' }]}
        onPress={() => {
          Keyboard.dismiss();
          void handlePost();
        }}
      >
        <Text style={styles.saveBtnIcon}>{type === 'event' ? ICONS.postTypes.event : ICONS.postTypes.suspension}</Text>
        <Text style={[styles.saveBtnText, { color: accentColor }]}>
          Post {type === 'event' ? 'Event' : 'Suspension Notice'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// main
export default function PostScheduleScreen() {
  const { theme, isDark } = useTheme();
  const [postType, setPostType] = useState<PostType>('class');

  const typeButtons: { id: PostType; label: string; color: string; bg: string }[] = [
    { id: 'class',      label: 'Class Schedules', color: '#4ade80', bg: isDark ? '#0f2a1a' : '#dcfce7' },
    { id: 'event',      label: 'Events',          color: '#3b82f6', bg: isDark ? '#0f1f3a' : '#dbeafe' },
    { id: 'suspension', label: 'Suspension',       color: '#ef4444', bg: isDark ? '#2a0f0f' : '#fee2e2' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        <Text style={[styles.pageTitle, { color: theme.title }]}>Post New Schedule</Text>

        <Text style={[styles.label, { color: theme.muted }]}>TYPE OF POST</Text>
        <View style={styles.typeRow}>
          {typeButtons.map(btn => (
            <TouchableOpacity
              key={btn.id}
              onPress={() => setPostType(btn.id)}
              style={[
                styles.typeBtn,
                { backgroundColor: theme.card, borderColor: theme.divider },
                postType === btn.id && { backgroundColor: btn.bg, borderColor: btn.color + '99' },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.typeBtnText,
                { color: theme.muted },
                postType === btn.id && { color: btn.color, fontWeight: '700' },
              ]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {postType === 'class'
          ? <ClassScheduleForm />
          : <EventSuspensionForm type={postType} />
        }

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNav role="admin" active="post" />
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 120 },

  pageTitle: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5, marginBottom: 24 },

  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  typeBtnText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, marginTop: 14 },

  row2: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  targetingHint: { marginTop: 6, fontSize: 11, lineHeight: 16 },

  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  multiline: { height: 80, paddingTop: 11 },

  tagDisplay: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 4 },
  tagDisplayText: { fontSize: 15, fontWeight: '700' },

  subjectsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  addBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  addBtnText: { fontSize: 12, fontWeight: '700' },

  subjectCard: { borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1 },
  subjectCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subjectLabel: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { fontSize: 11 },
  subjectNameInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, marginBottom: 10 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  roomInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13 },

  eventForm: { borderRadius: 14, padding: 16, borderWidth: 1 },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 4 },

  remindersWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  reminderOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  reminderOptionText: { fontSize: 12, fontWeight: '500' },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 16, marginTop: 20, gap: 10, borderWidth: 1 },
  saveBtnIcon: { fontSize: 18 },
  saveBtnText: { fontSize: 14, fontWeight: '700' },
  postStatusText: { marginTop: 10, fontSize: 12 },

});