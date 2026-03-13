import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, LayoutAnimation,
  Platform, UIManager, Alert, Modal, TextInput,
} from 'react-native';
import { ICONS } from '../../constants/icons';
import { useTheme } from '../../ThemeContext';
import BottomNav from '../../components/BottomNav';
import { useFocusEffect } from '@react-navigation/native';
import { getSchedules, deleteSchedule, updateSchedule } from '../../utils/apiClient';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type PostType = 'class' | 'event' | 'suspension';

const DEPARTMENTS = ['CICT', 'CBME'];
const COURSES: Record<string, string[]> = {
  CICT: ['BSIT', 'BSCS', 'BSIS', 'BTVTED'],
  CBME: ['BSA', 'BSAIS', 'BSE', 'BPA'],
};
const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];

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

interface ScheduleItem {
  id: string;
  scheduleId: string;
  subjectIndex: number;
  scheduleType: 'Class Schedules' | 'Events' | 'Suspension';
  title: string;
  tag: string;
  date?: string; // for display
  rawDate?: string; // for editing
  time?: string;
  room?: string;
  building?: string;
  organization?: string;
  description?: string;
  course?: string;
  block?: string;
  yearLevel?: string;
}

const DATA: Record<PostType, { label: string; color: string; textColor: string; items: ScheduleItem[] }> = {
  class: {
    label: 'Class Schedules',
    color: '#4ade80',
    textColor: '#0f172a',
    items: [],
  },
  suspension: {
    label: 'Suspensions',
    color: '#ef4444',
    textColor: '#ffffff',
    items: [],
  },
  event: {
    label: 'Events',
    color: '#3b82f6',
    textColor: '#ffffff',
    items: [],
  },
};


