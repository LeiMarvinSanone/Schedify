import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Modal } from 'react-native';
import { ICONS } from '../../constants/icons';
import { useTheme } from '../../ThemeContext';
import BottomNav from '../../components/BottomNav';

type PostType = 'class' | 'event' | 'suspension';

type Subject = {
  id: string;
  name: string;
  day: string;
  time: string;
  room: string;
  professor: string;
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
  const [dept, setDept]         = useState('CICT');
  const [course, setCourse]     = useState('BSIT');
  const [year, setYear]         = useState('2nd Year');
  const [block, setBlock]       = useState('2A');
  const [semester, setSemester] = useState('First Semester 2025-2026');
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Programming',     day: 'Monday',    time: '8:00am - 10:00am',  room: 'Lab 1',    professor: '' },
    { id: '2', name: 'Mathematics',     day: 'Tuesday',   time: '1:00pm - 3:00pm',   room: 'Room 201', professor: '' },
    { id: '3', name: 'Networks',        day: 'Wednesday', time: '8:00am - 10:00am',  room: 'Lab 2',    professor: '' },
    { id: '4', name: 'PE',              day: 'Thursday',  time: '3:00pm - 5:00pm',   room: 'Gym',      professor: '' },
    { id: '5', name: 'Web Development', day: 'Friday',    time: '10:00am - 12:00pm', room: 'Lab 3',    professor: '' },
  ]);

  const audienceTag = `${course} ${block}`;

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const addSubject = () => {
    setSubjects(prev => [...prev, { id: String(Date.now()), name: '', day: 'Monday', time: '8:00am - 10:00am', room: '', professor: '' }]);
  };
  const removeSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
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
      <View style={styles.row2}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>DEPARTMENT</Text>
          <Dropdown value={dept} options={DEPARTMENTS} onSelect={v => { setDept(v); setCourse(COURSES[v][0]); }} />
        </View>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>COURSE</Text>
          <Dropdown value={course} options={COURSES[dept] || []} onSelect={setCourse} />
        </View>
      </View>

      <View style={styles.row2}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>YEAR LEVEL</Text>
          <Dropdown value={year} options={YEAR_LEVELS} onSelect={setYear} />
        </View>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>BLOCK / SECTION</Text>
          <Dropdown value={block} options={BLOCKS} onSelect={setBlock} />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.muted }]}>SEMESTER</Text>
      <Dropdown value={semester} options={SEMESTERS} onSelect={setSemester} />
      <View style={{ height: 16 }} />

      <Text style={[styles.label, { color: theme.muted }]}>TARGET AUDIENCE TAG</Text>
      <View style={[styles.tagDisplay, { backgroundColor: tagBg, borderColor: tagBorder }]}>
        <Text style={[styles.tagDisplayText, { color: tagText }]}>{audienceTag}</Text>
      </View>

      <View style={styles.subjectsHeader}>
        <Text style={[styles.label, { color: theme.muted }]}>SUBJECTS & SCHEDULES</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: addBtnBg, borderColor: addBtnBorder }]} onPress={addSubject}>
          <Text style={[styles.addBtnText, { color: addBtnText }]}>{ICONS.actions.add} Add Subject</Text>
        </TouchableOpacity>
      </View>

      {subjects.map((subj, index) => (
        <View key={subj.id} style={[styles.subjectCard, { backgroundColor: subjectCardBg, borderColor: subjectCardBorder }]}>
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
            <View style={{ flex: 1.2 }}>
              <Dropdown value={subj.day.slice(0, 4)} options={DAYS.map(d => d.slice(0, 4))} onSelect={v => updateSubject(subj.id, 'day', v)} />
            </View>
            <View style={{ flex: 1.8, marginHorizontal: 6 }}>
              <TextInput
                style={[styles.roomInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
                value={subj.time} onChangeText={v => updateSubject(subj.id, 'time', v)}
                placeholder="e.g. 8:00am - 10:00am" placeholderTextColor={theme.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.roomInput, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
                value={subj.room} onChangeText={v => updateSubject(subj.id, 'room', v)}
                placeholder="Room" placeholderTextColor={theme.muted}
              />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isDark ? '#0f2a1a' : '#dcfce7', borderColor: isDark ? '#22c55e55' : '#86efac' }]}>
        <Text style={styles.saveBtnIcon}></Text>
        <Text style={[styles.saveBtnText, { color: isDark ? '#4ade80' : '#16a34a' }]}>
          Save & Post Schedule for {audienceTag}
        </Text>
      </TouchableOpacity>
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

  const accentColor = type === 'event' ? '#3b82f6' : '#fc8181';
  const accentBg    = type === 'event'
    ? (isDark ? '#0f1f3a' : '#dbeafe')
    : (isDark ? '#2a0000' : '#fff1f2');
  const formBg      = isDark ? '#14142a' : '#f8faff';
  const formBorder  = isDark ? accentColor + '33' : accentColor + '44';

  const tagOptions = ['All Students', 'BSIT', 'BSCS', 'BSIS', 'BTVTED', 'BSA', 'BSAIS', 'BSE', 'BPA', 'CICT Dept', 'CBME Dept'];

  return (
    <View style={[styles.eventForm, { backgroundColor: formBg, borderColor: formBorder }]}>
      <Text style={[styles.sectionHeader, { color: theme.title }]}>Event Info</Text>

      <Text style={[styles.label, { color: theme.muted }]}>TITLE</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
        value={title} onChangeText={setTitle}
        placeholder={type === 'event' ? 'e.g. Foundation Day Celebration' : 'e.g. No Classes - Bad Weather'}
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
              value={room} onChangeText={setRoom} placeholder="e.g. Gymnasium" placeholderTextColor={theme.muted} />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.muted }]}>BUILDING</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
              value={building} onChangeText={setBuilding} placeholder="e.g. Main Campus" placeholderTextColor={theme.muted} />
          </View>
        </View>
      )}

      <Text style={[styles.label, { color: theme.muted }]}>DATE</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
        value={date} onChangeText={setDate}
        placeholder="YYYY-MM-DD  (e.g. 2026-02-25)" placeholderTextColor={theme.muted} keyboardType="numeric"
      />

      <View style={styles.row2}>
        <View style={styles.col}>
          <Text style={[styles.label, { color: theme.muted }]}>START TIME</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
            value={startTime} onChangeText={setStartTime} placeholder="e.g. 08:00 AM" placeholderTextColor={theme.muted} />
        </View>
        {type === 'event' && (
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.muted }]}>END TIME</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.input, borderColor: theme.divider, color: theme.text }]}
              value={endTime} onChangeText={setEndTime} placeholder="e.g. 05:00 PM" placeholderTextColor={theme.muted} />
          </View>
        )}
      </View>

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

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentBg, borderColor: accentColor + '66' }]}>
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
        keyboardShouldPersistTaps="handled"
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },

  pageTitle: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5, marginBottom: 24 },

  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  typeBtnText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, marginTop: 14 },

  row2: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

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
  subjectRow: { flexDirection: 'row', alignItems: 'center' },
  roomInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13 },

  eventForm: { borderRadius: 14, padding: 16, borderWidth: 1 },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 4 },

  remindersWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  reminderOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  reminderOptionText: { fontSize: 12, fontWeight: '500' },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 16, marginTop: 20, gap: 10, borderWidth: 1 },
  saveBtnIcon: { fontSize: 18 },
  saveBtnText: { fontSize: 14, fontWeight: '700' },

});