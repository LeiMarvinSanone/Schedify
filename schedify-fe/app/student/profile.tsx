import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, StatusBar, Alert, ScrollView, Image,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../ThemeContext';
import BottomNav from '../../components/BottomNav';

const AvatarIcon = ({ color }: { color: string }) => (
  <Svg width="52" height="52" viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="17" r="9" stroke={color} strokeWidth="2.5" fill="none" />
    <Path d="M6 42c0-9.9 8.1-16 18-16s18 6.1 18 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </Svg>
);
const MoonIcon = ({ color }: { color: string }) => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke={color} strokeWidth="2" fill={color} />
  </Svg>
);
const SunIcon = ({ color }: { color: string }) => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const LockIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" />
    <Path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);
const LogOutIcon = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ChevronRight = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const DepartmentIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
);
const CourseIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </Svg>
);
const BlockIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function Profile() {
  const { isDark, toggleTheme, theme: t } = useTheme();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/login' as any) },
    ]);
  };

  const infoItems = [
    { icon: <DepartmentIcon color={t.accent} />, label: 'Department', value: 'CICT' },
    { icon: <CourseIcon color={t.accent} />, label: 'Course', value: 'BSCS' },
    { icon: <BlockIcon color={t.accent} />, label: 'Block', value: 'Block B — 3-B' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />

      <View style={[styles.topBar, { backgroundColor: t.bg }]}>
        <View style={styles.topLeft}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.topLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandName, { color: t.title }]}>Schedify</Text>
        </View>
        <View style={[styles.togglePill, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          {isDark ? <MoonIcon color="#e2e8f0" /> : <SunIcon color="#f6ad55" />}
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? '#e2e8f0' : '#f6ad55'}
            trackColor={{ false: '#cbd5e0', true: '#4a5568' }}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <View style={[styles.avatarRing, { borderColor: t.accent }]}>
            <View style={[styles.avatarInner, { backgroundColor: t.input }]}>
              <AvatarIcon color={t.muted} />
            </View>
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: t.title }]}>Student A</Text>
            <View style={[styles.badge, { backgroundColor: t.badgeBg }]}>
              <Text style={[styles.badgeText, { color: t.badgeText }]}>● Student</Text>
            </View>
            <Text style={[styles.heroEmail, { color: t.subtitle }]}>StudentA@gmail.com</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: t.muted }]}>ACADEMIC INFO</Text>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          {infoItems.map((item, i) => (
            <View key={item.label}>
              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: t.badgeBg }]}>{item.icon}</View>
                <View style={styles.infoText}>
                  <Text style={[styles.infoLabel, { color: t.muted }]}>{item.label}</Text>
                  <Text style={[styles.infoValue, { color: t.text }]}>{item.value}</Text>
                </View>
              </View>
              {i < infoItems.length - 1 && <View style={[styles.divider, { backgroundColor: t.divider }]} />}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: t.muted }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder }]}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/student/change-password' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: t.lockBg }]}>
              <LockIcon color={t.lockColor} />
            </View>
            <Text style={[styles.actionLabel, { color: t.text }]}>Change Password</Text>
            <ChevronRight color={t.muted} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: t.divider }]} />
          <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? '#3a1a1a' : '#fff5f5' }]}>
              <LogOutIcon color={t.danger} />
            </View>
            <Text style={[styles.actionLabel, { color: t.danger }]}>Log Out</Text>
            <ChevronRight color={t.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav role="student" active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topLogo: { width: 32, height: 32 },
  brandName: { fontSize: 24, fontWeight: '300', letterSpacing: 0.5 },
  togglePill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  heroCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 28, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  avatarRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, gap: 6 },
  heroName: { fontSize: 20, fontWeight: '700', letterSpacing: 0.3 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  heroEmail: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.3, marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  actionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});