function AccordionSection({ type, items, onDelete, onEdit }: { type: PostType; items: ScheduleItem[]; onDelete?: (id: string) => void; onEdit?: (item: ScheduleItem) => void }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { label, color, textColor } = DATA[type];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: open ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setOpen(o => !o);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });


  const bodyBg   = theme.card;
  const itemBg   = theme.bg;
  const metaColor = theme.subtitle;
  const descColor = theme.muted;

  const confirmDelete = (title: string, id: string) => {
    const message = `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`;

    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis.confirm === 'function' ? globalThis.confirm(message) : true;
      if (confirmed && onDelete) onDelete(id);
      return;
    }

    Alert.alert(
      'Delete Schedule',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            if (onDelete) onDelete(id);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={acc.wrapper}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.85}
        style={[acc.header, { backgroundColor: color }]}>
        <Text style={[acc.headerText, { color: textColor }]}>{label}</Text>
        <Animated.Text style={[acc.chevron, { color: textColor, transform: [{ rotate }] }]}>
          ⌄
        </Animated.Text>
      </TouchableOpacity>

      {open && (
        <View style={[acc.body, { backgroundColor: bodyBg, borderColor: color + '55' }]}>
          {items.length === 0 ? (
            <Text style={[acc.emptyText, { color: metaColor }]}>No items scheduled.</Text>
          ) : (
            items.map((item, i) => (
              <View
                key={item.id}
                style={[
                  acc.item,
                  { borderLeftColor: color, backgroundColor: itemBg },
                  i < items.length - 1 && acc.itemDivider,
                ]}
              >
             
                {item.date && (
                  <View style={[acc.dateBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                    <Text style={[acc.dateText, { color }]}>{item.date?.split(' ')[0]}</Text>
                    <Text style={[acc.dateNum,  { color }]}>{item.date?.split(' ')[1]}</Text>
                  </View>
                )}

                <View style={acc.itemContent}>
                  <Text style={[acc.itemTitle, { color: theme.text }]}>{item.title}</Text>
                  <View style={acc.itemMeta}>
                    {item.time         && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.time} {item.time}</Text>}
                    {item.room         && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.room} {item.room}</Text>}
                    {item.building     && <Text style={[acc.metaChip, { color: metaColor, fontWeight: 'bold' }]}>{ICONS.meta.building} {item.building}</Text>}
                    {item.organization && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.organization} {item.organization}</Text>}
                  </View>
                  <View style={[acc.tagBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[acc.tagText, { color }]}>{item.tag}</Text>
                  </View>
                  {item.description && (
                    <Text style={[acc.itemDesc, { color: descColor }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>

                <View style={acc.actions}>
                  {onEdit && (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => onEdit(item)}
                      style={[acc.editBtn, { backgroundColor: theme.accent + '20' }]}
                    >
                      <Text style={[acc.editBtnText, { color: theme.accent }]}>✎</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      console.log('DELETE BUTTON PRESSED for:', item.id, item.title);
                      console.log('Confirming delete for:', item.id);
                      confirmDelete(item.title, item.id);
                    }}
                    style={[acc.deleteBtn, { backgroundColor: theme.danger + '20' }]}
                  >
                    <Text style={[acc.deleteBtnText, { color: theme.danger }]}>{ICONS.actions.delete}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const acc = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 5,
  },
  headerText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  chevron: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  body: {
    borderWidth: 1, borderTopWidth: 0,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    overflow: 'hidden', marginTop: -6, paddingTop: 10,
  },
  emptyText: { fontSize: 13, padding: 16, fontStyle: 'italic' },
  item: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 12,
    borderLeftWidth: 3, marginHorizontal: 10,
    borderRadius: 6, marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  itemDivider: {},
  dateBadge: {
    width: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, borderWidth: 1, paddingVertical: 5,
  },
  dateText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  dateNum:  { fontSize: 15, fontWeight: '800', lineHeight: 18 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  metaChip: { fontSize: 11 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  tagText: { fontSize: 10, fontWeight: '700' },
  itemDesc: { fontSize: 11, marginTop: 4, fontStyle: 'italic', lineHeight: 16 },
  actions: { flexDirection: 'column', gap: 6, flexShrink: 0 },
  editBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  editBtnText: { fontSize: 16, fontWeight: '700' },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deleteBtnText: { fontSize: 16, fontWeight: '700' },
});

//  Main Screen 
export default function SchedulesScreen() {
  const { theme, isDark } = useTheme();
  const typeOrder: PostType[] = ['class', 'event', 'suspension'];
  const [data, setData] = useState<Record<PostType, ScheduleItem[]>>({
    class: [],
    event: [],
    suspension: [],
  });
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    time: '',
    room: '',
    description: '',
    tag: '',
    department: '',
    course: '',
    block: '',
    yearLevel: '',
    date: '',
  });

  const loadPostedEvents = async () => {
    try {
      const schedules = await getSchedules();
      const newData: Record<PostType, ScheduleItem[]> = {
        class: [],
        event: [],
        suspension: [],
      };

      schedules.forEach((schedule) => {
        const postType: PostType =
          schedule.type === 'Class Schedules' ? 'class' :
          schedule.type === 'Events' ? 'event' : 'suspension';

        const subjects = schedule.subjects && schedule.subjects.length > 0
          ? schedule.subjects
          : [{ name: schedule.tag || 'Untitled', day: '', timeRange: '', room: '' }];

        subjects.forEach((subject, subjectIndex) => {
          // Always show the date for events and suspensions, and keep the original format for editing
          let formattedDate = undefined;
          if (subject.day && /^\d{4}-\d{2}-\d{2}$/.test(subject.day)) {
            // For display: e.g. '03-14' => 'Mar 14'
            const [, month, day] = subject.day.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
          } else if (subject.day) {
            formattedDate = subject.day;
          }

          let tagValue = '';
          if (postType === 'class') {
            const parts = [schedule.department, schedule.course, schedule.yearLevel, schedule.block].filter(Boolean);
            if (schedule.tag === 'whole-university') {
              parts.push('Whole University');
            }
            tagValue = parts.join(' - ') || 'Class';
          } else {
            tagValue = schedule.tag || schedule.department || 'Posted';
          }
          const item: ScheduleItem = {
            id: `${schedule._id}-${subjectIndex}`,
            scheduleId: schedule._id,
            subjectIndex,
            scheduleType: schedule.type,
            title: subject.name,
            tag: tagValue,
            date: formattedDate, // for display
            rawDate: subject.day || '', // for editing
            time: subject.timeRange,
            room: subject.room,
            building: subject.building,
            organization: schedule.department,
            description: schedule.semester || schedule.yearLevel,
          };

          newData[postType].unshift(item);
        });
      });

      setData(newData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPostedEvents();
    }, [])
  );

  const handleDelete = async (id: string) => {
    try {
      const scheduleId = id.includes('-') ? id.split('-')[0] : id;
      await deleteSchedule(scheduleId);
      await loadPostedEvents();
      Alert.alert('Success', 'Schedule deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to delete schedule');
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      time: item.time || '',
      room: item.room || '',
      description: item.description || '',
      tag: item.tag || '',
      department: item.organization || '',
      course: item.course || '',
      block: item.block || '',
      yearLevel: item.yearLevel || '',
      date: item.rawDate || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const scheduleId = editingItem.scheduleId;
      const existing = await getSchedules();
      const currentSchedule = existing.find((s) => s._id === scheduleId);

      if (!currentSchedule) {
        Alert.alert('Error', 'Schedule no longer exists');
        return;
      }

      const nextSubjects = [...(currentSchedule.subjects || [])];
      if (nextSubjects[editingItem.subjectIndex]) {
        nextSubjects[editingItem.subjectIndex] = {
          ...nextSubjects[editingItem.subjectIndex],
          name: editForm.title,
          timeRange: editForm.time || 'TBA',
          room: editForm.room || undefined,
          // Only update day/date for event/suspension
          ...(editingItem.scheduleType !== 'Class Schedules' && editForm.date
            ? { day: editForm.date }
            : {}),
        };
      }

      const updatePayload = {
        tag: editForm.tag || currentSchedule.tag,
        department: editForm.department || currentSchedule.department,
        course: editForm.course || currentSchedule.course,
        yearLevel: editForm.yearLevel || currentSchedule.yearLevel,
        block: editForm.block || currentSchedule.block,
        subjects: nextSubjects,
      };
      console.log('🟡 UpdateSchedule Payload:', updatePayload);
      await updateSchedule(scheduleId, updatePayload);

      setEditingItem(null);
      await loadPostedEvents();
      Alert.alert('Success', 'Schedule updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.pageTitle, { color: theme.title }]}>All Schedules Posted</Text>

        {typeOrder.map(type => (
          <AccordionSection key={type} type={type} items={data[type]} onDelete={handleDelete} onEdit={handleEdit} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={!!editingItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setEditingItem(null)}
        />
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}> 
          <Text style={[styles.modalTitle, { color: theme.title }]}>Edit Schedule</Text>

          <Text style={[styles.modalLabel, { color: theme.subtitle }]}>Title</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.divider }]}
            value={editForm.title}
            onChangeText={text => setEditForm(prev => ({ ...prev, title: text }))}
            placeholder="Enter title"
            placeholderTextColor={theme.muted}
          />

          {/* Only show date field for Events and Suspensions */}
          {editingItem && editingItem.scheduleType !== 'Class Schedules' && (
            <>
              <Text style={[styles.modalLabel, { color: theme.subtitle }]}>Date</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.divider }]}
                value={editForm.date}
                onChangeText={text => setEditForm(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.muted}
              />
            </>
          )}

          <Text style={[styles.modalLabel, { color: theme.subtitle }]}>Tag (Department/Group)</Text>
          <Dropdown
            value={editForm.department || ''}
            options={DEPARTMENTS}
            onSelect={val => setEditForm(prev => ({ ...prev, department: val, course: '', block: '', yearLevel: '' }))}
            placeholder="Select department"
          />
          <Dropdown
            value={editForm.course || ''}
            options={editForm.department ? COURSES[editForm.department] : []}
            onSelect={val => setEditForm(prev => ({ ...prev, course: val }))}
            placeholder="Select course"
          />
          <Dropdown
            value={editForm.block || ''}
            options={BLOCKS}
            onSelect={val => setEditForm(prev => ({ ...prev, block: val }))}
            placeholder="Select block"
          />
          <Dropdown
            value={editForm.yearLevel || ''}
            options={["1st Year", "2nd Year", "3rd Year", "4th Year"]}
            onSelect={val => setEditForm(prev => ({ ...prev, yearLevel: val }))}
            placeholder="Select year level"
          />

          <Text style={[styles.modalLabel, { color: theme.subtitle }]}>Time</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.divider }]}
            value={editForm.time}
            onChangeText={text => setEditForm(prev => ({ ...prev, time: text }))}
            placeholder="e.g., 10:00 AM - 12:00 PM"
            placeholderTextColor={theme.muted}
          />

          <Text style={[styles.modalLabel, { color: theme.subtitle }]}>Room</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.divider }]}
            value={editForm.room}
            onChangeText={text => setEditForm(prev => ({ ...prev, room: text }))}
            placeholder="e.g., Room 101"
            placeholderTextColor={theme.muted}
          />

          <Text style={[styles.modalLabel, { color: theme.subtitle }]}>Description</Text>
          <TextInput
            style={[styles.modalInput, styles.modalTextArea, { backgroundColor: theme.input, color: theme.text, borderColor: theme.divider }]}
            value={editForm.description}
            onChangeText={text => setEditForm(prev => ({ ...prev, description: text }))}
            placeholder="Enter description"
            placeholderTextColor={theme.muted}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel, { backgroundColor: theme.muted + '30' }]}
              onPress={() => setEditingItem(null)}
            >
              <Text style={[styles.modalBtnText, { color: theme.subtitle }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSave, { backgroundColor: theme.accent }]}
              onPress={handleSaveEdit}
            >
              <Text style={[styles.modalBtnText, { color: '#ffffff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav role="admin" active="schedules" />
    </View>
  );
}

// ─── Styles 
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  pageTitle: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5, marginBottom: 24 },
  
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    position: 'absolute',
    top: '15%',
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnCancel: {},
  modalBtnSave: {},
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});