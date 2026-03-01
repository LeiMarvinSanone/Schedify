import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ICONS } from '../constants/icons';
import { useTheme } from '../ThemeContext';

type AdminTab = 'dashboard' | 'post' | 'schedules' | 'settings';
type StudentTab = 'calendar' | 'events' | 'profile';

type BottomNavProps =
  | { role: 'admin'; active: AdminTab }
  | { role: 'student'; active: StudentTab };

const ADMIN_TABS: { id: AdminTab; label: string; icon: string; route: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: ICONS.nav.dashboard, route: '/admin/dashboard' },
  { id: 'post', label: 'Post', icon: ICONS.nav.post, route: '/admin/post' },
  { id: 'schedules', label: 'Schedules', icon: ICONS.nav.schedules, route: '/admin/schedules' },
  { id: 'settings', label: 'Settings', icon: ICONS.nav.settings, route: '/admin/settings' },
];

const STUDENT_TABS: { id: StudentTab; label: string; icon: string; route: string }[] = [
  { id: 'calendar', label: 'Calendar', icon: ICONS.nav.calendar, route: '/student/calendar' },
  { id: 'events', label: 'Events', icon: ICONS.nav.events, route: '/student/events' },
  { id: 'profile', label: 'Profile', icon: ICONS.nav.profile, route: '/student/profile' },
];

export default function BottomNav(props: BottomNavProps) {
  const { theme, isDark } = useTheme();
  const isAdmin = props.role === 'admin';
  const tabs = isAdmin ? ADMIN_TABS : STUDENT_TABS;

  const navBg = isAdmin ? theme.navBg : isDark ? '#131d2a' : '#ffffff';
  const navBorder = isAdmin ? theme.navBorder : isDark ? '#1e2a3a' : '#e2e8f0';

  return (
    <View
      style={[
        styles.container,
        isAdmin ? styles.adminContainer : styles.studentContainer,
        { backgroundColor: navBg, borderTopColor: navBorder },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === props.active;

        if (isAdmin) {
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.adminTab}
              onPress={() => !isActive && router.push(tab.route as any)}
            >
              <Text style={[styles.adminIcon, { color: isActive ? theme.accent : theme.muted }]}>
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.adminLabel,
                  { color: isActive ? theme.accent : theme.muted },
                  isActive && styles.adminLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        const studentLabel = isDark ? '#4a5878' : '#94a3b8';
        const studentActive = isDark ? '#e2e8f0' : '#1e293b';

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.studentTab}
            onPress={() => !isActive && router.push(tab.route as any)}
          >
            <Text style={[styles.studentIcon, isActive && styles.studentIconActive]}>{tab.icon}</Text>
            <Text
              style={[
                styles.studentLabel,
                { color: studentLabel },
                isActive && { color: studentActive, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.studentActiveBar} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderTopWidth: 1 },

  adminContainer: { paddingBottom: 24, paddingTop: 10 },
  adminTab: { flex: 1, alignItems: 'center', gap: 3 },
  adminIcon: { fontSize: 20 },
  adminLabel: { fontSize: 11, fontWeight: '500' },
  adminLabelActive: { fontWeight: '700' },

  studentContainer: { paddingBottom: 20, paddingTop: 10 },
  studentTab: { flex: 1, alignItems: 'center', gap: 2, position: 'relative' },
  studentIcon: { fontSize: 22, opacity: 0.4 },
  studentIconActive: { opacity: 1 },
  studentLabel: { fontSize: 11, fontWeight: '500' },
  studentActiveBar: {
    position: 'absolute',
    bottom: -10,
    width: 20,
    height: 3,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
});
