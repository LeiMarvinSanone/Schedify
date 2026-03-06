import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar, Alert, Platform,
} from 'react-native';
import { ICONS } from '../../constants/icons';
import { useTheme } from '../../ThemeContext';
import BottomNav from '../../components/BottomNav';
import { useFocusEffect } from '@react-navigation/native';
import { getPostedCalendarEvents, deletePostedCalendarEvent } from '../../utils/scheduleStore';

type TagType = 'course' | 'department' | 'university';
type Schedule = {
  id: string;
  title: string;
  date: string;
  time: string;
  tag: TagType;
  tagValue: string;
  reminders: string[];
};

// ── Tag colors — uses theme so light mode gets lighter tints ──
function getTagColor(tag: TagType, isDark: boolean) {
  if (tag === 'course')
    return isDark
      ? { bg: '#2d1f6e', text: '#a78bfa', border: '#5b3fd4' }
      : { bg: '#ede9fe', text: '#7c3aed', border: '#c4b5fd' };
  if (tag === 'department')
    return isDark
      ? { bg: '#1a2f1a', text: '#4ade80', border: '#22c55e' }
      : { bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
  return isDark
    ? { bg: '#1a2a1a', text: '#4ade80', border: '#16a34a' }
    : { bg: '#f0fdf4', text: '#15803d', border: '#86efac' };
}

function getTagIcon(tag: TagType) {
  if (tag === 'course')     return ICONS.stats.courses;
  if (tag === 'department') return ICONS.meta.building;
  return ICONS.postTypes.class;
}

function getReminderIcon(reminder: string) {
  if (reminder.includes('Day'))  return ICONS.meta.time;
  if (reminder.includes('Hour')) return ICONS.meta.time;
  if (reminder.includes('Mins')) return ICONS.meta.time;
  return '🔔';
}

// ── TagBadge — reads theme for dark/light tints ──
function TagBadge({ tag, tagValue }: { tag: TagType; tagValue: string }) {
  const { isDark } = useTheme();
  const colors = getTagColor(tag, isDark);
  const icon   = getTagIcon(tag);

  return (
    <View style={[styles.tagBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={styles.tagIcon}>{icon}</Text>
      <Text style={[styles.tagText, { color: colors.text }]}>{tagValue}</Text>
    </View>
  );
}

// ── ReminderChip — uses theme.input + theme.divider ──
function ReminderChip({ label }: { label: string }) {
  const { theme } = useTheme();
  const icon = getReminderIcon(label);
  return (
    <View style={[styles.reminderChip, { backgroundColor: theme.input, borderColor: theme.divider }]}>
      <Text style={styles.reminderIcon}>{icon}</Text>
      <Text style={[styles.reminderText, { color: theme.subtitle }]}>{label}</Text>
    </View>
  );
}

// ── ScheduleCard — uses theme.card + theme.cardBorder ──
function ScheduleCard({ item, onDelete }: { item: Schedule; onDelete?: (id: string) => void }) {
  const { theme } = useTheme();

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
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              console.log('DELETE BUTTON PRESSED for:', item.id, item.title);
              console.log('Confirming delete for:', item.id);
              confirmDelete(item.title, item.id);
            }}
            style={[styles.deleteBtn, { backgroundColor: theme.danger + '20' }]}
          >
            <Text style={[styles.deleteBtnText, { color: theme.danger }]}>{ICONS.actions.delete}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TagBadge tag={item.tag} tagValue={item.tagValue} />
      <Text style={[styles.cardDate, { color: theme.muted }]}>{item.date} · {item.time}</Text>
      <View style={styles.remindersRow}>
        {item.reminders.map((reminder, index) => (
          <ReminderChip key={index} label={reminder} />
        ))}
      </View>
    </View>
  );
}

// ── StatCard — uses theme.card + theme.cardBorder ──
function StatCard({ icon, value, label, color }: {
  icon: string; value: number; label: string; color: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

// main
export default function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const loadPostedEvents = async () => {
    const posted = await getPostedCalendarEvents();
    const items: Schedule[] = [];

    posted.forEach((event) => {
      const item: Schedule = {
        id: event.id,
        title: event.label,
        date: event.date || '',
        time: event.time || '',
        tag: (event.department || event.org || 'Posted') as any,
        tagValue: event.org || event.department || 'Posted',
        reminders: [],
      };
      items.unshift(item);
    });

    setSchedules(items);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPostedEvents();
    }, [])
  );

  const handleDelete = async (id: string) => {
    try {
      console.log('=== DELETE START ===');
      console.log('Deleting item with id:', id);
      console.log('Current schedules state:', schedules);
      
      await deletePostedCalendarEvent(id);
      console.log('Item deleted from storage');
      
      await loadPostedEvents();
      console.log('Events reloaded, new schedules state:', schedules);
      console.log('=== DELETE COMPLETE ===');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const totalSchedules = schedules.length;
  const thisMonth      = schedules.filter(s => s.date.startsWith('2026-03')).length;
  const courseTags     = schedules.filter(s => s.tag === 'course').length;
  const deptTags       = schedules.filter(s => s.tag === 'department').length;

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: theme.muted }]}>Welcome back</Text>
          <Text style={[styles.headerTitle,  { color: theme.title }]}>Admin Dashboard</Text>
        </View>

        
        <View style={styles.statsGrid}>
          <StatCard icon={ICONS.stats.schedules}   value={totalSchedules} label="Total Schedules" color={theme.text} />
          <StatCard icon={ICONS.stats.monthly}     value={thisMonth}      label="This Month"      color={theme.text} />
          <StatCard icon={ICONS.stats.courses}     value={courseTags}     label="Course Tags"     color={theme.text} />
          <StatCard icon={ICONS.stats.departments} value={deptTags}       label="Dept Tags"       color={theme.text} />
        </View>

       
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>RECENT POSTS</Text>

        {schedules.map(schedule => (
          <ScheduleCard key={schedule.id} item={schedule} onDelete={handleDelete} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav role="admin" active="dashboard" />
    </View>
  );
}


const styles = StyleSheet.create({
  screen:        { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },

  header:      { marginBottom: 20 },
  welcomeText: { fontSize: 13, fontWeight: '400', marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard:  { borderRadius: 14, padding: 16, width: '47%', borderWidth: 1 },
  statIcon:  { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '500' },

  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },

  card:       { borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle:  { fontSize: 15, fontWeight: '700', flex: 1 },
  cardDate:   { fontSize: 12, marginBottom: 10 },

  remindersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reminderChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, gap: 5 },
  reminderIcon: { fontSize: 11 },
  reminderText: { fontSize: 11, fontWeight: '500' },

  tagBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, gap: 4 },
  tagIcon:  { fontSize: 11 },
  tagText:  { fontSize: 11, fontWeight: '700' },
  
  deleteBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deleteBtnText: { fontSize: 16, fontWeight: '700' },

});