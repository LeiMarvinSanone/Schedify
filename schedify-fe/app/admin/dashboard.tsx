import React from 'react';
import {
    View, Text, TouchableOpacity,
  StyleSheet, ScrollView, StatusBar,

}from 'react-native';
import {router} from 'expo-router';

type TagType = 'course'|'department'|'university';
type Schedule = {
  id: string;
  title: string;
  date: string;
  time: string;
  tag: TagType;
  tagValue: string;          
  reminders: string[];     
};

const SAMPLE_SCHEDULES: Schedule[] = [
  {
    id: '1',
    title: 'Midterm Examination',
    date: '2026-03-28',
    time: '08:00',
    tag: 'course',
    tagValue: 'BSIT',
    reminders: ['1 Day Before', '1 Hour Before'],
  },
  {
    id: '2',
    title: 'Foundation Day Celebration',
    date: '2026-02-28',
    time: '14:00',
    tag: 'university',
    tagValue: 'All',
    reminders: ['1 Day Before', '3 Hours Before'],
  },
  {
    id: '3',
    title: 'Department Meeting',
    date: '2026-02-28',
    time: '10:00',
    tag: 'department',
    tagValue: 'CICT',
    reminders: ['1 Hour Before', '30 Mins Before'],
  },
]

function getTagColor(tag: TagType) {
  if (tag === 'course')     return { bg: '#2d1f6e', text: '#a78bfa', border: '#5b3fd4' };
  if (tag === 'department') return { bg: '#1a2f1a', text: '#4ade80', border: '#22c55e' };
  return                           { bg: '#1a2a1a', text: '#4ade80', border: '#16a34a' }; // university
}

function getTagIcon(tag: TagType) {
  if (tag === 'course')     return '📘';
  if (tag === 'department') return '🏛️';
  return '↑';  // university / all
}

function getReminderIcon(reminder: string) {
  if (reminder.includes('Day'))   return '📅';
  if (reminder.includes('Hour'))  return '🕐';
  if (reminder.includes('Mins'))  return '⚡';
  return '🔔'; // At Event Time
}

function TagBadge({ tag, tagValue }: { tag: TagType; tagValue: string }) {
  const colors = getTagColor(tag);
  const icon = getTagIcon(tag);

  return (
    <View style={[
      styles.tagBadge,
      { backgroundColor: colors.bg, borderColor: colors.border }
    ]}>
      <Text style={styles.tagIcon}>{icon}</Text>
      <Text style={[styles.tagText, { color: colors.text }]}>{tagValue}</Text>
    </View>
  );
}

function ReminderChip({ label }: { label: string }) {
  const icon = getReminderIcon(label);
  return (
    <View style={styles.reminderChip}>
      <Text style={styles.reminderIcon}>{icon}</Text>
      <Text style={styles.reminderText}>{label}</Text>
    </View>
  );
}

function ScheduleCard({ item }: {item: Schedule}) {
    return (
        <View style = {styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <TagBadge tag={item.tag} tagValue={item.tagValue} />
            </View>
            <Text style={styles.cardDate}>{item.date} · {item.time}</Text>

      {/* Reminder chips row */}
      <View style={styles.remindersRow}>
        {item.reminders.map((reminder, index) => (
          // KEY: when rendering a list, React needs a unique "key" on each item
          <ReminderChip key={index} label={reminder} />
        ))}
      </View>
    </View>
  );
}

function StatCard({
  icon, value, label, color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BottomNav({ active }: { active: string }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'post',      label: 'Post',      icon: '+' },
    { id: 'schedules', label: 'Schedules', icon: '≡' },
    { id: 'settings',  label: 'Settings',  icon: '⚙' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.navTab}
          onPress={() => tab.id !== 'dashboard' && router.push(`/admin/${tab.id}` as any)}
        >
          <Text style={[
            styles.navIcon,
            active === tab.id && styles.navIconActive,
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.navLabel,
            active === tab.id && styles.navLabelActive,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AdminDashboard() {

  const totalSchedules = SAMPLE_SCHEDULES.length;
  const thisMonth = SAMPLE_SCHEDULES.filter(s => s.date.startsWith('2026-02')).length;
  const courseTags = SAMPLE_SCHEDULES.filter(s => s.tag === 'course').length;
  const deptTags = SAMPLE_SCHEDULES.filter(s => s.tag === 'department').length;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="📅" value={totalSchedules} label="Total Schedules" color="#ffffff" />
          <StatCard icon="📅" value={thisMonth}      label="This Month"      color="#ffffff" />
          <StatCard icon="📘" value={courseTags}     label="Course Tags"     color="#ffffff" />
          <StatCard icon="🏛️" value={deptTags}       label="Dept Tags"       color="#ffffff" />
        </View>

        <Text style={styles.sectionTitle}>RECENT POSTS</Text>

        {SAMPLE_SCHEDULES.map(schedule => (
          <ScheduleCard key={schedule.id} item={schedule} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav active="dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({

  // ── Outer container ──
  screen: {
    flex: 1,                  // fill the entire screen height
    backgroundColor: '#0f0f1a',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 52,           // space for the status bar
    paddingBottom: 12,
  },

  // ── Header ──
  header: { marginBottom: 20 },
  welcomeText: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Stats grid ──
  statsGrid: {
    flexDirection: 'row',     
    flexWrap: 'wrap',         
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    width: '47%',            
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Section title ──
  sectionTitle: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,       
    marginBottom: 12,
  },

  // ── Schedule card ──
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,                  
  },
  cardDate: {
    color: '#718096',
    fontSize: 12,
    marginBottom: 10,
  },

  // ── Reminder chips row ──
  remindersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2d2d4e',
    gap: 5,
  },
  reminderIcon: { fontSize: 11 },
  reminderText: {
    color: '#a0aec0',
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Tag badge (BSIT / CCS / All) ──
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    gap: 4,
  },
  tagIcon: { fontSize: 11 },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Bottom navigation ──
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2d2d4e',
    paddingBottom: 24,        
    paddingTop: 10,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  navIcon: {
    fontSize: 20,
    color: '#4a5568',
  },
  navIconActive: {
    color: '#a78bfa',         
  },
  navLabel: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#a78bfa',
    fontWeight: '700',
  },
});